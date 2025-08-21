import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.galgamex.net/api/search";
const BASE_URL = "https://www.galgamex.net/";

interface GalgameXItem {
  name: string;
  uniqueId: string;
}

interface GalgameXResponse {
  galgames: GalgameXItem[];
}

async function searchGalgameX(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "Galgamex",
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

    const data = await response.json() as GalgameXResponse;
    
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

const GalgameX: Platform = {
  name: "Galgamex",
  color: "lime",
  magic: false,
  search: searchGalgameX,
};

export default GalgameX;