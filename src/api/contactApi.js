import { apiRequest } from "./apiClient";

/**
 * 傳送首頁聯絡表單內容至後端
 * @param {{ name: string, email: string, message: string }} data
 */
export async function submitContactForm(data) {
  const result = await apiRequest("/contacts", {
    method: "POST",
    body: data,
  });
  return result;
}
