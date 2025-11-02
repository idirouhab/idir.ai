"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('nav');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "#about", label: t('about') },
    { href: "#speaking", label: t('speaking') },
    { href: "#podcast", label: t('podcast') },
    { href: "#contact", label: t('contact') },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl border-b-2 border-[#00ff88]"
          : "bg-transparent"
      }`}
      style={{
        background: scrolled ? 'rgba(0, 0, 0, 0.9)' : 'transparent'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <a
              href="#"
              className="text-2xl font-black text-white hover:text-[#00ff88] transition-colors uppercase tracking-tight"
            >
              IO
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-[#00ff88] transition-colors uppercase tracking-wide"
              >
                {item.label}
              </a>
            ))}
            <div className="ml-6">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:text-[#00ff88] transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="h-8 w-8"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                {isOpen ? (
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t-2 border-[#00ff88]" style={{ background: 'rgba(0, 0, 0, 0.98)' }}>
          <div className="px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-4 text-lg font-bold text-white hover:text-[#00ff88] border-l-4 border-transparent hover:border-[#00ff88] transition-all uppercase tracking-wide"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <div className="flex justify-center mt-6 pt-4 border-t border-gray-800">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
