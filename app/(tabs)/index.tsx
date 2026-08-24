import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [locationPermission, setLocationPermission] = useState(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  const [address, setAddress] = useState("");

  useEffect(() => {
    async function getLocation() {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      setLocationPermission(true);

      const location = await Location.getCurrentPositionAsync({});

      setUserLocation(location);
    }

    getLocation();
  }, []);

  function handleSearch() {
    console.log("Searching for:", address);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spots</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter an address"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        region={
          userLocation
            ? {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : {
                latitude: 40.7128,
                longitude: -74.006,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
        }
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Your Location"
          />
        )}
      </MapView>

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

  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },

  searchButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 8,
  },

  searchButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  map: {
    flex: 1,
  },

  permissionText: {
    textAlign: "center",
    padding: 12,
  },
});