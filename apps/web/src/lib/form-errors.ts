export function fieldErrorText(errors: unknown[]): string | null {
  if (errors.length === 0) return null;
  return errors
    .map((err) =>
      typeof err === "string"
        ? err
        : ((err as { message?: string } | null)?.message ?? String(err)),
    )
    .join(", ");
}
