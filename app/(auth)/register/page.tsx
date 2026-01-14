'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function Page() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all the required fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Confirm password should be same as password");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert(data.message || "User registered successfully! Please check your email.");
      redirect('/login');
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background circuit effect */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="M100 200 L300 200 L300 400 L500 400" stroke="#00f0ff" strokeWidth="3" />
            <path d="M600 300 L600 500 L800 500" stroke="#cc00ff" strokeWidth="3" />
            <circle cx="300" cy="200" r="6" fill="#00f0ff" filter="url(#glow)" />
            <circle cx="600" cy="500" r="6" fill="#cc00ff" filter="url(#glow)" />
            <circle cx="500" cy="400" r="6" fill="#00ff85" filter="url(#glow)" />
            <path d="M150 300 L150 600 L350 600 L350 800" stroke="#00ff85" strokeWidth="2.5" />
            <path d="M700 100 L900 100 L900 300" stroke="#00f0ff" strokeWidth="2.5" />
            <path d="M200 500 L400 500 L400 700" stroke="#cc00ff" strokeWidth="2.5" />
            <circle cx="150" cy="600" r="5" fill="#00ff85" filter="url(#glow)" />
            <circle cx="900" cy="300" r="5" fill="#00f0ff" filter="url(#glow)" />
            <circle cx="400" cy="700" r="5" fill="#cc00ff" filter="url(#glow)" />
            <path d="M50 50 L200 50 L200 250 L400 250" stroke="#ff4d4d" strokeWidth="2.5" />
            <path d="M950 950 L800 950 L800 750 L600 750" stroke="#00f0ff" strokeWidth="2.5" />
            <path d="M100 900 L300 900 L300 650 L500 650" stroke="#cc00ff" strokeWidth="2.5" />
            <path d="M900 50 L700 50 L700 200" stroke="#00ff85" strokeWidth="2.5" />
            <circle cx="200" cy="50" r="5" fill="#ff4d4d" filter="url(#glow)" />
            <circle cx="800" cy="950" r="5" fill="#00f0ff" filter="url(#glow)" />
            <circle cx="300" cy="900" r="5" fill="#cc00ff" filter="url(#glow)" />
            <circle cx="700" cy="200" r="5" fill="#00ff85" filter="url(#glow)" />
            <pattern id="hex-grid" x="0" y="0" width="40" height="69.28" patternUnits="userSpaceOnUse">
              <path
                d="M20 0 L10 17.32 L30 17.32 L40 34.64 L30 51.96 L10 51.96 L0 34.64 L10 17.32"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="0.7"
                strokeOpacity="0.7"
              />
            </pattern>
            <rect x="0" y="0" width="1000" height="1000" fill="url(#hex-grid)" />
          </g>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Subtle scanlines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none scanline-bg"></div>

      {/* Glowing nodes */}
      <div className="absolute w-3 h-3 bg-neon-blue rounded-full drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" style={{ top: '20%', left: '30%' }} />
      <div className="absolute w-2 h-2 bg-neon-purple rounded-full drop-shadow-[0_0_8px_rgba(204,0,255,0.7)]" style={{ top: '60%', right: '25%' }} />

      {/* Main content */}
      <div className="text-center z-10 w-full max-w-md">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neon-blue mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.7)] tracking-tight">
          LifeOS Register
        </h1>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-neon-blue/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <div className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-neon-blue/50 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-blue/70"
              />
            </div>
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
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-neon-blue/50 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-blue/70"
              />
            </div>
            <button
              onClick={handleRegister}
              className="w-full px-10 py-5 bg-neon-blue/20 text-neon-blue text-xl font-bold rounded-2xl border-2 border-neon-blue/50 backdrop-blur-lg shadow-xl hover:bg-neon-blue/30 transition-all duration-300"
            >
              Register
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
              Already have an account?{' '}
              <Link href="/login" className="text-neon-blue hover:underline">
                Log In
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