import { usePageLoading } from "../hooks/usePageLoading";

export default function NotFound() {
  usePageLoading(true);
  return (
    <div className="p-4 text-gray-500">
      這是前台 404 頁面 (NotFound404)
    </div>
  );
}
