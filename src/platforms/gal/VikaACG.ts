import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const API_URL = "https://www.vikacg.com/wp-json/b2/v1/getPostList";

// The Python code suggests the response text itself might be a JSON string
// that contains escaped HTML. Let's try to parse it as JSON first.
// The regex is applied to the *unescaped* string.
const REGEX = /<h2><a  target="_blank" href="(?<URL>.*?)" title="(?<NAME>.*?)"/gs;

async function searchVikaACG(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "VikaACG",
    count: 0,
    items: [],
  };

  try {
    const payload = {
      paged: 1,
      post_paged: 1,
      post_count: 1000, // Corresponds to MAX_RESULTS
      post_type: "post-1",
      post_cat: [6],
      post_order: "modified",
      post_meta: [
        "user", "date", "des", "cats", "like", "comment", "views", "video", "download", "hide",
      ],
      metas: {},
      search: game,
    };

    const response = await fetchClient(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const rawText = await response.text();
    let htmlContent: string;

    try {
        // Attempt to parse as JSON first. If it's a JSON string containing HTML,
        // JSON.parse will handle standard escapes like \uXXXX.
        const parsedJson = JSON.parse(rawText);
        // Assuming the HTML content is directly the value of the JSON, or a specific field.
        // The Python code implies the entire response text, after unescaping, is the HTML.
        // So, if parsedJson is a string, use it. Otherwise, stringify it.
        htmlContent = typeof parsedJson === 'string' ? parsedJson : JSON.stringify(parsedJson);
    } catch (jsonError) {
        // If JSON.parse fails, it might be due to non-standard Python escapes like \\/ or \\\\
        // Attempt a simple unescape for these specific cases.
        // Note: This is a simplified unescape and might not cover all Python's unicode_escape nuances.
        const unescapedText = rawText.replace(/\\(.)/g, '$1'); // Replaces \\/ with / and \\\\ with \
        try {
            htmlContent = JSON.parse(unescapedText); // Try parsing as JSON again
        } catch (finalError) {
            // If still fails, assume it's raw HTML that just needs basic unescaping
            htmlContent = unescapedText;
        }
    }

    const matches = htmlContent.matchAll(REGEX);

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