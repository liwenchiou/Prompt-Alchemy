import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WelcomeModal from "./WelcomeModal";
import { useOnboarding } from "../../context/OnboardingContext";

vi.mock("../../context/OnboardingContext", () => ({
  useOnboarding: vi.fn(),
}));

describe("WelcomeModal Component", () => {
  it("renders null when isWelcomeOpen is false", () => {
    vi.mocked(useOnboarding).mockReturnValue({
      isWelcomeOpen: false,
      startTour: vi.fn(),
      closeWelcomeModal: vi.fn(),
    });

    const { container } = render(<WelcomeModal />);
    expect(container.firstChild).toBeNull();
  });

  it("renders welcome modal content when isWelcomeOpen is true", () => {
    const mockStartTour = vi.fn();
    const mockCloseModal = vi.fn();

    vi.mocked(useOnboarding).mockReturnValue({
      isWelcomeOpen: true,
      startTour: mockStartTour,
      closeWelcomeModal: mockCloseModal,
    });

    render(<WelcomeModal />);

    expect(screen.getByText("歡迎來到")).toBeInTheDocument();
    expect(screen.getByText("開始 10 秒導覽")).toBeInTheDocument();
    expect(screen.getByText("跳過指引，直接探索")).toBeInTheDocument();
  });

  it("calls startTour when '開始 10 秒導覽' button is clicked", () => {
    const mockStartTour = vi.fn();
    const mockCloseModal = vi.fn();

    vi.mocked(useOnboarding).mockReturnValue({
      isWelcomeOpen: true,
      startTour: mockStartTour,
      closeWelcomeModal: mockCloseModal,
    });

    render(<WelcomeModal />);

    const startBtn = screen.getByRole("button", { name: /開始 10 秒導覽/i });
    fireEvent.click(startBtn);

    expect(mockStartTour).toHaveBeenCalledTimes(1);
  });

  it("calls closeWelcomeModal when close button or skip button is clicked", () => {
    const mockStartTour = vi.fn();
    const mockCloseModal = vi.fn();

    vi.mocked(useOnboarding).mockReturnValue({
      isWelcomeOpen: true,
      startTour: mockStartTour,
      closeWelcomeModal: mockCloseModal,
    });

    render(<WelcomeModal />);

    const skipBtn = screen.getByRole("button", { name: /跳過指引，直接探索/i });
    fireEvent.click(skipBtn);
    expect(mockCloseModal).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole("button", { name: /Close Modal/i });
    fireEvent.click(closeBtn);
    expect(mockCloseModal).toHaveBeenCalledTimes(2);
  });
});
