/**
 * Onboarding Tour Steps configuration for Driver.js
 * Supports dynamic routing via `targetRoute` and `route` properties.
 */
export const createTourSteps = (
  promptId = '00000000-0000-4000-8000-000000000001',
  skillId = '00000000-0000-4000-8000-000000000002'
) => {
  const promptDetailRoute = `/skills/${promptId}`;
  const skillDetailRoute = `/agent-skills/${skillId}`;

  return [
    {
      element: '[data-tour="navbar-brand"]',
      popover: {
        title: '✨ 歡迎來到 Prompt-Alchemy',
        description: '這裡是 Prompt 與 Agent Skill 鍊金工坊！您可以隨時點擊 Logo 返回首頁。',
        side: 'bottom',
        align: 'start',
      },
      route: '/',
    },
    {
      element: '[data-tour="nav-links"]',
      popover: {
        title: '📚 探索與安裝選單',
        description: '快速切換至 Prompt 市場、Agent Skills 技能庫與我的收藏區塊。',
        side: 'bottom',
        align: 'center',
      },
      route: '/',
    },
    {
      element: '[data-tour="hero-cta"]',
      popover: {
        title: '⚡ 10 秒極速安裝',
        description: '點擊此處可進入完整技能庫清單，隨時探索與複製常用的 AI 指令！',
        side: 'right',
        align: 'center',
      },
      route: '/',
    },
    {
      element: '[data-tour="featured-prompts"]',
      popover: {
        title: '🔥 熱門 Prompt 提示詞',
        description: '精選社群熱門的生成式 AI 提示詞模板。接下來讓我們前往 Prompt 詳情頁！',
        side: 'top',
        align: 'center',
      },
      route: '/',
      targetRoute: promptDetailRoute,
    },
    {
      element: '[data-tour="prompt-detail-content"]',
      popover: {
        title: '📝 Prompt 詳情與模板',
        description: '這裡展示 Prompt 的完整說明、參數結構與範例輸出，可複製直接套用。',
        side: 'bottom',
        align: 'center',
      },
      route: promptDetailRoute,
    },
    {
      element: '[data-tour="prompt-favorite-btn"]',
      popover: {
        title: '❤️ 收藏 Prompt',
        description: '點擊右上角「收藏」按鈕，可將喜歡的 Prompt 納入個人收藏庫。',
        side: 'left',
        align: 'center',
      },
      route: promptDetailRoute,
      targetRoute: skillDetailRoute,
    },
    {
      element: '[data-tour="skill-detail-content"]',
      popover: {
        title: '🤖 Agent Skill 技能詳情',
        description: '展示模組化 AI 技能說明、相容 Agent (Claude/Cursor) 與安裝指令。',
        side: 'bottom',
        align: 'center',
      },
      route: skillDetailRoute,
    },
    {
      element: '[data-tour="skill-favorite-btn"]',
      popover: {
        title: '💖 收藏 Agent Skill',
        description: '收藏 Skill 後，就能在收藏頁進行 Recipe 情境打包！',
        side: 'left',
        align: 'center',
      },
      route: skillDetailRoute,
      targetRoute: '/favorites/skills',
    },
    {
      element: '[data-tour="favorites-recipe-tabs"]',
      popover: {
        title: '🍱 Recipe 情境配方打包',
        description: '在「我的收藏-Skills」頁面，您可以切換 Recipe 頁籤，將多個 Skill 分類打包。',
        side: 'bottom',
        align: 'center',
      },
      route: '/favorites/skills',
    },
    {
      element: '[data-tour="favorite-card-add-recipe"]',
      popover: {
        title: '➕ 打包 Skill 到 Recipe',
        description: '點擊卡片上的「加入 Recipe」，即可將多個 Skill 歸類至指定的 Recipe 配方中。',
        side: 'top',
        align: 'center',
      },
      route: '/favorites/skills',
    },
    {
      element: '[data-tour="bulk-install-btn"]',
      popover: {
        title: '⚡ 一鍵安裝 (Bulk Install)',
        description: '點擊「一鍵安裝」即可自動打包目前配方內的所有 Skill CLI 指令！',
        side: 'bottom',
        align: 'end',
      },
      route: '/favorites/skills',
    },
    {
      element: '[data-tour="bulk-install-copy-btn"]',
      popover: {
        title: '📋 一鍵複製與完成導覽',
        description: `點擊「<strong style="color:#FFD700">複製全部</strong>」即可將打包好的安裝指令一鍵複製至剪貼簿，恭喜完成導覽！🎉
<div style="margin-top:10px;background:#111827;border:1px solid rgba(255,215,0,0.35);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6">
  <div style="color:#7DCEA0;margin-bottom:6px;font-size:11px">目前範圍：<span style="color:#FFD700;font-weight:600">全部</span></div>
  <div style="background:rgba(21,70,12,0.4);border-radius:4px;padding:8px 10px;font-family:monospace;color:#d4d9d6;font-size:11px;white-space:pre;margin-bottom:8px"># /my-skill
claude mcp add my-skill npx -y @my/skill-mcp
cursor mcp add my-skill npx -y @my/skill-mcp</div>
  <div style="display:flex;justify-content:flex-end">
    <span style="background:#FFD700;color:#0A0E1A;font-weight:700;font-size:12px;padding:5px 14px;border-radius:999px;cursor:pointer">複製全部</span>
  </div>
</div>`,
        side: 'top',
        align: 'end',
      },
      route: '/favorites/skills',
    },
    {
      element: '[data-tour="tour-replay-btn"]',
      popover: {
        title: '💡 隨時重新導覽',
        description: '未來若需要再次查看教學，隨時點擊右上方「新手指引」按鈕即可再次播放！',
        side: 'bottom',
        align: 'end',
      },
      route: '/favorites/skills',
    },
  ];
};

export const tourSteps = createTourSteps();
