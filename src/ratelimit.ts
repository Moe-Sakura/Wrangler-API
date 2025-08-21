// --- 速率限制常量 ---
const SEARCH_INTERVAL_SECONDS = 15;
// KV 条目将在此秒数后自动过期，以防止存储膨胀
const IP_ENTRY_TTL_SECONDS = 60; 

/**
 * 检查给定 IP 地址是否超出了速率限制。
 * @param ip 客户端的 IP 地址。
 * @param kvNamespace 用于存储 IP 时间戳的 KV 命名空间。
 * @returns 返回一个对象，包含是否允许请求以及剩余的等待秒数。
 */
export async function checkRateLimit(
  ip: string,
  kvNamespace: KVNamespace
): Promise<{ allowed: boolean; retryAfter: number }> {
  const currentTime = Math.floor(Date.now() / 1000);
  const lastSearchTimeStr = await kvNamespace.get(ip);
  const lastSearchTime = lastSearchTimeStr ? parseInt(lastSearchTimeStr, 10) : 0;

  if (lastSearchTime && (currentTime - lastSearchTime) < SEARCH_INTERVAL_SECONDS) {
    return {
      allowed: false,
      retryAfter: SEARCH_INTERVAL_SECONDS - (currentTime - lastSearchTime),
    };
  }

  // 更新 IP 的最后搜索时间，并设置 TTL
  await kvNamespace.put(ip, currentTime.toString(), {
    expirationTtl: IP_ENTRY_TTL_SECONDS,
  });

  return {
    allowed: true,
    retryAfter: 0,
  };
}