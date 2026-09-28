"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "./api";

type Role = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: Role[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, refresh_token: string, user_data: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nirikshak_token");
    const storedUser = localStorage.getItem("nirikshak_user");
    if (token && storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(storedUser));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        localStorage.removeItem("nirikshak_token");
        localStorage.removeItem("nirikshak_refresh_token");
        localStorage.removeItem("nirikshak_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, refresh_token: string, userData: User) => {
    localStorage.setItem("nirikshak_token", token);
    if (refresh_token) {
      localStorage.setItem("nirikshak_refresh_token", refresh_token);
    }
    localStorage.setItem("nirikshak_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    const refresh_token = localStorage.getItem("nirikshak_refresh_token");
    if (refresh_token) {
      try {
        await fetchApi("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token })
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignore logout errors on the client
      }
    }
    
    localStorage.removeItem("nirikshak_token");
    localStorage.removeItem("nirikshak_refresh_token");
    localStorage.removeItem("nirikshak_user");
    setUser(null);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
