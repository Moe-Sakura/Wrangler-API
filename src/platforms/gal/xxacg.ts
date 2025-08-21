import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const REGEX = /<h4 class="entry-title title"><a href="(?<URL>.*?)">(?<NAME>.*?)<\/a><\/h4>/gs;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

async function searchXxacg(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "xxacg",
    count: 0,
    items: [],
  };
  
  let html = ""; // 将 html 变量提升到 try 块外部

  try {
    const url = new URL("https://xxacg.net/");
    url.searchParams.set("s", game);

    const response = await fetchClient(url);
    if (!response.ok) {
      throw new Error(`Search 资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    html = await response.text();
    const matches = html.matchAll(REGEX);

    const items: SearchResultItem[] = [];
    for (const match of matches) {
      if (match.groups?.NAME && match.groups?.URL) {
        items.push({
          name: stripHtml(match.groups.NAME),
          url: match.groups.URL,
        });
      }
    }
    
    if (items.length === 0 && html.length > 0) {
        // 如果没有匹配项，但我们确实收到了 HTML，这可能意味着页面结构已更改。
        // 将部分 HTML 包含在错误中以供调试。
        throw new Error(`No matches found on page. HTML starts with: ${html.substring(0, 500)}`);
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

const xxacg: Platform = {
  name: "xxacg",
  color: "gold",
  magic: true,
  search: searchXxacg,
};

export default xxacg;