# Project topic: Indium

## Short description

Indium is a mobile app inspired by Letterboxd, with fewer features. It lets users keep track of the movies and series they watch. Users can search for titles, rate and review them, keep a watchlist, track their progress in series, watch trailers and follow friends to see what they have reviewed.

## Technologies

- React Native with Expo (TypeScript)
- React Navigation (bottom tabs, top tabs, native stack)
- Firebase Authentication (register and log in)
- Firebase Firestore (ratings, reviews, watchlist, favorites, series progress, follows, usernames)
- TMDB REST API (search, trending, lists, details, posters, trailers)
- Expo APIs: expo-image-picker, expo-image-manipulator, expo-brightness, expo-speech
- react-native-webview (YouTube trailer player)
- AsyncStorage (keeps the user logged in, remembers the cinema mode setting)

## Main features

### Account

- Register with a unique username, log in by email and password
- Change password or email from Settings (asks for the current password first)
- Profile picture chosen from the gallery and cropped (expo-image-picker), saved small and compressed (expo-image-manipulator)

### Discover

- Home: Films and Series tabs with top rated titles, new releases / recently airing, friends' latest reviews, and series with a new season
- Search movies and series through the TMDB API, with this week's trending titles shown when the search bar is empty

### Details page

- Poster, synopsis, genres, release year, runtime, TMDB rating, the app users' average rating, language and number of seasons
- Watch the trailer directly in the app (TMDB video endpoint, played from YouTube)
- Cinema mode: dims the screen brightness while a trailer is playing (expo-brightness)
- Listen to the synopsis read aloud (expo-speech)
- Rate out of 5 stars, with half stars
- Mark as watched without a rating (eye button)
- Write a review with a date, stars and a comment; edit or delete it later

### Lists

- Watchlist: add and remove titles, filter by type and genre, sort them
- "What to watch next?": spin a wheel of watchlist posters to pick a random title, optionally by genre
- Diary: all of a user's reviews, newest first
- Watched: everything a user has rated or marked as watched, with a rating filter
- My series: the season and episode the user stopped at, with "I'm up to date" and alerts for new seasons

### Social

- Search other users by username
- Follow and unfollow users, see followers and following lists
- Friends feed with the latest reviews of the people you follow
- Profile page with 3 favorite movies and 3 favorite series, recent activity and links to the user's lists

## Getting started

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file at the root of the project with your Firebase and TMDB keys:

   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
   EXPO_PUBLIC_FIREBASE_SENDER_ID=
   EXPO_PUBLIC_FIREBASE_APP_ID=
   EXPO_PUBLIC_TMDB_API_KEY=
   ```

   - Firebase: create a project, enable **Email/Password** authentication and **Firestore**.
   - TMDB: get a free API key at https://www.themoviedb.org/settings/api.

3. Start the app:
   ```bash
   npx expo start
   ```
   Then scan the QR code with Expo Go, or press `a` (Android) / `i` (iOS).

## Project structure

```
App.tsx              Navigation: bottom tabs and stack pages
screens/             One file per page (subscreens/ = Home's Films and Series tabs)
components/          Reusable UI pieces (details/ = parts of the details page)
hooks/               Shared logic (auth, search, title actions, cinema mode...)
services/            Firebase and TMDB access (one file per kind of data)
navigation/types.ts  Pages and their parameters
theme/               Colors and shared styles
```

This README was written by AI
