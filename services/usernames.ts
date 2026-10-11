import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

// Usernames are stored lowercased as the document id of usernames/{username},
// so uniqueness is case-insensitive and enforced by Firestore itself.
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const usernameRef = (username: string) =>
  doc(db, "usernames", username.trim().toLowerCase());

export async function isUsernameTaken(username: string) {
  const snapshot = await getDoc(usernameRef(username));
  return snapshot.exists();
}

export async function getEmailForUsername(username: string) {
  const snapshot = await getDoc(usernameRef(username));
  return snapshot.exists() ? (snapshot.data().email as string) : null;
}

// Throws an error with code "username-taken" if someone claimed it first.
export async function claimUsername(
  username: string,
  uid: string,
  email: string,
) {
  const ref = usernameRef(username);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) {
      throw Object.assign(new Error("Username is taken"), {
        code: "username-taken",
      });
    }
    transaction.set(ref, { uid, email, username: username.trim() });
  });
}
