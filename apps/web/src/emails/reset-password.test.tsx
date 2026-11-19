import { render } from "@react-email/render";
import type * as Brands from "src/brands";
import {
  ResetPasswordEmail,
  resetPasswordEmailSubject,
  resetPasswordEmailText,
} from "./reset-password";

vi.mock("src/brands", async (importOriginal) => {
  const actual = await importOriginal<typeof Brands>();
  return { ...actual, brand: { ...actual.brand, name: "Acme" } };
});

describe("reset password email", () => {
  it("names the brand in the html", async () => {
    const html = await render(
      <ResetPasswordEmail
        url="https://example.test/reset"
        logoImageUrl="https://example.test/logo.png"
      />,
    );

    expect(html).toContain("Acme");
    expect(html).not.toContain("Slogodle");
  });

  it("names the brand in the subject and plain text", () => {
    expect(resetPasswordEmailSubject()).toBe("Reset your Acme password");
    expect(resetPasswordEmailText("https://example.test/reset")).toContain(
      "Reset your Acme password: https://example.test/reset",
    );
  });
});
