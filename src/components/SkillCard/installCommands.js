const AGENT_ROWS = [
  { agent: "claude-code", key: "claude", label: "Claude" },
  { agent: "codex", key: "codex", label: "Codex" },
  { agent: "cursor", key: "cursor", label: "Cursor" },
];

function buildGitCloneSnippet(repoLabel) {
  const url = `https://github.com/${repoLabel}/archive/HEAD.tar.gz`;
  return [
    `curl -fsSL ${url} | tar -xz --strip-components=1 -k`
  ].join("\n");
}

/**
 * 判斷這筆 skill 的安裝形狀，供 SkillCard 顯示徽章用。
 * @returns {'full-package'|'single-kit'|null} installKind 為 git_clone 或未知值時回傳 null
 */
export function getInstallShape(skill) {
  if (skill?.installKind === "full_package") return "full-package";
  if (skill?.installKind === "single_kit") return "single-kit";
  return null;
}

export function buildInstallRows(skill) {
  const repoLabel =
    skill?.repoOwner && skill?.repoName
      ? `${skill.repoOwner}/${skill.repoName}`
      : null;
  if (!repoLabel) return [];

  if (skill?.installKind === "git_clone") {
    return [
      {
        key: "git-clone",
        label: "Git Clone",
        command: buildGitCloneSnippet(repoLabel),
      },
    ];
  }

  if (skill?.installKind !== "full_package" && skill?.installKind !== "single_kit") {
    return [];
  }

  const supportedAgents = skill?.supportedAgents || [];
  const rows = [];

  for (const { agent, key, label } of AGENT_ROWS) {
    if (!supportedAgents.includes(agent)) continue;
    const command =
      skill?.installKind === "full_package"
        ? `npx skills add ${repoLabel} --skill '*' -a ${agent}`
        : `npx skills add ${repoLabel} --skill ${skill?.skillSlug} -a ${agent}`;
    rows.push({ key, agent, label, command });
  }

  return rows;
}

export function getDefaultAgent(skill) {
  const supportedAgents = skill?.supportedAgents || [];
  if (supportedAgents.includes("codex")) return "codex";
  return supportedAgents[0] || null;
}


export function selectInstallRow(rows, agent) {
  return rows.find((row) => row.agent === agent) || null;
}

export function getInstallDisplay(skill, selectedAgent) {
  const installRows = buildInstallRows(skill);
  const installShape = getInstallShape(skill);
  const isGitClone = skill?.installKind === "git_clone";
  const selectedRow = isGitClone
    ? installRows[0] || null
    : selectInstallRow(installRows, selectedAgent);
  const availableAgents = isGitClone
    ? []
    : AGENT_ROWS.map((row) => row.agent).filter((agent) =>
      skill?.supportedAgents?.includes(agent)
    );

  return { installRows, installShape, isGitClone, selectedRow, availableAgents };
}
