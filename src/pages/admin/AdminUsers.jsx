import { useEffect, useState } from "react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import UserFormModal from "../../components/admin/UserFormModal";
import {
  getUsers,
  createUser,
  updateUser,
  disableUser,
  getParametersByType,
} from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";
import { formatDate } from "../../utils/date";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // 簡易篩選
  const [roleFilter, setRoleFilter] = useState("");

  const loadData = async (activeFilter) => {
    setLoading(true);
    const [fetchedUsers, fetchedRoles] = await Promise.all([
      getUsers(activeFilter || null),
      getParametersByType("role"),
    ]);
    setUsers(fetchedUsers);
    setRoles(fetchedRoles);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    const fetchInit = async () => {
      setLoading(true);
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        getUsers(roleFilter || null),
        getParametersByType("role"),
      ]);
      if (!active) return;
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
      setLoading(false);
    };
    fetchInit();
    return () => {
      active = false;
    };
  }, [roleFilter]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditing(user);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    try {
      if (editing) {
        await updateUser(editing.id, form);
      } else {
        await createUser(form);
      }
      setModalOpen(false);
      loadData(roleFilter);
      alertHelper.success(editing ? "更新成功" : "新增成功");
    } catch (error) {
      alertHelper.error("儲存失敗", error.message);
    }
  };

  const handleDisable = async (user) => {
    const confirmed = await alertHelper.confirm(
      "確定要停用此會員嗎？",
      `「${user.name}」將無法再登入系統。`,
    );
    if (!confirmed) return;
    await disableUser(user.id);
    loadData(roleFilter);
  };

  const getRoleName = (role) => {
    const r = roles.find(r => r.name.toLowerCase() === role?.toLowerCase());
    return r ? r.name : "未知";
  };

  return (
    <>
      <AdminPageHeader
        title="會員管理"
        description="管理平台登入帳號、指派權限與狀態"
        actions={
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + 新增會員
          </button>
        }
      />

      <div className="p-8">
        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">全部角色</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name.toLowerCase()}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="whitespace-nowrap px-6 py-3 font-medium">名稱</th>
                  <th className="whitespace-nowrap px-6 py-3 font-medium">Email</th>
                  <th className="whitespace-nowrap px-6 py-3 font-medium">角色</th>
                  <th className="whitespace-nowrap px-6 py-3 font-medium">狀態</th>
                  <th className="whitespace-nowrap px-6 py-3 font-medium">建立時間</th>
                  <th className="whitespace-nowrap px-6 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      載入中…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      尚無資料
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="text-gray-700 dark:text-gray-200"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                            啟用
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                            停用
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-gray-400">
                        {user.createdAt
                          ? formatDate(user.createdAt)
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisable(user)}
                            disabled={!user.isActive}
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
        <UserFormModal
          key={editing?.id || "new"}
          user={editing}
          roles={roles}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
