// Details page: TMDB rating, app users' average, language and seasons.

import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { TmdbMediaDetails } from "../../services/tmdb";
import type { AverageRating } from "../../hooks/useTitleActions";
import { colors } from "../../theme/colors";

type Props = {
  details: TmdbMediaDetails;
  average: AverageRating;
};

export default function StatsRow({ details, average }: Props) {
  return (
    <View style={styles.stats}>
      <View style={styles.stat}>
        <Ionicons name="star" size={18} color={colors.accent} />
        <Text style={styles.value}>
          {details.vote_average ? details.vote_average.toFixed(1) : "-"}
        </Text>
        <Text style={styles.label}>Rating</Text>
      </View>
      <View style={styles.stat}>
        <Ionicons name="people" size={18} color={colors.accent} />
        <Text style={styles.value}>
          {average.average ? `${average.average.toFixed(1)}/5` : "-"}
        </Text>
        <Text style={styles.label}>
          {average.count} {average.count === 1 ? "review" : "reviews"}
        </Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.value}>
          {details.original_language?.toUpperCase() ?? "-"}
        </Text>
        <Text style={styles.label}>Language</Text>
      </View>
      {details.number_of_seasons ? (
        <View style={styles.stat}>
          <Text style={styles.value}>{details.number_of_seasons}</Text>
          <Text style={styles.label}>Seasons</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    justifyContent: "space-around",
    marginTop: 20,
    paddingVertical: 14,
  },
  stat: { alignItems: "center", minWidth: 72 },
  value: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 4 },
  label: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
});
