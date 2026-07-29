import { useState } from 'react';

import { ProductPlaceholder } from '@/shared/components/ProductPlaceholder';

type ProductImageProps = {
  name: string;
  imageUrl?: string;
  className?: string;
};

export function ProductImage({
  name,
  imageUrl,
  className = 'h-40 w-full',
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl
    ? `${import.meta.env.BASE_URL}${imageUrl.replace(/^\//, '')}`
    : undefined;

  if (!src || failed) {
    return <ProductPlaceholder name={name} className={className} />;
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${className} rounded-lg object-cover`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
