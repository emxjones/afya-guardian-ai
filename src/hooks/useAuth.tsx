import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  account_type: "pregnant" | "postnatal" | "general";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  signup: (userData: {
    username: string;
    email: string;
    full_name: string;
    account_type: "pregnant" | "postnatal" | "general";
    password: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "https://afyajamii.onrender.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("afyajamii_token");
    const savedUser = localStorage.getItem("afyajamii_user");
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    setToken(data.access_token);
    
    // Get user info by decoding token or making another request
    // For now, we'll store minimal info and fetch full profile later
    const userData = {
      id: 1, // This should come from your backend
      username: credentials.username,
      email: "", // Will be filled from profile
      full_name: "", // Will be filled from profile
      account_type: "general" as const, // Will be filled from profile
    };
    
    setUser(userData);
    localStorage.setItem("afyajamii_token", data.access_token);
    localStorage.setItem("afyajamii_user", JSON.stringify(userData));
  };

  const signup = async (userData: {
    username: string;
    email: string;
    full_name: string;
    account_type: "pregnant" | "postnatal" | "general";
    password: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Signup failed");
    }

    // Auto-login after signup
    await login({ username: userData.username, password: userData.password });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("afyajamii_token");
    localStorage.removeItem("afyajamii_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}