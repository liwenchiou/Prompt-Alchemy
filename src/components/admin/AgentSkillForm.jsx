import { useForm, useWatch } from "react-hook-form";
import { isSkillActive } from "../../api/adminApi";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

const DEFAULTS = {
  name: "",
  description: "",
  intro: "",
  repoOwner: "",
  repoName: "",
  skillSlug: "",
  creatorName: "",
  creatorAvatarUrl: "",
  creatorProfileUrl: "",
  license: "",
  categoryId: "",
  installKind: "single_kit",
  supportedAgents: [],
  docUrl: "",
  isActive: true,
};

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

const SUPPORTED_AGENTS = [
  { id: "codex", label: "Codex" },
  { id: "claude-code", label: "Claude Code" },
  { id: "cursor", label: "Cursor" },
];

export default function AgentSkillForm({
  initialValues,
  categories,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ...DEFAULTS,
      ...initialValues,
      isActive: initialValues ? isSkillActive(initialValues) : true,
    },
  });

  const isActive = useWatch({ control, name: "isActive" });
  const selectedAgents = useWatch({ control, name: "supportedAgents" }) || [];
  const installKind = useWatch({ control, name: "installKind" });
  const avatarUrl = useWatch({ control, name: "creatorAvatarUrl" });

  const toggleInArray = (field, current, value) => {
    setValue(
      field,
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
      { shouldDirty: true },
    );
  };

  const submitWithValidation = (data) => {
    // 簡單的驗證邏輯：如果 installKind 不是 git_clone，則 supportedAgents 不能為空
    if (data.installKind !== 'git_clone' && data.supportedAgents.length === 0) {
      alert("當安裝方式不是 git_clone 時，至少需要選擇一個支援的 Agent！");
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitWithValidation)} className="space-y-6">
      <Section title="基本資料">
        <div className="space-y-1.5">
          <Label required>標題</Label>
          <input
            type="text"
            {...register("name", requiredText("標題"))}
            className={inputClass}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label required>簡介 (Intro)</Label>
          <textarea
            rows={2}
            {...register("intro", requiredText("簡介"))}
            className={`${inputClass} resize-y`}
          />
          {errors.intro && <p className="text-xs text-red-500">{errors.intro.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>詳細描述 (Description)</Label>
          <textarea
            rows={4}
            {...register("description")}
            className={`${inputClass} resize-y`}
          />
        </div>
      </Section>

      <Section title="分類設定">
        <div className="grid gap-4 sm:grid-cols-2">
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
            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
          </div>
        </div>
      </Section>

      <Section title="GitHub 來源">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label required>Repo Owner</Label>
            <input
              type="text"
              {...register("repoOwner", requiredText("Repo Owner"))}
              className={inputClass}
              placeholder="e.g. facebook"
            />
            {errors.repoOwner && <p className="text-xs text-red-500">{errors.repoOwner.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label required>Repo Name</Label>
            <input
              type="text"
              {...register("repoName", requiredText("Repo Name"))}
              className={inputClass}
              placeholder="e.g. react"
            />
            {errors.repoName && <p className="text-xs text-red-500">{errors.repoName.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label required>Skill Slug (指定子目錄或 *)</Label>
          <input
            type="text"
            {...register("skillSlug", requiredText("Skill Slug"))}
            className={inputClass}
            placeholder="*"
          />
          {errors.skillSlug && <p className="text-xs text-red-500">{errors.skillSlug.message}</p>}
        </div>
      </Section>

      <Section title="安裝設定">
        <div className="space-y-1.5">
          <Label required>安裝方式</Label>
          <select
            {...register("installKind", { required: "安裝方式為必填" })}
            className={inputClass}
          >
            <option value="single_kit">單一功能套件 (single_kit)</option>
            <option value="full_package">完整專案安裝 (full_package)</option>
            <option value="git_clone">純 Git Clone (git_clone)</option>
          </select>
          {errors.installKind && <p className="text-xs text-red-500">{errors.installKind.message}</p>}
        </div>

        {installKind !== "git_clone" && (
          <div className="space-y-1.5">
            <Label>支援的 Agent</Label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_AGENTS.map((agent) => {
                const active = selectedAgents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleInArray("supportedAgents", selectedAgents, agent.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {agent.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      <Section title="其他資訊">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>創作者名稱</Label>
            <input type="text" {...register("creatorName")} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label>創作者頭像 URL</Label>
            <div className="flex gap-3">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full bg-gray-100 object-cover ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
                />
              )}
              <input type="text" {...register("creatorAvatarUrl")} className={inputClass} />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>創作者 Profile URL</Label>
            <input type="text" {...register("creatorProfileUrl")} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label>License</Label>
            <input type="text" {...register("license")} className={inputClass} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>官方文件 URL</Label>
          <input type="text" {...register("docUrl")} className={inputClass} />
        </div>
      </Section>

      <Section title="發布設定">
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
