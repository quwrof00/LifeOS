'use client';

import Link from 'next/link';
import { signIn } from "next-auth/react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/write",
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/write");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background SVG Circuit */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
        </svg>
      </div>

      <div className="absolute inset-0 opacity-10 pointer-events-none scanline-bg"></div>
      <div className="absolute w-3 h-3 bg-neon-blue rounded-full drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" style={{ top: '20%', left: '30%' }} />
      <div className="absolute w-2 h-2 bg-neon-purple rounded-full drop-shadow-[0_0_8px_rgba(204,0,255,0.7)]" style={{ top: '60%', right: '25%' }} />

      <div className="text-center z-10 w-full max-w-md">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neon-blue mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.7)] tracking-tight">
          LifeOS Login
        </h1>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-neon-blue/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <div className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-neon-blue/50 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-blue/70"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-neon-blue/50 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-blue/70"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleLogin}
              className="w-full px-10 py-5 bg-neon-blue/20 text-neon-blue text-xl font-bold rounded-2xl border-2 border-neon-blue/50 backdrop-blur-lg shadow-xl hover:bg-neon-blue/30 transition-all duration-300 flex items-center justify-center"
              disabled={loading}>
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-neon-blue"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>) : (
                "Log In"
              )}
            </button>

            {/* Divider with "OR" text */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neon-blue/30"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white/10 text-neon-blue/80 text-sm backdrop-blur-sm">OR</span>
              </div>
            </div>

            <button
              onClick={() => signIn("google", { callbackUrl: "/write" })}
              className="w-full px-10 py-5 bg-white/10 text-white text-xl font-bold rounded-2xl border-2 border-white/50 backdrop-blur-lg shadow-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="#FFFFFF"
                />
              </svg>
              Continue with Google
            </button>

            <p className="text-gray-300 text-sm">
              Need an account?{' '}
              <Link href="/register" className="text-neon-blue hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --neon-blue: #00f0ff;
          --neon-purple: #cc00ff;
          --neon-green: #00ff85;
          --neon-red: #ff4d4d;
        }
        .scanline-bg {
          background-image: linear-gradient(rgba(0, 240, 255, 0.10) 1px, transparent 1px);
          background-size: 100% 8px;
        }
      `}</style>
    </div>
  );
}
