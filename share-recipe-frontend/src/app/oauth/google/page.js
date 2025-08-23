"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import { fetchProfile } from "@/lib/api/profile";

function GoogleOAuthContent() {
    const router = useRouter();
    const params = useSearchParams();
    const dispatch = useDispatch();

    const [error, setError] = useState("");

    useEffect(() => {
        const access = params.get("access");
        const refresh = params.get("refresh");
        const err = params.get("error");
        const next = params.get("next");

        if (err) {
            setError(err);
            return;
        }

        if (access && refresh) {
            try {
                localStorage.setItem("access", access);
                localStorage.setItem("refresh", refresh);
            } catch (e) {
                // ignore quota errors
            }

            (async () => {
                try {
                    const profile = await fetchProfile();
                    dispatch(setUser(profile));
                    router.replace(next || "/user/my-kitchen");
                } catch (e) {
                    setError(e?.message || "Failed to load profile after Google sign-in.");
                }
            })();
        } else {
            setError("Missing tokens in redirect. Please try again.");
        }
    }, [params, dispatch, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-xl font-semibold mb-2">Google sign-in failed</h1>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
                    <button
                        className="px-4 py-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-600"
                        onClick={() => router.replace("/signin")}
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <h1 className="text-xl font-semibold mb-2">Completing Google sign-in…</h1>
                <p className="text-sm text-gray-600">Please wait a moment.</p>
            </div>
        </div>
    );
}

export default function GoogleOAuthLanding() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-xl font-semibold mb-2">Loading...</h1>
                    <p className="text-sm text-gray-600">Please wait a moment.</p>
                </div>
            </div>
        }>
            <GoogleOAuthContent />
        </Suspense>
    );
}

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
