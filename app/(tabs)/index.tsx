import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";

import {
  getParkingLocations,
  getParkingOccupancy,
} from "../../services/parkingApi";

type ParkingSpot = {
  spaceid: string;
  latitude: number;
  longitude: number;
  blockface: string;
  occupancystate: string;
};

export default function HomeScreen() {
  const [locationPermission, setLocationPermission] = useState(false);

  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  const [address, setAddress] = useState("");

  const [searchedLocation, setSearchedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);

  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  async function loadParkingData() {
    try {
      const occupancyData = await getParkingOccupancy();

      const latestSpaces: any[] = [];

      occupancyData.forEach((parking: any) => {
        const alreadyAdded = latestSpaces.find(
          (spot) => spot.spaceid === parking.spaceid
        );

        if (!alreadyAdded) {
          latestSpaces.push(parking);
        }
      });

      const spaceIds = latestSpaces.map(
        (parking) => parking.spaceid
      );

      const locationData = await getParkingLocations(spaceIds);

      const spots: ParkingSpot[] = [];

      latestSpaces.forEach((parking: any) => {
        const location = locationData.find(
          (item: any) => item.spaceid === parking.spaceid
        );

        if (
          location &&
          location.latlng &&
          parking.occupancystate === "VACANT"
        ) {
          spots.push({
            spaceid: parking.spaceid,
            latitude: Number(location.latlng.latitude),
            longitude: Number(location.latlng.longitude),
            blockface: location.blockface || "Unknown street",
            occupancystate: parking.occupancystate,
          });
        }
      });

      setParkingSpots(spots);

      console.log("Vacant parking spots:", spots);
    } catch (error) {
      console.log("Parking error:", error);
    }
  }

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

      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    getLocation();

    loadParkingData();

    const interval = setInterval(() => {
      loadParkingData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  async function handleSearch() {
    if (!address.trim()) {
      return;
    }

    const results = await Location.geocodeAsync(address);

    if (results.length === 0) {
      Alert.alert("Address not found");
      return;
    }

    const location = {
      latitude: results[0].latitude,
      longitude: results[0].longitude,
    };

    setSearchedLocation(location);

    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
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
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
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

        {searchedLocation && (
          <Marker
            coordinate={searchedLocation}
            title="Searched Location"
          />
        )}

        {parkingSpots.map((spot) => (
          <Marker
            key={spot.spaceid}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            title="Available Parking"
            description={spot.blockface}
            pinColor="green"
          />
        ))}
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