import { normalizeAgentSkill } from "./agentSkillApi";
import { snakeToCamel } from "../utils/snakeToCamel";

export function normalizeFavoritedSkill(item) {
  const camel = snakeToCamel(item);
  const skill = normalizeAgentSkill({
    ...camel,
    category: item?.category_name ?? camel?.category,
  });
  if (!skill) return null;

  return {
    ...skill,
    favoriteId: camel?.favoriteId ?? null,
  };
}
