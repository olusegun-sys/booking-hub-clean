import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays, HelpCircle, LayoutDashboard, LogOut, Menu, Settings, Wrench, X
} from 'lucide-react';
import PlazzaaLogo from '../components/PlazzaaLogo';
import { api, currentBusiness, token } from '../lib/merchantApi';
import Overview from './Overview';
import BookingSetup from './BookingSetup';
import Bookings from './Bookings';
import SettingsSection from './SettingsSection';
import { Button, SetupRequired, SPRING, Toast } from './ui';

/**
 * The merchant dashboard.
 *
 * Four sections, matching the MVP scope: Dashboard, Booking Setup, Bookings,
 * Settings. The shell owns every piece of server state so the sections stay
 * presentational and a change made in one is visible in the others immediately
 * — validating a booking from the overview updates the counts and the list in
 * the same pass.
 */

const SECTIONS = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'setup', label: 'Booking Setup', icon: Wrench },
  { key: 'bookings', label: 'Bookings', icon: CalendarDays },
  { key: 'settings', label: 'Settings', icon: Settings }
];

/** PostgREST's "table isn't there" code, surfaced when the migration is pending. */
const isMissingTable = (err) =>
  err && (err.code === 'PGRST205' || /schema cache|does not exist/i.test(err.message || ''));

