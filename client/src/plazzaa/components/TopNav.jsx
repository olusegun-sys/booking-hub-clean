// FILE: client/src/plazzaa/components/TopNav.jsx
// UPDATED 20 Oct 2026 (Session 3 companion):
//  - Added subtle "Admin" pill to the left of Login (team-only entry).
//  - Fixed Login href: was pointing at /explore, now correctly at /login.
//  - Mobile menu unchanged in this pass (still routes Log in → /login).

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowUpRight, LogIn } from "lucide-react";
import { EASE } from "../lib/motion";

import PlazzaaLogo from "./PlazzaaLogo";
const LINKS = [
  { to: "/explore", label: "Discover" },
  { to: "/explore#experiences", label: "Experiences" },
  { to: "/business", label: "For business" },
];

/**
 * Low-chrome navigation. Transparent over the hero, then a white bar with a
 * hairline once you scroll past it — the page should feel like it owns the
 * top of the screen, not like a header is sitting on it.
 */
export default function TopNav({ tone = "light" }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || tone === "solid" || menuOpen;

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-40 transition-colors duration-ui ease-plz " +
        (solid ? "bg-white border-b border-plz-line" : "bg-transparent")
      }
    >
      <div className="plz-edge flex h-[64px] min-w-0 items-center justify-between gap-3 md:h-[76px]">
        <Link to="/" className="flex items-center" aria-label="Plazzaa home">
          <PlazzaaLogo size={26} />
        </Link>

        <nav className="hidden items-center gap-9 md:hidden" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[15px] font-medium text-plz-body hover:text-plz-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {/* WHY: team-only entry. Hidden on mobile (md:flex on parent),
              smaller padding than Login, muted zinc palette so it reads
              as secondary chrome to customers but is easy to find for
              the team. Hover lifts to a slightly darker grey. */}
          <Link
            to="/admin"
            className="inline-flex h-[32px] items-center rounded-md px-3 text-[12px] font-medium text-zinc-400 bg-zinc-100 transition-colors hover:bg-zinc-200 hover:text-zinc-600"
            aria-label="Admin dashboard"
          >
            Admin
          </Link>

          {/* WHY: original Login pill. Fixed destination from /explore → /login
              so the merchant sign-in page is actually reachable from desktop. */}
          <Link to="/login" className="plz-btn plz-btn-ink h-[44px] px-5">
            Login
            <LogIn size={16} strokeWidth={2} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-plz-ink md:hidden"
          aria-expanded={menuOpen}
          aria-controls="plz-mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="plz-mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="border-t border-plz-line bg-white md:hidden"
          >
            <div className="plz-edge flex flex-col gap-1 py-4">
              {LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="flex min-h-[48px] items-center text-[18px] font-medium text-plz-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="flex min-h-[48px] items-center text-[18px] font-medium text-plz-body"
              >
                Log in
              </Link>
              <Link to="/explore" className="plz-btn plz-btn-ink mt-2 w-full">
                Explore Plazzaa
                <ArrowUpRight size={16} strokeWidth={2} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}