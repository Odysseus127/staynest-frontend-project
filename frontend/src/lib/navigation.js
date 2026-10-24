export function getSafeReturnTo(value) {
  if (!value) return "/";

  try {
    const target = new URL(value, window.location.origin);
    if (target.origin !== window.location.origin) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}
