// 新增 / 編輯 Prompt / Skill 的「頁面容器」。
//
// 這個檔案負責「資料流」：判斷是新增還是編輯、載入需要的資料、送出後導頁。
// 真正的表單畫面與欄位驗證則交給 <SkillForm />（新增與編輯共用同一個表單元件）。
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import SkillForm from "../../components/admin/SkillForm";
import {
  getParametersByType,
  getSkillById,
  createSkill,
  updateSkill,
} from "../../api/adminApi";
import { alertHelper } from "../../utils/sweetAlert";

export default function SkillFormPage() {
  const navigate = useNavigate();
  // 路由 /admin/skills/:id/edit 會帶 id；/admin/skills/new 沒有 id。
  // 用有沒有 id 來判斷這次是「編輯」還是「新增」。
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]); // 分類下拉選單用
  const [contentTypes, setContentTypes] = useState([]); // 資料類型
  const [models, setModels] = useState([]); // 適用模型
  const [tags, setTags] = useState([]); // 標籤
  const [initialValues, setInitialValues] = useState(null); // 帶給表單的預設值
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false); // 編輯模式找不到該筆資料時顯示

  // 進頁時載入資料：分類清單一定要載；編輯模式再多載入該筆 skill 當表單預設值。
  useEffect(() => {
    // active 旗標：避免元件已卸載後才 setState（非同步回來太慢的情況）。
    let active = true;
    const load = async () => {
      const [cats, ctypes, mods, tgs] = await Promise.all([
        getParametersByType("category"),
        getParametersByType("contentType"),
        getParametersByType("model"),
        getParametersByType("tag"),
      ]);
      if (!active) return;
      
      setCategories(cats);
      setContentTypes(ctypes);
      setModels(mods);
      setTags(tgs);

      if (isEdit) {
        const skill = await getSkillById(id);
        if (!active) return;
        if (!skill) {
          setNotFound(true);
        } else {
          setInitialValues(skill); // 把整筆資料交給表單，表單只會取用可編輯的欄位
        }
      } else {
        setInitialValues({}); // 新增模式：空物件，表單會套用自己的預設值
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  // 表單通過驗證後才會呼叫這裡（驗證在 <SkillForm /> 內由 react-hook-form 處理）。
  // 這個函式是 async，react-hook-form 會 await 它，所以送出期間按鈕會自動 disabled。
  const handleSubmit = async (form) => {
    try {
      if (isEdit) {
        await updateSkill(id, form);
        alertHelper.success("已更新", `「${form.title}」已儲存。`);
      } else {
        await createSkill(form);
        alertHelper.success("已新增", `「${form.title}」已建立。`);
      }
      navigate("/admin/skills");
    } catch (err) {
      alertHelper.error("儲存失敗", err.message || "");
    }
  };

  return (
    <>
      <AdminPageHeader
        title={isEdit ? "編輯 Prompt / Skill" : "新增 Prompt / Skill"}
        description={isEdit ? "編輯既有資料" : "建立一筆新的 Prompt / Skill"}
      />
      <div className="mx-auto max-w-3xl p-8">
        {loading ? (
          <div className="py-12 text-center text-gray-400">載入中…</div>
        ) : notFound ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">找不到指定的資料。</p>
            <button
              type="button"
              onClick={() => navigate("/admin/skills")}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              返回列表
            </button>
          </div>
        ) : (
          <SkillForm
            initialValues={initialValues}
            categories={categories}
            contentTypes={contentTypes}
            models={models}
            tags={tags}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/skills")}
          />
        )}
      </div>
    </>
  );
}
