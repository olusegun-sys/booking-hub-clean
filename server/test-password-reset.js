// FILE: server/test-password-reset.js
// PURPOSE: Interactive smoke test for the forgot-password backend.
//
// USAGE (from the server/ folder):
//   node test-password-reset.js
//
// The script:
//   1. Sends a reset request to your test email
//   2. Waits for you to paste the token from your inbox
//   3. Runs all remaining tests automatically
//   4. Prints a PASS/FAIL summary
//
// No external tools required — only Node.js (which runs the backend).

const readline = require("readline");

const BASE = "http://localhost:5000";
const TEST_EMAIL = "scholaris21@gmail.com";
const OLD_PASSWORD = "password123"; // Update if your old password was different

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const dim   = (s) => `\x1b[2m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;
const cyan  = (s) => `\x1b[36m${s}\x1b[0m`;

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function run() {
  console.log(bold("\n========================================"));
  console.log(bold("Password Reset Backend Test Suite"));
  console.log(bold("========================================\n"));

  let passCount = 0;
  let failCount = 0;

  // ==========================================================
  // TEST 1 — Request a reset for the real email
  // ==========================================================
  console.log(dim("Test 1 — Request reset link for " + TEST_EMAIL + ":"));
  try {
    const r1 = await post("/api/businesses/forgot-password", {
      email: TEST_EMAIL,
    });
    if (r1.data.success === true) {
      console.log(green("  ✔ PASS — API returned success"));
      console.log(dim("  Response: " + JSON.stringify(r1.data)));
      passCount++;
    } else {
      console.log(red("  ✗ FAIL — success was not true"));
      console.log(red("  Response: " + JSON.stringify(r1.data)));
      failCount++;
      // Can't proceed without a valid Test 1
      console.log(red("\nCannot continue without a successful Test 1."));
      process.exit(1);
    }
  } catch (e) {
    console.log(red("  ✗ FAIL — request threw: " + e.message));
    console.log(red("  Is the backend running on " + BASE + "?"));
    process.exit(1);
  }
  console.log();

  // ==========================================================
  // PROMPT — Get the token from the email
  // ==========================================================
  console.log(cyan(bold("→ Next step: check your email for " + TEST_EMAIL)));
  console.log(dim("  The reset email will arrive within 5-30 seconds."));
  console.log(dim("  Copy the token from the reset URL — the long hex string after 'token='."));
  console.log(dim("  The URL looks like: http://localhost:5173/reset-password?token=abc123def456..."));
  console.log();

  const token = await ask(cyan("Paste the token here and press Enter: "));

  if (!token || token.length < 20) {
    console.log(red("\n✗ Token looks too short. Did you copy the full token?"));
    console.log(red("  Expected length is around 60 characters."));
    process.exit(1);
  }

  console.log();
  console.log(dim("Got token: " + token.substring(0, 20) + "... (" + token.length + " chars)\n"));

  // ==========================================================
  // TEST 2 — Reset the password using the token
  // ==========================================================
  console.log(dim("Test 2 — Reset password with token:"));
  try {
    const r2 = await post("/api/businesses/reset-password", {
      token,
      newPassword: "newpassword123",
    });
    if (r2.data.success === true) {
      console.log(green("  ✔ PASS"));
      console.log(dim("  Response: " + JSON.stringify(r2.data)));
      passCount++;
    } else {
      console.log(red("  ✗ FAIL — success was not true"));
      console.log(red("  Response: " + JSON.stringify(r2.data)));
      failCount++;
    }
  } catch (e) {
    console.log(red("  ✗ FAIL — request threw: " + e.message));
    failCount++;
  }
  console.log();

  // ==========================================================
  // TEST 3 — Try to reuse the same token (must fail)
  // ==========================================================
  console.log(dim("Test 3 — Reuse the same token (must fail):"));
  try {
    const r3 = await post("/api/businesses/reset-password", {
      token,
      newPassword: "anotherpassword",
    });
    if (r3.data.success === false) {
      console.log(green("  ✔ PASS — token was rejected on reuse"));
      console.log(dim("  Response: " + JSON.stringify(r3.data)));
      passCount++;
    } else {
      console.log(red("  ✗ FAIL — token was NOT rejected. Single-use is broken."));
      console.log(red("  Response: " + JSON.stringify(r3.data)));
      failCount++;
    }
  } catch (e) {
    console.log(red("  ✗ FAIL — request threw: " + e.message));
    failCount++;
  }
  console.log();

  // ==========================================================
  // TEST 4 — Request reset for non-existent email
  // ==========================================================
  console.log(dim("Test 4 — Request for non-existent email (must return success:true):"));
  try {
    const r4 = await post("/api/businesses/forgot-password", {
      email: "nobody@thisdoesnotexist.com",
    });
    if (r4.data.success === true) {
      console.log(green("  ✔ PASS — same response as real email (no enumeration)"));
      console.log(dim("  Response: " + JSON.stringify(r4.data)));
      passCount++;
    } else {
      console.log(red("  ✗ FAIL — different response for non-existent email"));
      console.log(red("  Response: " + JSON.stringify(r4.data)));
      failCount++;
    }
  } catch (e) {
    console.log(red("  ✗ FAIL — request threw: " + e.message));
    failCount++;
  }
  console.log();

  // ==========================================================
  // TEST 5 — Log in with the new password
  // ==========================================================
  console.log(dim("Test 5 — Login with new password:"));
  try {
    const r5 = await post("/api/businesses/login", {
      email: TEST_EMAIL,
      password: "newpassword123",
    });
    if (r5.data.success === true && r5.data.token) {
      console.log(green("  ✔ PASS — new password works"));
      console.log(dim("  New token: " + r5.data.token.substring(0, 20) + "..."));
      passCount++;
    } else {
      console.log(red("  ✗ FAIL — login rejected the new password"));
      console.log(red("  Response: " + JSON.stringify(r5.data)));
      failCount++;
    }
  } catch (e) {
    console.log(red("  ✗ FAIL — request threw: " + e.message));
    failCount++;
  }
  console.log();

  // ==========================================================
  // TEST 6 — Old password should be rejected
  // ==========================================================
  console.log(dim("Test 6 — Login with OLD password (must fail):"));
  try {
    const r6 = await post("/api/businesses/login", {
      email: TEST_EMAIL,
      password: OLD_PASSWORD,
    });
    if (r6.data.success === false) {
      console.log(green("  ✔ PASS — old password rejected"));
      console.log(dim("  Response: " + JSON.stringify(r6.data)));
      passCount++;
    } else {
      console.log(red("  ✗ FAIL — old password STILL WORKS. Security issue."));
      console.log(dim("  If your old password wasn't '" + OLD_PASSWORD + "', this failure is expected."));
      console.log(dim("  Edit OLD_PASSWORD at the top of this file and re-run."));
      failCount++;
    }
  } catch (e) {
    console.log(red("  ✗ FAIL — request threw: " + e.message));
    failCount++;
  }
  console.log();

  // ==========================================================
  // SUMMARY
  // ==========================================================
  console.log(bold("========================================"));
  console.log(bold("SUMMARY"));
  console.log(bold("========================================"));
  console.log(green(`  Passed: ${passCount}`));
  if (failCount > 0) {
    console.log(red(`  Failed: ${failCount}`));
  } else {
    console.log(green(`  Failed: ${failCount}`));
  }
  console.log(bold("========================================\n"));

  if (failCount === 0) {
    console.log(green("✔ All tests passed."));
    console.log();
    console.log(dim("Now verify in Supabase:"));
    console.log(dim("  1. Table Editor → password_reset_tokens → used = true for the token"));
    console.log(dim("  2. Table Editor → businesses → password_hash changed for " + TEST_EMAIL));
    console.log();
  } else {
    console.log(red("✗ Some tests failed. Review the output above."));
    console.log();
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(red("\nFATAL: " + err.message));
  console.error(dim("Is the backend running on port 5000?"));
  process.exit(1);
});