import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { signupSchema } from "../lib/auth-schemas";
import { fieldErrorText } from "../lib/form-errors";
import { GithubIcon } from "../components/icons/GithubIcon";
import styles from "./signup.module.css";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: { onChange: signupSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: signUpError } = await authClient.signUp.email({
        name: value.username,
        email: value.email,
        password: value.password,
      });
      if (signUpError) {
        setError(signUpError.message ?? m.signup_generic_error());
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
      setError(signInError.message ?? m.signup_generic_error());
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          ← {m.signup_back_to_game()}
        </Link>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>{m.signup_title()}</h1>

        <form
          className={styles.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Subscribe selector={(state) => state.submissionAttempts > 0}>
            {(hasSubmitted) => (
              <>
                <form.Field name="username">
                  {(field) => {
                    const errorText = hasSubmitted
                      ? fieldErrorText(field.state.meta.errors)
                      : null;
                    return (
                      <label className={styles.field}>
                        <span className={styles.label}>
                          {m.signup_username_label()}
                        </span>
                        <input
                          type="text"
                          className={styles.input}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {errorText && (
                          <span className={styles.fieldError}>
                            {errorText}
                          </span>
                        )}
                      </label>
                    );
                  }}
                </form.Field>

                <form.Field name="email">
                  {(field) => {
                    const errorText = hasSubmitted
                      ? fieldErrorText(field.state.meta.errors)
                      : null;
                    return (
                      <label className={styles.field}>
                        <span className={styles.label}>
                          {m.signup_email_label()}
                        </span>
                        <input
                          type="email"
                          className={styles.input}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {errorText && (
                          <span className={styles.fieldError}>
                            {errorText}
                          </span>
                        )}
                      </label>
                    );
                  }}
                </form.Field>

                <form.Field name="password">
                  {(field) => {
                    const errorText = hasSubmitted
                      ? fieldErrorText(field.state.meta.errors)
                      : null;
                    return (
                      <label className={styles.field}>
                        <span className={styles.label}>
                          {m.signup_password_label()}
                        </span>
                        <input
                          type="password"
                          className={styles.input}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {errorText && (
                          <span className={styles.fieldError}>
                            {errorText}
                          </span>
                        )}
                      </label>
                    );
                  }}
                </form.Field>

                <form.Field name="confirmPassword">
                  {(field) => {
                    const errorText = hasSubmitted
                      ? fieldErrorText(field.state.meta.errors)
                      : null;
                    return (
                      <label className={styles.field}>
                        <span className={styles.label}>
                          {m.signup_confirm_password_label()}
                        </span>
                        <input
                          type="password"
                          className={styles.input}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {errorText && (
                          <span className={styles.fieldError}>
                            {errorText}
                          </span>
                        )}
                      </label>
                    );
                  }}
                </form.Field>
              </>
            )}
          </form.Subscribe>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? m.signup_submitting() : m.signup_submit()}
              </button>
            )}
          </form.Subscribe>
          {error && (
            <p className={styles.error}>{m.signup_error({ error })}</p>
          )}
        </form>

        <div className={styles.divider}>{m.signup_or()}</div>

        <button
          type="button"
          className={styles.githubBtn}
          onClick={() => void handleGithub()}
        >
          <GithubIcon className={styles.githubIcon} />
          {m.signup_github()}
        </button>

        <Link to="/login" className={styles.authLink}>
          {m.signup_login_link()}
        </Link>
      </div>
    </div>
  );
}
