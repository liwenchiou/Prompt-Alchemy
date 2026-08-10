// Prompt / Skill 的「表單畫面」，新增頁與編輯頁共用同一個元件。
//
// 使用 react-hook-form 管理表單狀態與驗證：
//  - 一般欄位（文字 / textarea / select）用 register 綁定，RHF 自動收集值。
//  - 陣列型欄位（適用模型、標籤）不是原生 input，改用 setValue 手動寫入，
//    再用 useWatch 讀回目前選取值來畫出「被選中」的樣式。
//  - 驗證只在送出時觸發；通過後才呼叫 props.onSubmit(data)。
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { isSkillActive } from "../../api/adminApi";
import { uploadFile } from "../../api/uploadApi";
import {
  BLOCK_TYPES,
  createEmptyBlock,
  hasMetaFields,
  isUploadType,
  toBlocks,
  toPayload,
} from "../../utils/exampleOutputBlocks";

// 共用的 input 樣式，抽出來避免每個欄位重複一長串 className。
const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

// 表單所有欄位的預設值。新增模式會整份套用；
// 編輯模式會用 { ...DEFAULTS, ...initialValues } 覆蓋，確保欄位都有初始值。
const DEFAULTS = {
  title: "",
  slug: "",
  intro: "",
  contentTypeId: "",
  categoryId: "",
  modelType: [],
  tags: [],
  promptContent: "",
  useCase: "",
  exampleInput: "",
  exampleOutput: [],
  isActive: true,
};

// 產生「必填文字欄位」的 react-hook-form 驗證規則。
// required 擋空字串；validate 再擋「只打空白」的情況（trim 後仍為空就算沒填）。
const requiredText = (label) => ({
  required: `${label}為必填`,
  validate: (v) => (typeof v === "string" && v.trim() !== "") || `${label}為必填`,
});

function Section({ title, children }) {
  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100">
        {title}
      </div>
      {children}
    </section>
  );
}

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

// image / video / html 區塊的「檔案上傳」欄位，取代原本手貼網址的文字框。
// 選檔後打 /utility/upload，成功再把回傳的 url 寫進 data.context —— 資料形狀不變，
// 只是 url 的來源從「手打」變成「上傳」。context 仍以一個 hidden input 註冊，
// 維持 react-hook-form 的必填驗證；上傳成功後 setValue 會順帶觸發重新驗證。
function MediaUploadField({ index, type, control, register, setValue, error }) {
  const fieldName = `exampleOutput.${index}.data.context`;
  const url = useWatch({ control, name: fieldName });
  const [status, setStatus] = useState("idle"); // idle | uploading | error
  const [uploadError, setUploadError] = useState("");
  const accept =
    type === "video" ? "video/*" : type === "html" ? ".html,text/html" : "image/*";

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 清掉，讓「選同一個檔」也能再次觸發 onChange
    if (!file) return;

    setStatus("uploading");
    setUploadError("");
    try {
      const uploadedUrl = await uploadFile(file);
      setValue(fieldName, uploadedUrl, { shouldValidate: true, shouldDirty: true });
      setStatus("idle");
    } catch (err) {
      setUploadError(err.message || "上傳失敗，請再試一次");
      setStatus("error");
    }
  };

  const isUploading = status === "uploading";

  return (
    <div className="space-y-2">
      {/* 隱藏欄位：真正被 RHF 驗證的 context，值由上傳結果寫入 */}
      <input
        type="hidden"
        {...register(fieldName, {
          required: "請上傳檔案",
          validate: (v) =>
            (typeof v === "string" && v.trim() !== "") || "請上傳檔案",
        })}
      />

      {url && !isUploading && (
        <div className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
          {type === "video" ? (
            <video
              src={url}
              controls
              className="max-h-48 w-full rounded object-contain"
            />
          ) : type === "html" ? (
            // 預覽比照前台：一樣用 iframe 開上傳後的網址，sandbox 條件也對齊。
            <iframe
              src={url}
              title="HTML 預覽"
              className="h-48 w-full rounded border-0 bg-white"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <img
              src={url}
              alt=""
              className="max-h-48 w-full rounded object-contain"
            />
          )}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block break-all text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {url}
          </a>
        </div>
      )}

      <label
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
          isUploading
            ? "cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-700"
            : "cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFile}
          disabled={isUploading}
        />
        {isUploading ? "上傳中…" : url ? "更換檔案" : "選擇檔案上傳"}
      </label>

      {status === "error" && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}
      {error?.data?.context && !isUploading && status !== "error" && (
        <p className="text-xs text-red-500">{error.data.context.message}</p>
      )}
    </div>
  );
}

