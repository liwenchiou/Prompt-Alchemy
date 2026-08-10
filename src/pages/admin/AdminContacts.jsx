import { useEffect, useState } from "react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import {
  getAdminContacts,
  updateAdminContactStatus,
  deleteAdminContact,
} from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";
import { formatDate } from "../../utils/date";
import { Search, CheckCircle2, Clock, Trash2 } from "lucide-react";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const loadData = async (status, kw) => {
    setLoading(true);
    try {
      const data = await getAdminContacts({
        status: status === "all" ? null : status,
        keyword: kw || null,
      });
      setContacts(data || []);
    } catch (error) {
      alertHelper.error("讀取失敗", error.message || "無法載入聯絡清單");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(statusFilter, keyword);
  }, [statusFilter, keyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === "pending" ? "resolved" : "pending";
    const confirmed = await alertHelper.confirm(
      nextStatus === "resolved"
        ? `確定將 [ ${item.name} ] 的訊息標記為「已處理」？`
        : `確定將 [ ${item.name} ] 的訊息切換回「處理中」？`
    );
    if (!confirmed) return;

    try {
      await updateAdminContactStatus(item.id, nextStatus);
      alertHelper.success("更新成功");
      loadData(statusFilter, keyword);
    } catch (error) {
      alertHelper.error("更新失敗", error.message);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = await alertHelper.confirm(
      `確定要刪除 [ ${item.name} ] 的聯絡紀錄嗎？`,
      "刪除後無法復原"
    );
    if (!confirmed) return;

    try {
      await deleteAdminContact(item.id);
      alertHelper.success("刪除成功");
      loadData(statusFilter, keyword);
    } catch (error) {
      alertHelper.error("刪除失敗", error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="聯絡表單管理"
        description="管理與處理來自首頁使用者送出的聯絡與反饋表單"
      />

      {/* 搜尋與過濾篩選列 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* 狀態過濾 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            狀態篩選：
          </span>
          {[
            { value: "all", label: "全部" },
            { value: "pending", label: "處理中" },
            { value: "resolved", label: "已處理" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 關鍵字搜尋表單 */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜尋姓名 / Email / 內容..."
              className="w-60 sm:w-72 rounded-lg border border-gray-300 bg-transparent py-1.5 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            搜尋
          </button>
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setKeyword("");
              }}
              className="rounded-lg bg-gray-200 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              清除
            </button>
          )}
        </form>
      </div>

      {/* 聯絡資料表格 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-500">
            資料讀取中...
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-sm text-gray-500">
            <span>目前無符合條件的聯絡表單紀錄</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">處理狀態</th>
                  <th className="px-4 py-3">名稱</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">聯絡內容</th>
                  <th className="px-4 py-3">留言日期</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {contacts.map((item) => {
                  const isResolved = item.status === "resolved";
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isResolved
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}
                        >
                          {isResolved ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>已處理</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3.5 w-3.5" />
                              <span>處理中</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                        {item.email}
                      </td>
                      <td className="max-w-md px-4 py-3.5">
                        <p className="whitespace-pre-wrap break-words text-xs text-gray-700 dark:text-gray-300">
                          {item.message}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {formatDate(item.createdAt, "YYYY/MM/DD")}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              isResolved
                                ? "border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {isResolved ? "設為處理中" : "標記為已處理"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            title="刪除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
