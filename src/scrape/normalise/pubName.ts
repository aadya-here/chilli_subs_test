export function normalizeName(name: string): string {
  if (!name) return "";

  let normalized = name.trim();

  normalized = normalized.replace(/\s+/g, " ");
  normalized = normalized.replace(/\s*\([^)]*\)\s*/g, " ");
  normalized = normalized.toLowerCase();
  normalized = normalized.replace(/^(the|a|an)\s+/i, "");
  normalized = normalized.replace(/\s+(inc|ltd|llc|co|corp|company|press|publishing|publishers?)\.?$/i, "");
  normalized = normalized.replace(/[^\w\s\-']/g, "");

  // Trim again
  normalized = normalized.trim();

  return normalized;
}