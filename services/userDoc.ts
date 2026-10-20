// The document users/{uid} holds a user's favorites, watchlist, series progress
// and photo. Many screens listen to it at the same time, so instead of one
// Firestore listener each, they share ONE listener per user.
// When the last screen stops listening, the listener is closed.

import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// The place of a user's document in the database.
export const userDocRef = (uid: string) => doc(db, "users", uid);

type Listener = {
  onData: (data: DocumentData | undefined) => void;
  onError?: (error: Error) => void;
};

type Shared = {
  listeners: Set<Listener>;
  stop: () => void;
  // Last data received, so a screen that joins later gets it right away.
  last?: { data: DocumentData | undefined };
};

const sharedByUid: Record<string, Shared> = {};

// Listens to users/{uid}. `onData` gets the document's data
// (undefined if the user has no document yet).
// It returns a function to stop listening.
export function subscribeToUserDoc(
  uid: string,
  onData: Listener["onData"],
  onError?: Listener["onError"],
) {
  let shared = sharedByUid[uid];
  if (!shared) {
    const entry: Shared = { listeners: new Set(), stop: () => {} };
    entry.stop = onSnapshot(
      userDocRef(uid),
      (snapshot) => {
        const data = snapshot.data();
        entry.last = { data };
        entry.listeners.forEach((listener) => listener.onData(data));
      },
      (error) => {
        // Firestore closes a listener after an error: forget it,
        // so the next screen that listens starts a new one.
        if (sharedByUid[uid] === entry) delete sharedByUid[uid];
        entry.listeners.forEach((listener) => listener.onError?.(error));
      },
    );
    sharedByUid[uid] = entry;
    shared = entry;
  }

  const listener: Listener = { onData, onError };
  shared.listeners.add(listener);
  if (shared.last) onData(shared.last.data);

  const entry = shared;
  return () => {
    entry.listeners.delete(listener);
    if (entry.listeners.size === 0) {
      entry.stop();
      if (sharedByUid[uid] === entry) delete sharedByUid[uid];
    }
  };
}
