import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://res.nyne.dev/api/resource/search";
const BASE_URL = "https://res.nyne.dev/resources/";

interface NysoureItem {
  id: number;
  title: string;
}

interface NysoureResponse {
  success: boolean;
  data: NysoureItem[];
}

async function searchNysoure(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "Nysoure",
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL);
    url.searchParams.set("keyword", game);
    url.searchParams.set("page", "1");

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`API response status code is ${response.status}`);
    }

    const data = await response.json() as NysoureResponse;

    if (!data.success) {
      throw new Error("API returned success: false");
    }
    
    const items: SearchResultItem[] = data.data.map(item => ({
      name: item.title.trim(),
      url: BASE_URL + item.id,
    }));

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

const Nysoure: Platform = {
  name: "Nysoure",
  color: "gold",
  magic: true,
  search: searchNysoure,
};

export default Nysoure;