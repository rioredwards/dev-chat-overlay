import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "../auth";
import { mintRelayToken } from "../lib/relay-token";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <main>
        <h1>DevChat Invite Gateway</h1>
        <p>You must sign in with an allowlisted email.</p>
        <Link href="/signin">Go to sign in</Link>
      </main>
    );
  }

  const appUrl = process.env.DEVCHAT_APP_URL;
  if (appUrl) {
    const { token } = await mintRelayToken(session.user.email, "tester");
    const target = new URL(appUrl);
    target.searchParams.set("devchatToken", token);
    target.searchParams.set("devchatEmail", session.user.email);
    redirect(target.toString());
  }

  return (
    <main>
      <h1>Welcome</h1>
      <p>Signed in as {session.user.email}</p>
      <p>
        Set <code>DEVCHAT_APP_URL</code> to auto-redirect authenticated users into DevChat.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/signin" });
        }}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
