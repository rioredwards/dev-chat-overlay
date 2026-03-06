"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <main>
      <h1>Sign in</h1>
      <p>Invite-only access. Use your allowlisted email.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await signIn("resend", { email, redirect: true, callbackUrl: "/" });
          setSent(true);
        }}>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button type="submit">Send magic link</button>
      </form>
      {sent ? <p>Check your email for a sign-in link.</p> : null}
    </main>
  );
}
