export const ACCOUNT_TYPES = ["Manager", "Editor", "Creator", "Member"];

const STORAGE_KEY = "revo.accountType.v1";
const EVENT = "revo-account-type";

export function readAccountTypeOverride() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (ACCOUNT_TYPES.includes(value)) return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeAccountTypeOverride(type) {
  try {
    if (ACCOUNT_TYPES.includes(type)) localStorage.setItem(STORAGE_KEY, type);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

function identityBlob(user) {
  return [
    user?.accountType,
    user?.type,
    user?.role,
    user?.title,
    user?.department,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[_-]+/g, " ");
}

export function isWorkspaceOwner(user) {
  const s = [user?.name, user?.fullName, user?.email, user?.username]
    .filter(Boolean)
    .join(" ");
  return /combina/i.test(s);
}

export function inferAccountType(user) {
  if (isWorkspaceOwner(user)) return "Manager";

  const blob = identityBlob(user);
  if (!blob) return "Member";
  if (/\b(super admin|admin|manager|director|lead|head|producer)\b/.test(blob)) {
    return "Manager";
  }
  if (/\b(editor|colorist|motion)\b/.test(blob)) return "Editor";
  if (/\b(creator|ugc|actor|talent)\b/.test(blob)) return "Creator";
  return "Member";
}

export function resolveAccountType(user) {
  return readAccountTypeOverride() || inferAccountType(user);
}

export function isManagerAccount(user) {
  return resolveAccountType(user) === "Manager";
}

export function subscribeAccountType(onChange) {
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
