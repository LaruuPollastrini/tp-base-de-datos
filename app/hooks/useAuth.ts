import { useEffect, useState } from "react";
import { getToken } from "~/utils/auth";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== undefined) {
      const token = getToken();
      setIsLoggedIn(() => token);
    }
  }, []);

  return {
    isLoggedIn,
  };
};
