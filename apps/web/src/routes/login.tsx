import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { GithubIcon } from "../components/icons/GithubIcon";
import styles from "./login.module.css";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message ?? "Sign in failed");
      return;
    }
    navigate({ to: "/admin" });
  };

  const handleGithub = () => {
    authClient.signIn.social({ provider: "github", callbackURL: "/admin" });
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

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>{m.login_email_label()}</span>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{m.login_password_label()}</span>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? m.login_submitting() : m.login_submit()}
          </button>
          {error && <p className={styles.error}>{m.login_error({ error })}</p>}
        </form>

        <div className={styles.divider}>{m.login_or()}</div>

        <button type="button" className={styles.githubBtn} onClick={handleGithub}>
          <GithubIcon className={styles.githubIcon} />
          {m.login_github()}
        </button>
      </div>
    </div>
  );
}
