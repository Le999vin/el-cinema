import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TopBar } from "@/components/layout/top-bar";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/movies",
  useRouter: () => ({
    push,
    replace,
  }),
  useSearchParams: () => new URLSearchParams(""),
}));

describe("TopBar", () => {
  it("routes search submissions to the dedicated search page", () => {
    render(<TopBar displayName="Levin" />);

    fireEvent.change(screen.getByLabelText(/search movies or cinemas/i), {
      target: { value: "Dune" },
    });
    fireEvent.submit(screen.getByRole("search"));

    expect(push).toHaveBeenCalledWith("/search?query=Dune");
  });
});
