export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function shortAddress(value: string, visible = 6) {
  if (value.length <= visible * 2) {
    return value;
  }

  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

export function truncatePreview(value: unknown, maxLength = 900) {
  const text = typeof value === "string" ? value : JSON.stringify(value);

  if (!text) {
    return "";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
