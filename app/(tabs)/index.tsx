import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spots</Text>
      <Text style={styles.subtitle}>Find your spot.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 42,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 18,
    marginTop: 10,
  },
});