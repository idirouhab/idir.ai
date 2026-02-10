'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  src?: string | null;
  alt: string;
  priority?: boolean;
};

export default function BlogCoverImage({ src, alt, priority = false }: Props) {
  const placeholderImage = '/og-image.png';
  const [imageSrc, setImageSrc] = useState(src || placeholderImage);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 1024px"
      priority={priority}
      onError={() => setImageSrc(placeholderImage)}
    />
  );
}
