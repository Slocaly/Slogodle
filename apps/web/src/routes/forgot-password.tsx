import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { forgotPasswordSchema } from "../lib/auth-schemas";
import { fieldErrorText } from "../lib/form-errors";
import styles from "./forgot-password.module.css";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onChange: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      const { error: requestError } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: "/reset-password",
      });
      if (requestError) {
        setError(requestError.message ?? m.forgot_password_generic_error());
        return;
      }
      setSubmitted(true);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          ← {m.login_back_to_game()}
        </Link>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>{m.forgot_password_title()}</h1>

        {submitted ? (
          <>
            <p className={styles.success}>{m.forgot_password_success()}</p>
            <Link to="/login" className={styles.authLink}>
              {m.forgot_password_back_to_login()}
            </Link>
          </>
        ) : (
          <>
            <p className={styles.description}>
              {m.forgot_password_description()}
            </p>

            <form
              className={styles.form}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <form.Subscribe
                selector={(state) => state.submissionAttempts > 0}
              >
                {(hasSubmitted) => (
                  <form.Field name="email">
                    {(field) => {
                      const errorText = hasSubmitted
                        ? fieldErrorText(field.state.meta.errors)
                        : null;
                      return (
                        <label className={styles.field}>
                          <span className={styles.label}>
                            {m.forgot_password_email_label()}
                          </span>
                          <input
                            type="email"
                            className={styles.input}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(e.target.value)
                            }
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
                )}
              </form.Subscribe>

              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? m.forgot_password_submitting()
                      : m.forgot_password_submit()}
                  </button>
                )}
              </form.Subscribe>
              {error && (
                <p className={styles.error}>
                  {m.forgot_password_error({ error })}
                </p>
              )}
            </form>

            <Link to="/login" className={styles.authLink}>
              {m.forgot_password_back_to_login()}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
