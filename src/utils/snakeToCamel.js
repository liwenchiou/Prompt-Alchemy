
export function snakeToCamel(obj) {
  if (!obj || typeof obj !== "object") return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase()),
      value,
    ])
  );
}
