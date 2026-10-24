export function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export function dateShort(s) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}