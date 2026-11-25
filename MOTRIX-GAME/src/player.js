
import { auth, db } from "./firebase";

import {
  signInAnonymously,
  signOut
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

// ==========================================
// REGISTER PLAYER
// ==========================================

export async function registerPlayer(username) {
  const cleanUsername = username.trim();

  if (cleanUsername.length < 3 || cleanUsername.length > 16) {
    throw new Error("Username must be 3–16 characters long.");
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    throw new Error("Use only letters, numbers and underscores.");
  }

  let user = auth.currentUser;

  if (!user) {
    const result = await signInAnonymously(auth);
    user = result.user;
  }

  const playerRef = doc(db, "players", user.uid);
  const playerSnap = await getDoc(playerRef);

  await setDoc(
    playerRef,
    {
      uid: user.uid,
      username: cleanUsername,
      usernameLower: cleanUsername.toLowerCase(),
      ...(playerSnap.exists()
        ? {}
        : { createdAt: serverTimestamp() })
    },
    { merge: true }
  );

  return {
    uid: user.uid,
    username: cleanUsername
  };
}

// ==========================================
// SAVE EVERY COMPLETED GAME SCORE
// ==========================================

export async function savePlayerScore(player, game, difficulty, result) {
  // Check player
  if (!player?.uid) {
    throw new Error("No logged-in player found.");
  }

  // Check Firebase authentication
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.uid !== player.uid) {
    throw new Error("Firebase player authentication does not match.");
  }

  // Check game information
  if (!game?.id || !game?.name) {
    throw new Error("Game information is missing.");
  }

  // Check result information
  if (!result || typeof result !== "object") {
    throw new Error("Game result is missing.");
  }

  const scoreData = {
    playerID: player.uid,
    username: player.username || "Player",

    game: game.name,
    gameID: game.id,
    difficulty: difficulty || "medium",

    score: Number(result.score) || 0,
    accuracy: Number(result.acc) || 0,
    maxCombo: Number(result.maxCombo) || 0,

    stars: Number(result.stars) || 0,

    createdAt: serverTimestamp()
  };

  // addDoc creates a NEW document for every completed game
  const scoreRef = await addDoc(
    collection(db, "scores"),
    scoreData
  );

  console.log("MOTRIX SCORE SAVED SUCCESSFULLY!");
  console.log("Firebase document ID:", scoreRef.id);
  console.log("Saved score:", scoreData);

  return scoreRef.id;
}

// ==========================================
// LOGOUT PLAYER
// ==========================================

export async function logoutPlayer() {
  await signOut(auth);
}
