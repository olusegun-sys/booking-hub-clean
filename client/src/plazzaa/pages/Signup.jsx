import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import API_BASE from '../../config';
import { images } from '../lib/data';
import { EASE } from '../lib/motion';
import PlazzaaLogo from '../components/PlazzaaLogo';
import BusinessTypeModal from '../components/BusinessTypeModal';
import AccountCreated from '../components/AccountCreated';

/**
 * Merchant sign-up.
 *
 * Built as the sibling of the sign-in screen — same split, same field styling,
 * same voice — so the two screens read as one product rather than two eras of
 * the codebase.
 *
 * The form is two steps because the registration endpoint asks for eight
 * things, and eight fields in one column reads as work. Step one is the
 * business, step two is the account; nothing is sent until the end.
 */

const NIGERIAN_STATES = [
  'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const FIELD =
  'mt-2.5 h-12 w-full rounded-[10px] border border-plz-line bg-white px-3.5 text-[15px] text-plz-ink ' +
  'placeholder:text-plz-grey transition-colors duration-micro ease-plz ' +
  'focus:border-plz-blue focus:outline-none focus:ring-2 focus:ring-plz-blue/15';

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-plz-ink">
      {children}
    </label>
  );
}

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[12px] text-[#C0395A]">{children}</p>;
}

