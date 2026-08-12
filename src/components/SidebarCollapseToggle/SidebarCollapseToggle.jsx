import { CircleChevronLeft, CircleChevronRight } from "lucide-react";

// 側邊欄收合／展開切換按鈕

export default function SidebarCollapseToggle({ collapsed, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-pencil-name="Sidebar Collapse Toggle"
      aria-label={collapsed ? "展開側邊選單" : "收合側邊選單"}
      className="sidebar-toggle-flash box-border shrink-0 flex items-center justify-center p-1.5 rounded-lg bg-transparent border-0 text-[#7DCEA0] hover:bg-[#39FF14]/10 hover:text-[#39FF14] cursor-pointer transition-all"
    >
      {collapsed ? (
        <CircleChevronRight size={20} />
      ) : (
        <CircleChevronLeft size={20} />
      )}
    </button>
  );
}
