import { describe, it, expect } from "vitest";
import {
  buildInstallRows,
  getInstallShape,
  getDefaultAgent,
  selectInstallRow,
  getInstallDisplay,
} from "./installCommands";

describe("getInstallShape — Full package／Single kit 判斷", () => {
  it("installKind=undefined／git_clone 時回傳 null（不顯示徽章）", () => {
    expect(getInstallShape({})).toBeNull();
    expect(getInstallShape({ installKind: "git_clone" })).toBeNull();
  });

  it("installKind=full_package 時回傳 full-package", () => {
    expect(getInstallShape({ installKind: "full_package" })).toBe(
      "full-package"
    );
  });

  it("installKind=single_kit 時回傳 single-kit", () => {
    expect(getInstallShape({ installKind: "single_kit" })).toBe(
      "single-kit"
    );
  });
});

describe("buildInstallRows — 依 installKind／supportedAgents 組出對應的安裝指令列", () => {
  const baseSkill = {
    repoOwner: "mattpocock",
    repoName: "skills",
    skillSlug: "tdd",
  };

  it("full_package：每個 supportedAgents 都產生一行 --skill '*' 指令", () => {
    const rows = buildInstallRows({
      ...baseSkill,
      installKind: "full_package",
      supportedAgents: ["claude-code", "codex", "cursor"],
    });

    expect(rows).toEqual([
      {
        key: "claude",
        agent: "claude-code",
        label: "Claude",
        command: "npx skills add mattpocock/skills --skill '*' -a claude-code",
      },
      {
        key: "codex",
        agent: "codex",
        label: "Codex",
        command: "npx skills add mattpocock/skills --skill '*' -a codex",
      },
      {
        key: "cursor",
        agent: "cursor",
        label: "Cursor",
        command: "npx skills add mattpocock/skills --skill '*' -a cursor",
      },
    ]);
  });

  it("single_kit：每個 supportedAgents 都產生一行 --skill <slug> 指令", () => {
    const rows = buildInstallRows({
      ...baseSkill,
      installKind: "single_kit",
      supportedAgents: ["codex"],
    });

    expect(rows).toEqual([
      {
        key: "codex",
        agent: "codex",
        label: "Codex",
        command: "npx skills add mattpocock/skills --skill tdd -a codex",
      },
    ]);
  });

  it("supportedAgents 為空陣列時不產生任何行", () => {
    const rows = buildInstallRows({
      ...baseSkill,
      installKind: "single_kit",
      supportedAgents: [],
    });

    expect(rows).toEqual([]);
  });

  it("row 順序固定為 claude-code → codex → cursor，不受 supportedAgents 陣列順序影響", () => {
    const rows = buildInstallRows({
      ...baseSkill,
      installKind: "single_kit",
      supportedAgents: ["cursor", "codex", "claude-code"],
    });

    expect(rows.map((row) => row.key)).toEqual(["claude", "codex", "cursor"]);
  });

  it("installKind='git_clone' 時只回傳 curl | tar 一組（bash + PowerShell 兩版），忽略 supportedAgents", () => {
    const rows = buildInstallRows({
      ...baseSkill,
      installKind: "git_clone",
      supportedAgents: [],
    });

    expect(rows).toEqual([
      {
        key: "git-clone",
        label: "Git Clone",
        command: [
          "# Git Bash / WSL / macOS / Linux：",
          "curl -fsSL https://github.com/mattpocock/skills/archive/HEAD.tar.gz | tar -xz --strip-components=1 -k",
          "# Windows PowerShell：",
          "curl.exe -fsSL https://github.com/mattpocock/skills/archive/HEAD.tar.gz | tar -xz --strip-components=1 -k",
        ].join("\n"),
      },
    ]);
  });

  it("沒有 repoOwner／repoName 時回傳空陣列", () => {
    expect(buildInstallRows({ installKind: "full_package", supportedAgents: ["codex"] })).toEqual([]);
  });

  it("installKind 是 undefined／未知值時回傳空陣列，不誤組出 --skill undefined 這種指令", () => {
    expect(
      buildInstallRows({ ...baseSkill, supportedAgents: ["codex"] })
    ).toEqual([]);
    expect(
      buildInstallRows({
        ...baseSkill,
        installKind: "not-a-real-kind",
        supportedAgents: ["codex"],
      })
    ).toEqual([]);
  });
});

