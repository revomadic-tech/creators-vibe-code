import { LogOut } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useLogout } from "../api/auth/hooks";
import { useAccountType } from "../hooks/useAccountType";
import {
  ACCOUNT_TYPES,
  writeAccountTypeOverride,
} from "../lib/accountType";

export default function Settings() {
  const { user } = useAuth();
  const { accountType, isManager, identity } = useAccountType();
  const { mutate: signOut, isPending } = useLogout();
  const name = identity?.name || user?.name || "Account";

  return (
    <div className="flex-1 overflow-y-auto" data-shell-page-scroll>
      <div className="px-6 pb-6 pt-24 fade-in">
        <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-[#F9F8F6] text-stone-800 shadow-2xl">
          <div className="border-b border-stone-200/80 px-5 py-4">
            <p className="text-[13px] font-semibold">Settings</p>
            <p className="mt-0.5 text-[11px] text-stone-400">
              {name}
              {user?.email ? ` · ${user.email}` : ""}
            </p>
          </div>

          <div className="space-y-2 border-b border-stone-200/80 px-5 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">
              Account type
            </p>
            <div className="flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-white p-1">
              {ACCOUNT_TYPES.map((type) => {
                const selected = accountType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => writeAccountTypeOverride(type)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                      selected
                        ? "bg-stone-900 text-white"
                        : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400">
              {isManager
                ? "Manager can open Admin and Review Pipeline decisions."
                : "Admin is hidden on Member, Editor, and Creator. Switch to Manager to see it."}
            </p>
          </div>

          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() => signOut()}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              <LogOut size={13} />
              {isPending ? "Signing out…" : "Sign out"}
            </button>
            <p className="mt-2 text-[10px] text-stone-400">
              Sessions stay signed in until you click Sign out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