export default function Signup() {
  const [step, setStep] = useState(0);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    city: '',
    state: 'Lagos',
    address: '',
    email: '',
    phone: '',
    password: ''
  });

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
    setFormError('');
  };

  /** The server's rules, checked here so nobody learns them one round-trip at a time. */
  const validate = (which) => {
    const next = {};
    if (which === 0) {
      if (form.businessName.trim().length < 2) next.businessName = 'Tell us what your business is called.';
      if (!form.businessType) next.businessType = 'Pick the closest match.';
      if (form.city.trim().length < 2) next.city = 'Which city do you work in?';
    } else {
      if (!form.email.includes('@')) next.email = 'Enter a valid email address.';
      if (form.phone.replace(/\D/g, '').length < 10) next.phone = 'Enter a phone number we can reach you on.';
      if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate(1)) return;

    setLoading(true);
    setFormError('');

    fetch(API_BASE + '/api/businesses/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: form.businessName.trim(),
        businessType: form.businessType,
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.business) {
          // Registration signs the merchant in; the confirmation plays, then
          // hands over to the dashboard.
          if (data.token) localStorage.setItem('auth_token', data.token);
          localStorage.setItem('currentBusiness', JSON.stringify(data.business));
          setCreated(data.business);
          return;
        }
        setFormError(data.error || 'We could not create your account. Please try again.');
        setLoading(false);
      })
      .catch(() => {
        setFormError('Could not reach Plazzaa. Check your connection and try again.');
        setLoading(false);
      });
  };

  const next = () => { if (validate(0)) { setStep(1); setFormError(''); } };

  if (created) {
    return (
      <AccountCreated
        businessName={created.name}
        onDone={() => { window.location.href = '/dashboard'; }}
      />
    );
  }

  return (
    <div className="plz-root min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ------------------------------------------------------------ form */}
        <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="Plazzaa home">
              <PlazzaaLogo size={26} />
            </Link>
            <Link
              to="/business"
              className="flex items-center gap-1.5 text-[14px] font-medium text-plz-body transition-colors duration-micro ease-plz hover:text-plz-ink"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-14"
          >
            {/* progress */}
            <div className="flex items-center gap-2" aria-hidden="true">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  animate={{ backgroundColor: i <= step ? '#2D60EA' : '#E4E4E7' }}
                  transition={{ duration: 0.3 }}
                  className="h-1 flex-1 rounded-full"
                />
              ))}
            </div>
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-plz-grey">
              Step {step + 1} of 2
            </p>

            <h1 className="mt-3 text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
              {step === 0 ? 'Start taking bookings.' : 'Create your account.'}
            </h1>
            <p className="mt-3 text-body text-plz-body">
              {step === 0
                ? 'Your own booking page, live in minutes. No card needed.'
                : 'This is how you’ll sign in, and how customers reach you.'}
            </p>

            <form onSubmit={submit} noValidate className="mt-9">
              <AnimatePresence mode="wait">
                {step === 0 ? (
                  <motion.div
                    key="business"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="flex flex-col gap-6"
                  >
                    <div>
                      <Label htmlFor="plz-biz">Business name</Label>
                      <input
                        id="plz-biz"
                        value={form.businessName}
                        onChange={set('businessName')}
                        placeholder="Glow Spa Lekki"
                        className={FIELD}
                        aria-invalid={Boolean(errors.businessName) || undefined}
                      />
                      <FieldError>{errors.businessName}</FieldError>
                    </div>

                    <div>
                      <Label>Business type</Label>
                      <BusinessTypeModal
                        value={form.businessType}
                        open={typeModalOpen}
                        onOpenChange={setTypeModalOpen}
                        onChange={(id) => {
                          setForm((f) => ({ ...f, businessType: id }));
                          setErrors((p) => ({ ...p, businessType: '' }));
                        }}
                      />
                      <FieldError>{errors.businessType}</FieldError>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="plz-city">City</Label>
                        <input
                          id="plz-city"
                          value={form.city}
                          onChange={set('city')}
                          placeholder="Lagos"
                          className={FIELD}
                          aria-invalid={Boolean(errors.city) || undefined}
                        />
                        <FieldError>{errors.city}</FieldError>
                      </div>
                      <div>
                        <Label htmlFor="plz-state">State</Label>
                        <select id="plz-state" value={form.state} onChange={set('state')} className={FIELD}>
                          {NIGERIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="plz-address">Address</Label>
                      <input
                        id="plz-address"
                        value={form.address}
                        onChange={set('address')}
                        placeholder="12 Admiralty Way, Lekki Phase 1"
                        className={FIELD}
                      />
                      <p className="mt-1.5 text-[12px] text-plz-body">
                        Optional. You can add this later.
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      onClick={next}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                      className="plz-btn plz-btn-primary mt-1 w-full"
                    >
                      Continue
                      <ArrowRight size={16} />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="flex flex-col gap-6"
                  >
                    <div>
                      <Label htmlFor="plz-email">Email address</Label>
                      <input
                        id="plz-email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@yourbusiness.com"
                        className={FIELD}
                        aria-invalid={Boolean(errors.email) || undefined}
                      />
                      <FieldError>{errors.email}</FieldError>
                    </div>

                    <div>
                      <Label htmlFor="plz-phone">Phone number</Label>
                      <input
                        id="plz-phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={set('phone')}
                        placeholder="0803 000 0000"
                        className={FIELD}
                        aria-invalid={Boolean(errors.phone) || undefined}
                      />
                      <FieldError>{errors.phone}</FieldError>
                    </div>

                    <div>
                      <Label htmlFor="plz-password">Password</Label>
                      <div className="relative">
                        <input
                          id="plz-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={form.password}
                          onChange={set('password')}
                          placeholder="At least 8 characters"
                          className={FIELD + ' pr-12'}
                          aria-invalid={Boolean(errors.password) || undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-ctl text-plz-body transition-colors duration-micro ease-plz hover:text-plz-ink"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                      <FieldError>{errors.password}</FieldError>
                    </div>

                    {formError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        role="alert"
                        className="rounded-ctl bg-[#FDEEF0] px-4 py-3 text-[14px] text-[#A32E4C]"
                      >
                        {formError}
                      </motion.p>
                    )}

                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        onClick={() => setStep(0)}
                        whileTap={{ scale: 0.985 }}
                        className="plz-btn plz-btn-quiet shrink-0"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </motion.button>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={loading ? undefined : { y: -2 }}
                        whileTap={loading ? undefined : { scale: 0.985 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                        className="plz-btn plz-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Creating your page…
                          </>
                        ) : (
                          <>
                            Create my booking page
                            <ArrowRight size={16} />
                          </>
                        )}
                      </motion.button>
                    </div>

                    <p className="text-[12px] leading-relaxed text-plz-grey">
                      By creating an account you agree to Plazzaa&apos;s terms and privacy policy.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <p className="mt-10 text-[14px] text-plz-body">
              Already selling on Plazzaa?{' '}
              <Link to="/login" className="font-semibold text-plz-blue hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>

          <p className="text-[13px] text-plz-grey">
            People &nbsp;·&nbsp; Places &nbsp;·&nbsp; Possibilities
          </p>
        </div>

        {/* ----------------------------------------------------------- visual */}
        <div className="relative hidden lg:block">
          <div className="sticky top-0 h-screen p-3">
            <div className="relative h-full overflow-hidden rounded-[22px]">
              <img
                src={images.salonOwner}
                alt="A salon owner finishing a client's braids in her studio in Lagos"
                className="plz-fill"
              />
              <div className="absolute inset-0 bg-plz-ink/40" />
              <div className="absolute inset-x-0 bottom-0 p-10">
                <p className="plz-script text-[30px] leading-tight text-white/85">
                  Good Businesses
                  <br />
                  Brighter Communities
                </p>
                <p className="mt-5 max-w-[34ch] text-lead text-white">
                  Set your services, share one link, and let customers book themselves in.
                </p>

                <ul className="mt-7 flex flex-col gap-2.5">
                  {[
                    'Your own booking page',
                    'Payments straight to your bank',
                    'No commission on bookings'
                  ].map((line) => (
                    <li key={line} className="flex items-center gap-2.5 text-[15px] text-white/90">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
