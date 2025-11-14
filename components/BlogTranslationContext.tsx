'use client';

import { createContext, useContext, ReactNode } from 'react';

type BlogTranslationContextType = {
  translatedSlug: { slug: string; language: 'en' | 'es' } | null;
};

const BlogTranslationContext = createContext<BlogTranslationContextType | undefined>(undefined);

export function BlogTranslationProvider({
  children,
  translatedSlug,
}: {
  children: ReactNode;
  translatedSlug: { slug: string; language: 'en' | 'es' } | null;
}) {
  return (
    <BlogTranslationContext.Provider value={{ translatedSlug }}>
      {children}
    </BlogTranslationContext.Provider>
  );
}

export function useBlogTranslation() {
  const context = useContext(BlogTranslationContext);
  return context?.translatedSlug ?? null;
}
