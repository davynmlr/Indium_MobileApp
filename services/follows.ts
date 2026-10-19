// This file manages who follows who.
// Each "A follows B" is one document in the "follows" collection,
// named "{A's uid}_{B's uid}", so the same follow can't be saved twice.
// - Following of a user = documents where followerUid is the user.
// - Followers of a user = documents where followingUid is the user.

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// A user shown in a list (search results, followers, following).
export type UserSummary = {
  uid: string;
  username: string;
};

type Follow = {
  followerUid: string;
  followerName: string;
  followingUid: string;
  followingName: string;
  createdAt: number;
};

const followRef = (followerUid: string, followingUid: string) =>
  doc(db, "follows", `${followerUid}_${followingUid}`);

// `me` starts following `other`.
export async function followUser(me: UserSummary, other: UserSummary) {
  const follow: Follow = {
    followerUid: me.uid,
    followerName: me.username,
    followingUid: other.uid,
    followingName: other.username,
    createdAt: Date.now(),
  };
  await setDoc(followRef(me.uid, other.uid), follow);
}

// `myUid` stops following `otherUid`.
export async function unfollowUser(myUid: string, otherUid: string) {
  await deleteDoc(followRef(myUid, otherUid));
}

// Listens to whether `myUid` follows `otherUid` (true / false).
export function subscribeToIsFollowing(
  myUid: string,
  otherUid: string,
  onChange: (isFollowing: boolean) => void,
) {
  return onSnapshot(followRef(myUid, otherUid), (snapshot) =>
    onChange(snapshot.exists()),
  );
}

// Listens to the people who follow `uid`, newest first.
export function subscribeToFollowers(
  uid: string,
  onChange: (users: UserSummary[]) => void,
) {
  return onSnapshot(
    query(collection(db, "follows"), where("followingUid", "==", uid)),
    (snapshot) => {
      const follows = snapshot.docs.map((d) => d.data() as Follow);
      follows.sort((a, b) => b.createdAt - a.createdAt);
      onChange(
        follows.map((f) => ({ uid: f.followerUid, username: f.followerName })),
      );
    },
  );
}

// Listens to the people `uid` follows, newest first.
export function subscribeToFollowing(
  uid: string,
  onChange: (users: UserSummary[]) => void,
) {
  return onSnapshot(
    query(collection(db, "follows"), where("followerUid", "==", uid)),
    (snapshot) => {
      const follows = snapshot.docs.map((d) => d.data() as Follow);
      follows.sort((a, b) => b.createdAt - a.createdAt);
      onChange(
        follows.map((f) => ({ uid: f.followingUid, username: f.followingName })),
      );
    },
  );
}
