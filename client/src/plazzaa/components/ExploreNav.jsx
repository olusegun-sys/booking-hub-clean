import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MapPin, Menu, Search, X } from 'lucide-react';
import { cities } from '../lib/data';
import { EASE } from '../lib/motion';

import PlazzaaLogo from './PlazzaaLogo';
const LINKS = [
  { to: '/explore', label: 'Discover', match: '/explore' },
  { to: '/explore#experiences', label: 'Experiences' },
  { to: '/explore#offers', label: 'Offers' },
  { to: '/explore#compare', label: 'Compare' }
];

/**
 * The marketplace's own navigation: browsing sections on the left, where you
 * are on the right, and sign-in that never blocks the browsing. Discovery
 * comes first — an account is only needed to keep something.
 */
export default function ExploreNav({ city, setCity }) {
  const [open, setOpen] = useState(false);
  const { hash } = useLocation();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const activeLabel = LINKS.find((l) => (hash ? l.to.endsWith(hash) : l.label === 'Discover'))?.label
    || 'Discover';

  return (
    <header className="sticky top-0 z-40 border-b border-plz-line bg-white/95 backdrop-blur-sm">
      <div className="plz-edge flex h-[64px] items-center gap-6 md:h-[72px]">
        <Link to="/" className="shrink-0" aria-label="Plazzaa home">
          <PlazzaaLogo size={26} />
        </Link>

        <nav className="hidden min-w-0 items-center gap-7 md:flex" aria-label="Marketplace">
          {LINKS.map((link) => {
            const active = link.label === activeLabel;
            return (
              <Link
                key={link.label}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className="relative py-1 text-[15px] font-medium text-plz-body transition-colors duration-micro ease-plz hover:text-plz-ink"
              >
                <span className={active ? 'text-plz-blue' : undefined}>{link.label}</span>
                {active && (
                  <motion.span
                    layoutId="plz-nav-underline"
                    className="absolute -bottom-[3px] left-0 right-0 h-[2px] rounded-full bg-plz-blue"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex min-w-0 shrink items-center gap-2 md:gap-3">
          <label className="hidden items-center gap-1.5 rounded-full border border-plz-line px-3 py-2 lg:flex">
            <MapPin size={14} className="shrink-0 text-plz-grey" />
            <span className="sr-only">City</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="appearance-none bg-transparent pr-4 text-[14px] font-medium text-plz-ink focus:outline-none"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={14} className="-ml-4 shrink-0 text-plz-grey" aria-hidden="true" />
          </label>

          <a
            href="#search"
            aria-label="Jump to search"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-plz-line text-plz-ink transition-colors duration-micro ease-plz hover:border-plz-ink lg:flex"
          >
            <Search size={16} />
          </a>

          <Link
            to="/login"
            className="hidden h-10 items-center rounded-full border border-plz-line px-4 text-[14px] font-semibold text-plz-ink transition-colors duration-micro ease-plz hover:border-plz-ink sm:flex lg:flex"
          >
            Log in
          </Link>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/signup"
              className="flex h-10 items-center rounded-full bg-plz-blue px-4 text-[14px] font-semibold text-white transition-colors duration-micro ease-plz hover:bg-plz-blue-deep"
            >
              Sign up
            </Link>
          </motion.div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 flex h-10 w-10 items-center justify-center text-plz-ink md:hidden"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="border-t border-plz-line bg-white md:hidden"
          >
            <div className="plz-edge flex flex-col py-3">
              {LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center text-[17px] font-medium text-plz-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center text-[17px] font-medium text-plz-body"
              >
                Log in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
