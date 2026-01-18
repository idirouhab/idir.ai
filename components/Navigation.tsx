"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Image from "next/image";
import logo from "../public/logo-idirai.png"; // Adjust path to your public folder

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tAria = useTranslations('aria');

  // Extract locale from pathname (e.g., /en/blog -> en)
  const locale = pathname?.split('/')[1] || 'en';

  // Detect if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // Cancel previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Throttle scroll handler to run max every 100ms
      timeoutId = setTimeout(() => {
        setScrolled(window.scrollY > 20);

        // Scroll-spy: detect which section is in view
        const sections = ["about", "services", "podcast", "contact"];
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
      }, 100);
    };

    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const navItems = [
    { href: `/${locale}/#about`, label: t('about'), id: "about" },
    { href: `/${locale}/#services`, label: t('services'), id: "services" },
    { href: `/${locale}/#podcast`, label: t('podcast'), id: "podcast" },
    { href: `/${locale}/blog`, label: t('blog'), id: "blog", isExternal: true },
    { href: `/${locale}/subscribe`, label: t('newsletter'), id: "newsletter", isExternal: true },
    { href: `/${locale}/courses`, label: t('courses'), id: "courses", isExternal: true },
    { href: `/${locale}/#contact`, label: t('contact'), id: "contact" },
  ];

  // Always show background on mobile, or when scrolled on desktop
  const showBackground = isMobile || scrolled;

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          showBackground
            ? "backdrop-blur-xl border-b border-[#10b981]"
            : "bg-transparent"
        }`}
        style={{
          background: showBackground ? 'rgba(0, 0, 0, 0.9)' : 'transparent'
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0">
              <a
                href={`/${locale}`}
                className="flex items-center hover:opacity-80 transition-opacity"
                aria-label={tAria('logoHome')}
              >
                <Image
                  src={logo}
                  alt="idir.ai"
                  className="h-8 w-auto"
                  priority
                />
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1" role="menubar">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-bold transition-all uppercase tracking-wide ${
                    activeSection === item.id
                      ? "text-[#10b981] border-b-2 border-[#10b981]"
                      : "text-gray-300 hover:text-[#10b981]"
                  }`}
                  role="menuitem"
                  aria-current={activeSection === item.id ? "page" : undefined}
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
                className="p-2 text-white hover:text-[#10b981] transition-colors"
                aria-label={isOpen ? tAria('closeMenu') : tAria('openMenu')}
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
      </nav>

      {/* Mobile menu backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[998] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu - off-canvas slide-in */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 bg-black border-l-4 border-[#10b981] z-[999] md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(0, 0, 0, 0.98)',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
            <span className="text-2xl font-black text-white uppercase">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:text-[#10b981] transition-colors"
              aria-label={tAria('closeMenu')}
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="space-y-2 px-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-4 text-lg font-bold transition-all uppercase tracking-wide rounded ${
                    activeSection === item.id
                      ? "text-[#10b981] border-l-4 border-[#10b981] bg-[#10b981]/10"
                      : "text-white hover:text-[#10b981] border-l-4 border-transparent hover:border-[#10b981]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
