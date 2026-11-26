import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// React's act() environment flag, so state updates outside act() are reported.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
  // Absent in tests that opt into the node environment.
  if (typeof localStorage !== "undefined") localStorage.clear();
});
