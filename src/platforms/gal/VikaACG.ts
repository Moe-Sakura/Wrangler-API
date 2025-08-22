import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.vikacg.com/wp-json/b2/v1/getPostList";
const REGEX = /<h2><a  target="_blank" href="(?<URL>.*?)">(?<NAME>.*?)<\/a>/gs;

async function searchVikaACG(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "VikaACG",
    count: 0,
    items: [],
  };

  try {
    const response = await fetchClient(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paged: 1,
        post_paged: 1,
        post_count: 1000, // Hardcoded limit, larger values may cause timeouts
        post_type: "post-1",
        post_cat: [6],
        post_order: "modified",
        post_meta: [
          "user",
          "date",
          "des",
          "cats",
          "like",
          "comment",
          "views",
          "video",
          "download",
          "hide",
        ],
        metas: {},
        search: game,
      }),
    });

    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    // The response is a JSON-encoded string containing HTML.
    // .json() will parse the JSON and unescape the string content.
    const html: string = await response.text();
    
    const matches = html.replaceAll('\\/', '/').replaceAll('\\\\', '\\').matchAll(REGEX);

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

const VikaACG: Platform = {
  name: "VikaACG",
  color: "gold",
  magic: true,
  search: searchVikaACG,
};

export default VikaACG;