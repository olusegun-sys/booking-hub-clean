
// FILE: client/src/plazzaa/pages/ForgotPassword.jsx
// PURPOSE: "Enter your email" screen for the password reset flow.
// Mirrors the visual language of Login.jsx — same split-screen layout,
// same typography, same field styling.
//
// Flow: user lands here → enters email → submits → we call
// POST /api/businesses/forgot-password → always shows the same
// confirmation (no enumeration) → user checks inbox.

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import API_BASE from "../../config";
import { images } from "../lib/data";
import { EASE } from "../lib/motion";
import PlazzaaLogo from "../components/PlazzaaLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Enter the email address you signed up with.");
      return;
    }

    setLoading(true);
    setError("");

    fetch(API_BASE + "/api/businesses/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
      .then((response) => response.json())
      .then((data) => {
        // WHY: The API always returns {success: true} regardless of whether
        // the email exists. We show the same confirmation either way so an
        // attacker can't probe for registered emails. The user just knows
        // to check their inbox.
        if (data.success) {
          setSent(true);
          setLoading(false);
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
            {!sent ? (
              <>
                <h1 className="text-h2 text-plz-ink" style={{ textWrap: "balance" }}>
                  Forgot your password?
                </h1>
                <p className="mt-3 text-body text-plz-body">
                  Enter the email you signed up with and we&apos;ll send you a link
                  to choose a new password.
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="you@yourbusiness.com"
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
                        Sending&hellip;
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="mt-10 text-[14px] text-plz-body">
                  Remembered it?{" "}
                  <Link to="/login" className="font-semibold text-plz-blue hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-plz-cream"
                >
                  <Mail size={28} className="text-plz-blue" />
                </motion.div>

                <h1 className="mt-6 text-h2 text-plz-ink" style={{ textWrap: "balance" }}>
                  Check your inbox
                </h1>
                <p className="mt-3 text-body text-plz-body">
                  If <strong className="text-plz-ink">{email}</strong> has a Plazzaa
                  account, a reset link is on its way. It works for 1 hour.
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-plz-body">
                  Didn&apos;t get it? Check your spam folder, or make sure you
                  entered the email you signed up with.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    to="/login"
                    className="plz-btn plz-btn-quiet w-full justify-center"
                  >
                    Back to sign in
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                    className="text-[14px] font-medium text-plz-blue hover:underline"
                  >
                    Send to a different email
                  </button>
                </div>
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
                src={images.spaReception}
                alt="A business owner preparing for the day"
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