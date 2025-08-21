import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.touchgal.us/api/search";
const BASE_URL = "https://www.touchgal.us/";

async function searchTouchGal(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "TouchGal",
    count: 0,
    items: [],
  };

  try {
    const payload = {
      queryString: JSON.stringify([{ type: "keyword", name: game }]),
      limit: 24, // Hardcoded as per original script
      searchOption: {
        searchInIntroduction: false,
        searchInAlias: true,
        searchInTag: false,
      },
      page: 1,
      selectedType: "all",
      selectedLanguage: "all",
      selectedPlatform: "all",
      sortField: "resource_update_time",
      sortOrder: "desc",
      selectedYears: ["all"],
      selectedMonths: ["all"],
    };

    const response = await fetchClient(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API response status code is ${response.status}`);
    }

    const data = await response.json() as { galgames: { name: string; uniqueId: string }[] };
    
    const items: SearchResultItem[] = data.galgames.map(item => ({
      name: item.name.trim(),
      url: BASE_URL + item.uniqueId,
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

const TouchGal: Platform = {
  name: "TouchGal",
  color: "lime",
  magic: false,
  search: searchTouchGal,
};

export default TouchGal;