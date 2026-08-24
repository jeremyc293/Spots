export async function getParkingOccupancy() {
  const url =
    "https://data.lacity.org/resource/e7h6-4a3e.json?$order=eventtime DESC&$limit=50";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load parking occupancy");
  }

  return await response.json();
}

export async function getParkingLocations(spaceIds: string[]) {
  if (spaceIds.length === 0) {
    return [];
  }

  const ids = spaceIds.map((id) => `'${id}'`).join(",");

  const where = encodeURIComponent(`spaceid in(${ids})`);

  const url =
    `https://data.lacity.org/resource/s49e-q6j2.json?$where=${where}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load parking locations");
  }

  return await response.json();
}