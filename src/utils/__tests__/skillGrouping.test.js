import { describe, it, expect } from "vitest";
import { filterSkillsByQuery, groupSkillsByRepo } from "../skillGrouping";

// 13 號票：主列表／收藏清單依 repoOwner+repoName 分組（full_package 優先、
// single_kit 收合）、搜尋範圍統一為 name／skillSlug／repoOwner／category
// （見 spec-install-mechanism-v2.md 第 29、31 行）。

const dotnetFull = {
  id: "dotnet-full",
  name: ".NET Agent Skills",
  skillSlug: "*",
  repoOwner: "dotnet",
  repoName: "skills",
  categoryName: "測試 / 品質保證",
  installKind: "full_package",
};

const dotnetKitA = {
  id: "dotnet-kit-a",
  name: "dotnet-test",
  skillSlug: "dotnet-test",
  repoOwner: "dotnet",
  repoName: "skills",
  categoryName: "測試 / 品質保證",
  installKind: "single_kit",
};

const dotnetKitB = {
  id: "dotnet-kit-b",
  name: "dotnet-upgrade",
  skillSlug: "dotnet-upgrade",
  repoOwner: "dotnet",
  repoName: "skills",
  categoryName: "測試 / 品質保證",
  installKind: "single_kit",
};

const soloKit = {
  id: "solo-kit",
  name: "hookify",
  skillSlug: "writing-rules",
  repoOwner: "anthropics",
  repoName: "claude-plugins-official",
  categoryName: "小工具",
  installKind: "single_kit",
};

const gitCloneSkill = {
  id: "git-clone-skill",
  name: "deck-writer",
  skillSlug: "deck-writer",
  repoOwner: "Wcc723",
  repoName: "social-image-kit",
  categoryName: "小工具",
  installKind: "git_clone",
};

describe("groupSkillsByRepo — 依 repoOwner+repoName 分組", () => {
  it("同一組裡 full_package 跟 single_kit 分別歸類，group 依第一次出現順序排列", () => {
    const groups = groupSkillsByRepo([dotnetFull, dotnetKitA, soloKit, dotnetKitB]);

    expect(groups.map((g) => g.repoKey)).toEqual([
      "dotnet/skills",
      "anthropics/claude-plugins-official",
    ]);

    const dotnetGroup = groups[0];
    expect(dotnetGroup.fullPackage).toBe(dotnetFull);
    expect(dotnetGroup.singleKits).toEqual([dotnetKitA, dotnetKitB]);
  });

  it("沒有 full_package 的 repo：group.fullPackage 為 null，single_kit 正常收在 singleKits", () => {
    const groups = groupSkillsByRepo([soloKit]);

    expect(groups[0].fullPackage).toBeNull();
    expect(groups[0].singleKits).toEqual([soloKit]);
  });

  it("非 full_package／single_kit（例如 git_clone）歸到 others，跟收合機制無關", () => {
    const groups = groupSkillsByRepo([gitCloneSkill]);

    expect(groups[0].fullPackage).toBeNull();
    expect(groups[0].singleKits).toEqual([]);
    expect(groups[0].others).toEqual([gitCloneSkill]);
  });

  it("同一 repo 出現第二筆 full_package（理論上不該發生）時，第二筆退到 others 而不是覆蓋或遺失", () => {
    const duplicateFull = { ...dotnetFull, id: "dotnet-full-2" };
    const groups = groupSkillsByRepo([dotnetFull, duplicateFull]);

    expect(groups[0].fullPackage).toBe(dotnetFull);
    expect(groups[0].others).toEqual([duplicateFull]);
  });
});

describe("filterSkillsByQuery — 搜尋範圍統一為 name／skillSlug／repoOwner／category", () => {
  const skills = [dotnetFull, dotnetKitA, soloKit];

  it("query 為空字串時原樣回傳", () => {
    expect(filterSkillsByQuery(skills, "")).toEqual(skills);
    expect(filterSkillsByQuery(skills, "   ")).toEqual(skills);
  });

  it("命中 name", () => {
    expect(filterSkillsByQuery(skills, "hookify")).toEqual([soloKit]);
  });

  it("命中 skillSlug", () => {
    expect(filterSkillsByQuery(skills, "dotnet-test")).toEqual([dotnetKitA]);
  });

  it("命中 repoOwner", () => {
    expect(filterSkillsByQuery(skills, "dotnet")).toEqual([dotnetFull, dotnetKitA]);
  });

  it("命中 category", () => {
    expect(filterSkillsByQuery(skills, "小工具")).toEqual([soloKit]);
  });

  it("不區分大小寫，且不比對 intro 欄位", () => {
    expect(filterSkillsByQuery(skills, "HOOKIFY")).toEqual([soloKit]);
    expect(
      filterSkillsByQuery(
        [{ ...soloKit, name: "other", intro: "hookify 相關敘述" }],
        "hookify"
      )
    ).toEqual([]);
  });
});

describe("搜尋 + 分組組合：只命中某個 single_kit 時，group 裡不會出現沒命中的 full_package", () => {
  it("先過濾再分組，命中的 single_kit 單獨出現，沒命中的 full_package 不在 group 裡", () => {
    const filtered = filterSkillsByQuery(
      [dotnetFull, dotnetKitA, dotnetKitB],
      "dotnet-test"
    );
    const groups = groupSkillsByRepo(filtered);

    expect(groups).toHaveLength(1);
    expect(groups[0].fullPackage).toBeNull();
    expect(groups[0].singleKits).toEqual([dotnetKitA]);
  });

  it("full_package 跟某個 single_kit 都命中時，group 仍保留兩者（維持預設收合行為的資料基礎）", () => {
    const filtered = filterSkillsByQuery(
      [dotnetFull, dotnetKitA, dotnetKitB],
      "dotnet"
    );
    const groups = groupSkillsByRepo(filtered);

    expect(groups[0].fullPackage).toBe(dotnetFull);
    expect(groups[0].singleKits).toEqual([dotnetKitA, dotnetKitB]);
  });
});
