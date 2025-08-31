import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaGithub,
  FaYoutube,
} from "react-icons/fa6";

import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-gray-400 py-10 px-4 text-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center space-x-4 w-auto h-auto">
                  <Link href="/">
                  <h1 className="text-4xl font-light tracking-wider ">
                    <span className="font-extralight text-white">share</span>
                    <span className="font-medium text-yellow-500">recipe</span>
                  </h1>
                </Link>
                </div>
        {/* Top Nav Links */}
        <div className="flex flex-wrap justify-center gap-6">
          {["About", "Blog", "Jobs", "Press", "Accessibility", "Partners"].map(
            (item) => (
              <a
                key={item}
                href="#"
                className="hover:text-yellow-500 transition-colors duration-300"
              >
                {item}
              </a>
            )
          )}
        </div>

        {/* Social Icons */}
        <div className="flex gap-6 text-xl">
          <a
            href="#"
            className="hover:text-yellow-500 transition-colors duration-300"
          >
            <FaFacebookF />
          </a>
          <a
            href="#"
            className="hover:text-yellow-500 transition-colors duration-300"
          >
            <FaInstagram />
          </a>
          <a
            href="#"
            className="hover:text-yellow-500 transition-colors duration-300"
          >
            <FaXTwitter />
          </a>
          <a
            href="#"
            className="hover:text-yellow-500 transition-colors duration-300"
          >
            <FaYoutube />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 text-gray-400">
          © {new Date().getFullYear()} Your Company, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
