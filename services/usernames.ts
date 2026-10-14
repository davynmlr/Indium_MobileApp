// This file manages usernames in the database.
// Each username is saved in the "usernames" collection.
// The username itself is the name of the document, so two users cannot have the same one.

import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

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

// Finds the email linked to a username (used to log in with a username).
// Returns null if the username does not exist.
export async function getEmailForUsername(username: string) {
  const snapshot = await getDoc(usernameRef(username));
  return snapshot.exists() ? (snapshot.data().email as string) : null;
}

// Saves a new username for a user.
// We use a "transaction": the check and the save happen together,
// so two people cannot take the same username at the same time.
// If the username is already taken, it throws an error with code "username-taken".
export async function claimUsername(
  username: string,
  uid: string,
  email: string,
) {
  const ref = usernameRef(username);
  await runTransaction(db, async (transaction) => {
    // Check if the username already exists
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) {
      throw Object.assign(new Error("Username is taken"), {
        code: "username-taken",
      });
    }
    // It is free, so we save it with the user id and email
    transaction.set(ref, { uid, email, username: username.trim() });
  });
}
