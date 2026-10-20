// This file manages usernames in the database.
// Each username is saved in the "usernames" collection.
// The username itself is the name of the document, so two users cannot have the same one.
// Anyone can read these documents, so they must NOT contain the email
// (it stays private in Firebase Auth). That's why login is by email only.

import {
  collection,
  deleteField,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import type { UserSummary } from "./follows";

// Rules for a valid username:
// only letters, numbers and "_", between 3 and 20 characters.
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Gives the place in the database for a username.
// We remove spaces and put it in lowercase, so "Davyn" and "davyn" are the same.
const usernameRef = (username: string) =>
  doc(db, "usernames", username.trim().toLowerCase());

// Returns true if someone already uses this username.
export async function isUsernameTaken(username: string) {
  const snapshot = await getDoc(usernameRef(username));
  return snapshot.exists();
}

// Saves a new username for a user.
// We use a "transaction": the check and the save happen together,
// so two people cannot take the same username at the same time.
// If the username is already taken, it throws an error with code "username-taken".
export async function claimUsername(username: string, uid: string) {
  const ref = usernameRef(username);
  await runTransaction(db, async (transaction) => {
    // Check if the username already exists
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) {
      throw Object.assign(new Error("Username is taken"), {
        code: "username-taken",
      });
    }
    // It is free, so we save it with the user id (never the email)
    transaction.set(ref, { uid, username: username.trim() });
  });
}

// Old accounts were created when the email was saved here.
// This removes it from the user's own document (runs after login).
export async function removeEmailFromUsername(user: User) {
  if (!user.displayName) return;
  const ref = usernameRef(user.displayName);
  const snapshot = await getDoc(ref);
  if (
    snapshot.exists() &&
    snapshot.data().uid === user.uid &&
    "email" in snapshot.data()
  ) {
    await updateDoc(ref, { email: deleteField() });
  }
}

// Finds users whose username starts with `text` (max 20 results).
// The document names are the lowercase usernames, so we search between
// "text" and "text" + a very big character.
export async function searchUsers(text: string): Promise<UserSummary[]> {
  const start = text.trim().toLowerCase();
  if (!start) return [];
  const snapshot = await getDocs(
    query(
      collection(db, "usernames"),
      where(documentId(), ">=", start),
      where(documentId(), "<=", start + ""),
      limit(20),
    ),
  );
  // Only keep the uid and the username (not the email).
  return snapshot.docs.map((d) => ({
    uid: d.data().uid as string,
    username: d.data().username as string,
  }));
}
