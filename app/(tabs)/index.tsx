import { useEffect, useRef, useState } from "react";
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
  getParkingLocationsInArea,
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

  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentRegionRef = useRef<Region>(mapRegion);

  const loadingRef = useRef(false);

  async function loadParkingData(region: Region) {
    if (loadingRef.current) {
      console.log("Parking request skipped");
      return;
    }

    loadingRef.current = true;

    try {
      const locationData =
        await getParkingLocationsInArea(region);

      const spaceIds = locationData.map(
        (location: any) => location.spaceid
      );

      const occupancyData =
        await getParkingOccupancy(spaceIds);

      const spots: ParkingSpot[] = [];

      occupancyData.forEach((parking: any) => {
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
            blockface:
              location.blockface || "Unknown street",
            occupancystate: parking.occupancystate,
          });
        }
      });

      setParkingSpots(spots);

      console.log(
        "Nearby vacant spots:",
        spots.length
      );
    } catch (error) {
      console.log("Parking error:", error);
    } finally {
      loadingRef.current = false;
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

      const location =
        await Location.getCurrentPositionAsync({});

      setUserLocation(location);

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setMapRegion(region);
      currentRegionRef.current = region;
    }

    getLocation();

    const interval = setInterval(() => {
      loadParkingData(currentRegionRef.current);
    }, 60000);

    return () => {
      clearInterval(interval);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleSearch() {
    if (!address.trim()) {
      return;
    }

    const results =
      await Location.geocodeAsync(address);

    if (results.length === 0) {
      Alert.alert("Address not found");
      return;
    }

    const location = {
      latitude: results[0].latitude,
      longitude: results[0].longitude,
    };

    setSearchedLocation(location);

    const newRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(newRegion);
    currentRegionRef.current = newRegion;

    await loadParkingData(newRegion);
  }

  function handleMapMove(region: Region) {
    setMapRegion(region);
    currentRegionRef.current = region;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      loadParkingData(region);
    }, 1500);
  }

  function recenterMap() {
    if (!userLocation) {
      Alert.alert("Current location is not available yet.");
      return;
    }

    const region = {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(region);
    currentRegionRef.current = region;

    loadParkingData(region);
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
          <Text style={styles.searchButtonText}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.spotCount}>
          {parkingSpots.length} vacant spots nearby
        </Text>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={recenterMap}
        >
          <Text style={styles.locationButtonText}>
            Recenter on Me
          </Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={handleMapMove}
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
          Location permission is needed to find
          spots near you.
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

  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  spotCount: {
    fontSize: 15,
    fontWeight: "bold",
  },

  locationButton: {
    backgroundColor: "#eeeeee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  locationButtonText: {
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