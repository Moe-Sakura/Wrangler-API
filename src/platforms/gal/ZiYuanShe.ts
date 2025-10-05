import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

const BASE_URL = "https://galzy.eu.org";

async function searchZiYuanShe(game: string): Promise<PlatformSearchResult> {
  const searchResult: PlatformSearchResult = {
    name: "紫缘社",
    count: 0,
    items: [],
  };

  try {
    const response = await fetchClient(`${BASE_URL}/search?q=${encodeURIComponent(game)}`);

    if (!response.ok) {
      throw new Error(`资源平台 SearchAPI 响应异常状态码 ${response.status}`);
    }

    const html = await response.text();
    const tempContent = html.split('</script><script>self.__next_f.push([1,"')
    const scriptContent = tempContent[tempContent.length - 1].split('\\n"])</script></body></html>')[0];
    const cleanedScriptContent = scriptContent.substring(scriptContent.indexOf(':') + 1).replace(/\\"/g, '"');
    const jsonData = JSON.parse(cleanedScriptContent);
    
    const gameListData = jsonData[3].children[2][3].gameListData.hits;

    if (gameListData) {
      const items: SearchResultItem[] = gameListData.map((item: any) => ({
        name: (() => {
          const zhTitle = item.titles.find((title: any) => title.lang === 'zh-Hans');
          const jaTitle = item.titles.find((title: any) => title.lang === 'ja');
          if (zhTitle) {
            return zhTitle.title;
          }
          if (jaTitle) {
            return jaTitle.title;
          }
          return item.titles[0]?.title || '';
        })(),
        url: `${BASE_URL}/${item.id}`,
      }));
      searchResult.items = items;
      searchResult.count = items.length;
    }
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

const ZiYuanShe: Platform = {
  name: "紫缘社",
  color: "lime",
  magic: false,
  search: searchZiYuanShe,
};

export default ZiYuanShe;