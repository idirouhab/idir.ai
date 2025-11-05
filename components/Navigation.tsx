"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const t = useTranslations('nav');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Scroll-spy: detect which section is in view
      const sections = ["about", "speaking", "podcast", "contact"];
      const scrollPosition = window.scrollY + 100; // offset for navbar

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "#about", label: t('about'), id: "about" },
    { href: "#speaking", label: t('speaking'), id: "speaking" },
    { href: "#podcast", label: t('podcast'), id: "podcast" },
    { href: "/blog", label: t('blog'), id: "blog", isExternal: true },
    { href: "/subscribe", label: t('newsletter'), id: "newsletter", isExternal: true },
    { href: "#contact", label: t('contact'), id: "contact" },
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
                className={`px-4 py-2 text-sm font-bold transition-all uppercase tracking-wide ${
                  activeSection === item.id
                    ? "text-[#00ff88] border-b-2 border-[#00ff88]"
                    : "text-gray-300 hover:text-[#00ff88]"
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="ml-6">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:text-[#00ff88] transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
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
              <span className="sr-only">{isOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu - off-canvas slide-in */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 bg-black border-l-4 border-[#00ff88] z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'rgba(0, 0, 0, 0.98)' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <span className="text-2xl font-black text-white uppercase">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:text-[#00ff88] transition-colors"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="space-y-2 px-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-4 text-lg font-bold transition-all uppercase tracking-wide rounded ${
                    activeSection === item.id
                      ? "text-[#00ff88] border-l-4 border-[#00ff88] bg-[#00ff8810]"
                      : "text-white hover:text-[#00ff88] border-l-4 border-transparent hover:border-[#00ff88]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
}
