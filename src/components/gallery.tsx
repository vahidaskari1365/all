"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export type GalleryImage = {
  url: string;
  title: string;
};

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const open = idx !== null;

  const next = useCallback(
    () => setIdx((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () => setIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const close = useCallback(() => setIdx(null), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, next, prev, close]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-slate-200"
            aria-label={`باز کردن تصویر ${img.title}`}
          >
            <Image
              src={img.url}
              alt={img.title}
              fill
              sizes="(max-width:640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/20" />
            <span className="absolute bottom-2 right-2 grid h-8 w-8 translate-y-2 place-items-center rounded-lg bg-white/90 text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && idx !== null && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-ink/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="بستن"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
              aria-label="قبلی"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
              aria-label="بعدی"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.figure
              key={idx}
              className="relative max-h-[85vh] max-w-3xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] w-[88vw] max-w-3xl overflow-hidden rounded-2xl">
                <Image
                  src={images[idx].url}
                  alt={images[idx].title}
                  fill
                  sizes="88vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="mt-3 text-center text-sm font-medium text-white/90">
                {images[idx].title}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
