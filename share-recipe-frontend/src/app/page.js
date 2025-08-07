"use client";

import React from "react";
import axios from "axios";
import "./globals.css";
import SearchBar from "@/components/searchbar";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
// Importing icons
import {
  IoShareSocialOutline,
  IoBookmarkOutline,
  IoShareSocialSharp,
  IoBookmarkSharp,
} from "react-icons/io5";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import ChefCuate from "@/assets/chef-cuate.svg"; // Adjust the path as necessary
import FeedbackForm from "@/components/feedback";

export default function Home() {
  const scrollRef = useRef(null);
  const [topRecipes, setTopRecipes] = useState([]);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/recipes/top-recipes/")
      .then((res) => {
        setTopRecipes(res.data);
        setFocused(res.data[0]);
      })

      .catch((err) => console.error("Failed to fetch top recipes", err));
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: "smooth" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const focusedRef = useRef(null);

  useEffect(() => {
    if (focusedRef.current) {
      focusedRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [focused]);

  const handleSetFocused = (recipe) => {
    setFocused(recipe);
  };

  const shareUrl = focused
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/recipes/${
        focused.id
      }`
    : "#";

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
        </div>
      </section>

      {/* Scrollable Cards Section */}
      <section className="w-full h-auto mt-25 text-center">
        {/* Title Bar */}
        <div>
          <h2 className="relative -bottom-5 text-3xl font-semibold text-black">
            WORLD’S
          </h2>
          <div className="w-full h-15 bg-yellow-500 py-4 flex flex-col items-center justify-center text-center">
            <p className="text-white text-lg">FAVOURIT</p>
          </div>
        </div>
        {/* Scrollable Cards */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 px-4 pb-4 mt-5 scrollbar-hide scroll-smooth h-auto"
        >
          {topRecipes.map((recipe) => (
            <div
              key={recipe.id}
              ref={focused?.id === recipe.id ? focusedRef : null}
              className={`min-w-[350px] bg-white rounded-lg flex-shrink-0 transition-all duration-300 shadow hover:shadow-lg 
        ${
          focused?.id === recipe.id
            ? "border-b-4 shadow-xl shadow-yellow-100 border-yellow-500  "
            : "border border-gray-200"
        }
      `}
            >
              <button
                onClick={() => handleSetFocused(recipe)}
                className="w-full"
              >
                <img
                  src={recipe.image || "/home-image.jpg"}
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </button>
            </div>
          ))}
        </div>

        {focused && (
          <div className="mt-20 h-50 items-center">
            <div className="relative w-full flex justify-center">
              {/* Yellow Border Layer */}
              <div className="w-full border-t-2 border-b-2 border-yellow-500 h-30 z-0"></div>

              {/* Content Overlay */}
              <div className="absolute top-1/2 -translate-y-1/2 z-10 max-w-5xl w-full p-6 flex flex-col md:flex-row justify-between items-center">
                {/* Info Block */}
                <div className="bg-white p-3 items-center h-auto mt-20 md:mt-0">
                  <div className="p-3 text-left">
                    <h3 className="text-lg font-semibold text-yellow-500">
                      {focused.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {focused.description}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="bg-white p-2 w-70 flex justify-center space-x-4 mt-8 md:mt-0">
                  {/* Show Recipe */}
                  <Link href={`/recipes/${focused.id}`}>
                    <button className="relative group bg-yellow-500 text-white px-6 py-2 rounded-md overflow-hidden transition-all duration-300 hover:border hover:border-yellow-500 hover:bg-white hover:text-yellow-500">
                      <span className="relative z-10">Show Recipe</span>
                      <span className="absolute left-0 top-0 h-full w-full bg-white text-yellow-500 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
                    </button>
                  </Link>

                  {/* Share Button (Shadcn Dialog) */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="group p-2 rounded-md border border-yellow-500 transition duration-300 hover:bg-yellow-500"
                        title="Share"
                      >
                        <span className="block text-yellow-500 group-hover:hidden">
                          <IoShareSocialOutline size={20} />
                        </span>
                        <span className="hidden text-white group-hover:block">
                          <IoShareSocialSharp size={20} />
                        </span>
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share this recipe</DialogTitle>
                        <DialogDescription>
                          Copy the link below to share
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-gray-100 rounded p-2 break-all text-sm text-gray-700">
                        {shareUrl}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                          alert("Link copied to clipboard!");
                        }}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-2"
                      >
                        Copy Link
                      </button>
                    </DialogContent>
                  </Dialog>

                  {/* Bookmark Button */}
                  <button
                    className="group p-2 rounded-md border border-yellow-500 transition duration-300 hover:bg-yellow-500"
                    title="Bookmark"
                  >
                    <span className="block text-yellow-500 group-hover:hidden">
                      <IoBookmarkOutline size={20} />
                    </span>
                    <span className="hidden text-white group-hover:block">
                      <IoBookmarkSharp size={20} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center w-full">
          <ChefCuate className="w-[80vw] max-w-md h-auto object-contain" />
        </div>
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

          <Link href="/signin">
            <button
              className="bg-yellow-500 text-black border-transparent hover:text-white hover:border hover:border-white  hover:bg-transparent font-semibold px-8 py-3 rounded-lg transition duration-300"
              variant="outline"
            >
              Sign In to Your Account
            </button>
          </Link>
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
