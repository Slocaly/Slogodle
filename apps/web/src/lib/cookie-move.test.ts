// @vitest-environment node
import { withCookieMove } from "./cookie-move";

const SESSION = "__Secure-better-auth.session_token";
const MARKER = "__Host-slogodle.cookie_moved";
const HOST_ONLY = "Path=/; HttpOnly; Secure; SameSite=Lax";
const EXPIRE_OLD = `${SESSION}=; Max-Age=0; ${HOST_ONLY}`;
const REISSUE = `${SESSION}=abc.sig%3D; Max-Age=604800; Domain=.slogodle.com; ${HOST_ONLY}`;
const SET_MARKER = `${MARKER}=1; Max-Age=2592000; ${HOST_ONLY}`;

async function run(
  cookie: string,
  {
    url = "https://tech.slogodle.com/",
    response = new Response("ok"),
  }: { url?: string; response?: Response } = {},
) {
  const handle = vi.fn(async (_request: Request) => response);
  const result = await withCookieMove(
    new Request(url, { headers: { cookie } }),
    handle,
  );
  return {
    result,
    setCookies: result.headers.getSetCookie(),
    seenCookie: handle.mock.calls[0][0].headers.get("cookie"),
  };
}

describe("withCookieMove", () => {
  it("moves a single session cookie to .slogodle.com, keeping its raw value", async () => {
    const { result, setCookies, seenCookie } = await run(
      `a=1; ${SESSION}=abc.sig%3D`,
    );

    expect(setCookies).toEqual([EXPIRE_OLD, REISSUE, SET_MARKER]);
    expect(seenCookie).toBe(`a=1; ${SESSION}=abc.sig%3D`);
    expect(await result.text()).toBe("ok");
  });

  it("does not re-issue the old value when the app sets the session cookie", async () => {
    const fromApp = `${SESSION}=new; Domain=.slogodle.com; Path=/`;
    const { setCookies } = await run(`${SESSION}=old`, {
      response: new Response("ok", { headers: { "set-cookie": fromApp } }),
    });

    expect(setCookies).toEqual([fromApp, EXPIRE_OLD, SET_MARKER]);
  });

  it("shows the app only the newest cookie when there are two", async () => {
    const { setCookies, seenCookie } = await run(
      `${SESSION}=dead; a=1; ${SESSION}=good`,
    );

    expect(seenCookie).toBe(`a=1; ${SESSION}=good`);
    expect(setCookies).toEqual([EXPIRE_OLD, SET_MARKER]);
  });

  it("keeps the request body when it rewrites the cookies", async () => {
    let body = "";
    await withCookieMove(
      new Request("https://tech.slogodle.com/api/progress/sync", {
        method: "POST",
        headers: { cookie: `${SESSION}=dead; ${SESSION}=good` },
        body: "payload",
      }),
      async (request) => {
        body = await request.text();
        return new Response("ok");
      },
    );

    expect(body).toBe("payload");
  });

  it("adds no cookie to a publicly cacheable response", async () => {
    const { setCookies } = await run(`${SESSION}=abc`, {
      response: new Response("<svg/>", {
        headers: { "cache-control": "public, max-age=31536000, immutable" },
      }),
    });

    expect(setCookies).toEqual([]);
  });

  it.each([
    ["the browser was already moved", `${MARKER}=1; ${SESSION}=abc`, undefined],
    ["there is no session cookie", "a=1", undefined],
    ["the host is brand", `${SESSION}=abc`, "https://brand.slogodle.com/"],
    ["the host is localhost", `${SESSION}=abc`, "http://localhost:3000/"],
    ["the host is workers.dev", `${SESSION}=abc`, "https://x.workers.dev/"],
  ])("does nothing when %s", async (_label, cookie, url) => {
    const { setCookies, seenCookie } = await run(cookie, { url });

    expect(setCookies).toEqual([]);
    expect(seenCookie).toBe(cookie);
  });
});
