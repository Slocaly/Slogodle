import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestingLogo } from "src/test/create-testing-logo";
import { render } from "src/test/render-with-providers";
import { SpeedGame } from "../SpeedGame";
import type { SpeedRemote } from "../SpeedGame";

const logos = [
  createTestingLogo({
    description: "React is a UI library.",
    founded: 2013,
    funFact: "React came out of a news feed.",
    industry: "Frontend library",
    name: "React",
  }),
  createTestingLogo({
    founded: 2014,
    industry: "Frontend framework",
    name: "Vue",
  }),
  createTestingLogo({ name: "Next.js" }),
];

const ambience = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));
vi.mock("../../lib/speed-ambience", () => ({
  createSpeedAmbience: () => ambience,
}));

const START = new Date(2026, 5, 10, 12, 0, 0);
const RUN_CAP_MS = 15 * 60 * 1000;

const renderSpeedGame = async (
  props: Partial<React.ComponentProps<typeof SpeedGame>> = {},
) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const playBubble = vi.fn();
  const playWrongGuess = vi.fn();
  const rendered = await act(() =>
    render(
      <SpeedGame
        logos={logos}
        playBubble={playBubble}
        playWrongGuess={playWrongGuess}
        soundEnabled={false}
        {...props}
      />,
    ),
  );
  const guess = async (text: string) => {
    await user.type(screen.getByRole("textbox", { name: "Logo name" }), text);
    await user.click(screen.getByRole("button", { name: "Submit" }));
  };
  const start = () =>
    user.click(screen.getByRole("button", { name: "Start the clock" }));
  return { ...rendered, guess, playBubble, playWrongGuess, start, user };
};

const seriesList = () =>
  within(screen.getByRole("complementary", { name: "Series" }));

/** Solves the whole series in order, with one wrong guess first when asked. */
const solveAll = async (
  guess: (text: string) => Promise<void>,
  { withOneMiss = false } = {},
) => {
  if (withOneMiss) await guess("wrong");
  await guess("react");
  await guess("vue");
  await guess("nextjs");
};

const remoteRun = (overrides: Partial<SpeedRemote> = {}): SpeedRemote => ({
  clockOffset: 0,
  expired: false,
  onFinish: vi.fn(),
  onStart: vi.fn(),
  result: null,
  startedAt: Date.now() - 1000,
  ...overrides,
});

