import MediaListScreen from "./MediaListScreen";

export default function SeriesScreen() {
  return (
    <MediaListScreen
      mediaType="tv"
      newList="on_the_air"
      newListTitle="Recently airing"
    />
  );
}
