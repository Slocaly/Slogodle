import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestingLogo } from "src/test/create-testing-logo";
import { render } from "src/test/render-with-providers";
import { GuessForm } from "../GuessForm";

const bank = [
  createTestingLogo({ name: "React" }),
  createTestingLogo({ name: "Redux" }),
  createTestingLogo({ name: "Vue" }),
];

const renderGuessForm = (
  props: Partial<React.ComponentProps<typeof GuessForm>> = {},
) =>
  act(() =>
    render(
      <GuessForm
        attemptCount={0}
        bank={bank}
        logo={bank[0]}
        onSubmit={vi.fn()}
        {...props}
      />,
    ),
  );

describe("GuessForm", () => {
  it("shows the hint prompt before any wrong guess", async () => {
    await renderGuessForm({ attemptCount: 0 });

    expect(screen.getByText("Wrong guess reveals a hint.")).toBeVisible();
  });

  it("reveals a hint after a wrong guess", async () => {
    await renderGuessForm({ attemptCount: 1 });

    expect(screen.getByText("Founded: 2013")).toBeVisible();
  });

  it("suggests the logos whose name starts with what is typed", async () => {
    const user = userEvent.setup();
    await renderGuessForm();

    await user.type(screen.getByRole("combobox"), "re");

    expect(await screen.findByRole("option", { name: "React" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Redux" })).toBeVisible();
    expect(
      screen.queryByRole("option", { name: "Vue" }),
    ).not.toBeInTheDocument();
  });

  it("suggests nothing while the input is empty", async () => {
    await renderGuessForm();

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("submits the picked suggestion and clears the input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    await renderGuessForm({ onSubmit });

    await user.type(screen.getByRole("combobox"), "vu");
    await user.click(await screen.findByRole("option", { name: "Vue" }));

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("Vue");
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("submits the highlighted suggestion when pressing Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    await renderGuessForm({ onSubmit });

    await user.type(screen.getByRole("combobox"), "red");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("Redux");
  });

  it("does not submit free text that matches no suggestion", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    await renderGuessForm({ onSubmit });

    await user.type(screen.getByRole("combobox"), "zzz{Enter}");

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
