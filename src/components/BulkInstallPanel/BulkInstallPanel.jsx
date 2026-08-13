import { useState } from "react";
import { Square, SquareCheck } from "lucide-react";
import { buildInstallRows } from "../SkillCard/installCommands";
import { copyToClipboard } from "../../utils/copyToClipboard";

const AGENT_TOGGLES = [
  { agent: "claude-code", label: "Claude" },
  { agent: "codex", label: "Codex" },
  { agent: "cursor", label: "Cursor" },
];

/// 依照目前勾選的 Skill 與 Agent，組出安裝指令的文字內容
function buildScript(skills, selectedAgents) {
  const dedupedRepoKeys = new Set(
    skills
      .filter((skill) => skill.installKind === "full_package")
      .filter((skill) =>
        buildInstallRows(skill).some(
          (row) => !row.agent || selectedAgents.has(row.agent)
        )
      )
      .map((skill) => `${skill.repoOwner}/${skill.repoName}`)
  );

  return skills
    .filter((skill) => {
      if (skill.installKind !== "single_kit") return true;
      return !dedupedRepoKeys.has(`${skill.repoOwner}/${skill.repoName}`);
    })
    .map((skill) => {
      const rows = buildInstallRows(skill).filter(
        (row) => !row.agent || selectedAgents.has(row.agent)
      );
      if (rows.length === 0) return null;
      const body = rows.map((row) => row.command).join("\n");
      return `# ${skill.name}\n${body}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

//「一鍵安裝」摺疊面板：預設勾選傳入的 skills 全部，使用者可以在這裡再次取消

export default function BulkInstallPanel({ skills, scopeLabel }) {
  const skillIdsKey = skills.map((skill) => skill.id).join(",");
  const [prevSkillIdsKey, setPrevSkillIdsKey] = useState(skillIdsKey);
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(skillIdsKey ? skillIdsKey.split(",") : [])
  );
  const [copied, setCopied] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState(
    () => new Set(AGENT_TOGGLES.map((option) => option.agent))
  );

  // 篩選範圍（切換 Recipe tab）就重置回全選
  if (skillIdsKey !== prevSkillIdsKey) {
    setPrevSkillIdsKey(skillIdsKey);
    setSelectedIds(new Set(skillIdsKey ? skillIdsKey.split(",") : []));
  }

  const toggleSkill = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAgent = (agent) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agent)) {
        next.delete(agent);
      } else {
        next.add(agent);
      }
      return next;
    });
  };

  const selectedSkills = skills.filter((skill) => selectedIds.has(skill.id));
  const script = buildScript(selectedSkills, selectedAgents);

  const handleCopy = async () => {
    const success = await copyToClipboard(script);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      data-pencil-name="Bulk Install Panel"
      className="box-border w-full flex flex-col gap-3 p-4.5 bg-[#111827] border border-[#FFD700]/40 rounded-2xl"
    >
      <div className="text-[13px] text-[#7DCEA0]">
        目前範圍：<span className="text-[#FFD700] font-semibold">{scopeLabel}</span>
        ，取消勾選可以把該 Skill 排除在安裝指令之外，不影響收藏或 Recipe。
      </div>

      {skills.length === 0 ? (
        <div className="text-[13px] text-[#7DCEA0]/70 py-2">
          這個範圍內沒有可安裝的 Skill。
        </div>
      ) : (
        <div
          data-pencil-name="Bulk Install Skill List"
          className="flex flex-col gap-1.5"
        >
          {skills.map((skill) => {
            const checked = selectedIds.has(skill.id);
            const hasCommands = buildInstallRows(skill).length > 0;
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left bg-transparent border-0 cursor-pointer hover:bg-[#FFD700]/10 transition-colors"
              >
                {checked ? (
                  <SquareCheck size={16} className="shrink-0 text-[#FFD700]" />
                ) : (
                  <Square size={16} className="shrink-0 text-[#3D6B50]" />
                )}
                <span className="text-[13px] text-[#E0F0E8] truncate">
                  /{skill.name}
                </span>
                {!hasCommands && (
                  <span className="text-[11px] text-[#7DCEA0]/60 shrink-0">
                    （尚無安裝指令）
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {skills.length > 0 && (
        <div
          data-pencil-name="Bulk Install Agent Toggles"
          className="flex flex-col gap-1.5 pt-1 border-t border-[#1A3A2A]/60"
        >
          <div className="text-[12px] text-[#7DCEA0]/80">
            只組出以下 agent 的安裝指令：
          </div>
          <div className="flex flex-wrap gap-2">
            {AGENT_TOGGLES.map((option) => {
              const isSelected = selectedAgents.has(option.agent);
              return (
                <button
                  key={option.agent}
                  type="button"
                  onClick={() => toggleAgent(option.agent)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-[4px] border cursor-pointer transition-colors text-[12px] ${
                    isSelected
                      ? "bg-[#FFD700]/15 border-[#FFD700] text-[#FFD700]"
                      : "bg-transparent border-[#1A3A2A] text-[#7DCEA0] hover:border-[#FFD700]/40"
                  }`}
                >
                  {isSelected ? (
                    <SquareCheck size={14} className="shrink-0" />
                  ) : (
                    <Square size={14} className="shrink-0" />
                  )}
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        data-pencil-name="Bulk Install Script"
        className="flex flex-col gap-2"
      >
        <div
          data-testid="bulk-install-script"
          className="text-[13px]/[18px] box-border w-full text-[#d4d9d6] font-mono text-left whitespace-pre-wrap wrap-break-word bg-[rgba(21,70,12,0.4)] rounded-sm px-3 py-2 min-h-11"
        >
          {script || "沒有選取任何指令。"}
        </div>
        <div
          data-tour="bulk-install-copy-btn"
          className="self-end box-border w-fit shrink-0 h-fit"
        >
          <button
            type="button"
            onClick={handleCopy}
            disabled={!script}
            className="box-border w-fit shrink-0 h-fit flex gap-0 py-1.5 px-3.5 justify-start items-start bg-[#FFD700] hover:bg-[#FFD700]/85 active:scale-95 transition-all rounded-[999px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-none"
          >
            <div className="text-[13px]/[normal] box-border text-[#0A0E1A] font-semibold text-left whitespace-nowrap">
              {copied ? "已複製" : "複製全部"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
