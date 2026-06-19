import { signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const ALLOWED_DOMAIN = "techtown.fr";

/**
 * Sign in with Google and verify the email domain.
 * Rejects and signs out if the domain is not allowed.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const email = result.user.email ?? "";

  // Vérification côté client — obligatoire même avec hd: hint
  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    await signOut(auth);
    throw new Error(`Seuls les comptes @${ALLOWED_DOMAIN} sont autorisés.`);
  }

  return result.user;
}

export function logout(): Promise<void> {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
