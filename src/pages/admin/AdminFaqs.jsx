import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EyeOff, Pencil, Plus, RotateCcw, Search } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import FaqFormModal from "../../components/admin/FaqFormModal";
import StatusBadge from "../../components/admin/StatusBadge";
import {
  createAdminFaq,
  disableAdminFaq,
  getAdminFaqs,
  restoreAdminFaq,
  updateAdminFaq,
} from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";
import { formatDate } from "../../utils/date";

function getFaqErrorMessage(error) {
  if (error?.status === 401) return "登入狀態已失效，請重新登入。";
  if (error?.status === 403) return "您沒有管理 FAQ 的權限。";
  if (error?.status === 404) {
    return "這則 FAQ 已不存在或已被其他管理者更新，請重新載入。";
  }
  if (error?.status === 400) {
    return error.message || "FAQ 資料格式不正確，請檢查問題、回答與排序序號。";
  }
  return error?.message || "FAQ 操作失敗，請稍後再試。";
}

function QueueMarker({ faq }) {
  return (
    <div className="flex items-center gap-3" aria-label={`排序序號 ${faq.sortOrder}`}>
      <span
        aria-hidden="true"
        className={`h-9 w-1 rounded-full ${
          faq.isActive
            ? "bg-emerald-500"
            : "bg-amber-300 dark:bg-amber-700"
        }`}
      />
      <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-200">
        #{String(faq.sortOrder).padStart(2, "0")}
      </span>
    </div>
  );
}

