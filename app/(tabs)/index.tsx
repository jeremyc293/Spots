import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    async function getLocationPermission() {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setLocationPermission(true);
      }
    }

    getLocationPermission();
  }, []);

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

      {!locationPermission && (
        <Text style={styles.permissionText}>
          Location permission is needed to find spots near you.
        </Text>
      )}
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

  permissionText: {
    textAlign: "center",
    padding: 12,
  },
});