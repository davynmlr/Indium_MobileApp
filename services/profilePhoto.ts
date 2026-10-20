// This file manages the profile photo of a user.
// The photo is saved as a small JPEG (base64 text) in the document users/{uid},
// in the field "photo". This way we don't need Firebase Storage.

import { deleteField, doc, onSnapshot, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { db } from "./firebase";

// Size of the saved photo in pixels (square). Small, so the document stays light.
const PHOTO_SIZE = 256;

// Opens the phone's gallery so the user can choose and crop a square photo.
// Returns the photo as a data URI ("data:image/jpeg;base64,..."),
// or null if the user cancelled.
// Throws an error with code "permission-denied" if the user refused access.
export async function pickProfilePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw Object.assign(new Error("No access to photos"), {
      code: "permission-denied",
    });
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (result.canceled) return null;

  // Make the photo small and compressed before saving it.
  const context = ImageManipulator.manipulate(result.assets[0].uri);
  context.resize({ width: PHOTO_SIZE, height: PHOTO_SIZE });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.7,
    base64: true,
  });
  return `data:image/jpeg;base64,${saved.base64}`;
}

// Saves the photo in the database. `null` removes it.
export async function saveProfilePhoto(uid: string, photo: string | null) {
  await setDoc(
    doc(db, "users", uid),
    { photo: photo ?? deleteField() },
    { merge: true },
  );
}

// Listens to the user's photo. `onChange` gets the photo, or null if there is none.
// It returns a function to stop listening.
export function subscribeToProfilePhoto(
  uid: string,
  onChange: (photo: string | null) => void,
) {
  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => onChange(snapshot.data()?.photo ?? null),
    () => onChange(null),
  );
}
