import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AgentSkillForm from "../../components/admin/AgentSkillForm";
import {
  getParametersByType,
  getAdminAgentSkillById,
  createAdminAgentSkill,
  updateAdminAgentSkill,
} from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";

export default function AdminAgentSkillFormManager() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [cats] = await Promise.all([
        getParametersByType("category"),
      ]);
      if (!active) return;
      
      setCategories(cats);

      if (isEdit) {
        const skill = await getAdminAgentSkillById(id);
        if (!active) return;
        if (!skill) {
          setNotFound(true);
        } else {
          setInitialValues(skill);
        }
      } else {
        setInitialValues({});
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const handleSubmit = async (form) => {
    try {
      if (isEdit) {
        await updateAdminAgentSkill(id, form);
        alertHelper.success("已更新", `「${form.name}」已儲存。`);
      } else {
        await createAdminAgentSkill(form);
        alertHelper.success("已新增", `「${form.name}」已建立。`);
      }
      navigate("/admin/agent-skills");
    } catch (err) {
      alertHelper.error("儲存失敗", err.message || "");
    }
  };

  return (
    <>
      <AdminPageHeader
        title={isEdit ? "編輯 Agent Skill" : "新增 Agent Skill"}
        description={isEdit ? "編輯既有的 Agent Skill 資料" : "建立一筆新的 Agent Skill"}
      />
      <div className="mx-auto max-w-3xl p-8">
        {loading ? (
          <div className="py-12 text-center text-gray-400">載入中…</div>
        ) : notFound ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">找不到指定的資料。</p>
            <button
              type="button"
              onClick={() => navigate("/admin/agent-skills")}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              返回列表
            </button>
          </div>
        ) : (
          <AgentSkillForm
            initialValues={initialValues}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/agent-skills")}
          />
        )}
      </div>
    </>
  );
}
