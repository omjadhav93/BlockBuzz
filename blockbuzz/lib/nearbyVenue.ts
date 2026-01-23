export type NominatimResult = {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string; // added to distinguish between city, town, venue, etc.
    address: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
    };
};

/**
 * Search for cities matching a query string.
 */
export async function searchCities(query: string): Promise<NominatimResult[]> {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
            q: query,
            format: "json",
            addressdetails: "1",
            limit: "5",
            countrycodes: "IN",   // Only India
        })
    );
    const results: NominatimResult[] = await res.json();
    // Keep only city/town/village results
    return results.filter(r => ["city", "town", "village"].includes(r.type));
}

/**
 * Fetch venues for a given city. Excludes the city itself.
 */
export async function fetchVenuesInCity(lat: string, lon: string): Promise<NominatimResult[]> {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
            format: "json",
            addressdetails: "1",
            limit: "20",
            extratags: "1",
            q: "",
            viewbox: `${parseFloat(lon) - 0.05},${parseFloat(lat) - 0.05},${parseFloat(lon) + 0.05},${parseFloat(lat) + 0.05}`,
            bounded: "1",
        })
    );

    const results: NominatimResult[] = await res.json();

    // Filter out the city itself, keep places like amenities, buildings, leisure, etc.
    return results.filter(r => !["city", "town", "village", "administrative"].includes(r.type));
}