describe("SpeedGame", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(START);
    ambience.start.mockClear();
    ambience.stop.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("sound", () => {
    it("plays the error sound on a wrong guess only", async () => {
      const { guess, playWrongGuess, start } = await renderSpeedGame();
      await start();

      await guess("wrong");
      expect(playWrongGuess).toHaveBeenCalledOnce();

      await guess("react");
      expect(playWrongGuess).toHaveBeenCalledOnce();
    });

    it("keeps the ambient bed silent until the clock starts", async () => {
      const { start } = await renderSpeedGame({ soundEnabled: true });
      expect(ambience.start).not.toHaveBeenCalled();

      await start();

      expect(ambience.start).toHaveBeenCalledOnce();
    });

    it("stops the ambient bed once the series is solved", async () => {
      const { guess, start } = await renderSpeedGame({ soundEnabled: true });
      await start();

      await solveAll(guess);

      expect(ambience.stop).toHaveBeenCalledOnce();
    });

    it("keeps the ambient bed silent when sound is off", async () => {
      const { start } = await renderSpeedGame({ soundEnabled: false });

      await start();

      expect(ambience.start).not.toHaveBeenCalled();
    });
  });

  describe("before the run starts", () => {
    it("presents the round and its rules", async () => {
      await renderSpeedGame();

      expect(
        screen.getByRole("heading", { name: "Speed round" }),
      ).toBeVisible();
      expect(screen.getByText("Name 3 logos against the clock.")).toBeVisible();
      expect(screen.getByText(/Every wrong guess adds 1 second/)).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Start the clock" }),
      ).toBeEnabled();
    });

    it("titles the series list, by default and when given a title", async () => {
      await renderSpeedGame();
      expect(
        screen.getByRole("heading", { name: "Today's series" }),
      ).toBeVisible();
    });

    it("uses the given series title", async () => {
      await renderSpeedGame({ title: "Practice" });

      expect(screen.getByRole("heading", { name: "Practice" })).toBeVisible();
    });

    it("hides the logo names and locks the series list", async () => {
      await renderSpeedGame();

      const items = seriesList().getAllByRole("button");

      expect(items).toHaveLength(3);
      for (const item of items) {
        expect(item).toBeDisabled();
        expect(item).toHaveTextContent("???");
      }
      expect(screen.queryByText("React")).not.toBeInTheDocument();
    });

    it("renders the right panel when given one", async () => {
      await renderSpeedGame({ rightPanel: <p>Daily ladder here</p> });

      expect(screen.getByText("Daily ladder here")).toBeVisible();
    });
  });

  describe("practice run", () => {
    it("starts the run on a mystery logo with a zeroed timer", async () => {
      const { start } = await renderSpeedGame();

      await start();

      expect(screen.getByRole("img", { name: "Logo to guess" })).toBeVisible();
      expect(screen.getByText("00:00.0")).toBeVisible();
      expect(screen.getByRole("img", { name: "0 of 3 solved" })).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Start the clock" }),
      ).not.toBeInTheDocument();
    });

    it("keeps the submit button disabled until something is typed", async () => {
      const { start, user } = await renderSpeedGame();
      await start();

      expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

      await user.type(screen.getByRole("textbox", { name: "Logo name" }), "  ");
      expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();

      await user.type(screen.getByRole("textbox", { name: "Logo name" }), "x");
      expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
    });

    it("solves a logo on a correct guess, whatever the case", async () => {
      const { guess, playBubble, start } = await renderSpeedGame();
      await start();

      await guess("rEaCt");

      expect(screen.getByRole("img", { name: "1 of 3 solved" })).toBeVisible();
      expect(screen.getByRole("button", { name: /React/ })).toBeVisible();
      expect(playBubble).toHaveBeenCalledOnce();
    });

    it("shows the solved logo's story and moves on once the next logo is picked", async () => {
      const { guess, start, user } = await renderSpeedGame();
      await start();
      await guess("react");

      // The game jumped to the next unsolved logo; the solved one can be revisited.
      expect(
        screen.queryByText("React is a UI library."),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /React/ }));

      expect(screen.getByRole("heading", { name: "React" })).toBeVisible();
      expect(screen.getByText("React is a UI library.")).toBeVisible();
      expect(screen.getByText("React came out of a news feed.")).toBeVisible();
      expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute(
        "href",
        "https://github.com/example/react",
      );
    });

    it("accepts the name without its .js suffix", async () => {
      const { guess, start } = await renderSpeedGame();
      await start();
      await guess("react");
      await guess("vue");

      await guess("next");

      expect(screen.getByRole("heading", { name: "Your score" })).toBeVisible();
    });

    it("clears the input and reveals a hint after a wrong guess", async () => {
      const { guess, playBubble, start } = await renderSpeedGame();
      await start();
      expect(screen.getByText("Wrong guess reveals a hint.")).toBeVisible();

      await guess("angular");

      expect(screen.getByRole("textbox", { name: "Logo name" })).toHaveValue(
        "",
      );
      expect(screen.getByText("Founded: 2013")).toBeVisible();
      expect(screen.getByRole("img", { name: "0 of 3 solved" })).toBeVisible();
      expect(playBubble).not.toHaveBeenCalled();
    });

    it("reveals one more hint per wrong guess", async () => {
      const { guess, start } = await renderSpeedGame();
      await start();

      await guess("a");
      await guess("b");

      expect(screen.getByText("Industry: Frontend library")).toBeVisible();
    });

    it("reveals the letters of the name one by one after three wrong guesses", async () => {
      const { guess, start } = await renderSpeedGame();
      await start();
      const revealedLetters = () => screen.queryAllByText(/^[A-Z]$/);

      await guess("a");
      await guess("b");
      await guess("c");
      expect(revealedLetters()).toHaveLength(0);

      await guess("d");
      expect(revealedLetters()).toHaveLength(1);

      await guess("e");
      expect(revealedLetters()).toHaveLength(2);
    });

    it("skips to the next logo", async () => {
      const { guess, start, user } = await renderSpeedGame();
      await start();

      await user.click(screen.getByRole("button", { name: "Skip this one" }));
      await guess("vue");

      expect(screen.getByRole("button", { name: /Vue/ })).toBeVisible();
      expect(screen.getByRole("button", { name: /1\s*\?\?\?/ })).toBeVisible();
    });

    it("jumps to any logo from the series list", async () => {
      const { guess, start, user } = await renderSpeedGame();
      await start();

      await user.click(screen.getByRole("button", { name: /3\s*\?\?\?/ }));
      await guess("nextjs");

      expect(screen.getByRole("button", { name: /Next\.js/ })).toBeVisible();
    });

    it("does not count a guess against another logo", async () => {
      const { guess, start } = await renderSpeedGame();
      await start();

      await guess("vue");

      expect(screen.getByRole("img", { name: "0 of 3 solved" })).toBeVisible();
      expect(screen.getByText("Founded: 2013")).toBeVisible();
    });
  });

  describe("practice run with the clock ticking", () => {
    beforeEach(() => {
      vi.useRealTimers();
      vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
      vi.setSystemTime(START);
    });

    it("counts the elapsed time", async () => {
      const { start } = await renderSpeedGame();
      await start();

      act(() => vi.advanceTimersByTime(2500));

      expect(screen.getByText("00:02.5")).toBeVisible();
    });

    it("stops the clock once the series is solved and scores it", async () => {
      const { guess, start } = await renderSpeedGame();
      await start();
      act(() => vi.advanceTimersByTime(4000));

      await solveAll(guess);
      act(() => vi.advanceTimersByTime(10_000));

      expect(screen.getByRole("heading", { name: "Your score" })).toBeVisible();
      expect(
        screen.getByText("00:04.0", { selector: "#speed-score" }),
      ).toBeVisible();
      expect(screen.getByText("Flawless, no wrong guesses")).toBeVisible();
    });

    it("adds a one second penalty per wrong guess to the score", async () => {
      const { guess, start } = await renderSpeedGame();
      await start();
      act(() => vi.advanceTimersByTime(4000));

      await solveAll(guess, { withOneMiss: true });

      expect(
        screen.getByText("00:05.0", { selector: "#speed-score" }),
      ).toBeVisible();
      expect(screen.getByText("Solve time 00:04.0")).toBeVisible();
      expect(screen.getByText(/1 wrong guess/)).toBeVisible();
      expect(screen.getByText("(+00:01.0)")).toBeVisible();
    });

    it("pluralises several wrong guesses", async () => {
      const { guess, start } = await renderSpeedGame();
      await start();

      await guess("a");
      await guess("b");
      await solveAll(guess);

      expect(screen.getByText(/2 wrong guesses/)).toBeVisible();
      expect(screen.getByText("(+00:02.0)")).toBeVisible();
    });
  });

  describe("finished practice run", () => {
    const renderFinishedRun = async (
      props: Partial<React.ComponentProps<typeof SpeedGame>> = {},
    ) => {
      const game = await renderSpeedGame(props);
      await game.start();
      await solveAll(game.guess, { withOneMiss: true });
      return game;
    };

    it("unlocks the series list with every name", async () => {
      await renderFinishedRun();

      expect(seriesList().getByRole("button", { name: /React/ })).toBeEnabled();
      expect(seriesList().getByRole("button", { name: /Vue/ })).toBeEnabled();
      expect(
        seriesList().getByRole("button", { name: /Next\.js/ }),
      ).toBeEnabled();
    });

    it("moves focus to the result heading", async () => {
      await renderFinishedRun();

      expect(screen.getByRole("heading", { name: "Your score" })).toHaveFocus();
    });

    it("tells the player to come back tomorrow", async () => {
      await renderFinishedRun();

      expect(
        screen.getByText("Come back tomorrow for a new series."),
      ).toBeVisible();
    });

    it("labels the score as a replay score for a replay", async () => {
      await renderFinishedRun({ replay: true });

      expect(
        screen.getByRole("heading", { name: "Your replay score" }),
      ).toBeVisible();
      expect(screen.getByText("Replays aren't ranked.")).toBeVisible();
    });

    it("offers to play again when given a restart callback", async () => {
      const onRestart = vi.fn();
      const { user } = await renderFinishedRun({ onRestart });

      await user.click(screen.getByRole("button", { name: "Play again" }));

      expect(onRestart).toHaveBeenCalledOnce();
      expect(
        screen.queryByText("Come back tomorrow for a new series."),
      ).not.toBeInTheDocument();
    });

    it("opens a logo's details from the recap and goes back to the results", async () => {
      const { user } = await renderFinishedRun();

      await user.click(
        screen.getByRole("button", { name: "React: see details" }),
      );

      expect(screen.getByRole("heading", { name: "React" })).toBeVisible();
      expect(screen.getByText("React is a UI library.")).toBeVisible();
      expect(
        screen.queryByRole("heading", { name: "Your score" }),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Back to results" }));

      expect(screen.getByRole("heading", { name: "Your score" })).toBeVisible();
    });

    it("opens a logo's details from the series list", async () => {
      const { user } = await renderFinishedRun();

      await user.click(seriesList().getByRole("button", { name: /Vue/ }));

      expect(screen.getByRole("heading", { name: "Vue" })).toBeVisible();
    });

    it("has no share button without a series number", async () => {
      await renderFinishedRun();

      expect(
        screen.queryByRole("button", { name: "Share result" }),
      ).not.toBeInTheDocument();
    });

    it("copies the result to the clipboard and plays a sound when sharing", async () => {
      const { playBubble, user } = await renderFinishedRun({ dayIndex: 4 });
      playBubble.mockClear();

      await user.click(screen.getByRole("button", { name: "Share result" }));

      expect(await screen.findByRole("status")).toHaveTextContent("Copied!");
      expect(await navigator.clipboard.readText()).toBe(
        `⚡ Slogodle Speed #5\n⏱ 00:01.0 (00:00.0 + 1 wrong)\n\nBeat my time 👇\n${window.location.origin}/speed`,
      );
      expect(playBubble).toHaveBeenCalledOnce();
    });
  });

  describe("saved run", () => {
    const KEY = "speed-test-run";

    it("resumes where the player left off after a reload", async () => {
      const first = await renderSpeedGame({ persistKey: KEY });
      await first.start();
      await first.guess("react");
      first.unmount();

      await renderSpeedGame({ persistKey: KEY });

      expect(
        screen.queryByRole("button", { name: "Start the clock" }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("img", { name: "1 of 3 solved" })).toBeVisible();
      expect(screen.getByRole("button", { name: /React/ })).toBeVisible();
    });

    it("does not resume without a persist key", async () => {
      const first = await renderSpeedGame();
      await first.start();
      first.unmount();

      await renderSpeedGame();

      expect(
        screen.getByRole("button", { name: "Start the clock" }),
      ).toBeVisible();
    });

    it("ignores a saved run that does not match the series", async () => {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          finishedAt: null,
          guessLog: [[]],
          solved: [false],
          startedAt: Date.now(),
        }),
      );

      await renderSpeedGame({ persistKey: KEY });

      expect(
        screen.getByRole("button", { name: "Start the clock" }),
      ).toBeVisible();
    });

    it("shows a finished run's result after a reload", async () => {
      const first = await renderSpeedGame({ persistKey: KEY });
      await first.start();
      await solveAll(first.guess);
      first.unmount();

      await renderSpeedGame({ persistKey: KEY });

      expect(screen.getByRole("heading", { name: "Your score" })).toBeVisible();
    });
  });

  describe("daily run, timed by the server", () => {
    it("asks the server to start the run and then shows the first logo", async () => {
      const onStart = vi
        .fn()
        .mockResolvedValue({ clockOffset: 0, startedAt: Date.now() });
      const { start } = await renderSpeedGame({
        remote: remoteRun({ onStart, startedAt: null }),
      });

      await start();

      expect(onStart).toHaveBeenCalledOnce();
      expect(
        await screen.findByRole("textbox", { name: "Logo name" }),
      ).toBeVisible();
    });

    it("disables the start button while the server is starting the run", async () => {
      const onStart = vi.fn().mockReturnValue(new Promise(() => {}));
      const { start } = await renderSpeedGame({
        remote: remoteRun({ onStart, startedAt: null }),
      });

      await start();

      expect(
        screen.getByRole("button", { name: "Start the clock" }),
      ).toBeDisabled();
    });

    it("joins a run that is already under way, on the server's clock", async () => {
      await renderSpeedGame({
        remote: remoteRun({ clockOffset: 2000, startedAt: Date.now() - 3000 }),
      });

      expect(
        screen.queryByRole("button", { name: "Start the clock" }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("00:05.0")).toBeVisible();
    });

    it("ignores a saved run started under another server run", async () => {
      localStorage.setItem(
        "k",
        JSON.stringify({
          finishedAt: null,
          guessLog: [["react"], [], []],
          solved: [true, false, false],
          startedAt: 111,
        }),
      );

      await renderSpeedGame({ persistKey: "k", remote: remoteRun() });

      expect(screen.getByRole("img", { name: "0 of 3 solved" })).toBeVisible();
    });

    it("sends every guess to the server once the series is solved and shows its result", async () => {
      const onFinish = vi.fn().mockResolvedValue({
        durationMs: 9000,
        scoreMs: 10_000,
        wrongCount: 1,
      });
      const { guess } = await renderSpeedGame({
        remote: remoteRun({ onFinish }),
      });

      await solveAll(guess, { withOneMiss: true });

      expect(
        await screen.findByRole("heading", { name: "Your score" }),
      ).toBeVisible();
      expect(onFinish).toHaveBeenCalledExactlyOnceWith([
        ["wrong", "react"],
        ["vue"],
        ["nextjs"],
      ]);
      expect(
        screen.getByText("00:10.0", { selector: "#speed-score" }),
      ).toBeVisible();
      expect(screen.getByText("Solve time 00:09.0")).toBeVisible();
    });

    it("says the time is being saved while waiting for the server", async () => {
      const onFinish = vi.fn().mockReturnValue(new Promise(() => {}));
      const { guess } = await renderSpeedGame({
        remote: remoteRun({ onFinish }),
      });

      await solveAll(guess);

      expect(
        screen.getByRole("heading", { name: "Saving your time" }),
      ).toBeVisible();
    });

    it("lets the player retry when saving fails", async () => {
      const onFinish = vi
        .fn()
        .mockRejectedValueOnce(new Error("offline"))
        .mockResolvedValueOnce({
          durationMs: 9000,
          scoreMs: 9000,
          wrongCount: 0,
        });
      const { guess, user } = await renderSpeedGame({
        remote: remoteRun({ onFinish }),
      });
      await solveAll(guess);
      expect(
        await screen.findByRole("heading", {
          name: "Couldn't save your result",
        }),
      ).toBeVisible();

      await user.click(screen.getByRole("button", { name: "Try again" }));

      expect(
        await screen.findByRole("heading", { name: "Your score" }),
      ).toBeVisible();
      expect(onFinish).toHaveBeenCalledTimes(2);
    });

    it("shows the result of a run already finished, with no way to replay", async () => {
      await renderSpeedGame({
        onRestart: undefined,
        remote: remoteRun({
          result: { durationMs: 9000, scoreMs: 11_000, wrongCount: 2 },
        }),
      });

      expect(screen.getByRole("heading", { name: "Your score" })).toBeVisible();
      expect(
        screen.getByText("00:11.0", { selector: "#speed-score" }),
      ).toBeVisible();
      expect(
        screen.getByText("Come back tomorrow for a new series."),
      ).toBeVisible();
      expect(
        screen.queryByRole("textbox", { name: "Logo name" }),
      ).not.toBeInTheDocument();
    });

    describe("when the run times out", () => {
      it("locks a run left unfinished past the time cap and shows the answers", async () => {
        await renderSpeedGame({
          remote: remoteRun({ startedAt: Date.now() - RUN_CAP_MS - 1000 }),
        });

        expect(
          screen.getByRole("heading", { name: "Time's up" }),
        ).toBeVisible();
        expect(screen.getByText(/more than 15 min/)).toBeVisible();
        expect(
          screen.getByText(
            "Timed-out runs aren't ranked. Come back tomorrow for a new series.",
          ),
        ).toBeVisible();
        expect(
          screen.queryByRole("textbox", { name: "Logo name" }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "React: see details" }),
        ).toBeVisible();
      });

      it("locks a run the server reports as expired", async () => {
        await renderSpeedGame({ remote: remoteRun({ expired: true }) });

        expect(
          screen.getByRole("heading", { name: "Time's up" }),
        ).toBeVisible();
      });

      it("counts the logos found before the time ran out", async () => {
        localStorage.setItem(
          "k",
          JSON.stringify({
            finishedAt: null,
            guessLog: [["react"], [], []],
            solved: [true, false, false],
            startedAt: Date.now() - RUN_CAP_MS - 1000,
          }),
        );

        await renderSpeedGame({
          persistKey: "k",
          remote: remoteRun({ startedAt: Date.now() - RUN_CAP_MS - 1000 }),
        });

        expect(
          screen.getByRole("heading", { name: "Time's up" }),
        ).toHaveAccessibleDescription(/^1\s*\/3$/);
      });

      it("opens a logo's details from the recap", async () => {
        const { user } = await renderSpeedGame({
          remote: remoteRun({ expired: true }),
        });

        await user.click(
          screen.getByRole("button", { name: "Vue: see details" }),
        );

        expect(screen.getByRole("heading", { name: "Vue" })).toBeVisible();
      });

      it("does not time out a local practice run", async () => {
        const { start } = await renderSpeedGame();

        await start();
        act(() => vi.setSystemTime(Date.now() + RUN_CAP_MS * 2));

        expect(
          screen.queryByRole("heading", { name: "Time's up" }),
        ).not.toBeInTheDocument();
      });

      it("mentions the replay is unranked for a replay", async () => {
        await renderSpeedGame({
          remote: remoteRun({ expired: true }),
          replay: true,
        });

        expect(screen.getByText(/Replays aren't ranked\./)).toBeVisible();
      });
    });
  });
});
