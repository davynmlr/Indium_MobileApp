// Films tab of the Home screen.
import MediaListScreen from "./MediaListScreen";

export default function FilmsScreen() {
  return (
    <MediaListScreen
      mediaType="movie"
      newList="now_playing"
      newListTitle="New releases"
    />
  );
}
