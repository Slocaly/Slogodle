import type { CSSProperties } from "react";

// Table-based layout with inline styles on purpose — Outlook desktop renders
// email HTML with Word's engine, which ignores flexbox/grid and most modern
// CSS. This keeps the template working across Gmail, Apple Mail, Outlook,
// and Yahoo alike.
//
// Colors are the hex equivalents of this app's oklch --bg-1 / --card-bg /
// --text / --muted / --accent-pink / --accent-yellow (light theme) — email
// clients have poor/no oklch() support, so the palette can't reference the
// site's CSS variables directly.
const colors = {
  pageBg: "#f6dffb",
  cardBg: "#fffdf6",
  text: "#292440",
  muted: "#626079",
  yellow: "#efd369",
};

// Pixel dimensions of public/email/slogodle-wordmark.png (rendered offline
// with satori + resvg from the site's actual Yang Bagus font and title
// colors, then trimmed — see the image itself for how it was produced).
// The file is 2x these for retina sharpness; the <img> below is sized down
// to these values.
const LOGO_WIDTH = 222;
const LOGO_HEIGHT = 56;

const styles = {
  body: {
    margin: 0,
    padding: "32px 16px",
    backgroundColor: colors.pageBg,
    fontFamily:
      "'Trebuchet MS', 'Segoe UI', Verdana, Helvetica, Arial, sans-serif",
  } satisfies CSSProperties,
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 32,
  } satisfies CSSProperties,
  brandWrap: {
    textAlign: "center",
    margin: "0 0 24px",
  } satisfies CSSProperties,
  // Applied to the <img> itself: most clients ignore styles on an <img>'s
  // alt text, but Outlook.com and a few others do render them, so a blocked
  // image still reads as a Slogodle-branded label instead of broken art.
  brandImg: {
    fontFamily: "'Yang Bagus', 'Fredoka', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    color: colors.text,
  } satisfies CSSProperties,
  heading: {
    margin: "0 0 12px",
    fontSize: 20,
    fontWeight: 700,
    color: colors.text,
  } satisfies CSSProperties,
  paragraph: {
    margin: "0 0 24px",
    fontSize: 14,
    lineHeight: 1.5,
    color: colors.muted,
  } satisfies CSSProperties,
  buttonWrap: {
    textAlign: "center",
    margin: "0 0 24px",
  } satisfies CSSProperties,
  button: {
    display: "inline-block",
    backgroundColor: colors.yellow,
    color: colors.text,
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    borderRadius: 999,
    padding: "12px 28px",
  } satisfies CSSProperties,
  footnote: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    color: colors.muted,
  } satisfies CSSProperties,
  hr: {
    border: "none",
    borderTop: "1px solid #29244022",
    margin: "24px 0",
  } satisfies CSSProperties,
  tagline: {
    margin: 0,
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
  } satisfies CSSProperties,
  preheader: {
    display: "none",
    fontSize: 1,
    lineHeight: 1,
    maxHeight: 0,
    maxWidth: 0,
    opacity: 0,
    overflow: "hidden",
  } satisfies CSSProperties,
};

export interface ResetPasswordEmailProps {
  url: string;
  // Absolute URL to public/email/slogodle-wordmark.png, built from
  // env.BETTER_AUTH_URL by the caller — this component doesn't know the
  // app's origin, and email images must be absolute URLs.
  logoImageUrl: string;
}

export function ResetPasswordEmail({
  url,
  logoImageUrl,
}: ResetPasswordEmailProps) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reset your Slogodle password</title>
      </head>
      <body style={styles.body}>
        <span style={styles.preheader}>
          Reset the password for your Slogodle account. This link expires in
          1 hour.
        </span>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width={420}
                  cellPadding={0}
                  cellSpacing={0}
                  style={styles.card}
                >
                  <tbody>
                    <tr>
                      <td>
                        <div style={styles.brandWrap}>
                          <img
                            src={logoImageUrl}
                            width={LOGO_WIDTH}
                            height={LOGO_HEIGHT}
                            alt="Slogodle"
                            style={styles.brandImg}
                          />
                        </div>
                        <h1 style={styles.heading}>Reset your password</h1>
                        <p style={styles.paragraph}>
                          We received a request to reset the password for
                          your Slogodle account. Click the button below to
                          choose a new one.
                        </p>
                        <div style={styles.buttonWrap}>
                          <a href={url} style={styles.button}>
                            Reset password
                          </a>
                        </div>
                        <p style={styles.footnote}>
                          This link expires in 1 hour. If you didn't request
                          this, you can safely ignore this email.
                        </p>
                        <hr style={styles.hr} />
                        <p style={styles.tagline}>
                          Slogodle — guess the logo, keep your streak.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export default ResetPasswordEmail;

ResetPasswordEmail.PreviewProps = {
  url: "https://slogodle.com/reset-password?token=preview-token",
  // `pnpm email` serves this template from its own dev server, which can't
  // reach a relative app path — point this at a deployed origin, or run the
  // app's own dev server and swap in its localhost URL, to preview for real.
  logoImageUrl: "https://slogodle.com/email/slogodle-wordmark.png",
} satisfies ResetPasswordEmailProps;
