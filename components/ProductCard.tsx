"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatReward } from "@/lib/format";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index: number;
  onSelect: () => void;
}

export default function ProductCard({
  product,
  index,
  onSelect,
}: ProductCardProps) {
  const [loaded, setLoaded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-label={`${product.title}, вознаграждение ${formatReward(product.reward)}`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className={styles.imageWrap}>
        {!loaded && <div className={styles.skeleton} aria-hidden="true" />}
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 3}
          onLoad={() => setLoaded(true)}
          className={`${styles.image} ${loaded ? styles.imageLoaded : ""}`}
        />
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{product.title}</p>
        <p className={styles.reward}>{formatReward(product.reward)}</p>
        <span className={styles.cta}>Выполнить</span>
      </div>
    </div>
  );
}
