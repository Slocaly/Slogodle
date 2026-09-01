import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as v from "valibot";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { resetPasswordSchema } from "../lib/auth-schemas";
import { fieldErrorText } from "../lib/form-errors";
import styles from "./reset-password.module.css";

const searchSchema = v.object({
  token: v.optional(v.string()),
  error: v.optional(v.string()),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, error: linkError } = Route.useSearch();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: { newPassword: "", confirmPassword: "" },
    validators: { onChange: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!token) return;
      setError(null);
      const { error: resetError } = await authClient.resetPassword({
        newPassword: value.newPassword,
        token,
      });
      if (resetError) {
        setError(resetError.message ?? m.reset_password_generic_error());
        return;
      }
      setSubmitted(true);
    },
  });

  const invalidLink = !token || Boolean(linkError);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          ← {m.login_back_to_game()}
        </Link>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>{m.reset_password_title()}</h1>

        {invalidLink ? (
          <>
            <p className={styles.success}>{m.reset_password_invalid_link()}</p>
            <Link to="/forgot-password" className={styles.authLink}>
              {m.reset_password_request_new_link()}
            </Link>
          </>
        ) : submitted ? (
          <>
            <p className={styles.success}>{m.reset_password_success()}</p>
            <Link to="/login" className={styles.authLink}>
              {m.reset_password_login_link()}
            </Link>
          </>
        ) : (
          <>
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
                  <>
                    <form.Field name="newPassword">
                      {(field) => {
                        const errorText = hasSubmitted
                          ? fieldErrorText(field.state.meta.errors)
                          : null;
                        return (
                          <label className={styles.field}>
                            <span className={styles.label}>
                              {m.reset_password_new_password_label()}
                            </span>
                            <input
                              type="password"
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

                    <form.Field name="confirmPassword">
                      {(field) => {
                        const errorText = hasSubmitted
                          ? fieldErrorText(field.state.meta.errors)
                          : null;
                        return (
                          <label className={styles.field}>
                            <span className={styles.label}>
                              {m.reset_password_confirm_password_label()}
                            </span>
                            <input
                              type="password"
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
                    {isSubmitting
                      ? m.reset_password_submitting()
                      : m.reset_password_submit()}
                  </button>
                )}
              </form.Subscribe>
              {error && (
                <p className={styles.error}>
                  {m.reset_password_error({ error })}
                </p>
              )}
            </form>

            <Link to="/login" className={styles.authLink}>
              {m.reset_password_login_link()}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
