import { useForm, useWatch } from "react-hook-form";

export default function FaqFormModal({ faq, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      question: faq?.question || "",
      answer: faq?.answer || "",
      sortOrder: faq?.sortOrder ?? 0,
      isActive: faq?.isActive ?? true,
    },
  });

  const isEdit = Boolean(faq);
  const isActive = useWatch({ control, name: "isActive" });
  const titleId = "faq-form-title";
  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  const submitForm = (values) =>
    onSubmit({
      question: values.question.trim(),
      answer: values.answer.trim(),
      sortOrder: Number(values.sortOrder),
      isActive: Boolean(values.isActive),
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        noValidate
        onSubmit={handleSubmit(submitForm)}
        className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2
              id={titleId}
              className="m-0 text-lg font-bold text-gray-900 dark:text-gray-100"
            >
              {isEdit ? "編輯 FAQ" : "新增 FAQ"}
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              編輯前台顯示的問題、回答與發布順序。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="關閉 FAQ 表單"
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="faq-question"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              問題 <span className="text-red-500">*</span>
            </label>
            <input
              id="faq-question"
              type="text"
              aria-invalid={Boolean(errors.question)}
              {...register("question", {
                required: "問題為必填",
                validate: (value) =>
                  value.trim() !== "" || "問題不可只包含空白",
              })}
              className={inputClass}
              placeholder="例如：如何收藏喜歡的 Prompt？"
            />
            {errors.question && (
              <p className="text-xs text-red-500">{errors.question.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="faq-answer"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              回答 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="faq-answer"
              rows={7}
              aria-invalid={Boolean(errors.answer)}
              {...register("answer", {
                required: "回答為必填",
                validate: (value) =>
                  value.trim() !== "" || "回答不可只包含空白",
              })}
              className={`${inputClass} resize-y leading-6`}
              placeholder="以清楚、直接的方式回答使用者會遇到的問題。"
            />
            {errors.answer && (
              <p className="text-xs text-red-500">{errors.answer.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
            <div className="space-y-1.5">
              <label
                htmlFor="faq-sort-order"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                排序序號 <span className="text-red-500">*</span>
              </label>
              <input
                id="faq-sort-order"
                type="number"
                min="0"
                step="1"
                aria-invalid={Boolean(errors.sortOrder)}
                {...register("sortOrder", {
                  valueAsNumber: true,
                  validate: (value) =>
                    (Number.isInteger(value) && value >= 0) ||
                    "排序序號必須是大於或等於 0 的整數",
                })}
                className={inputClass}
              />
              {errors.sortOrder && (
                <p className="text-xs text-red-500">
                  {errors.sortOrder.message}
                </p>
              )}
              <p className="text-xs leading-5 text-gray-400 dark:text-gray-500">
                啟用項目會優先顯示；序號越小越前。
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    發布狀態
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {isActive ? "啟用後會顯示於前台" : "未啟用時僅後台可見"}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="FAQ 發布狀態"
                  aria-checked={isActive}
                  onClick={() => setValue("isActive", !isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                    isActive ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-5 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "儲存中…" : "儲存"}
          </button>
        </div>
      </form>
    </div>
  );
}
