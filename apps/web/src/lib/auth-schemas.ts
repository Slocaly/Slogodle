import * as v from "valibot";
import { m } from "../paraglide/messages.js";

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email()),
  password: v.pipe(v.string(), v.nonEmpty()),
});

export type LoginFormValues = v.InferInput<typeof loginSchema>;

export const signupSchema = v.pipe(
  v.object({
    username: v.pipe(v.string(), v.trim(), v.nonEmpty()),
    email: v.pipe(v.string(), v.trim(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
    confirmPassword: v.pipe(v.string(), v.nonEmpty()),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      m.signup_password_mismatch(),
    ),
    ["confirmPassword"],
  ),
);

export type SignupFormValues = v.InferInput<typeof signupSchema>;

export const forgotPasswordSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email()),
});

export type ForgotPasswordFormValues = v.InferInput<typeof forgotPasswordSchema>;

export const resetPasswordSchema = v.pipe(
  v.object({
    newPassword: v.pipe(v.string(), v.minLength(8)),
    confirmPassword: v.pipe(v.string(), v.nonEmpty()),
  }),
  v.forward(
    v.partialCheck(
      [["newPassword"], ["confirmPassword"]],
      (input) => input.newPassword === input.confirmPassword,
      m.signup_password_mismatch(),
    ),
    ["confirmPassword"],
  ),
);

export type ResetPasswordFormValues = v.InferInput<typeof resetPasswordSchema>;
