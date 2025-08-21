import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://05fx.022016.xyz/api/fs/search";
const BASE_URL = "https://05fx.022016.xyz";

interface ZeroFiveItem {
  name: string;
  parent: string;
}

interface ZeroFiveResponse {
  message: string;
  data: {
    content: ZeroFiveItem[];
    total: number;
  };
}

async function searchZeroFive(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "05的资源小站",
    count: 0,
    items: [],
  };

  try {
    const payload = {
      parent: "/",
      keywords: game,
      scope: 0,
      page: 1,
      per_page: 999999, // Corresponds to MAX_RESULTS
      password: "",
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

    const data = await response.json() as ZeroFiveResponse;

    if (data.message !== "success") {
      throw new Error(`API returned an error: ${data.message}`);
    }

    const items: SearchResultItem[] = data.data.content.map(item => ({
      name: item.name.trim(),
      url: BASE_URL + item.parent + "/" + item.name,
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

const ZeroFive: Platform = {
  name: "05的资源小站",
  color: "lime",
  magic: false,
  search: searchZeroFive,
};

export default ZeroFive;