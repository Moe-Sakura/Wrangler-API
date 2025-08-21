import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.tiangal.com/search/";
const REGEX = /<\/i><\/a><h2><a href="(?<URL>.*?)" title="(?<NAME>.*?)"/gs;

async function searchTianYouErCiYuan(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "天游二次元",
    count: 0,
    items: [],
  };

  try {
    const url = new URL(API_URL + encodeURIComponent(game)); // URL path parameter
    
    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`API response status code is ${response.status}`);
    }

    const html = await response.text();
    const matches = html.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      if (match.groups?.NAME && match.groups?.URL) {
        items.push({
          name: match.groups.NAME.trim(),
          url: match.groups.URL,
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

const TianYouErCiYuan: Platform = {
  name: "天游二次元",
  color: "gold",
  magic: true,
  search: searchTianYouErCiYuan,
};

export default TianYouErCiYuan;