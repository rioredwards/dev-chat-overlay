import Link from "next/link";
import { auth, signOut } from "../auth";

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

  return (
    <main>
      <h1>Welcome</h1>
      <p>Signed in as {session.user.email}</p>
      <p>
        Fetch your relay token at <code>/api/devchat-token</code> and pass it to <code>DevChatOverlay</code> as
        <code> token</code>.
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
