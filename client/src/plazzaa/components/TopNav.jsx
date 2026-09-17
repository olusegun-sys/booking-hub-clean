import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { EASE } from '../lib/motion';

const LINKS = [
  { to: '/explore', label: 'Discover' },
  { to: '/explore#experiences', label: 'Experiences' },
  { to: '/business', label: 'For business' }
];

/**
 * Low-chrome navigation. Transparent over the hero, then a white bar with a
 * hairline once you scroll past it — the page should feel like it owns the
 * top of the screen, not like a header is sitting on it.
 */
export default function TopNav({ tone = 'light' }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const solid = scrolled || tone === 'solid' || menuOpen;

  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-40 transition-colors duration-ui ease-plz ' +
        (solid ? 'bg-white border-b border-plz-line' : 'bg-transparent')
      }
    >
      <div className="plz-edge flex h-[64px] items-center justify-between md:h-[76px]">
        <Link
          to="/"
          className="text-[19px] font-bold tracking-[-0.03em] text-plz-ink md:text-[21px]"
          aria-label="Plazzaa home"
        >
          Plazzaa
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
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

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/login" className="text-[15px] font-medium text-plz-body hover:text-plz-ink">
            Log in
          </Link>
          <Link to="/explore" className="plz-btn plz-btn-ink h-[44px] px-5">
            Explore Plazzaa
            <ArrowUpRight size={16} strokeWidth={2} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-plz-ink md:hidden"
          aria-expanded={menuOpen}
          aria-controls="plz-mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
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