function FaqActions({ faq, processing, onEdit, onToggle }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(faq)}
        disabled={processing}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
        編輯
      </button>
      <button
        type="button"
        onClick={() => onToggle(faq)}
        disabled={processing}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          faq.isActive
            ? "border border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {faq.isActive ? (
          <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
        ) : (
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
        )}
        {processing
          ? "處理中…"
          : faq.isActive
            ? "下架"
            : "恢復發布"}
      </button>
    </div>
  );
}

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    getAdminFaqs()
      .then((data) => {
        if (!isCurrent) return;
        setFaqs(data);
        setLoadError("");
      })
      .catch((error) => {
        if (!isCurrent) return;
        setFaqs([]);
        setLoadError(getFaqErrorMessage(error));
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const reloadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAdminFaqs();
      setFaqs(data);
    } catch (error) {
      setFaqs([]);
      setLoadError(getFaqErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && faq.isActive) ||
        (statusFilter === "inactive" && !faq.isActive);
      const matchesKeyword =
        !normalizedKeyword ||
        faq.question.toLowerCase().includes(normalizedKeyword) ||
        faq.answer.toLowerCase().includes(normalizedKeyword);
      return matchesStatus && matchesKeyword;
    });
  }, [faqs, keyword, statusFilter]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (faq) => {
    setEditing(faq);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    try {
      if (editing) {
        await updateAdminFaq(editing.id, form);
      } else {
        await createAdminFaq(form);
      }
      setModalOpen(false);
      setEditing(null);
      await reloadData();
      alertHelper.success(editing ? "FAQ 更新成功" : "FAQ 新增成功");
    } catch (error) {
      alertHelper.error("儲存失敗", getFaqErrorMessage(error));
    }
  };

  const handleTogglePublish = async (faq) => {
    const confirmed = await alertHelper.confirm(
      faq.isActive
        ? "確定要下架這則 FAQ 嗎？"
        : "確定要恢復發布這則 FAQ 嗎？",
      faq.isActive
        ? "下架後前台不再顯示，但仍可從管理後台恢復發布。"
        : "恢復發布後，這則 FAQ 會重新出現在前台。"
    );
    if (!confirmed) return;

    setProcessingId(faq.id);
    try {
      if (faq.isActive) {
        await disableAdminFaq(faq.id);
      } else {
        await restoreAdminFaq(faq.id);
      }
      await reloadData();
      alertHelper.success(faq.isActive ? "FAQ 已下架" : "FAQ 已恢復發布");
    } catch (error) {
      alertHelper.error(
        faq.isActive ? "下架失敗" : "恢復發布失敗",
        getFaqErrorMessage(error)
      );
    } finally {
      setProcessingId(null);
    }
  };

  const hasFilters = keyword.trim() !== "" || statusFilter !== "all";

  return (
    <>
      <AdminPageHeader
        title="FAQ 管理"
        description="管理首頁顯示的常見問題、發布狀態與顯示順序"
        actions={
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            新增 FAQ
          </button>
        }
      />

      <div className="space-y-5 p-6 sm:p-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                發布佇列
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                啟用項目優先，排序序號越小越前；調整後以後端回傳順序為準。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                role="group"
                aria-label="FAQ 狀態篩選"
                className="flex flex-wrap gap-2"
              >
                {[
                  { value: "all", label: "全部" },
                  { value: "active", label: "啟用" },
                  { value: "inactive", label: "未啟用" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={statusFilter === filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      statusFilter === filter.value
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-0 sm:w-72">
                <Search
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="搜尋問題或回答..."
                  aria-label="搜尋 FAQ"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div
            role="status"
            className="flex h-52 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900"
          >
            FAQ 資料讀取中…
          </div>
        ) : loadError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-left dark:border-red-900/60 dark:bg-red-950/30"
          >
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              無法載入 FAQ 管理清單
            </p>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {loadError}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={reloadData}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                重新載入
              </button>
              {loadError.includes("登入狀態") && (
                <Link
                  to="/admin/login"
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 no-underline transition hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  返回登入頁
                </Link>
              )}
            </div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {faqs.length === 0
                ? "尚未建立任何 FAQ"
                : "沒有符合目前搜尋或篩選條件的 FAQ"}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  setStatusFilter("all");
                }}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                清除篩選
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">發布佇列</th>
                      <th className="px-5 py-3 font-medium">問題</th>
                      <th className="px-5 py-3 font-medium">回答預覽</th>
                      <th className="px-5 py-3 font-medium">狀態</th>
                      <th className="px-5 py-3 font-medium">時間</th>
                      <th className="px-5 py-3 text-right font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredFaqs.map((faq) => (
                      <tr
                        key={faq.id}
                        className={`align-top transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/40 ${
                          faq.isActive ? "" : "opacity-75"
                        }`}
                      >
                        <td className="px-5 py-5">
                          <QueueMarker faq={faq} />
                        </td>
                        <td className="max-w-xs px-5 py-5 font-semibold text-gray-900 dark:text-gray-100">
                          <p className="whitespace-normal break-words leading-6">
                            {faq.question}
                          </p>
                        </td>
                        <td className="max-w-md px-5 py-5 text-gray-600 dark:text-gray-300">
                          <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6">
                            {faq.answer}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <StatusBadge isActive={faq.isActive} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-5 text-xs text-gray-500 dark:text-gray-400">
                          <p>更新 {formatDate(faq.updatedAt)}</p>
                          <p className="mt-1">建立 {formatDate(faq.createdAt)}</p>
                        </td>
                        <td className="px-5 py-5">
                          <FaqActions
                            faq={faq}
                            processing={processingId === faq.id}
                            onEdit={handleEdit}
                            onToggle={handleTogglePublish}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {filteredFaqs.map((faq) => (
                <article
                  key={faq.id}
                  className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 ${
                    faq.isActive
                      ? "border-gray-200 dark:border-gray-800"
                      : "border-amber-200 opacity-80 dark:border-amber-900/60"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-1 ${
                      faq.isActive
                        ? "bg-emerald-500"
                        : "bg-amber-300 dark:bg-amber-700"
                    }`}
                  />
                  <div className="min-w-0 pl-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <QueueMarker faq={faq} />
                      <StatusBadge isActive={faq.isActive} />
                    </div>
                    <h2 className="mt-4 text-base font-bold leading-6 text-gray-900 dark:text-gray-100">
                      {faq.question}
                    </h2>
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      <span>更新 {formatDate(faq.updatedAt)}</span>
                      <span>建立 {formatDate(faq.createdAt)}</span>
                    </div>
                    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                      <FaqActions
                        faq={faq}
                        processing={processingId === faq.id}
                        onEdit={handleEdit}
                        onToggle={handleTogglePublish}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <FaqFormModal
          key={editing?.id || "new"}
          faq={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSave}
        />
      )}
    </>
  );
}
