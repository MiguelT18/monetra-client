"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiImage, FiChevronRight as FiArrowRight } from "react-icons/fi";
import type { ProductResponse } from "@/lib/product-api";
import { cn } from "@/lib/utils";

interface Props {
  products: ProductResponse[];
}

export function RecommendedProductsCarousel({ products }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_46%] lg:flex-[0_0_31%] xl:flex-[0_0_23.5%]"
            >
              <Link
                href={`/user/explore/${p.id}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                      <FiImage size={32} className="text-muted-foreground/30" />
                    </div>
                  )}
                  <span className="absolute top-2 right-2 rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                    {p.commissionRate}%
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-3.5">
                  <div>
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground line-through">
                        ${Number(p.price).toFixed(2)}
                      </span>
                      {p.commissionRate != null ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Ganas ${(p.price * p.commissionRate / 100).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Comisión N/A
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                      {p.affiliateCookieDays} días cookie
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                      Ver detalles <FiArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        aria-label="Anterior"
        className={cn(
          "absolute -left-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-sm transition-opacity",
          "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          !canScrollPrev && "opacity-0 pointer-events-none"
        )}
      >
        <FiChevronLeft size={16} />
      </button>

      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        aria-label="Siguiente"
        className={cn(
          "absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-sm transition-opacity",
          "hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          !canScrollNext && "opacity-0 pointer-events-none"
        )}
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

export function RecommendedProductsCarouselSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_46%] lg:flex-[0_0_31%] xl:flex-[0_0_23.5%]"
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="aspect-[16/10] bg-muted" />
            <div className="p-3.5 space-y-3">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
              </div>
              <div className="h-px bg-border" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
