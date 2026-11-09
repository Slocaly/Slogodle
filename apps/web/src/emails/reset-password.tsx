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
  cardBg: "#fffdf6",
  muted: "#626079",
  pageBg: "#f6dffb",
  text: "#292440",
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
    backgroundColor: colors.pageBg,
    fontFamily:
      "'Trebuchet MS', 'Segoe UI', Verdana, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "32px 16px",
  } satisfies CSSProperties,
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    maxWidth: 420,
    padding: 32,
    width: "100%",
  } satisfies CSSProperties,
  brandWrap: {
    margin: "0 0 24px",
    textAlign: "center",
  } satisfies CSSProperties,
  // Applied to the <img> itself: most clients ignore styles on an <img>'s
  // alt text, but Outlook.com and a few others do render them, so a blocked
  // image still reads as a Slogodle-branded label instead of broken art.
  brandImg: {
    color: colors.text,
    fontFamily: "'Yang Bagus', 'Fredoka', sans-serif",
    fontSize: 20,
    fontWeight: 700,
  } satisfies CSSProperties,
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 12px",
  } satisfies CSSProperties,
  paragraph: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 1.5,
    margin: "0 0 24px",
  } satisfies CSSProperties,
  buttonWrap: {
    margin: "0 0 24px",
    textAlign: "center",
  } satisfies CSSProperties,
  button: {
    backgroundColor: colors.yellow,
    borderRadius: 999,
    color: colors.text,
    display: "inline-block",
    fontSize: 14,
    fontWeight: 700,
    padding: "12px 28px",
    textDecoration: "none",
  } satisfies CSSProperties,
  footnote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 1.5,
    margin: 0,
  } satisfies CSSProperties,
  hr: {
    border: "none",
    borderTop: "1px solid #29244022",
    margin: "24px 0",
  } satisfies CSSProperties,
  tagline: {
    color: colors.muted,
    fontSize: 11,
    margin: 0,
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reset your Slogodle password</title>
      </head>
      <body style={styles.body}>
        <span style={styles.preheader}>
          Reset the password for your Slogodle account. This link expires in 1
          hour.
        </span>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
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
                          We received a request to reset the password for your
                          Slogodle account. Click the button below to choose a
                          new one.
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
