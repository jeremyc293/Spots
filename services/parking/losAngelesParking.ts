import { Region } from "react-native-maps";

export async function getLAParkingLocations(region: Region) {
  const north = region.latitude + region.latitudeDelta / 2;
  const south = region.latitude - region.latitudeDelta / 2;
  const east = region.longitude + region.longitudeDelta / 2;
  const west = region.longitude - region.longitudeDelta / 2;

  const where = encodeURIComponent(
    `within_box(latlng, ${north}, ${west}, ${south}, ${east})`
  );

  const url =
    `https://data.lacity.org/resource/s49e-q6j2.json?$where=${where}&$limit=200`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load LA parking locations");
  }

  return await response.json();
}

export async function getLAParkingOccupancy(spaceIds: string[]) {
  if (spaceIds.length === 0) {
    return [];
  }

  const ids = spaceIds
    .map((id) => `'${id}'`)
    .join(",");

  const where = encodeURIComponent(
    `spaceid in(${ids})`
  );

  const url =
    `https://data.lacity.org/resource/e7h6-4a3e.json?$where=${where}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load LA parking occupancy");
  }

  return await response.json();
}