// 範例輸出的單一區塊。type 決定要畫哪些欄位：
// text 是一個多行的「內容」；image / video / html 都是「上傳檔案」（context 存網址），
// 其中 image / video 再多 alt / caption 兩個選填欄位。切換 type 時不清空任何欄位，隱藏的值留在表單狀態裡，
// 由送出時的 toPayload 負責裁掉，避免手滑切錯就把填好的內容弄丟。
function ExampleOutputBlock({
  index,
  control,
  register,
  setValue,
  error,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast,
}) {
  const type = useWatch({ control, name: `exampleOutput.${index}.type` });
  const withMeta = hasMetaFields(type);
  const withUpload = isUploadType(type);
  const contextLabel = withUpload ? "上傳檔案" : "內容";

  const moveButtonClass =
    "rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          區塊 {index + 1}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="上移"
            className={moveButtonClass}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="下移"
            className={moveButtonClass}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="刪除區塊"
            className="rounded border border-gray-300 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/30"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-1.5 sm:max-w-xs">
        <Label required>類型</Label>
        <select
          {...register(`exampleOutput.${index}.type`)}
          className={inputClass}
        >
          {BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label required>{contextLabel}</Label>
        {withUpload ? (
          <MediaUploadField
            index={index}
            type={type}
            control={control}
            register={register}
            setValue={setValue}
            error={error}
          />
        ) : (
          <>
            <textarea
              rows={4}
              {...register(
                `exampleOutput.${index}.data.context`,
                requiredText(contextLabel),
              )}
              className={`${inputClass} resize-y font-mono`}
            />
            {error?.data?.context && (
              <p className="text-xs text-red-500">{error.data.context.message}</p>
            )}
          </>
        )}
      </div>

      {withMeta && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>替代文字</Label>
            <input
              type="text"
              {...register(`exampleOutput.${index}.data.alt`)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label>圖說</Label>
            <input
              type="text"
              {...register(`exampleOutput.${index}.data.caption`)}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillForm({
  initialValues,
  categories,
  contentTypes,
  models,
  tags,
  onSubmit,
  onCancel,
}) {
  const {
    register, // 綁定原生欄位（value + onChange + ref 一次搞定）
    handleSubmit, // 包住送出：先跑驗證，通過才呼叫我們的 onSubmit
    control, // 給 useWatch 訂閱欄位值用
    setValue, // 手動寫入欄位值（給非原生的 chips 用）
    formState: { errors, isSubmitting },
  } = useForm({
    // 編輯模式的 initialValues 會覆蓋 DEFAULTS，達成「同一表單、兩種模式」。
    // exampleOutput 另外過 toBlocks：舊資料可能還是純字串或 { outputText, outputImages }，
    // 沒轉成 block 陣列的話編輯舊資料會壞掉。
    defaultValues: {
      ...DEFAULTS,
      ...initialValues,
      exampleOutput: toBlocks(initialValues?.exampleOutput),
      // 走 isSkillActive 而不是直接讀 initialValues.isActive：
      // seed 資料只有 snake_case 的 is_active。
      isActive: initialValues ? isSkillActive(initialValues) : true,
    },
  });

  const isActive = useWatch({ control, name: "isActive" });

  // 範例輸出是「有序、可重複、可增減」的複合物件，用 useFieldArray 管理，
  // 而不是像 modelType / tags 那樣手動 setValue。
  const {
    fields: outputBlocks,
    append: appendBlock,
    remove: removeBlock,
    swap: swapBlocks,
  } = useFieldArray({ control, name: "exampleOutput" });

  // seq 不是使用者填的欄位，送出時才依目前排列順序生成。
  const submitWithSeq = (data) =>
    onSubmit({ ...data, exampleOutput: toPayload(data.exampleOutput) });

  // 選項來源現在全由父層（AdminSkillFormManager）非同步載入後透過 Props 傳入。

  // 適用模型、標籤是「多選 chips」，不是原生 input，
  // 所以用 useWatch 讀目前選取的陣列，好在畫面上標示哪些被選中。
  const selectedModels = useWatch({ control, name: "modelType" }) || [];
  const selectedTags = useWatch({ control, name: "tags" }) || [];

  // 點一下 chip：已選就移除、未選就加入，再用 setValue 寫回表單狀態。
  const toggleInArray = (field, current, value) => {
    setValue(
      field,
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
      { shouldDirty: true },
    );
  };

  return (
    // handleSubmit(onSubmit)：送出時先驗證，全部通過才把資料交給 onSubmit。
    // 表單分成 5 個區塊呈現，降低一次填一堆欄位的壓力。
    <form onSubmit={handleSubmit(submitWithSeq)} className="space-y-6">
      {/* 1. 基本資料 */}
      <Section title="基本資料">
        <div className="space-y-1.5">
          <Label required>標題</Label>
          <input
            type="text"
            {...register("title", requiredText("標題"))}
            className={inputClass}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label required>Slug（網址識別名稱）</Label>
          <input
            type="text"
            placeholder="例如：backend-api-review"
            {...register("slug", requiredText("網址識別名稱 (slug)"))}
            className={inputClass}
          />
          {errors.slug && (
            <p className="text-xs text-red-500">{errors.slug.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label required>簡介（顯示在卡片上）</Label>
          <textarea
            rows={2}
            {...register("intro", requiredText("簡介"))}
            className={`${inputClass} resize-y`}
          />
          {errors.intro && (
            <p className="text-xs text-red-500">{errors.intro.message}</p>
          )}
        </div>
      </Section>

      {/* 2. 分類設定 */}
      <Section title="分類設定">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label required>資料類型</Label>
            <select
              {...register("contentTypeId", { required: "資料類型為必填" })}
              className={inputClass}
            >
              <option value="">請選擇</option>
              {contentTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name === "prompt" ? "Prompt" : ct.name === "skills" ? "Skill" : ct.name}
                </option>
              ))}
            </select>
            {errors.contentTypeId && (
              <p className="text-xs text-red-500">
                {errors.contentTypeId.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label required>所屬分類</Label>
            <select
              {...register("categoryId", { required: "所屬分類為必填" })}
              className={inputClass}
            >
              <option value="">請選擇</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>適用模型</Label>
          <div className="flex flex-wrap gap-2">
            {models.map((model) => {
              const active = selectedModels.includes(model.id);
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() =>
                    toggleInArray("modelType", selectedModels, model.id)
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {model.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>標籤</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleInArray("tags", selectedTags, tag.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* 3. 主要內容 */}
      <Section title="主要內容">
        <div className="space-y-1.5">
          <Label required>Prompt / Skill 主要內容</Label>
          <textarea
            rows={6}
            {...register("promptContent", requiredText("主要內容"))}
            className={`${inputClass} resize-y font-mono`}
          />
          {errors.promptContent && (
            <p className="text-xs text-red-500">
              {errors.promptContent.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>使用情境</Label>
          <textarea
            rows={3}
            {...register("useCase")}
            className={`${inputClass} resize-y`}
          />
        </div>
      </Section>

      {/* 4. 範例內容 */}
      <Section title="範例內容">
        <div className="space-y-1.5">
          <Label>範例輸入</Label>
          <textarea
            rows={4}
            {...register("exampleInput")}
            className={`${inputClass} resize-y font-mono`}
          />
        </div>
        <div className="space-y-3">
          <Label>範例輸出</Label>
          {outputBlocks.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              尚未新增區塊。可依序加入文字、圖片、影片或 HTML。
            </p>
          ) : (
            <div className="space-y-3">
              {outputBlocks.map((field, index) => (
                <ExampleOutputBlock
                  key={field.id}
                  index={index}
                  control={control}
                  register={register}
                  setValue={setValue}
                  error={errors.exampleOutput?.[index]}
                  onMoveUp={() => swapBlocks(index, index - 1)}
                  onMoveDown={() => swapBlocks(index, index + 1)}
                  onRemove={() => removeBlock(index)}
                  isFirst={index === 0}
                  isLast={index === outputBlocks.length - 1}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => appendBlock(createEmptyBlock())}
            className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            + 新增區塊
          </button>
        </div>
      </Section>

      {/* 5. 發布設定 */}
      <Section title="發布設定">
        {/* 狀態是布林，沒有驗證的必要 —一定有值。
            toggle 樣式沿用參數管理 / 會員管理的既有寫法。 */}
        <div className="flex items-center justify-between sm:max-w-xs">
          <Label>狀態</Label>
          <button
            type="button"
            onClick={() => setValue("isActive", !isActive, { shouldDirty: true })}
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
          {isActive ? "啟用中：會顯示在前台" : "已停用：不會顯示在前台"}
        </p>
      </Section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSubmitting ? "儲存中…" : "儲存"}
        </button>
      </div>
    </form>
  );
}
