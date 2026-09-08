/** Same handoff as admin: `/#sso_grant=<accessToken>` from a trusted parent console. */
export function consumeSsoGrant() {
  try {
    const hash = window.location.hash;
    const marker = "sso_grant=";
    const at = hash.indexOf(marker);
    if (at === -1) return;

    const raw = hash.slice(at + marker.length);
    const token = decodeURIComponent(raw.split("&")[0] ?? "");
    if (!token) return;

    const prev = localStorage.getItem("accessToken");
    localStorage.setItem("accessToken", token);
    if (prev !== token) localStorage.removeItem("user");

    const clean = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", clean);
  } catch {
    /* never block boot */
  }
}
