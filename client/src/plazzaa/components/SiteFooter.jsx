import { Link } from 'react-router-dom';

import PlazzaaLogo from './PlazzaaLogo';
/**
 * The quiet end of the page, in the brand's own words rather than a sitemap:
 * a wordmark, a line, and the three words that run through the Plazzaa
 * material. Real links live in the navigation and the sticky gateway.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-plz-line bg-white pb-28 pt-10 md:pb-24">
      <div className="plz-edge flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <PlazzaaLogo size={28} />
          <p className="mt-1 text-[14px] text-plz-body">More places. Brighter days.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { to: '/explore', label: 'Discover' },
            { to: '/explore#experiences', label: 'Experiences' },
            { to: '/business', label: 'For business' },
            { to: '/login', label: 'Log in' }
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[14px] text-plz-body transition-colors duration-micro ease-plz hover:text-plz-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-[13px] tracking-[0.02em] text-plz-grey">
          People &nbsp;·&nbsp; Places &nbsp;·&nbsp; Possibilities
        </p>
      </div>
    </footer>
  );
}
