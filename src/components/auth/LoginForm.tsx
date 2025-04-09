import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { showToast } from "../../lib/toast";
import { Theme } from "../../types/theme";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Github, Grid2x2, Mail } from "lucide-react";

interface LoginFormProps {
  currentTheme: Theme;
  onSuccess: (type: "user" | "admin") => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ currentTheme, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clear any existing sessions first
      await supabase.auth.signOut();

      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!user) {
        throw new Error("No user returned from authentication");
      }

      // Check if this is an admin login attempt
      const adminLevel = user?.user_metadata?.admin_level || "user";
      if (loginType === "admin" && (!adminLevel || adminLevel === "user")) {
        throw new Error("Invalid admin credentials");
      }

      // Pass the login type to onSuccess
      onSuccess(loginType);
    } catch (err) {
      let errorMessage = "Invalid email or password. Please try again.";
      if (err instanceof Error && err.message === "Invalid admin credentials") {
        errorMessage = "Invalid admin credentials. You don't have admin access.";
      }
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: "github" | "google" | "azure") => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
      showToast(`Failed to sign in with ${provider}`, "error");
      console.error(`${provider} login error:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  ">
      <div className="max-w-sm w-full p-8 rounded-lg border border-accent bg-background">
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setLoginType("user")}
            className={`flex-1 p-2 rounded font-medium transition-opacity text-sm  ${
              loginType === "user" ? "text-primary-foreground hover:bg-theme" : " bg-accent-primary text-primary"
            }`}
          >
            User
          </Button>
          <Button
            onClick={() => setLoginType("admin")}
            className={`flex-1 p-2 rounded font-medium transition-opacity text-sm  ${
              loginType === "admin" ? "text-primary-foreground hover:bg-theme" : " bg-accent-primary text-primary"
            }`}
          >
            Admin
          </Button>
        </div>

        {error && <div className="p-4 mb-4 rounded text-sm text-primary">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2 ">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded text-sm   "
              placeholder="name@company.com"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2 ">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded text-sm "
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full p-2 rounded font-medium border border-primary">
            {loading ? "Signing in..." : "Continue"}
          </Button>
        </form>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => signInWithProvider("google")}
            disabled={loading}
            className="flex-1 p-1 rounded font-medium bg-accent-primary text-primary flex items-center justify-center gap-2 text-sm border border-primary"
          >
            <Mail size={14} />
            {loading ? "Google..." : "Google"}
          </Button>

          <Button
            onClick={() => signInWithProvider("azure")}
            disabled={loading}
            className="flex-1 p-1 rounded font-medium bg-accent-primary text-primary flex items-center justify-center gap-2 text-sm border border-primary"
          >
            <Grid2x2 size={14} />
            {loading ? "Microsoft..." : "Microsoft"}
          </Button>
        </div>

        <Button
          onClick={() => signInWithProvider("github")}
          disabled={loading}
          className="w-full p-1 rounded font-medium bg-accent-primary text-primary mt-2 flex items-center justify-center gap-2 text-sm border border-primary"
        >
          <Github size={14} />
          {loading ? "GitHub..." : "GitHub"}
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
