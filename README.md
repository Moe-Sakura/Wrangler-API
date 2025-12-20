# Wrangler-API

Cloudflare Workers 版 SearchGal 聚合搜索 API。

提供 `/gal` 和 `/patch` 两个入口，接收游戏名并以 SSE 流式返回各平台搜索结果。

## 准备

- Node.js（Win 需要） 与 pnpm
- Cloudflare 账号（发布时需要）

## 安装

### POSIX

```sh
## 安装 pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

## 安装依赖
pnpm install
```

### Windows

```sh
## 安装 Node.js
winget install -e --id OpenJS.NodeJS

## 安装 pnpm
npx pnpm@latest-10 dlx @pnpm/exe@latest-10 setup

## 安装依赖
pnpm install
```

## 开发

```sh
# 纯本地（无 Cloudflare 登录）
npx wrangler dev --local

# 实时连 Cloudflare
npx wrangler dev
```

## 运行

```sh
npx wrangler dev --ip 0.0.0.0
```

## 发布

```sh
npx wrangler login   # 首次需要
npx wrangler publish
```

## API 使用

- 路径：`POST /gal` 或 `POST /patch`
- Content-Type：`multipart/form-data`
- 表单字段：`game` (string)
- 响应：`text/event-stream`，每行是一条 JSON，示例：

```json
{"total":33}
{"progress":{"completed":1,"total":33}}
{"progress":{"completed":2,"total":33},"result":{"name":"某平台","color":"lime","tags":["NoReq"],"items":[{"name":"Title","url":"https://..."}]}}
{"done":true}
```

## 标签说明（tags）

- `NoReq`：无需登录/回复即可拿到下载信息
- `Login`：需登录后访问
- `LoginPay`：需登录且支付积分
- `LoginRep`：需登录并回复/评论解锁
- `Rep`：需回复/评论但无需登录
- `SuDrive`：自建网盘盘源
- `NoSplDrive`：不限速网盘盘源（如Onedrive/Mega等）
- `SplDrive`：限速网盘盘源（如百度/夸克/天翼等）
- `MixDrive`：不限速与限速网盘盘源混合，可能提供多种下载形式
- `BTmag`：BT或磁力链接
- `magic`：站点需要代理访问

## 目录速览

- `src/index.ts` Worker 入口，路由 `/gal`、`/patch`
- `src/core.ts` 处理并行搜索与 SSE 组装
- `src/platforms/gal` GAL 平台搜集器
- `src/platforms/patch` 补丁平台搜集器
- `src/utils/httpClient.ts` 统一请求封装
- `scripts/generate-indices.js` 可选的索引生成脚本
