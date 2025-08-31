"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "@/components/searchbar";
import Link from "next/link";
import { useSelector } from "react-redux";

import FeedbackForm from "@/components/feedback";
import ChefCuate from "@/assets/Chef-cuate.svg";

export default function Home() {
  // Auth-aware UI flags
  const isAuthenticatedRedux = useSelector((state) => state.user?.isAuthenticated);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Determine auth either from Redux or token presence
    const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    setIsAuthed(Boolean(isAuthenticatedRedux) || Boolean(token));
  }, [isAuthenticatedRedux]);

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative w-full h-screen bg-cover bg-center -mt-20" // Adjust this value
        style={{ backgroundImage: "url('/home-image.jpg')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 z-0" />

        {/* Content on top */}
        <div className="relative z-10 flex flex-col  items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl font-bold text-white">
            Find Your Next Favorite Recipe
          </h1>
          <SearchBar />
          <p className="text-xl text-white mt-2 text-wrap max-w-7xl">
            Discover new recipes from around the world and share your own
            culinary creations. Whether you’re a home cook or a food enthusiast,
            there’s something delicious waiting for you here.
          </p>

          {!isAuthed && (
            <Link
              href="/signin"
              className="text-yellow-500 hover:underline mt-15 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Sign In to Your Account
            </Link>
          )}
        </div>
      </section>

      {/* Illustration Section (kept) */}
      <section className="w-full h-auto mt-10 flex justify-center">
        <ChefCuate className="w-[80vw] max-w-md h-auto object-contain" />
      </section>

      {/* Wave Section */}

      <section className="w-full h-auto mt-10 ">
        {/* SVG Wave */}
        <div className="flex justify-center w-full">
          <svg
            viewBox="0 0 1717 211"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M445.322 158.698C273.381 240.067 0 99.383 0 99.383V210.5H1801.5V77.5545C1749.63 46.8135 1531.07 40.469 1326.84 99.383C1169.84 144.669 1092.51 82.6536 921.075 18.0143C749.641 -46.6249 617.262 77.33 445.322 158.698Z"
              fill="#1E1E1E"
            />
          </svg>
        </div>

        {/* Section Content */}
        <div className="-mt-1 px-6 md:px-12 h-auto bg-[#1E1E1E]">
          <div className="py-5 flex flex-col md:flex-row justify-center items-center gap-6 text-center">
            {/* Breakfast */}
            <Link
              href="/recipes?session=1"
              className="relative border-2 border-yellow-500/70 p-4 pt-8 rounded-2xl w-4xs max-w-2xs h-50 bg-[#1E1E1E] hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 py-2 w-52 bg-[#1E1E1E] z-10">
                <h3 className="font-bold text-3xl text-[#FEF3E2]">Breakfast</h3>
              </div>
              <p className="text-gray-400 text-sm mt-8">
                Start your day with energetic and healthy recipes that keep you
                full and happy. Explore pancakes, smoothies, and more.
              </p>
            </Link>

            {/* Lunch */}
            <Link
              href="/recipes?session=2"
              className="relative border-2 border-yellow-500/70 p-4 pt-8 rounded-2xl w-4xs max-w-2xs h-50 bg-[#1E1E1E] hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 py-2 w-52 bg-[#1E1E1E] z-10">
                <h3 className="font-bold text-3xl text-[#FEF3E2]">Lunch</h3>
              </div>
              <p className="text-gray-400 text-sm mt-8">
                Enjoy easy, tasty, and filling lunch ideas perfect for work or
                home. Discover bowls, wraps, and classic dishes.
              </p>
            </Link>

            {/* Dinner */}
            <Link
              href="/recipes?session=3"
              className="relative border-2 border-yellow-500/70 p-4 pt-8 rounded-2xl w-4xs max-w-2xs h-50 bg-[#1E1E1E] hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 py-2 w-52 bg-[#1E1E1E] z-10">
                <h3 className="font-bold text-3xl text-[#FEF3E2]">Dinner</h3>
              </div>
              <p className="text-gray-400 text-sm mt-8">
                End your day with comforting and satisfying dinners to share
                with family and friends. From curries to pastas.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className=" py-16 px-6 md:px-20 bg-[#1E1E1E]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-500">
            Join Our Community
          </h2>
          <p className="text-gray-400 mb-6">
            Save your favorite recipes, share your own culinary creations, and
            connect with fellow food lovers. Log in to unlock full features and
            personalize your recipe experience.
          </p>

          {/* <<button className="bg-yellow-500 hover:border hover:border-white text-white hover:bg-transparent font-semibold px-8 py-3 rounded-lg transition duration-300">
            Sign In to Your Account
          </button>> */}

          {!isAuthed && (
            <Link href="/signin">
              <button
                className="bg-yellow-500 text-black border-transparent hover:text-white hover:border hover:border-white  hover:bg-transparent font-semibold px-8 py-3 rounded-lg transition duration-300"
                variant="outline"
              >
                Sign In to Your Account
              </button>
            </Link>
          )}
        </div>
      </section>

      <section className="w-full px-6 md:px-20 py-16 bg-white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left Side: Form */}
          <FeedbackForm />

          {/* Right Side: Illustration */}
          <div className="flex justify-center">
            {/* Replace with your own SVG component or <img src="" /> */}
            {/* <EatingDonutsCuate className="w-[80vw] max-w-md h-auto object-contain" /> */}

            <img
              src="/coffee cup-cuate.png"
              alt="Eating Donuts Illustration"
              className="w-[80vw] max-w-md h-auto object-contain"
            />
          </div>
        </div>
      </section>
    </>
  );
}
