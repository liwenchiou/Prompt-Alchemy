import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BulkInstallPanel from "./BulkInstallPanel";
import { copyToClipboard } from "../../utils/copyToClipboard";

vi.mock("../../utils/copyToClipboard", () => ({
  copyToClipboard: vi.fn(),
}));

const skillA = {
  id: "skill-1",
  name: "frontend-design",
  repoOwner: "anthropics",
  repoName: "claude-plugins-official",
  skillSlug: "frontend-design",
  installKind: "single_kit",
  supportedAgents: ["claude-code"],
};

const skillB = {
  id: "skill-2",
  name: "lazy-senior",
  repoOwner: "liwenchiou",
  repoName: "liai",
  skillSlug: "lazy-senior",
  installKind: "single_kit",
  supportedAgents: ["codex"],
};

describe("BulkInstallPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(copyToClipboard).mockResolvedValue(true);
  });

  it("預設全選，組出來的指令包含所有 Skill 的安裝指令", () => {
    render(<BulkInstallPanel skills={[skillA, skillB]} scopeLabel="全部收藏" />);

    expect(screen.getByText(/# frontend-design/)).toBeInTheDocument();
    expect(
      screen.getByText(/npx skills add anthropics\/claude-plugins-official --skill frontend-design -a claude-code/)
    ).toBeInTheDocument();
    expect(screen.getByText(/# lazy-senior/)).toBeInTheDocument();
    expect(
      screen.getByText(/npx skills add liwenchiou\/liai --skill lazy-senior -a codex/)
    ).toBeInTheDocument();
  });

  it("取消勾選某個 Skill 後，指令裡不再包含它，其他 Skill 不受影響", async () => {
    render(<BulkInstallPanel skills={[skillA, skillB]} scopeLabel="全部收藏" />);

    await userEvent.click(screen.getByText("/frontend-design"));

    expect(screen.queryByText(/# frontend-design/)).not.toBeInTheDocument();
    expect(screen.getByText(/# lazy-senior/)).toBeInTheDocument();
  });

  it("複製全部按鈕呼叫 copyToClipboard，帶入目前勾選組出來的完整指令", async () => {
    render(<BulkInstallPanel skills={[skillA]} scopeLabel="全部收藏" />);

    await userEvent.click(screen.getByText("複製全部"));

    expect(copyToClipboard).toHaveBeenCalledWith(
      "# frontend-design\nnpx skills add anthropics/claude-plugins-official --skill frontend-design -a claude-code"
    );
  });

  it("範圍內沒有 Skill 時顯示提示文字，不顯示清單", () => {
    render(<BulkInstallPanel skills={[]} scopeLabel="Default" />);

    expect(
      screen.getByText("這個範圍內沒有可安裝的 Skill。")
    ).toBeInTheDocument();
  });

  it("沒有任何安裝指令的 Skill，清單上會標註「尚無安裝指令」", () => {
    const skillNoCommand = { id: "skill-3", name: "no-repo" };
    render(
      <BulkInstallPanel skills={[skillNoCommand]} scopeLabel="全部收藏" />
    );

    expect(screen.getByText("（尚無安裝指令）")).toBeInTheDocument();
  });

  describe("agent toggle：只組出目前 toggle 開啟的 agent 那幾行", () => {
    const skillMultiAgent = {
      id: "skill-multi",
      name: "matt",
      repoOwner: "mattpocock",
      repoName: "skills",
      skillSlug: "*",
      installKind: "full_package",
      supportedAgents: ["claude-code", "codex", "cursor"],
    };

    it("預設三個 agent 都是開的，組出來的指令包含三行", () => {
      render(
        <BulkInstallPanel skills={[skillMultiAgent]} scopeLabel="全部收藏" />
      );

      expect(
        screen.getByText(/npx skills add mattpocock\/skills --skill '\*' -a claude-code/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/npx skills add mattpocock\/skills --skill '\*' -a codex/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/npx skills add mattpocock\/skills --skill '\*' -a cursor/)
      ).toBeInTheDocument();
    });

    it("關掉 Cursor 的 toggle 後，指令裡不再有 -a cursor 那行，其他 agent 不受影響", async () => {
      render(
        <BulkInstallPanel skills={[skillMultiAgent]} scopeLabel="全部收藏" />
      );

      await userEvent.click(screen.getByRole("button", { name: /Cursor/ }));

      const script = screen.getByTestId("bulk-install-script").textContent;
      expect(script).toContain("-a claude-code");
      expect(script).toContain("-a codex");
      expect(script).not.toContain("-a cursor");
    });

    it("git_clone 的 Skill 不分 agent，關掉所有 agent toggle 也不影響它的指令", async () => {
      const gitCloneSkill = {
        id: "skill-git-clone",
        name: "deck-writer",
        repoOwner: "Wcc723",
        repoName: "social-image-kit",
        installKind: "git_clone",
        supportedAgents: [],
      };
      render(
        <BulkInstallPanel skills={[gitCloneSkill]} scopeLabel="全部收藏" />
      );

      await userEvent.click(screen.getByRole("button", { name: /Claude/ }));
      await userEvent.click(screen.getByRole("button", { name: /Codex/ }));
      await userEvent.click(screen.getByRole("button", { name: /Cursor/ }));

      expect(
        screen.getByText(/curl -fsSL https:\/\/github\.com\/Wcc723\/social-image-kit/)
      ).toBeInTheDocument();
    });

    it("三個 agent 都關掉時，有 agent 區分的 Skill 不會出現在指令裡", async () => {
      render(
        <BulkInstallPanel skills={[skillMultiAgent]} scopeLabel="全部收藏" />
      );

      await userEvent.click(screen.getByRole("button", { name: /Claude/ }));
      await userEvent.click(screen.getByRole("button", { name: /Codex/ }));
      await userEvent.click(screen.getByRole("button", { name: /Cursor/ }));

      expect(screen.getByText("沒有選取任何指令。")).toBeInTheDocument();
    });
  });

  describe("批次去重：同 repo 選到 full_package 時，single_kit 直接跳過", () => {
    const fullPackage = {
      id: "cpo-full",
      name: "claude-plugins-official",
      repoOwner: "anthropics",
      repoName: "claude-plugins-official",
      skillSlug: "*",
      installKind: "full_package",
      supportedAgents: ["claude-code", "codex"],
    };
    const singleKitA = {
      id: "cpo-kit-a",
      name: "learning-output-style",
      repoOwner: "anthropics",
      repoName: "claude-plugins-official",
      skillSlug: "learning-output-style",
      installKind: "single_kit",
      supportedAgents: ["claude-code"],
    };
    const singleKitB = {
      id: "cpo-kit-b",
      name: "kotlin-lsp",
      repoOwner: "anthropics",
      repoName: "claude-plugins-official",
      skillSlug: "kotlin-lsp",
      installKind: "single_kit",
      supportedAgents: ["claude-code"],
    };
    const otherRepoKit = {
      id: "other-kit",
      name: "lazy-senior",
      repoOwner: "liwenchiou",
      repoName: "liai",
      skillSlug: "lazy-senior",
      installKind: "single_kit",
      supportedAgents: ["codex"],
    };

    it("full_package 跟同 repo 的 single_kit 都勾選時，指令只保留 full_package，single_kit 不出現", () => {
      render(
        <BulkInstallPanel
          skills={[fullPackage, singleKitA, singleKitB]}
          scopeLabel="全部收藏"
        />
      );

      const script = screen.getByTestId("bulk-install-script").textContent;
      expect(script).toContain("# claude-plugins-official");
      expect(script).not.toContain("# learning-output-style");
      expect(script).not.toContain("# kotlin-lsp");
    });

    it("不同 repo 的 single_kit 不受影響，正常出現", () => {
      render(
        <BulkInstallPanel
          skills={[fullPackage, singleKitA, otherRepoKit]}
          scopeLabel="全部收藏"
        />
      );

      expect(screen.getByText(/# lazy-senior/)).toBeInTheDocument();
    });

    it("full_package 實際上組不出任何指令（不支援目前開著的 agent）時，同 repo 的 single_kit 不會被連帶隱藏", async () => {

      const codexOnlyFullPackage = { ...fullPackage, supportedAgents: ["codex"] };
      render(
        <BulkInstallPanel
          skills={[codexOnlyFullPackage, singleKitA]}
          scopeLabel="全部收藏"
        />
      );

      await userEvent.click(screen.getByRole("button", { name: /Codex/ }));

      const script = screen.getByTestId("bulk-install-script").textContent;
      expect(script).not.toContain("# claude-plugins-official");
      expect(script).toContain("# learning-output-style");
    });
  });
});
