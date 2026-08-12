
import openaiIcon from "/openail.svg?url";
import claudeIcon from "/claude-color.svg?url";
import cursorIcon from "/cursorIcon.svg?url";

export const AGENT_OPTIONS = [
  { agent: "claude-code", label: "Claude", icon: claudeIcon, alt: "Claude Icon", invert: false },
  { agent: "codex", label: "Codex", icon: openaiIcon, alt: "OpenAI Icon", invert: true },
  { agent: "cursor", label: "Cursor", icon: cursorIcon, alt: "Cursor Icon", invert: true },
];


export function getAvailableAgentOptions(availableAgents) {
  return AGENT_OPTIONS.filter((option) => availableAgents.includes(option.agent));
}
