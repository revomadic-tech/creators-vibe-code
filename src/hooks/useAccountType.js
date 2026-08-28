import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { currentUser } from "../data/mockData";
import { resolveViewer } from "../lib/adTaskBrief";
import {
  resolveAccountType,
  subscribeAccountType,
} from "../lib/accountType";

export function useAccountType() {
  const { user } = useAuth();
  const viewer = resolveViewer(user) || currentUser;
  const identity = user || viewer;
  const [accountType, setAccountType] = useState(() => resolveAccountType(identity));

  useEffect(() => {
    const sync = () => setAccountType(resolveAccountType(user || viewer));
    sync();
    return subscribeAccountType(sync);
  }, [user, viewer]);

  return {
    accountType,
    isManager: accountType === "Manager",
    viewer,
    identity,
  };
}
