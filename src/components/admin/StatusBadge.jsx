// 狀態徽章：顯示這筆資料是啟用還是未啟用。
// 狀態就是一個布林（isActive），未啟用的資料不會出現在前台。
export default function StatusBadge({ isActive }) {
  const style = isActive
    ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {isActive ? "啟用" : "未啟用"}
    </span>
  );
}
