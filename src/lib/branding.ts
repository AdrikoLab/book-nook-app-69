/** Privileged signing must never accept another tenant's object path. */
export function brandingReference(value: string | null, businessId: string): string | null {
  if (!value) return null;
  if (value.startsWith("https://")) {
    try {
      const url = new URL(value);
      return url.username || url.password ? null : url.href;
    } catch { return null; }
  }
  const parts = value.split("/");
  if (parts[0] !== businessId || parts.length !== 2 || !parts[1]) return null;
  if (parts[1] === "." || parts[1] === ".." || /[%\\?#\u0000-\u001f]/.test(value)) return null;
  return value;
}