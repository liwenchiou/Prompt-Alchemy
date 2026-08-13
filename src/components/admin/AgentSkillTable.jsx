import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { getCategoryName, isSkillActive } from "../../api/adminApi";
import { formatDate } from "../../utils/date";

export default function AgentSkillTable({ skills, loading, onToggleActive }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th className="whitespace-nowrap px-6 py-3 font-medium">標題</th>
              <th className="whitespace-nowrap px-6 py-3 font-medium">分類</th>
              <th className="whitespace-nowrap px-6 py-3 font-medium">安裝方式</th>
              <th className="whitespace-nowrap px-6 py-3 font-medium">狀態</th>
              <th className="whitespace-nowrap px-6 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  載入中…
                </td>
              </tr>
            ) : skills.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  沒有符合條件的資料
                </td>
              </tr>
            ) : (
              skills.map((skill) => {
                return (
                  <tr key={skill.id} className="text-gray-700 dark:text-gray-200">
                    <td className="min-w-[200px] max-w-xs px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {skill.name}
                      </div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                        {skill.intro}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-gray-400">
                      {skill.category || getCategoryName(skill.categoryId) || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                        {skill.installKind}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge isActive={isSkillActive(skill)} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/agent-skills/${skill.id}/edit`)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleActive(skill)}
                          className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30"
                        >
                          {isSkillActive(skill) ? "停用" : "啟用"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
