import { Region } from "react-native-maps";

import {
  getLAParkingLocations,
  getLAParkingOccupancy,
} from "./losAngelesParking";

export async function getParkingData(region: Region) {
  const locations = await getLAParkingLocations(region);

  const spaceIds = locations.map(
    (location: any) => location.spaceid
  );

  const occupancy = await getLAParkingOccupancy(spaceIds);

  return {
    locations,
    occupancy,
  };
}