// Prompt / Skill 列表上方的篩選列：關鍵字、類型、分類、狀態。
// 本身不存狀態，篩選條件由父層（skills.jsx）持有；這裡改動就呼叫 onChange 回傳新的條件物件。
import { ACTIVE_OPTIONS } from "../../api/adminApi";

const selectClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function SkillFilterBar({ filters, categories, contentTypes, onChange }) {

  // 更新單一篩選欄位，其餘條件原封不動一起回傳給父層。
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
        value={filters.contentTypeId}
        onChange={(e) => update("contentTypeId", e.target.value)}
        className={selectClass}
      >
        <option value="">全部類型</option>
        {contentTypes.map((ct) => (
          <option key={ct.id} value={ct.id}>
            {ct.name === "prompt" ? "Prompt" : ct.name === "skills" ? "Skill" : ct.name}
          </option>
        ))}
      </select>

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
