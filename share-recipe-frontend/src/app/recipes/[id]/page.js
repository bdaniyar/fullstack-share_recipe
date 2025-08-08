"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getRecipe,
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  unsaveRecipe,
  deleteRecipe,
  getComments,
  addComment,
} from "@/lib/api/recipes";
import { API_BASE_URL } from "@/lib/config";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const data = await getRecipe(id);
        setRecipe(data);
        // Initialize social state from backend
        setLikesCount(typeof data?.likes === "number" ? data.likes : 0);
        setLiked(Boolean(data?.liked));
        setSaved(Boolean(data?.saved));
        // Load comments
        const items = await getComments(id);
        setComments(items || []);
      } catch (err) {
        console.error("Failed to fetch recipe", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipeData();
  }, [id]);

  const ensureAuth = () => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("access");
    if (!token) {
      alert("Please sign in to perform this action.");
      return false;
    }
    return true;
  };

  const onLike = async () => {
    if (!ensureAuth() || likeBusy) return;
    setLikeBusy(true);
    try {
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikesCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));
      const res = nextLiked ? await likeRecipe(id) : await unlikeRecipe(id);
      if (typeof res?.likes === "number") setLikesCount(res.likes);
    } catch (e) {
      console.error(e);
    } finally {
      setLikeBusy(false);
    }
  };

  const onSave = async () => {
    if (!ensureAuth() || saveBusy) return;
    setSaveBusy(true);
    try {
      const nextSaved = !saved;
      setSaved(nextSaved);
      const res = nextSaved ? await saveRecipe(id) : await unsaveRecipe(id);
      // backend returns {saved}; optimistic is fine
    } catch (e) {
      console.error(e);
    } finally {
      setSaveBusy(false);
    }
  };

  const onDelete = async () => {
    if (!ensureAuth()) return;
    if (!confirm("Delete this recipe?")) return;
    try {
      await deleteRecipe(id);
      router.push("/user/my-recipes");
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  };

  const onAddComment = async () => {
    if (!ensureAuth()) return;
    const text = commentText.trim();
    if (!text) return;
    try {
      // optimistic
      const temp = {
        id: `tmp-${Date.now()}`,
        content: text,
        created_at: new Date().toISOString(),
        user_id: null,
      };
      setComments((prev) => [...prev, temp]);
      setCommentText("");
      const saved = await addComment(id, text);
      // replace temp with saved (append simplest way)
      setComments((prev) => [...prev.filter((c) => !String(c.id).startsWith("tmp-")), saved]);
    } catch (e) {
      console.error(e);
      alert("Failed to post comment");
      // revert optimistic
      setComments((prev) => prev.filter((c) => !String(c.id).startsWith("tmp-")));
      setCommentText(text);
    }
  };

  const imgSrc = recipe?.image_url
    ? (recipe.image_url.startsWith("http") ? recipe.image_url : `${API_BASE_URL}${recipe.image_url}`)
    : "/home-image.jpg";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-lg">Loading recipe...</p>
          </div>
        ) : recipe ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <img
              src={imgSrc}
              alt={recipe.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2 text-yellow-600">
                {recipe.title}
              </h1>
              <p className="text-gray-700 mb-6">{recipe.description}</p>
              <div className="prose">
                <h2 className="text-xl font-semibold mb-2">Instructions</h2>
                <p className="whitespace-pre-line">
                  {recipe.instructions || "No instructions yet."}
                </p>
              </div>

              <div className="flex gap-3 mt-6 items-center">
                <button
                  onClick={onLike}
                  disabled={likeBusy}
                  className={`px-4 py-2 rounded-md ${liked
                    ? "bg-yellow-600 text-black"
                    : "bg-yellow-500 hover:bg-yellow-600 text-black"
                    } ${likeBusy ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {liked ? "Liked" : "Like"}
                </button>
                <span className="text-gray-500 text-sm">
                  {likesCount} likes
                </span>
                <button
                  onClick={onSave}
                  disabled={saveBusy}
                  className={`px-4 py-2 rounded-md ${saved
                    ? "bg-gray-300"
                    : "bg-gray-100 hover:bg-gray-200"
                    } text-gray-800 ${saveBusy ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {saved ? "Saved" : "Save"}
                </button>
                {recipe?.can_delete ? (
                  <button
                    onClick={onDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md ml-auto"
                  >
                    Delete
                  </button>
                ) : null}
              </div>

              {/* Comments */}
              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-3">Comments</h3>
                <div className="space-y-3">
                  {comments.length ? (
                    comments.map((c) => (
                      <div key={c.id} className="border rounded-md p-3 bg-gray-50">
                        <div className="text-sm text-gray-500">
                          {c.user_id ? `User #${c.user_id}` : "You"} · {new Date(c.created_at).toLocaleString()}
                        </div>
                        <div className="mt-1">{c.content}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No comments yet.</p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 border rounded-md px-3 py-2"
                  />
                  <button
                    onClick={onAddComment}
                    className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Recipe not found.</p>
        )}
      </div>
    </div>
  );
}