// 12 號票：agent 選擇器預設 Codex，但不能選到 supportedAgents 沒有的 agent。
describe("getDefaultAgent — agent 選擇器的預設值", () => {
  it("supportedAgents 包含 codex 時預設選 codex", () => {
    expect(
      getDefaultAgent({ supportedAgents: ["claude-code", "codex", "cursor"] })
    ).toBe("codex");
  });

  it("supportedAgents 不含 codex 時，預設選第一個支援的 agent", () => {
    expect(getDefaultAgent({ supportedAgents: ["cursor", "claude-code"] })).toBe(
      "cursor"
    );
  });

  it("supportedAgents 是空陣列或缺漏時回傳 null", () => {
    expect(getDefaultAgent({ supportedAgents: [] })).toBeNull();
    expect(getDefaultAgent({})).toBeNull();
  });
});

// 切換 agent 選擇器後，複製的指令內容要跟著換成對應 agent 那一行。
describe("selectInstallRow — 依目前選定的 agent 找出對應那一行", () => {
  const rows = buildInstallRows({
    repoOwner: "mattpocock",
    repoName: "skills",
    skillSlug: "tdd",
    installKind: "single_kit",
    supportedAgents: ["claude-code", "codex"],
  });

  it("切換 agent 會拿到不同的那一行指令", () => {
    expect(selectInstallRow(rows, "claude-code").command).toBe(
      "npx skills add mattpocock/skills --skill tdd -a claude-code"
    );
    expect(selectInstallRow(rows, "codex").command).toBe(
      "npx skills add mattpocock/skills --skill tdd -a codex"
    );
  });

  it("選到 rows 裡沒有的 agent 時回傳 null", () => {
    expect(selectInstallRow(rows, "cursor")).toBeNull();
  });
});

// SkillCard／AgentSkillDetail 共用的安裝區塊推導邏輯（見 code review：兩個
// 元件原本各自重複這段判斷，收斂進 installCommands.js 一份）。
describe("getInstallDisplay — SkillCard／AgentSkillDetail 共用的安裝區塊推導", () => {
  it("git_clone：不分 agent，只回傳保底那一行，agent 選項為空", () => {
    const skill = {
      repoOwner: "Wcc723",
      repoName: "social-image-kit",
      installKind: "git_clone",
      supportedAgents: [],
    };
    const display = getInstallDisplay(skill, "codex");

    expect(display.isGitClone).toBe(true);
    expect(display.availableAgents).toEqual([]);
    expect(display.selectedRow.key).toBe("git-clone");
  });

  it("single_kit：依 selectedAgent 選出對應那一行，並只列出 supportedAgents 有的選項", () => {
    const skill = {
      repoOwner: "mattpocock",
      repoName: "skills",
      skillSlug: "tdd",
      installKind: "single_kit",
      supportedAgents: ["claude-code", "codex"],
    };

    const display = getInstallDisplay(skill, "codex");
    expect(display.isGitClone).toBe(false);
    expect(display.selectedRow.command).toBe(
      "npx skills add mattpocock/skills --skill tdd -a codex"
    );
    expect(display.availableAgents).toEqual(["claude-code", "codex"]);
  });

  it("selectedAgent 是這個 skill 不支援的 agent 時，selectedRow 回傳 null", () => {
    const skill = {
      repoOwner: "mattpocock",
      repoName: "skills",
      skillSlug: "tdd",
      installKind: "single_kit",
      supportedAgents: ["codex"],
    };

    expect(getInstallDisplay(skill, "cursor").selectedRow).toBeNull();
  });
});
