"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
const links = [
  { name: "Home", href: "/" },
  { name: "Recipes", href: "/recipes" },
  { name: "My Kitchen", href: "/user/my-kitchen" },
  { name: "Community", href: "/community" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const navDark = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href) => pathname === href;

  const navLinkStyle = (href) =>
    `block px-4 py-2 text-lg font-medium transition-colors ${
      isActive(href)
        ? "text-yellow-500"
        : `text-gray-400 ${
            navDark ? "hover:text-white" : "hover:text-[#1E1E1E]"
          }`
    }`;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/">
            <h1 className="text-3xl font-light tracking-wider">
              <span className={navDark ? "text-white" : "text-[#1E1E1E]"}>
                share
              </span>
              <span className="font-semibold text-yellow-500">recipe</span>
            </h1>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={navLinkStyle(link.href)}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden text-2xl ${
            navDark ? "text-gray-400" : "text-[#1E1E1E]"
          } hover:text-yellow-500 focus:outline-none`}
        >
          ☰
        </button>
      </div>

      {/* Mobile Fullscreen Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-xs z-50 flex flex-col items-start py-20 px-6 space-y-6 md:hidden transition-all duration-300">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4"
          >
            <X className="text-yellow-500" />
          </button>
          
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xl  text-yellow-500"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
