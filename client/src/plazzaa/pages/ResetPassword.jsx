// FILE: client/src/plazzaa/pages/ResetPassword.jsx
// PURPOSE: "Choose a new password" screen. Reached by clicking the
// link in the reset email. Reads ?token= from the URL and submits it
// along with the new password to POST /api/businesses/reset-password.
//
// States:
//   1. No token in URL → show "this link is invalid" and offer to re-request
//   2. Token present → show password fields
//   3. Submit success → show "password updated" and link to /login
//   4. Submit failure → show the server's error message
//
// UPDATED 22 Oct 2026: eye-icon stability fix — replaced
// 'top-1/2 -translate-y-1/2' with 'inset-y-0 my-auto' on the show/hide
// password button. Same fix as Login.jsx, same root cause (sub-pixel
// jitter during focus/blur/autofill).

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import API_BASE from "../../config";
import { images } from "../lib/data";
import { EASE } from "../lib/motion";
import PlazzaaLogo from "../components/PlazzaaLogo";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // WHY: If someone lands here without a token, don't let them submit.
  // Show a clear message instead of a form that can't succeed.
  const hasToken = Boolean(token && token.length >= 20);

  useEffect(() => {
    // No-op effect to ensure state resets when token changes (e.g. user
    // opens a second reset link in the same tab).
    setError("");
    setPassword("");
    setConfirmPassword("");
    setDone(false);
  }, [token]);

  const submit = (event) => {
    event.preventDefault();

    if (!hasToken) {
      setError("This reset link is missing its token. Please use the link from your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The two passwords don't match. Please retype them.");
      return;
    }

    setLoading(true);
    setError("");

    fetch(API_BASE + "/api/businesses/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setDone(true);
          setLoading(false);
          // WHY auto-redirect: after the password is set, the natural next
          // step is logging in. Give the user 2 seconds to read the
          // confirmation, then take them to /login automatically.
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2200);
          return;
        }
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      })
      .catch(() => {
        setError("Could not reach Plazzaa. Check your connection and try again.");
        setLoading(false);
      });
  };

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
              to="/login"
              className="flex items-center gap-1.5 text-[14px] font-medium text-plz-body transition-colors duration-micro ease-plz hover:text-plz-ink"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-14"
          >
            {!hasToken ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEEF0]"
                >
                  <AlertCircle size={28} className="text-[#A32E4C]" />
                </motion.div>

                <h1 className="mt-6 text-h2 text-plz-ink">This link isn&apos;t valid</h1>
                <p className="mt-3 text-body text-plz-body">
                  The reset link is missing its token, or the URL was truncated
                  when you copied it. Request a fresh link and try again.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    to="/forgot-password"
                    className="plz-btn plz-btn-primary w-full justify-center"
                  >
                    Request a new link
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/login"
                    className="text-[14px] font-medium text-plz-blue hover:underline"
                  >
                    Back to sign in
                  </Link>
                </div>
              </>
            ) : done ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF7EF]"
                >
                  <Check size={28} className="text-[#1B7F43]" />
                </motion.div>

                <h1 className="mt-6 text-h2 text-plz-ink">Password updated</h1>
                <p className="mt-3 text-body text-plz-body">
                  You&apos;re being signed in&hellip;
                </p>
                <p className="mt-3 text-[14px] text-plz-body">
                  If nothing happens in a few seconds,{" "}
                  <Link to="/login" className="font-semibold text-plz-blue hover:underline">
                    go to sign in
                  </Link>
                  .
                </p>
              </>
            ) : (
              <>
                <h1 className="text-h2 text-plz-ink" style={{ textWrap: "balance" }}>
                  Choose a new password
                </h1>
                <p className="mt-3 text-body text-plz-body">
                  Make it at least 8 characters. A mix of letters and numbers
                  is safer than something easy to guess.
                </p>

                <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-6">
                  <div>
                    <label
                      htmlFor="plz-password"
                      className="block text-[13px] font-semibold text-plz-ink"
                    >
                      New password
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        id="plz-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="At least 8 characters"
                        className="plz-field pr-12"
                        aria-invalid={Boolean(error) || undefined}
                      />
                      {/* WHY: pinned to inset-y-0 with my-auto — the icon
                          can no longer drift on focus/blur/autofill. Same
                          fix as Login.jsx. Previously top-1/2 + -translate-y-1/2
                          caused sub-pixel jitter. */}
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-1 my-auto flex h-10 w-10 items-center justify-center rounded-ctl text-plz-body transition-colors duration-micro ease-plz hover:text-plz-ink"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="plz-confirm"
                      className="block text-[13px] font-semibold text-plz-ink"
                    >
                      Confirm new password
                    </label>
                    <input
                      id="plz-confirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Type it again"
                      className="plz-field mt-2.5"
                      aria-invalid={Boolean(error) || undefined}
                    />
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
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    className="plz-btn plz-btn-primary mt-1 w-full disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving&hellip;
                      </>
                    ) : (
                      <>
                        Update password
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            )}
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
                alt="A salon owner at work"
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