---
name: slogodle-publish-videos
description: Render the next X daily Slogodle videos, upload them to the slogodle-videos-tmp R2 bucket, and schedule them on Buffer (Instagram Reel + YouTube Short at 10:00 Paris), plus give the delete command for videos already posted. Use whenever the user asks to "generate and upload the next X videos", "schedule the next videos", "prepare the next batch", or anything about rendering/publishing/scheduling Slogodle videos on Buffer, even if they don't mention R2 or Buffer by name.
allowed-tools: Read, Edit, Bash, AskUserQuestion, ToolSearch
---

Takes the user from "generate and upload the next X videos" to X days of scheduled posts. The user drops a number; you do the rest and come back with a summary. Pause only for the decisions listed below.

## Fixed facts

- **Buffer organization:** Slogodle (`6ab9205c27db693e86e126ec`).
- **Channels:** Instagram `6ab921fdea19ca0bde03ceeb` and YouTube `6ab920c7ea19ca0bde03ac60`. TikTok (`6ab9214aea19ca0bde03af7e`) is connected but has never been used. Leave it out unless the user asks.
- **Bucket:** `slogodle-videos-tmp`, public at `https://pub-aa7f22244f6c4d19be4cbaf62530e147.r2.dev`. Run wrangler from `apps/web`, where it is installed and logged in. Never create, configure, or delete the bucket itself. Only put objects in it.
- **Daily order:** `buildPublishSchedule()` in `apps/video/src/lib/videoSeries.ts`. Day #1 is `PUBLISH_START_DATE`, and the series cycle multiple-choice → guess → name-choice. Day #N's date is fixed by that function, so never pick dates by hand.
- **Buffer plan:** at most 10 scheduled posts per channel.

Buffer tools are deferred. Load them in one ToolSearch call first: `select:mcp__claude_ai_Buffer__list_posts,mcp__claude_ai_Buffer__create_post,mcp__claude_ai_Buffer__get_post`.

## 1. Find where the last batch stopped

Call `list_posts` for the org with `status: ["scheduled", "sent"]`, sorted by `dueAt` desc, `first: 40`. Captions look like `Slogodle day #N`, and the highest N is the last scheduled day. The batch starts at **N+1**.

From the same results, count the posts still `scheduled` on each channel. If that count plus X would go over 10 on a channel, tell the user how many fit and ask whether to do fewer. Buffer rejects posts past the limit.

## 2. Delete command for videos already posted

The posts point straight at the r2.dev URLs. Buffer doesn't copy the file when the post is created, so a file can only go once **every** post that uses it is `sent`.

From the `list_posts` results (page further if needed), collect asset `source` URLs under the r2.dev base:

- **deletable:** every post using the URL is `sent`;
- **keep:** at least one post using it is still `scheduled`, `sending` or `error`.

The key is the last segment of the URL. Don't run the delete yourself: the user wants to run it. Give them one ready-to-paste command:

```
! cd apps/web && for k in <key1> <key2> …; do npx wrangler r2 object delete "slogodle-videos-tmp/$k" --remote; done
```

Older batches may already be deleted. Listing their keys again does no harm, so you don't need to track that.

## 3. Plan the batch

```
cd apps/video && pnpm plan:batch --from-day <N+1> --count <X>
```

This prints JSON with:

- `videos[]`: day, date, `dueAt` (10:00 Paris with the right UTC offset), series, episode, logo, local `file`, `r2Key`;
- `renders[]`: the `render:all` ranges needed per series;
- `warnings[]`: logos that come back within 3 days (`--window` changes that). `kind: "answer"` means the same logo is the answer twice. `kind: "decoy"` means the answer one day shows up among the choices of a neighboring day.

If the first `dueAt` is already in the past, the schedule and Buffer have drifted apart (for example, a day was skipped). Stop and ask the user before going on.

**Repeated logos:** show the user every warning. Answer repeats matter most: the same answer two days apart looks lazy. Decoy repeats are milder, so mention them without making a fuss. For an answer repeat, offer to swap the episode with a later, unrendered one, the way `GUESS_EPISODE_SWAPS` does in `apps/video/src/lib/videoOrder.ts`. Add a similar swap list for another series if needed. Only swap episodes after the last number in `apps/video/rendered.txt`. Already-rendered episodes are already in `out/`, and render-all skips them. After a swap, run `plan:batch` again and check the warning is gone. Use AskUserQuestion: swap, or keep as is. Edit nothing without a yes.

## 4. Render

For each entry in `renders`:

```
cd apps/video && pnpm render:all <series> --from <from> --count <count>
```

Each video takes a minute or more. Run each command in the background with a long timeout, and give the user a one-line update between series. render-all skips files that already exist and updates `rendered.txt` itself. Leave that file alone. Once done, check that every `videos[].file` exists.

## 5. Upload

From `apps/web`, once per video:

```
npx wrangler r2 object put "slogodle-videos-tmp/<r2Key>" --file "<file>" --content-type video/mp4 --remote
```

Then check that each URL returns 200: `curl -sI <base>/<r2Key> | head -1`. Buffer can't fetch a broken URL, and it only finds out at publish time, when it's too late.

## 6. Schedule on Buffer

For each video, create two posts with `mode: "customScheduled"`, `schedulingType: "automatic"` and `dueAt` from the plan (don't recompute it). These match the earlier posts:

- **text** (both channels): `Slogodle day #<day>\n\n#dailygame #guessthelogo #logo #logogame`
- **assets:** `[{ "video": { "url": "<base>/<r2Key>", "metadata": { "thumbnailOffset": 0 } } }]`
- **Instagram metadata:** `{ "instagram": { "type": "reel", "shouldShareToFeed": true, "isAiGenerated": false } }`
- **YouTube metadata:** `{ "youtube": { "title": "Slogodle day #<day>", "categoryId": "24", "privacy": "public", "license": "youtube", "notifySubscribers": false, "madeForKids": false, "embeddable": true, "isAiGenerated": false } }`

The calls don't depend on each other, so send them in parallel batches. Check that each result has `status: "scheduled"`. If a post fails, report it, keep going with the others, and list the failures at the end.

## 7. Summary

Finish with:

1. A table: day, date, series, logo.
2. Any repeated-logo warnings left in.
3. The delete command from step 2, if there's anything to delete.
4. A reminder that this batch's files must stay in the bucket until its last post goes out (give that date). The next run's step 2 will pick them up.

Don't commit. The user commits everything themselves. Mention that `rendered.txt` changed, and that `videoOrder.ts` changed too if you swapped episodes.
