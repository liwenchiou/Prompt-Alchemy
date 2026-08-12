import { useState } from "react";

/**
 * 管理側邊欄「收合／展開」的布林狀態，讓多個頁面的側邊欄共用同一套邏輯。
 * @param {boolean} initial 初始是否收合
 * @returns {[boolean, () => void]} [collapsed, toggleCollapsed]
 */
export default function useCollapsible(initial = false) {
  const [collapsed, setCollapsed] = useState(initial);
  const toggleCollapsed = () => setCollapsed((prev) => !prev);
  return [collapsed, toggleCollapsed];
}