export default function MerchantDashboard() {
  const business = currentBusiness();
  const businessId = business && business.id;

  const [section, setSection] = useState('overview');
  const [navOpen, setNavOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [validatingRef, setValidatingRef] = useState(null);
  const [error, setError] = useState('');
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  const [setup, setSetup] = useState(null);
  const [services, setServices] = useState([]);
  const [hours, setHours] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const say = useCallback((message, tone = 'ok') => {
    setToast({ id: Date.now(), message, tone });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* --------------------------------------------------------------- loading */

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError('');

    const results = await Promise.allSettled([
      api.setupStatus(businessId),
      api.services(businessId),
      api.hours(businessId),
      api.bankAccount(businessId),
      api.bookings(businessId)
    ]);

    const [setupRes, servicesRes, hoursRes, bankRes, bookingsRes] = results;

    if (setupRes.status === 'fulfilled') setSetup(setupRes.value);
    if (servicesRes.status === 'fulfilled') setServices(servicesRes.value.services || []);
    if (hoursRes.status === 'fulfilled') setHours(hoursRes.value.hours || []);
    if (bankRes.status === 'fulfilled') setBankAccount(bankRes.value.bankAccount || null);
    if (bookingsRes.status === 'fulfilled') {
      setBookings(bookingsRes.value.bookings || []);
      setCounts(bookingsRes.value.counts || {});
    }

    // The V1 tables land together, so one missing table means the whole
    // migration is pending — the legacy tables answering fine would otherwise
    // hide it. Any other failure is worth naming on its own.
    const failures = results.filter((r) => r.status === 'rejected').map((r) => r.reason);
    if (failures.some(isMissingTable)) {
      setMigrationNeeded(true);
    } else if (failures.length) {
      setError(failures[0]?.message || 'Could not load your dashboard.');
    }

    setLoading(false);
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  /** Refresh only the booking list — used after a validation. */
  const reloadBookings = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await api.bookings(businessId);
      setBookings(data.bookings || []);
      setCounts(data.counts || {});
    } catch {
      /* the toast from the action already told the story */
    }
  }, [businessId]);

  /* --------------------------------------------------------------- actions */

  const guard = async (key, run, okMessage) => {
    setBusy(key);
    try {
      const result = await run();
      if (okMessage) say(okMessage);
      return result;
    } catch (err) {
      if (isMissingTable(err)) setMigrationNeeded(true);
      say(err.message || 'That did not work.', 'error');
      throw err;
    } finally {
      setBusy(null);
    }
  };

  const createService = (service) =>
    guard('service', async () => {
      const { service: created } = await api.createService(businessId, service);
      setServices((list) => [...list, created]);
      api.setupStatus(businessId).then(setSetup).catch(() => {});
    }, 'Service added.');

  const updateService = (serviceId, patch) =>
    guard('service', async () => {
      const { service: updated } = await api.updateService(businessId, serviceId, patch);
      setServices((list) => list.map((s) => (s.id === serviceId ? updated : s)));
      api.setupStatus(businessId).then(setSetup).catch(() => {});
    }, 'Service updated.');

  const deleteService = (service) => {
    const ok = window.confirm(
      `Remove “${service.name}”?\n\nExisting bookings keep their details, but customers won't be able to book it again.`
    );
    if (!ok) return Promise.resolve();

    return guard('service', async () => {
      const result = await api.deleteService(businessId, service.id);
      if (result.deactivated && result.service) {
        setServices((list) => list.map((s) => (s.id === service.id ? result.service : s)));
      } else {
        setServices((list) => list.filter((s) => s.id !== service.id));
      }
      api.setupStatus(businessId).then(setSetup).catch(() => {});
    }, 'Service removed.');
  };

  const saveHours = (week) =>
    guard('hours', async () => {
      const { hours: saved } = await api.saveHours(businessId, week);
      setHours(saved || []);
      api.setupStatus(businessId).then(setSetup).catch(() => {});
    }, 'Opening hours saved.');

  const saveBank = (account) =>
    guard('bank', async () => {
      const { bankAccount: saved } = await api.saveBankAccount(businessId, account);
      setBankAccount(saved);
      api.setupStatus(businessId).then(setSetup).catch(() => {});
    }, 'Bank details saved.');

  const validate = async (booking) => {
    setValidatingRef(booking.booking_reference);
    try {
      await api.validate(businessId, booking.booking_reference);
      say('Booking confirmed. We emailed the customer.');
      setSelected(null);
      await reloadBookings();
    } catch (err) {
      if (isMissingTable(err)) setMigrationNeeded(true);
      say(err.message || 'Could not validate that booking.', 'error');
    } finally {
      setValidatingRef(null);
    }
  };

  /* ----------------------------------------------------------- booking link */

  const bookingUrl = setup && setup.bookingLink
    ? window.location.origin + setup.bookingLink
    : business && business.slug
      ? window.location.origin + '/book/' + business.slug
      : '';

  const copyText = async (text, message) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      say(message);
    } catch {
      say(text, 'ok');
    }
  };

  const copyLink = () => copyText(bookingUrl, 'Booking link copied.');

  /** A link that opens straight on one service, skipping the menu. */
  const serviceLink = (service) =>
    bookingUrl && service.slug ? bookingUrl + '/s/' + service.slug : '';

  const copyServiceLink = (service) =>
    copyText(serviceLink(service), `Link to “${service.name}” copied.`);

  const uploadImage = (fileName, fileData) =>
    api.uploadServiceImage(businessId, fileName, fileData).then((r) => r.url);

  /* ---------------------------------------------------------- navigation */

  /** 'bookings:confirmed' jumps to the list already filtered. */
  const go = (target) => {
    const [key, preset] = String(target).split(':');
    setSection(key);
    if (preset) setFilter(preset);
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentBusiness');
    window.location.href = '/login';
  };

  /* ------------------------------------------------------------- gatekeeping */

  if (!businessId || !token()) {
    return (
      <div className="plz-root flex min-h-screen items-center justify-center bg-plz-surface px-5">
        <div className="w-full max-w-[380px] rounded-[16px] border border-plz-line bg-white p-8 text-center">
          <PlazzaaLogo size={26} className="mx-auto" />
          <p className="mt-6 text-[16px] font-semibold text-plz-ink">Please sign in</p>
          <p className="mt-2 text-[14px] leading-relaxed text-plz-body">
            Your session has ended. Sign in again to reach your dashboard.
          </p>
          <Button onClick={() => { window.location.href = '/login'; }} className="mt-6 w-full">
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------- derived slices */

  const awaiting = bookings.filter((b) => b.status === 'awaiting_validation');
  const now = Date.now();
  const upcoming = bookings
    .filter((b) => b.status === 'confirmed' && new Date(b.start_datetime).getTime() >= now)
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
    .slice(0, 5);

  const listed = filter === 'all'
    ? bookings
    : bookings.filter((b) => filter.split(',').includes(b.status));

  const overviewCounts = { ...counts, total: bookings.length };

  const rail = (
    <>
      <div>
        <div className="flex items-center justify-between px-5">
          <PlazzaaLogo size={23} />
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
            className="text-plz-body lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-7 flex flex-col gap-1 px-3">
          {SECTIONS.map(({ key, label, icon: Icon }) => {
            const active = section === key;
            const badge = key === 'bookings' && awaiting.length > 0 ? awaiting.length : null;

            return (
              <button
                key={key}
                type="button"
                onClick={() => go(key)}
                aria-current={active ? 'page' : undefined}
                className={
                  'relative flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors duration-micro ease-plz ' +
                  (active ? 'text-white' : 'text-plz-body hover:bg-plz-surface hover:text-plz-ink')
                }
              >
                {active && (
                  <motion.span
                    layoutId="plz-nav-active"
                    transition={SPRING}
                    className="absolute inset-0 rounded-[10px] bg-plz-blue"
                  />
                )}
                <Icon size={16} className="relative shrink-0" />
                <span className="relative">{label}</span>
                {badge && (
                  <span
                    className={
                      'relative ml-auto rounded-full px-1.5 text-[11px] font-semibold ' +
                      (active ? 'bg-white/20 text-white' : 'bg-[#FEF8E7] text-[#B0840F]')
                    }
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-3">
        <div className="rounded-[12px] bg-plz-cream p-4">
          <p className="text-[14px] font-semibold leading-tight text-plz-ink">
            More bookings.
            <br />
            A brighter tomorrow.
          </p>
          <p className="mt-2 text-[12px] leading-snug text-plz-body">
            Share your link anywhere you already talk to customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => go('settings')}
          className="mt-2 flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-plz-body transition-colors duration-micro ease-plz hover:bg-plz-surface hover:text-plz-ink"
        >
          <HelpCircle size={15} />
          Help &amp; support
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-plz-body transition-colors duration-micro ease-plz hover:bg-plz-surface hover:text-plz-ink"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="plz-root min-h-screen bg-[#F7F8FB]">
      <div className="flex">
        {/* ------------------------------------------------------ static rail */}
        <aside className="sticky top-0 hidden h-screen w-[212px] shrink-0 flex-col justify-between border-r border-plz-line bg-white py-6 lg:flex">
          {rail}
        </aside>

        {/* ------------------------------------------------------ mobile rail */}
        <AnimatePresence>
          {navOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNavOpen(false)}
                className="fixed inset-0 z-40 bg-plz-ink/30 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                className="fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col justify-between bg-white py-6 shadow-panel lg:hidden"
              >
                {rail}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------------- body */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-plz-line bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              className="text-plz-body lg:hidden"
            >
              <Menu size={20} />
            </button>

            <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-plz-ink">
              {business.name}
            </p>

            <span className="hidden items-center gap-2.5 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF3FE] text-[12px] font-semibold text-plz-blue">
                {(business.owner_name || business.name || 'P')
                  .split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <span className="leading-tight">
                <span className="block text-[13px] font-semibold text-plz-ink">
                  {business.owner_name || 'Owner'}
                </span>
                <span className="block text-[11px] text-plz-body">{business.email}</span>
              </span>
            </span>
          </header>

          <main className="p-4 sm:p-6">
            {migrationNeeded && (
              <div className="mb-5">
                <SetupRequired />
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                {section === 'overview' && (
                  <Overview
                    business={business}
                    loading={loading}
                    error={error}
                    counts={overviewCounts}
                    awaiting={awaiting}
                    upcoming={upcoming}
                    setup={setup}
                    bookingUrl={bookingUrl}
                    onCopyLink={copyLink}
                    onGo={go}
                    onOpenBooking={(b) => { setSection('bookings'); setSelected(b); }}
                    onValidate={validate}
                    validatingRef={validatingRef}
                  />
                )}

                {section === 'setup' && (
                  <BookingSetup
                    business={business}
                    services={services}
                    hours={hours}
                    bankAccount={bankAccount}
                    loading={loading}
                    busy={busy}
                    setup={setup}
                    bookingUrl={bookingUrl}
                    onCopyLink={copyLink}
                    onCopyServiceLink={copyServiceLink}
                    onUploadImage={uploadImage}
                    onCreateService={createService}
                    onUpdateService={updateService}
                    onDeleteService={deleteService}
                    onSaveHours={saveHours}
                    onSaveBank={saveBank}
                  />
                )}

                {section === 'bookings' && (
                  <Bookings
                    bookings={listed}
                    counts={overviewCounts}
                    loading={loading}
                    filter={filter}
                    onFilter={setFilter}
                    onValidate={validate}
                    validatingRef={validatingRef}
                    selected={selected}
                    onSelect={setSelected}
                  />
                )}

                {section === 'settings' && (
                  <SettingsSection
                    business={business}
                    bookingUrl={bookingUrl}
                    onCopyLink={copyLink}
                    onLogout={logout}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
