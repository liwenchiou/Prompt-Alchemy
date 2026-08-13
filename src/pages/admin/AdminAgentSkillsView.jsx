import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AgentSkillFilterBar from "../../components/admin/AgentSkillFilterBar";
import AgentSkillTable from "../../components/admin/AgentSkillTable";
import {
  getAdminAgentSkills,
  getParametersByType,
  setAdminAgentSkillActive,
  isSkillActive,
} from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";

const EMPTY_FILTERS = {
  keyword: "",
  categoryId: "",
  active: "",
};

export default function AdminAgentSkillsView() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getParametersByType("category")]).then(([cats]) => {
      if (active) {
        setCategories(cats);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getAdminAgentSkills(filters).then((data) => {
      if (!active) return;
      setSkills(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [filters]);

  const reload = () => {
    getAdminAgentSkills(filters).then(setSkills);
  };

  const handleToggleActive = async (skill) => {
    const active = isSkillActive(skill);
    if (active) {
      const confirmed = await alertHelper.confirm(
        "確定要停用嗎？",
        `「${skill.name}」停用後前台將不再顯示，但資料仍保留在後台。`,
      );
      if (!confirmed) return;
    }
    await setAdminAgentSkillActive(skill.id, !active);
    reload();
  };

  return (
    <>
      <AdminPageHeader
        title="Agent Skill 管理"
        description="管理所有 Agent Skill 資料"
        actions={
          <button
            type="button"
            onClick={() => navigate("/admin/agent-skills/new")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + 新增 Agent Skill
          </button>
        }
      />

      <div className="space-y-4 p-8">
        <AgentSkillFilterBar
          filters={filters}
          categories={categories}
          onChange={setFilters}
        />
        <AgentSkillTable
          skills={skills}
          loading={loading}
          onToggleActive={handleToggleActive}
        />
      </div>
    </>
  );
}
