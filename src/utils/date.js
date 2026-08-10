export function formatDate(dateInput, format = "YYYY/MM/DD") {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return format
    .replace("YYYY", String(yyyy))
    .replace("MM", mm)
    .replace("DD", dd);
}
