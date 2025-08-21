import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://koyso.to/";
const BASE_URL = "https://koyso.to";
const REGEX = /<a class="game_item" href="(?<URL>.+?)"\s*>.*?<span style="background-color: rgba\(128,128,128,0\)">(?<NAME>.+?)<\/span>/gs;

async function searchKoyso(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "Koyso",
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("keywords", game);

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`API response status code is ${response.status}`);
    }

    const html = await response.text();
    // --- DEBUGGING: Print the full HTML content ---
    // console.log("Koyso API HTML Response:", html.substring(0, 1000)); // Print first 1000 chars
    // --- END DEBUGGING ---

    const matches = html.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      if (match.groups?.NAME && match.groups?.URL) {
        items.push({
          name: match.groups.NAME.trim(),
          url: BASE_URL + encodeURIComponent(match.groups.URL),
        });
      }
    }

    searchResult.items = items;
    searchResult.count = items.length;

  } catch (error) {
    if (error instanceof Error) {
      searchResult.error = error.message;
    } else {
      searchResult.error = "An unknown error occurred";
    }
    searchResult.count = -1;
  }

  return searchResult;
}

const Koyso: Platform = {
  name: "Koyso",
  color: "lime",
  magic: false,
  search: searchKoyso,
};

export default Koyso;