import { StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spots</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 40.7128,
          longitude: -74.006,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 10,
  },

  map: {
    flex: 1,
  },
});