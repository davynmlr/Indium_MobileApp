import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { subscribeToFollowing, UserSummary } from "../services/follows";
import { Review, subscribeToReviewsOfUsers } from "../services/reviews";

// The people the logged-in user follows, and their reviews (newest first).
// Both lists are empty if nobody is logged in.
export function useFriendsActivity() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [activity, setActivity] = useState<Review[]>([]);

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setFollowing([]);
      return;
    }
    return subscribeToFollowing(uid, setFollowing);
  }, [uid]);

  // Listen again only when the list of followed users changes.
  const followingKey = following.map((f) => f.uid).join(",");
  useEffect(() => {
    const uids = followingKey ? followingKey.split(",") : [];
    return subscribeToReviewsOfUsers(uids, setActivity);
  }, [followingKey]);

  return { following, activity };
}
