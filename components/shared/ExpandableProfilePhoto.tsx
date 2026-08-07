"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type ExpandableProfilePhotoProps = {
  src: string;
  alt: string;
  initials: string;
  isLoading?: boolean;
  sizeClassName?: string;
  expandedSizeClassName?: string;
};

export function ExpandableProfilePhoto({
  src,
  alt,
  initials,
  isLoading = false,
  sizeClassName = "h-20 w-20",
  expandedSizeClassName = "max-h-[80vh] max-w-[90vw]",
}: ExpandableProfilePhotoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dialogTitleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      window.setTimeout(() => {
        triggerButtonRef.current?.focus();
      }, 0);
    };
  }, [isOpen]);

  if (isLoading) {
    return (
      <div
        aria-label={`Loading photo for ${alt}`}
        className={[
          sizeClassName,
          "shrink-0 animate-pulse rounded-full bg-slate-200 ring-4 ring-white",
        ].join(" ")}
      />
    );
  }

  if (!src) {
    return (
      <div
        aria-label={`No photo available for ${alt}`}
        className={[
          sizeClassName,
          "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-2xl font-bold text-white shadow-sm ring-4 ring-white",
        ].join(" ")}
      >
        {initials || "SU"}
      </div>
    );
  }

  return (
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        aria-label={`Open larger photo of ${alt}`}
        onClick={() => setIsOpen(true)}
        className={[
          sizeClassName,
          "group relative shrink-0 overflow-hidden rounded-full shadow-sm ring-4 ring-white outline-none transition focus-visible:ring-cyan-400",
        ].join(" ")}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
        />

        <span className="absolute inset-0 flex items-end justify-end bg-slate-950/0 p-1.5 transition group-hover:bg-slate-950/15 group-focus-visible:bg-slate-950/15">
          <span className="flex h-7 w-7 translate-y-1 items-center justify-center rounded-full bg-white/95 text-slate-700 opacity-0 shadow-sm transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <Search
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />
          </span>
        </span>
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIsOpen(false);
            }
          }}
        >
          <div className="relative flex max-h-full max-w-full flex-col items-center">
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close enlarged photo"
              onClick={() => setIsOpen(false)}
              className="absolute right-0 top-0 z-10 flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <X
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>

            <img
              src={src}
              alt={alt}
              className={[
                expandedSizeClassName,
                "rounded-2xl object-contain shadow-2xl",
              ].join(" ")}
            />

            <h2
              id={dialogTitleId}
              className="mt-4 text-center text-lg font-semibold text-white"
            >
              {alt}
            </h2>

            <p className="mt-1 text-center text-sm text-slate-300">
              Press Escape or click outside the photo to close
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}