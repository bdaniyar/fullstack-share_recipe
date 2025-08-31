"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPublicProfile } from "@/lib/api/profile";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

export default function PublicUserProfilePage() {
    const { username } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) return;
        (async () => {
            try {
                setLoading(true);
                const prof = await fetchPublicProfile(username);
                setData(prof);
            } catch (e) {
                setError(e.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        })();
    }, [username]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading profile...</div>;
    }
    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    }
    if (!data) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">No data</div>;
    }

    const avatar = data.photo_url ? `${API_BASE_URL}${data.photo_url}` : null;

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-32 w-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-4xl font-bold text-yellow-700">
                            {avatar ? <img src={avatar} alt={data.username} className="h-full w-full object-cover" /> : data.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">{data.username}</h1>
                            {(data.first_name || data.last_name) && (
                                <p className="text-gray-600 text-sm mt-1">{[data.first_name, data.last_name].filter(Boolean).join(" ")}</p>
                            )}
                            {data.bio && (
                                <p className="mt-3 text-sm text-gray-700 whitespace-pre-line break-words max-w-2xl">{data.bio}</p>
                            )}
                            {data.joined && (
                                <p className="text-xs text-gray-400 mt-2">Joined {new Date(data.joined).toLocaleDateString()}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Recipes</h2>
                        {data.recipes?.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.recipes.map(r => (
                                    <Link key={r.id} href={`/recipes/${r.id}`} className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                                        <div className="h-32 w-full overflow-hidden">
                                            <img src={r.image_url ? (r.image_url.startsWith("http") ? r.image_url : `${API_BASE_URL}${r.image_url}`) : "/home-image.jpg"} alt={r.title} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium line-clamp-2">{r.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No recipes yet.</p>
                        )}
                    </div>

                    {data.saved_recipes?.length ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Saved Recipes (private)</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.saved_recipes.map(r => (
                                    <Link key={r.id} href={`/recipes/${r.id}`} className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                                        <div className="h-32 w-full overflow-hidden">
                                            <img src={r.image_url ? (r.image_url.startsWith("http") ? r.image_url : `${API_BASE_URL}${r.image_url}`) : "/home-image.jpg"} alt={r.title} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium line-clamp-2">{r.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
