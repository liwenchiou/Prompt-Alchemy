// 每個後台頁面上方共用的標題列。
// title：頁面標題；description：副標說明；actions：右側操作按鈕（例如「+ 新增」）。
export default function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-8 py-6 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
