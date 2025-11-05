'use client';

import { useEffect } from 'react';
import { incrementViewCount } from '@/lib/blog';

type Props = {
  postId: string;
};

export default function ViewTracker({ postId }: Props) {
  useEffect(() => {
    // Track view after a 3 second delay to filter out bounces
    const timer = setTimeout(() => {
      incrementViewCount(postId);
    }, 3000);

    return () => clearTimeout(timer);
  }, [postId]);

  return null; // This component doesn't render anything
}
