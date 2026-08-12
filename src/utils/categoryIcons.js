import {
  CodeXml,
  Database,
  Bug,
  PocketKnife,
  Rocket,
  ShieldCheck,
  FileText,
  Palette,
  Languages,
  BookOpenText,
} from "lucide-react";

// 分類名稱 -> lucide icon，比照 HomePage.jsx「所有分類」卡片使用的圖示，
// 並補齊 Agent Skill 實際會用到、但首頁固定卡片沒涵蓋到的分類。
export const CATEGORY_ICONS = {
  前端開發: CodeXml,
  後端開發: Database,
  除錯技巧: Bug,
  小工具: PocketKnife,
  "DevOps / 部署維運": Rocket,
  "測試 / 品質保證": ShieldCheck,
  "文件 / 寫作": FileText,
  "教育 / 學習": BookOpenText,
  資安相關: ShieldCheck,
  "設計 / UX": Palette,
  翻譯助手: Languages,
};

export const DEFAULT_CATEGORY_ICON = PocketKnife;
