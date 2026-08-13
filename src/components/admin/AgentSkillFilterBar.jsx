import { ACTIVE_OPTIONS } from "../../api/adminApi";

const selectClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function AgentSkillFilterBar({ filters, categories, onChange }) {
  const update = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <input
        type="text"
        value={filters.keyword}
        onChange={(e) => update("keyword", e.target.value)}
        placeholder="搜尋標題 / 簡介…"
        className="min-w-56 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />

      <select
        value={filters.categoryId}
        onChange={(e) => update("categoryId", e.target.value)}
        className={selectClass}
      >
        <option value="">全部分類</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={filters.active}
        onChange={(e) => update("active", e.target.value)}
        className={selectClass}
      >
        <option value="">全部狀態</option>
        {ACTIVE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
