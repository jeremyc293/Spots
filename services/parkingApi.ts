export async function getParkingOccupancy() {
  const url =
    "https://data.lacity.org/resource/e7h6-4a3e.json?$limit=20";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load parking data");
  }

  const data = await response.json();

  return data;
}