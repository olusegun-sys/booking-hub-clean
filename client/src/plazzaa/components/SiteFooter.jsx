import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Discover',
    links: [
      { label: 'Places', to: '/explore' },
      { label: 'Experiences', to: '/explore#experiences' },
      { label: 'Offers', to: '/explore#offers' },
      { label: 'Plan with a budget', to: '/explore#budget' }
    ]
  },
  {
    title: 'For business',
    links: [
      { label: 'How it works', to: '/business#how' },
      { label: 'Create your booking link', to: '/signup' },
      { label: 'Log in', to: '/login' }
    ]
  },
  {
    title: 'Cities',
    links: [
      { label: 'Lagos', to: '/explore' },
      { label: 'Abuja', to: '/explore' }
    ]
  }
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-plz-line bg-white pb-30 pt-16 md:pb-22 md:pt-18">
      <div className="plz-edge">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-[21px] font-bold tracking-[-0.03em] text-plz-ink">Plazzaa</p>
            <p className="mt-3 max-w-[38ch] text-[15px] text-plz-body">
              One link where customers can see what a business offers, pick a time that is
              actually free, and book it.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} className="md:col-span-2" aria-label={column.title}>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-plz-grey">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[15px] text-plz-body hover:text-plz-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-plz-line pt-6 text-[14px] text-plz-grey sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Plazzaa. Built in Lagos.</p>
          <p>Payments happen between you and the business.</p>
        </div>
      </div>
    </footer>
  );
}
