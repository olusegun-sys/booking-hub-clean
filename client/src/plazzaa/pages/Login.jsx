import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import API_BASE from '../../config';
import { images } from '../lib/data';
import { EASE } from '../lib/motion';

/**
 * Merchant sign-in.
 *
 * Calm and roomy rather than busy: one column of generous spacing, a single
 * ask per line, and the brand carried by one photograph instead of decoration.
 *
 * The network contract is unchanged from the previous screen — same endpoint,
 * same token and business keys in localStorage, same redirect — so existing
 * accounts keep working exactly as they did.
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Enter the email address you signed up with.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    setError('');

    fetch(API_BASE + '/api/businesses/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.business) {
          if (data.token) localStorage.setItem('auth_token', data.token);
          localStorage.setItem('currentBusiness', JSON.stringify(data.business));
          window.location.href = '/dashboard';
          return;
        }
        setError(data.error || 'That email and password did not match.');
        setLoading(false);
      })
      .catch(() => {
        setError('Could not reach Plazzaa. Check your connection and try again.');
        setLoading(false);
      });
  };

  return (
    <div className="plz-root min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ------------------------------------------------------------ form */}
        <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-[20px] font-bold tracking-[-0.03em] text-plz-ink">
              Plazzaa
            </Link>
            <Link
              to="/"
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
            className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-14"
          >
            <h1 className="text-h2 text-plz-ink" style={{ textWrap: 'balance' }}>
              Welcome back.
            </h1>
            <p className="mt-3 text-body text-plz-body">
              Sign in to manage your services, availability and bookings.
            </p>

            <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-6">
              <div>
                <label
                  htmlFor="plz-email"
                  className="block text-[13px] font-semibold text-plz-ink"
                >
                  Email address
                </label>
                <input
                  id="plz-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@yourbusiness.com"
                  className="plz-field mt-2.5"
                  aria-invalid={Boolean(error) || undefined}
                />
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <label
                    htmlFor="plz-password"
                    className="block text-[13px] font-semibold text-plz-ink"
                  >
                    Password
                  </label>
                  <Link
                    to="/login"
                    className="text-[13px] font-medium text-plz-blue hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-2.5">
                  <input
                    id="plz-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Your password"
                    className="plz-field pr-12"
                    aria-invalid={Boolean(error) || undefined}
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
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="rounded-ctl bg-[#FDEEF0] px-4 py-3 text-[14px] text-[#A32E4C]"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { y: -2 }}
                whileTap={loading ? undefined : { scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                className="plz-btn plz-btn-primary mt-1 w-full disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            <p className="mt-10 text-[14px] text-plz-body">
              New to Plazzaa?{' '}
              <Link to="/signup" className="font-semibold text-plz-blue hover:underline">
                Create your booking link
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
                src={images.spaReception}
                alt="A spa owner setting up her reception for the day in Lekki, Lagos"
                className="plz-fill"
              />
              <div className="absolute inset-0 bg-plz-ink/35" />
              <div className="absolute inset-x-0 bottom-0 p-10">
                <p className="plz-script text-[30px] leading-tight text-white/85">
                  Good Businesses
                  <br />
                  Brighter Communities
                </p>
                <p className="mt-5 max-w-[34ch] text-lead text-white">
                  Every booking that used to live in your inbox, in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
