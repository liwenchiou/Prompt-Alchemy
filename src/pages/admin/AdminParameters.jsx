import { useEffect, useState } from "react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import ParameterFormModal from "../../components/admin/ParameterFormModal";
import {
  getParametersByType,
  createParameter,
  updateParameter,
  disableParameter,
} from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";
import { formatDate } from "../../utils/date";

const TABS = [
  { id: "category", label: "分類管理" },
  { id: "contentType", label: "資料類型" },
  { id: "model", label: "適用模型" },
  { id: "tag", label: "標籤管理" },
];

export default function AdminParametersPage() {
  const [activeTab, setActiveTab] = useState("category");
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadParameters = (type) => {
    setLoading(true);
    getParametersByType(type).then((data) => {
      setParameters(data);
      setLoading(false);
    });
  };

  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab);
    setLoading(true);
  }

  useEffect(() => {
    let active = true;
    getParametersByType(activeTab).then((data) => {
      if (!active) return;
      setParameters(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [activeTab]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (param) => {
    setEditing(param);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    if (editing) {
      await updateParameter(editing.id, form);
    } else {
      await createParameter(activeTab, form);
    }
    setModalOpen(false);
    loadParameters(activeTab);
  };

  const handleDisable = async (param) => {
    const typeLabel = TABS.find((t) => t.id === activeTab)?.label || "參數";
    const confirmed = await alertHelper.confirm(
      `確定要停用此${typeLabel}嗎？`,
      `「${param.name}」將被停用。`,
    );
    if (!confirmed) return;
    await disableParameter(param.id);
    loadParameters(activeTab);
  };

  return (
    <>
      <AdminPageHeader
        title="標籤與參數管理"
        description="集中管理分類、資料類型、適用模型與標籤"
        actions={
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + 新增{TABS.find((t) => t.id === activeTab)?.label.replace('管理', '')}
          </button>
        }
      />

      <div className="px-8 pt-4">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 pt-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium">名稱</th>
                  <th className="px-6 py-3 font-medium">說明</th>
                  <th className="px-6 py-3 font-medium">狀態</th>
                  <th className="px-6 py-3 font-medium">建立時間</th>
                  <th className="px-6 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      載入中…
                    </td>
                  </tr>
                ) : parameters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      尚無資料
                    </td>
                  </tr>
                ) : (
                  parameters.map((param) => (
                    <tr
                      key={param.id}
                      className="text-gray-700 dark:text-gray-200"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {param.name}
                      </td>
                      <td className="max-w-xs px-6 py-4 text-gray-500 dark:text-gray-400">
                        <span className="line-clamp-2">
                          {param.description || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {param.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                            啟用
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                            停用
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {param.createdAt
                          ? formatDate(param.createdAt)
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(param)}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisable(param)}
                            disabled={!param.isActive}
                            className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30"
                          >
                            停用
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ParameterFormModal
          key={editing?.id || "new"}
          parameter={editing}
          type={activeTab}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
