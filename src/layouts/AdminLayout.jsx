// 後台共用版型：左側固定側邊欄 + 右側內容區。
// 各後台頁面透過 <Outlet /> 顯示在右側；頁面內各自用 <AdminPageHeader /> 放標題與操作鈕。
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    // 注意 text-left：全站 global.css 把 #root 設成 text-align:center，
    // 這裡覆蓋回靠左，後台內容才不會整片置中。
    <div className="admin-layout flex min-h-screen bg-gray-50 text-left text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
