export async function getParkingOccupancy() {
  const url =
    "https://data.lacity.org/resource/e7h6-4a3e.json?$limit=20";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load parking occupancy");
  }

  return await response.json();
}

export async function getParkingLocations() {
  const url =
    "https://data.lacity.org/resource/s49e-q6j2.json?$limit=100";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load parking locations");
  }

  return await response.json();
}