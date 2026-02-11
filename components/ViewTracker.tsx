'use client';

import { useEffect } from 'react';

type Props = {
  postId: string;
};

export default function ViewTracker({ postId }: Props) {
  useEffect(() => {
    // Track view after a 3 second delay to filter out bounces
    const timer = setTimeout(() => {
      fetch(`/api/blog-public/${postId}/view`, {
        method: 'POST',
        keepalive: true,
      }).catch(() => {});
    }, 3000);

    return () => clearTimeout(timer);
  }, [postId]);

  return null; // This component doesn't render anything
}
