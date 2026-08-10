import { useForm, useWatch } from "react-hook-form";

const LABELS = {
  category: "分類",
  contentType: "資料類型",
  model: "適用模型",
  tag: "標籤"
};

export default function ParameterFormModal({ parameter, type, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: parameter?.name || "",
      description: parameter?.description || "",
      isActive: parameter?.isActive ?? true,
    },
  });

  const isEdit = Boolean(parameter);
  const isActive = useWatch({ control, name: "isActive" });
  const typeLabel = LABELS[type] || "參數";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {isEdit ? `編輯${typeLabel}` : `新增${typeLabel}`}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {typeLabel}名稱 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("name", {
              required: `${typeLabel}名稱為必填`,
              setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
            })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {typeLabel}說明
          </label>
          <textarea
            rows={3}
            {...register("description")}
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            狀態
          </label>
          <button
            type="button"
            onClick={() => setValue("isActive", !isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              isActive ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
            role="switch"
            aria-checked={isActive}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {isActive ? "啟用中" : "已停用"}
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? "儲存中…" : "儲存"}
          </button>
        </div>
      </form>
    </div>
  );
}
