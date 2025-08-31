// src/app/not-found.js
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-yellow-500 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-500 mb-6">Oops! The page you're looking for doesn't exist.</p>
      <a href="/" className="text-yellow-500 hover:underline">Go back home</a>
    </div>
  );
}
