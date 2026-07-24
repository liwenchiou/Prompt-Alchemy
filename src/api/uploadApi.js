import apiClient from "./apiClient";

/**
 * 上傳單一檔案至後端（GCP Bucket），回傳公開可存取的 URL。
 * 打 POST /utility/upload，以 multipart/form-data 帶 `file` 欄位。
 * 覆寫 Content-Type 讓瀏覽器 / axios 自動補上 multipart boundary。
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post("/utility/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const url = res?.data?.url;
  if (!url) {
    throw new Error("上傳成功但未取得檔案網址");
  }
  return url;
}
