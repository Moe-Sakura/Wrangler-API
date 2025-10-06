import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const DATA_URL = "https://peach.sslswwdx.top/page/search/index.json";

interface TaoHuaYuanItem {
  title: string;
  permalink: string;
}

async function searchTaoHuaYuan(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    count: 0,
    items: [],
  };

  try {
    const response = await fetchClient(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${DATA_URL}`);
    }

    const data = await response.json() as TaoHuaYuanItem[];
    
    const items: SearchResultItem[] = data
      .filter(item => item.title.includes(game))
      .map(item => ({
        name: item.title.trim(),
        url: item.permalink,
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

const TaoHuaYuan: Platform = {
  name: "桃花源",
  color: "lime",
  tags: ["NoReq", "SuDrive"],
  magic: false,
  search: searchTaoHuaYuan,
};

export default TaoHuaYuan;