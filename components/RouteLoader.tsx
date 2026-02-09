'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function isAnchor(element: HTMLElement | null): element is HTMLAnchorElement {
  return !!element && element.tagName.toLowerCase() === 'a';
}

function isInternalLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;

    const isHashOnly =
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash;
    if (isHashOnly) return false;

    return true;
  } catch {
    return false;
  }
}

export default function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setLoading(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!isAnchor(anchor)) return;
      if (!isInternalLink(anchor)) return;

      setLoading(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setLoading(false);
        timeoutRef.current = null;
      }, 8000);
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      document.body.classList.add('route-loading');
    } else {
      document.body.classList.remove('route-loading');
    }
  }, [loading]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed top-0 left-0 right-0 h-0.5 z-[9999] transition-opacity duration-200 ${
        loading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="h-full w-full bg-gradient-to-r from-[#11b981] via-[#14b8a6] to-transparent animate-pulse" />
    </div>
  );
}
