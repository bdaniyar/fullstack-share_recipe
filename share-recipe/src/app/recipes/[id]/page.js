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

const REPLIES_PREVIEW_COUNT = 2;

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
  const [replyParentId, setReplyParentId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedThreads, setExpandedThreads] = useState(new Set()); // root comment ids whose replies fully shown

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const data = await getRecipe(id);
        setRecipe(data);
        setLikesCount(typeof data?.likes === "number" ? data.likes : 0);
        setLiked(Boolean(data?.liked));
        setSaved(Boolean(data?.saved));
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
      await (nextSaved ? saveRecipe(id) : unsaveRecipe(id));
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

  const onEdit = () => {
    if (!ensureAuth()) return;
    router.push(`/user/my-recipes/${id}/edit`);
  };

  const findComment = (cid) => comments.find(c => String(c.id) === String(cid));
  const findRootId = (cid) => {
    let cur = findComment(cid);
    while (cur && cur.parent_id) {
      cur = findComment(cur.parent_id);
    }
    return cur ? cur.id : null;
  };

  const onAddComment = async (parentId = null) => {
    if (!ensureAuth()) return;
    const text = (parentId ? replyText : commentText).trim();
    if (!text) return;
    try {
      const temp = {
        id: `tmp-${Date.now()}`,
        content: text,
        created_at: new Date().toISOString(),
        user_id: null,
        username: "You",
        parent_id: parentId,
      };
      setComments((prev) => [...prev, temp]);
      if (parentId) {
        setReplyText("");
        setReplyParentId(null);
        const rootId = findRootId(parentId) || parentId;
        setExpandedThreads(prev => {
          const next = new Set(prev);
          next.add(rootId);
          return next;
        });
      } else {
        setCommentText("");
      }
      const saved = await addComment(id, text, parentId);
      setComments((prev) => [
        ...prev.filter((c) => !String(c.id).startsWith("tmp-")),
        saved,
      ]);
    } catch (e) {
      console.error(e);
      alert("Failed to post comment");
      setComments((prev) => prev.filter((c) => !String(c.id).startsWith("tmp-")));
      if (parentId) {
        setReplyText(text);
      } else {
        setCommentText(text);
      }
    }
  };

  const imgSrc = recipe?.image_url
    ? (recipe.image_url.startsWith("http") ? recipe.image_url : `${API_BASE_URL}${recipe.image_url}`)
    : "/home-image.jpg";

  const buildCommentTree = () => {
    const flat = comments
      .map(c => ({ ...c, children: [] }))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const map = {};
    flat.forEach(c => { map[c.id] = c; });
    const roots = [];
    flat.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(c);
      } else if (!c.parent_id) {
        roots.push(c);
      }
    });
    return roots;
  };

  const flattenReplies = (node) => {
    const out = [];
    const walk = (n) => {
      (n.children || []).forEach(child => {
        out.push({ comment: child, parent: n });
        walk(child); // keep deeper chain but no extra indent visually
      });
    };
    walk(node);
    return out;
  };

  const renderReplyRow = (replyObj) => {
    const { comment: c, parent } = replyObj;
    const displayName = c.username || (String(c.id).startsWith("tmp-") ? "You" : "Unknown");
    return (
      <div key={c.id} className="rounded-md p-3 bg-white shadow-sm">
        <div className="text-sm text-gray-500">
          {c.username ? (
            <button type="button" onClick={() => router.push(`/user/${encodeURIComponent(c.username)}`)} className="text-yellow-600 hover:underline bg-transparent p-0 m-0 border-0 cursor-pointer focus:outline-none">{displayName}</button>
          ) : displayName} · {new Date(c.created_at).toLocaleString()}
        </div>
        {parent && (
          <div className="text-xs text-gray-500 mt-1">
            ↪ replying to {parent.username ? (
              <button type="button" onClick={() => router.push(`/user/${encodeURIComponent(parent.username)}`)} className="text-yellow-600 hover:underline bg-transparent p-0 m-0 border-0 cursor-pointer focus:outline-none">@{parent.username}</button>
            ) : '@unknown'}
          </div>
        )}
        <div className="mt-1 whitespace-pre-line break-words">{c.content}</div>
        <div className="mt-2">
          <button
            type="button"
            className="text-xs text-yellow-600 hover:underline"
            onClick={() => setReplyParentId(replyParentId === c.id ? null : c.id)}
          >
            {replyParentId === c.id ? "Cancel" : "Reply"}
          </button>
        </div>
        {replyParentId === c.id && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={() => onAddComment(c.id)}
              className="bg-yellow-500 text-black px-3 py-2 rounded-md hover:bg-yellow-600 text-sm"
            >
              Reply
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderThread = (root) => {
    const rootDisplay = root.username || (String(root.id).startsWith("tmp-") ? "You" : "Unknown");
    const repliesFlat = flattenReplies(root);
    const expanded = expandedThreads.has(root.id);
    let visibleReplies = repliesFlat;
    let hiddenCount = 0;
    if (repliesFlat.length > REPLIES_PREVIEW_COUNT && !expanded) {
      visibleReplies = repliesFlat.slice(0, REPLIES_PREVIEW_COUNT);
      hiddenCount = repliesFlat.length - visibleReplies.length;
    }
    return (
      <div key={root.id} className="border rounded-md p-4 bg-gray-50">
        <div className="text-sm text-gray-500">
          {root.username ? (
            <button type="button" onClick={() => router.push(`/user/${encodeURIComponent(root.username)}`)} className="text-yellow-600 hover:underline bg-transparent p-0 m-0 border-0 cursor-pointer focus:outline-none">{rootDisplay}</button>
          ) : rootDisplay} · {new Date(root.created_at).toLocaleString()}
        </div>
        <div className="mt-1 whitespace-pre-line break-words">{root.content}</div>
        <div className="mt-2">
          <button
            type="button"
            className="text-xs text-yellow-600 hover:underline"
            onClick={() => setReplyParentId(replyParentId === root.id ? null : root.id)}
          >
            {replyParentId === root.id ? "Cancel" : "Reply"}
          </button>
        </div>
        {replyParentId === root.id && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={() => onAddComment(root.id)}
              className="bg-yellow-500 text-black px-3 py-2 rounded-md hover:bg-yellow-600 text-sm"
            >
              Reply
            </button>
          </div>
        )}
        {repliesFlat.length > 0 && (
          <div className="mt-4 pl-4 border-l border-yellow-200 space-y-3">
            {visibleReplies.map(r => renderReplyRow(r))}
            {hiddenCount > 0 && (
              <button
                type="button"
                className="text-xs text-yellow-700 hover:underline"
                onClick={() => setExpandedThreads(prev => { const next = new Set(prev); next.add(root.id); return next; })}
              >
                Show {hiddenCount} more repl{hiddenCount === 1 ? 'y' : 'ies'}
              </button>
            )}
            {expanded && repliesFlat.length > REPLIES_PREVIEW_COUNT && (
              <button
                type="button"
                className="text-xs text-yellow-700 hover:underline"
                onClick={() => setExpandedThreads(prev => { const next = new Set(prev); next.delete(root.id); return next; })}
              >
                Hide replies
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

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
              {recipe?.author_username ? (
                <div className="text-sm text-gray-500 mb-4">
                  By <button type="button" onClick={() => router.push(`/user/${encodeURIComponent(recipe.author_username)}`)} className="text-yellow-600 hover:underline bg-transparent p-0 m-0 border-0 cursor-pointer focus:outline-none focus:ring-0">{recipe.author_username}</button>
                </div>
              ) : null}
              <p className="text-gray-700 mb-6">{recipe.description}</p>

              {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ing) => (
                      <span key={ing.id} className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={onEdit}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={onDelete}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Comments */}
              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-3">Comments</h3>
                <div className="space-y-3">
                  {comments.length ? (
                    buildCommentTree().map(root => renderThread(root))
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
                    onClick={() => onAddComment(null)}
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
