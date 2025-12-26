<div align="center">

# Wrangler-API

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](./LICENSE)


**Cloudflare Workers 版 SearchGal 聚合搜索 API**

🚀 **极速响应** | 🌊 **SSE 流式传输** | 🎮 **多平台聚合**

[快速部署](#quick-start) • [API 文档](#api-doc) • [开发者接入指南](#dev-guide)

</div>

---

## 📖 简介

本项目是一个基于 Cloudflare Workers 的聚合搜索 API，专为 Galgame 资源搜索设计。它提供 `/gal` 和 `/patch` 两个主要入口，接收游戏名称后，通过 Server-Sent Events (SSE) 流式返回各大 Galgame 论坛和资源站的搜索结果。

<a id="quick-start"></a>

## 🚀 快速部署

### ☁️ 一键云部署

[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://deploy.workers.cloudflare.com/?url=https://github.com/Moe-Sakura/Wrangler-API)
[![Deploy to Koyeb](https://img.shields.io/badge/Deploy%20to-Koyeb-121212?style=for-the-badge&logo=koyeb&logoColor=white)](https://app.koyeb.com/deploy?type=git&name=wrangler-api&repository=github.com/Moe-Sakura/Wrangler-API&branch=main&builder=dockerfile&ports=8787;http;/)
[![Run on Google Cloud](https://img.shields.io/badge/Run%20on-Google%20Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://deploy.cloud.run?git_repo=https://github.com/Moe-Sakura/Wrangler-API&revision=main)

### 🧭 服务器性能参考（硬件配置）

> 以下为通用建议，适用于自建部署或容器化运行场景。此项目主要消耗在外部请求与解析，内存压力通常较低。

| 档位 | CPU | 内存 | 网络 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| 最低 | 1 vCPU | 512 MB–1 GB | 1-5 Mbps | 低并发 |
| 推荐 | 2 vCPU | 1–2 GB | 5-20 Mbps | 中小规模并发 |
| 高并发 | 4 vCPU+ | 2–4 GB | 20 Mbps+ | 高并发 |

---

### 环境准备

- **Node.js**: 推荐最新 LTS 版本 (Windows 用户必需)
- **pnpm**: 包管理工具
- **Cloudflare 账号**: 用于发布 (本地开发可选)

### 安装依赖

```bash
# 安装 pnpm (如果未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 本地开发

```bash
# 启动本地开发服务器 (模拟 Cloudflare 环境)
npx wrangler dev

# 纯本地模式 (不连接 Cloudflare)
npx wrangler dev --local
```

### Docker / Podman 部署

如果您更喜欢使用容器化部署：

```bash
# 启动服务
podman-compose up -d

# 查看日志
podman-compose logs -f
```

---

<a id="api-doc"></a>

## 📡 API 文档

### 搜索接口

- **路径**: `POST /gal` (游戏) 或 `POST /patch` (补丁)
- **Content-Type**: `multipart/form-data` 或 `application/json`
- **参数**: `game` (string) - 搜索关键词

### 响应格式

响应采用 **Server-Sent Events (SSE)** 流式传输，每行是一个 JSON 对象。

**示例流:**

```json
{"total": 10}                                                                  // 1. 预计总搜索源数量
{"progress": {"completed": 1, "total": 10}}                                    // 2. 进度更新
{"progress": {"completed": 2, "total": 10}, "result": { ... }}                 // 3. 搜索结果 (见下文)
{"done": true}                                                                 // 4. 结束信号
```

**Result 对象结构:**

```json
{
  "name": "某平台",
  "color": "lime",
  "tags": ["NoReq"],
  "items": [
    {
      "name": "游戏标题",
      "url": "https://example.com/detail/123"
    }
  ]
}
```

### 🏷️ 标签说明 (Tags)

| 标签 | 含义 | 说明 |
| :--- | :--- | :--- |
| `NoReq` | **无门槛** | 无需登录、无需回复即可获取资源 |
| `Login` | **需登录** | 需要注册并登录账号 |
| `LoginPay` | **需付费** | 需要登录且消耗积分/货币 |
| `LoginRep` | **需回复** | 需要登录并回复/评论 |
| `Rep` | **需回复** | 需回复但无需登录 (较少见) |
| `SuDrive` | **自建盘** | 站点自建网盘，速度通常较快 |
| `NoSplDrive` | **不限速** | 使用 OneDrive, Mega, Google Drive 等不限速网盘 |
| `SplDrive` | **限速盘** | 使用 百度网盘, 夸克, 天翼 等可能限速的网盘 |
| `MixDrive` | **混合盘** | 包含多种网盘链接 |
| `BTmag` | **BT/磁力** | 提供种子或磁力链接 |
| `magic` | **魔法** | 站点可能被墙，需要代理访问 |

---


<a id="dev-guide"></a>

## 🤝 面向 Galgame 网站开发者：如何接入

如果您是 Galgame 资源站的站长或开发者，欢迎将您的站点接入到本聚合搜索中。接入过程非常简单，只需三步。

### 1. 创建适配器文件

在 `src/platforms/gal/` 目录下创建一个新的 TypeScript 文件，例如 `MyGalSite.ts`。

### 2. 实现 Platform 接口

复制以下模板代码，并根据您站点的搜索逻辑进行修改：

```typescript
import { fetchClient } from "../../utils/httpClient";
import type { Platform, PlatformSearchResult, SearchResultItem } from "../../types";

// 1. 定义站点配置
const SITE_NAME = "我的Gal站";
const API_URL = "https://api.mygalsite.com/search"; // 您的搜索接口或页面URL
const DETAIL_BASE_URL = "https://mygalsite.com/game/";

// 2. 定义接口返回类型 (根据实际情况修改)
interface MySiteResponse {
  code: number;
  data: {
    id: string;
    title: string;
  }[];
}

// 3. 实现搜索函数
async function searchMySite(game: string): Promise<PlatformSearchResult> {
  const result: PlatformSearchResult = { count: 0, items: [] };

  try {
    // 构造请求
    const url = new URL(API_URL);
    url.searchParams.set("q", game); // 根据实际参数名修改

    // 发起请求 (fetchClient 已封装 User-Agent 等通用头)
    const response = await fetchClient(url);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // 解析数据 (如果是 HTML 页面，可以使用正则表达式提取)
    const data = await response.json() as MySiteResponse;

    // 转换为统一格式
    const items: SearchResultItem[] = data.data.map(item => ({
      name: item.title.trim(),
      url: `${DETAIL_BASE_URL}${item.id}`,
    }));

    result.items = items;
    result.count = items.length;

  } catch (error) {
    // 错误处理
    result.error = error instanceof Error ? error.message : "Unknown error";
    result.count = -1; // -1 表示搜索出错
  }

  return result;
}

// 4. 导出配置对象
const MyGalSite: Platform = {
  name: SITE_NAME,
  color: "blue", // 也就是前端显示的颜色，支持 hex 或颜色名
  tags: ["NoReq", "SuDrive"], // 标签见上文说明
  magic: false, // 是否需要代理访问
  search: searchMySite,
};

export default MyGalSite;
```

### 3. 注册适配器

无需手动修改代码，只需运行以下命令即可自动注册所有适配器：

```bash
npm run generate
# 或者
pnpm run generate
```

该脚本会自动扫描 `src/platforms/gal/` 目录下的文件并更新索引。

### 4. 提交 Pull Request

完成上述步骤后，请将您的更改提交到 GitHub：

1.  Fork 本仓库
2.  提交您的更改 (`git commit -m "feat: add MyGalSite adapter"`)
3.  推送到您的 Fork (`git push origin main`)
4.  在 GitHub 上发起 Pull Request

我们会尽快审核并合并您的代码，感谢您的贡献！🎉

---

## 📂 项目结构

```text
src/
├── index.ts                # Worker 入口，路由定义
├── core.ts                 # 核心逻辑：并行搜索与 SSE 组装
├── types.ts                # 类型定义
├── utils/
│   └── httpClient.ts       # 统一 HTTP 请求封装
└── platforms/
    ├── gal/                # GAL 游戏平台适配器集合
    │   ├── index.ts        # GAL 平台注册表
    │   └── ...             # 各平台实现
    └── patch/              # 补丁平台适配器集合
```

## 📜 许可证

[MIT](./LICENSE) © Wrangler-API
