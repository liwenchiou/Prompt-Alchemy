// 後台首頁（/admin）：統計數字、快速操作與儀表板列表。
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import {
  getSkills,
  getParametersByType,
  getAdminAuth,
  getUsers,
  isSkillActive,
} from "../../api/adminApi";
import { getPublishedPrompts } from "../../api/promptApi";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    categories: 0,
    users: 0,
  });
  const [popular, setPopular] = useState([]);
  const [mostFavorited, setMostFavorited] = useState([]);

  const admin = getAdminAuth();

  useEffect(() => {
    Promise.all([
      getSkills(),
      getParametersByType("category"),
      getUsers(),
      getPublishedPrompts(),
    ]).then(([skills, categories, users, publishedPrompts]) => {
      // 統計數據
      setStats({
        total: skills.length,
        active: skills.filter((s) => isSkillActive(s)).length,
        inactive: skills.filter((s) => !isSkillActive(s)).length,
        categories: categories.length,
        users: users.length,
      });

      // Top 5 熱門榜單（取前台已發布內容，依複製次數排序）
      const pop = [...publishedPrompts]
        .sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0))
        .slice(0, 5);
      setPopular(pop);

      // Top 5 前台最多被收藏（取前台已發布內容，依收藏數排序）
      const favs = [...publishedPrompts]
        .sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0))
        .slice(0, 5);
      setMostFavorited(favs);
    });
  }, []);

  const cards = [
    { label: "全部 Prompt / Skill", value: stats.total },
    { label: "會員總數", value: stats.users },
    { label: "啟用", value: stats.active },
    { label: "未啟用", value: stats.inactive },
    { label: "分類數量", value: stats.categories },
  ];

  return (
    <>
      <AdminPageHeader
        title="後台首頁"
        description={admin ? `歡迎回來，${admin.name}` : "後台管理入口"}
      />
      <div className="space-y-8 p-8">
        
        {/* 1. 統計數字卡片 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {card.value}
              </div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* 2. 快速操作區 (Quick Actions) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/admin/skills/new"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-500 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-500"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl transition group-hover:bg-indigo-100 dark:bg-indigo-900/30 dark:group-hover:bg-indigo-900/50">
              ✨
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-gray-100">撰寫新 Prompt / Skill</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">分享你的最新 AI 提示詞或技能</div>
            </div>
          </Link>
          
          <Link
            to="/admin/parameters"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-2xl transition group-hover:bg-gray-100 dark:bg-gray-800 dark:group-hover:bg-gray-700">
              🏷️
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-gray-100">管理系統參數</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">維護分類、標籤與適用模型</div>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-600"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl transition group-hover:bg-blue-100 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50">
              👥
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-gray-100">會員管理</div>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">管理帳號與指派權限</div>
            </div>
          </Link>
        </div>

        {/* 3. 資料列表區 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* 熱門榜單 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 bg-gray-50/50 p-4 text-sm font-bold text-gray-900 dark:border-gray-800 dark:bg-gray-800/30 dark:text-gray-100">
              🏆 熱門被複製內容 (Top 5)
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {popular.map((s) => (
                <Link
                  key={s.id}
                  to={`/admin/skills/${s.id}/edit`}
                  className="flex items-center justify-between p-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="min-w-0 pr-4">
                    <div className="truncate font-medium text-gray-800 dark:text-gray-200">
                      {s.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                      {s.intro || "無簡介"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-orange-500">
                    🔥 {s.copyCount}
                  </div>
                </Link>
              ))}
              {popular.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">尚無資料</div>
              )}
            </div>
          </div>

          {/* 前台最多被收藏 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 bg-gray-50/50 p-4 text-sm font-bold text-gray-900 dark:border-gray-800 dark:bg-gray-800/30 dark:text-gray-100">
              ❤️ 前台最多被收藏 (Top 5)
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {mostFavorited.map((s) => (
                <Link
                  key={s.id}
                  to={`/admin/skills/${s.id}/edit`}
                  className="flex items-center justify-between p-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="min-w-0 pr-4">
                    <div className="truncate font-medium text-gray-800 dark:text-gray-200">
                      {s.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                      {s.intro || "無簡介"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-pink-500">
                    ❤️ {s.favoriteCount || 0}
                  </div>
                </Link>
              ))}
              {mostFavorited.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">尚無資料</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
