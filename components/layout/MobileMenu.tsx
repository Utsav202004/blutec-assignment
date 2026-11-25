"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { isActivePath, mainNav, site, whatsappLink } from "@/lib/site";
import { PawIcon } from "@/components/ui/PawIcon";

/**
 * Full-screen mobile menu built on the native <dialog> element. That gives us
 * focus trapping, Esc-to-close and an inert page behind it for free. The
 * open/close animation is a circular clip-path reveal from the Menu button
 * (see tp-menu-in / tp-menu-out in app/styles/header.css).
 */
export function MobileMenu({ pathname }: { pathname: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    d.removeAttribute("data-closing");
    d.showModal();
    document.documentElement.style.overflow = "hidden"; // lock page scroll
  };

  const close = () => {
    const d = dialogRef.current;
    if (!d || !d.open || d.hasAttribute("data-closing")) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      d.removeAttribute("data-closing");
      d.close();
    };
    if (reduce) return finish();
    d.setAttribute("data-closing", "");
    // Close when the clip-path animation ends (with a fallback in case
    // animationend never fires, e.g. in a background tab)
    const fallback = setTimeout(finish, 600);
    d.addEventListener(
      "animationend",
      (e) => {
        if (e.target !== d) return;
        clearTimeout(fallback);
        finish();
      },
      { once: true },
    );
  };

  // Close the menu after navigating to a new page
  useEffect(() => {
    close();
  }, [pathname]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
    };
    // Intercept Esc so it plays the closing animation too
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    d.addEventListener("close", onClose);
    d.addEventListener("cancel", onCancel);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("cancel", onCancel);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-cocoa bg-milk px-4 text-[0.95rem] font-semibold lg:hidden"
      >
        <PawIcon className="size-4" />
        Menu
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        className="tp-menu m-0 h-dvh max-h-none w-screen max-w-none bg-honey p-0 text-cocoa backdrop:bg-cocoa/40"
      >
        <div className="gutter flex h-full flex-col pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <span className="font-scrawl text-lg">where to, friend?</span>
            <button
              type="button"
              onClick={close}
              className="h-11 rounded-full bg-cocoa px-5 font-semibold text-milk"
            >
              Close
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-10 flex-1">
            <ul className="space-y-1">
              {mainNav.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      data-active={active}
                      className="tp-menu-link font-plush block py-2 text-[clamp(2.4rem,11vw,3.4rem)]"
                    >
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="space-y-3">
            <a
              href={whatsappLink()}
              className="btn btn-whatsapp w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us
            </a>
            <p className="text-center text-sm font-medium">{site.phoneDisplay}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
