"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { data, error } = await signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Failed to login");
      setIsLoading(false);
    } else {
      router.push("/chat");
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-400/10 mb-6">
        <Sparkles className="w-5 h-5 text-black" />
      </div>
      
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-8">
        Sign in to your account
      </h2>

      <div className="w-full flex flex-col gap-3 mb-8">
        <Button variant="outline" className="w-full h-12 bg-white dark:bg-[#0c0c0f]/60 hover:bg-zinc-50 dark:hover:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 font-medium">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Sign in with Google
        </Button>
        <Button variant="outline" className="w-full h-12 bg-white dark:bg-[#0c0c0f]/60 hover:bg-zinc-50 dark:hover:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 font-medium">
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.71 3.58-.71 1.514.048 2.872.845 3.65 2.15-3.1 1.72-2.64 5.92.51 7.15-.65 1.48-1.54 2.76-2.82 3.58zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Sign in with Apple
        </Button>
      </div>

      <div className="w-full relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#fafcf7] dark:bg-[#030303] px-4 text-zinc-500 dark:text-zinc-400">Or with email</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="w-full space-y-4">
        {error && (
          <div className="p-3 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md text-center">
            {error}
          </div>
        )}
        
        <Input
          id="email"
          type="email"
          placeholder="Email or username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-12 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-amber-500"
        />

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-12 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-amber-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 rounded border-zinc-300 dark:border-white/10 text-black dark:text-white focus:ring-amber-500 bg-white dark:bg-zinc-900"
            />
            <label htmlFor="remember" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 hover:underline">
            Forgot Password?
          </a>
        </div>

        <Button type="submit" className="w-full h-12 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-base mt-2 transition-colors animate-in fade-in duration-300" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8 pt-4">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-zinc-950 dark:text-white font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
