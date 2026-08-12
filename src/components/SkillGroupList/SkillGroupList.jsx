import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function SkillGroupList({ groups, renderCard }) {
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  const toggleExpanded = (repoKey) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(repoKey)) next.delete(repoKey);
      else next.add(repoKey);
      return next;
    });
  };

  return (
    <>
      {groups.map((group) => {
        const hasCollapsible =
          Boolean(group.fullPackage) && group.singleKits.length > 0;
        const isExpanded = hasCollapsible && expandedKeys.has(group.repoKey);
        const showFullPackage = group.fullPackage && !isExpanded;
        const showSingleKits =
          group.singleKits.length > 0 && (!group.fullPackage || isExpanded);

        return (
          <div key={group.repoKey} className="contents">
            {group.others.map((skill) => (
              <div key={skill.id} className="w-full">
                {renderCard(skill)}
              </div>
            ))}

            {showFullPackage && (
              <div
                data-pencil-name="Full Package Group Card"
                className="w-full relative"
              >
                {renderCard(group.fullPackage)}
                {hasCollapsible && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(group.repoKey)}
                    aria-expanded={false}
                    aria-label={`展開 ${group.repoOwner}/${group.repoName} 的單一元件清單`}
                    className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-[#0F1F18] border border-[#39FF14]/60 text-[#39FF14] hover:bg-[#39FF14]/15 cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            )}

            {showSingleKits && (
              <div
                data-pencil-name="Single Kit Group Panel"
                className="w-full col-span-full box-border flex flex-col gap-3 border border-[#1A3A2A] rounded-xl p-4"
              >
                {hasCollapsible && (
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-[#7DCEA0]">
                      {group.repoOwner}/{group.repoName} 底下的單一元件
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(group.repoKey)}
                      aria-expanded={true}
                      aria-label={`收合 ${group.repoOwner}/${group.repoName} 的單一元件清單`}
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0F1F18] border border-[#39FF14]/60 text-[#39FF14] hover:bg-[#39FF14]/15 cursor-pointer transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                )}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.singleKits.map((skill) => (
                    <div key={skill.id} className="w-full">
                      {renderCard(skill)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
