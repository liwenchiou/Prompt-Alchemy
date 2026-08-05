import { apiRequest } from "./apiClient";

function normalizeFaq(item) {
  if (
    typeof item?.id !== "string" ||
    typeof item?.question !== "string" ||
    typeof item?.answer !== "string"
  ) {
    return null;
  }

  const id = item.id.trim();
  const question = item.question.trim();
  const answer = item.answer.trim();

  if (!id || !question || !answer) {
    return null;
  }

  return { id, question, answer };
}

/**
 * 取得前台啟用中的常見問題。
 */
export async function getFaqs() {
  const result = await apiRequest("/faqs/", { method: "GET" });

  if (result?.status !== "success" || !Array.isArray(result.data)) {
    throw new Error("FAQ 回應格式錯誤");
  }

  return result.data.map(normalizeFaq).filter(Boolean);
}
