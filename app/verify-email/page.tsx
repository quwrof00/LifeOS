"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No token provided");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage("Email verified successfully! Redirecting to login...");
                    setTimeout(() => {
                        router.push("/login");
                    }, 3000);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Failed to verify email");
                }
            } catch {
                setStatus("error");
                setMessage("An error occurred");
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="flex flex-col items-center space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-xl">
            <h1 className="text-2xl font-bold">Email Verification</h1>
            {status === "loading" && <p className="text-zinc-400">Verifying your email...</p>}
            {status === "success" && (
                <div className="text-center">
                    <p className="text-green-500">{message}</p>
                    <Link href="/login" className="mt-4 inline-block text-sm text-zinc-400 hover:text-white">
                        Go to Login
                    </Link>
                </div>
            )}
            {status === "error" && (
                <div className="text-center">
                    <p className="text-red-500">{message}</p>
                    <Link href="/login" className="mt-4 inline-block text-sm text-zinc-400 hover:text-white">
                        Back to Login
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
