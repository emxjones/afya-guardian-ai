import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

type AuthMode = "login" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { login, signup } = useAuth();

  return (
    <AuthLayout
      title={mode === "login" ? "Welcome Back" : "Create Account"}
      description={
        mode === "login" 
          ? "Sign in to your healthcare account" 
          : "Join AfyaJamii AI for personalized healthcare support"
      }
    >
      {mode === "login" ? (
        <LoginForm
          onLogin={login}
          onSwitchToSignup={() => setMode("signup")}
        />
      ) : (
        <SignupForm
          onSignup={signup}
          onSwitchToLogin={() => setMode("login")}
        />
      )}
    </AuthLayout>
  );
}