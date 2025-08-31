"use client";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      if (token) {
        router.push("/"); // main screen for logged-in users
      } else {
        router.push("/signup");
      }
    } catch (e) {
      router.push("/signup");
    }
  };

  return (

    <div className="-mt-20 flex flex-col items-center justify-start bg-cover bg-center min-h-screen " >
      {/* Hero Section */}
      <section className="w-full py-16 px-4 text-center mt-40">
        <p className="text-lg max-w-3xl mx-auto text-[#1E1E1E]">
          Welcome to our Recipe Sharing Platform — where food meets creativity
          and community. We’re passionate about bringing together cooks, food
          lovers, and culinary explorers to share their love for flavors.
        </p>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 max-w-5xl text-center">
        <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
        <p className="text-yellow-700 max-w-3xl mx-auto">
          Our mission is to create a digital kitchen where everyone from
          beginner cooks to professional chefs can share, discover, and
          celebrate diverse recipes from all around the world.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg shadow hover:shadow-md transition duration-300">
            <h3 className="text-xl font-semibold mb-2">Recipe Sharing</h3>
            <p className="text-gray-400">
              Post your own unique dishes and explore hundreds of recipes from
              others.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow hover:shadow-md transition duration-300">
            <h3 className="text-xl font-semibold mb-2">Food Blogs</h3>
            <p className="text-gray-400">
              Read interesting blogs on food trends, health, and culinary
              journeys.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow hover:shadow-md transition duration-300">
            <h3 className="text-xl font-semibold mb-2">Community Feedback</h3>
            <p className="text-gray-400">
              Rate, review, and react to recipes — build a trusted food
              community.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 text-center w-full">
        <h2 className="text-2xl font-bold mb-4 text-yellow-500">
          Join Us Today!
        </h2>
        <p className="text-gray-700 mb-6">
          Share your passion for food. Create your profile, post your best
          recipes, and engage with a vibrant community of food lovers.
        </p>
        <button
          type="button"
          onClick={handleGetStarted}
          className="inline-block bg-yellow-500 hover:border-2 hover:border-yellow-500 hover:bg-transparent hover:text-yellow-500  text-white px-6 py-3 rounded-full font-semibold transition duration-300"
        >
          Get Started
        </button>
      </section>
    </div>

  );
}
