

const SEARCH_FIELDS = ["name", "skillSlug", "repoOwner", "categoryName"];

export function filterSkillsByQuery(skills, query) {
  const normalized = (query || "").trim().toLowerCase();
  if (!normalized) return skills;

  return skills.filter((skill) =>
    SEARCH_FIELDS.some((field) =>
      (skill?.[field] || "").toLowerCase().includes(normalized)
    )
  );
}

export function groupSkillsByRepo(skills) {
  const groups = [];
  const groupByKey = new Map();

  for (const skill of skills) {
    const repoKey =
      skill?.repoOwner && skill?.repoName
        ? `${skill.repoOwner}/${skill.repoName}`
        : `skill:${skill?.id}`;

    let group = groupByKey.get(repoKey);
    if (!group) {
      group = {
        repoKey,
        repoOwner: skill?.repoOwner || "",
        repoName: skill?.repoName || "",
        fullPackage: null,
        singleKits: [],
        others: [],
      };
      groupByKey.set(repoKey, group);
      groups.push(group);
    }

    if (skill?.installKind === "full_package" && !group.fullPackage) {
      group.fullPackage = skill;
    } else if (skill?.installKind === "single_kit") {
      group.singleKits.push(skill);
    } else {
      group.others.push(skill);
    }
  }

  return groups;
}
