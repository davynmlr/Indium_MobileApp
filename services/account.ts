// This file lets the logged-in user change their password and email.
// Firebase asks for the current password first ("re-authentication"),
// so someone who finds an unlocked phone can't change them.

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  User,
  verifyBeforeUpdateEmail,
} from "firebase/auth";

// Checks the current password. Throws "auth/invalid-credential" if it is wrong.
async function confirmPassword(user: User, currentPassword: string) {
  if (!user.email) throw new Error("This account has no email.");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
}

// Changes the password.
export async function changePassword(
  user: User,
  currentPassword: string,
  newPassword: string,
) {
  await confirmPassword(user, currentPassword);
  await updatePassword(user, newPassword);
}

// Asks to change the email. Firebase sends a link to the new address:
// the email only changes when the user clicks it.
export async function requestEmailChange(
  user: User,
  currentPassword: string,
  newEmail: string,
) {
  await confirmPassword(user, currentPassword);
  await verifyBeforeUpdateEmail(user, newEmail);
}

// Turns a Firebase error into a message for the user.
export function accountErrorMessage(error: any) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Your current password is incorrect.";
    case "auth/weak-password":
      return "The new password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
      return "This email is already used by another account.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a bit and try again.";
    case "auth/operation-not-allowed":
      return "Email changes are turned off for this app.";
    default:
      return "Something went wrong. Please try again.";
  }
}
