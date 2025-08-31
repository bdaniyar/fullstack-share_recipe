"use client";
import { useRouter } from "next/navigation";

export default function ErrorPage({ error, next }) {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-gray-500">{error?.message || "Unexpected error occurred."}</p>
      <button onClick={() => router.push(next.link)
      } className="mt-4 bg-yellow-500 px-4 py-2 rounded text-black">{next.name}</button>
    </div>
  );
}