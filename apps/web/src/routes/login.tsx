import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { loginSchema } from "../lib/auth-schemas";
import { fieldErrorText } from "../lib/form-errors";
import { GithubIcon } from "../components/icons/GithubIcon";
import styles from "./login.module.css";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: signInError } = await authClient.signIn.email(value);
      if (signInError) {
        setError(signInError.message ?? m.login_generic_error());
        return;
      }
      navigate({ to: "/" });
    },
  });

  const handleGithub = async () => {
    setError(null);
    const { error: signInError } = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
    if (signInError) {
      setError(signInError.message ?? m.login_generic_error());
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          ← {m.login_back_to_game()}
        </Link>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>{m.login_title()}</h1>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="email">
            {(field) => {
              const errorText = fieldErrorText(field.state.meta.errors);
              return (
                <label className={styles.field}>
                  <span className={styles.label}>
                    {m.login_email_label()}
                  </span>
                  <input
                    type="email"
                    className={styles.input}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {errorText && (
                    <span className={styles.fieldError}>{errorText}</span>
                  )}
                </label>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const errorText = fieldErrorText(field.state.meta.errors);
              return (
                <label className={styles.field}>
                  <span className={styles.label}>
                    {m.login_password_label()}
                  </span>
                  <input
                    type="password"
                    className={styles.input}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {errorText && (
                    <span className={styles.fieldError}>{errorText}</span>
                  )}
                </label>
              );
            }}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? m.login_submitting() : m.login_submit()}
              </button>
            )}
          </form.Subscribe>
          {error && <p className={styles.error}>{m.login_error({ error })}</p>}
        </form>

        <div className={styles.divider}>{m.login_or()}</div>

        <button
          type="button"
          className={styles.githubBtn}
          onClick={() => void handleGithub()}
        >
          <GithubIcon className={styles.githubIcon} />
          {m.login_github()}
        </button>

        <Link to="/signup" className={styles.authLink}>
          {m.login_signup_link()}
        </Link>
      </div>
    </div>
  );
}
