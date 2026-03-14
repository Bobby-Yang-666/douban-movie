# 映场

一个面向真实影迷口碑的电影评分与评论站点，会自动同步豆瓣“正在上映”片单。

## 当前架构

- Next.js 16 + App Router
- React 19
- Tailwind CSS 4
- Postgres
- Cheerio 抓取豆瓣上映页
- Vercel Cron 触发自动同步

## 已实现

- 自动抓取豆瓣“正在上映”片单
- 电影列表页、详情页、社区评分与评论
- Postgres 持久化电影、评论和同步记录
- 页面访问时自动检查数据是否过期
- 适配 Vercel 的每日 Cron

## 本地运行

先准备 Postgres 连接串并写入环境变量：

```bash
cp .env.example .env.local
```

然后安装依赖并启动：

```bash
npm install
npm run dev
```

## 手动同步

```bash
npm run sync
```

## 生产构建

```bash
npm run build
npm run start
```

## Vercel 部署

1. 在 Vercel 中创建项目并连接当前 GitHub 仓库
2. 在 Vercel Marketplace 中添加 Postgres 集成
3. 配置环境变量：

- `POSTGRES_URL` 或 `DATABASE_URL`
- `DOUBAN_CITY_SLUG`
- `DOUBAN_CITY_NAME`
- `SYNC_WINDOW_HOURS`
- `SYNC_SECRET`
- `CRON_SECRET`

4. 部署后，`vercel.json` 会每天触发一次 `/api/cron/sync`

说明：

- 当前官方已经不再提供旧版独立的 “Vercel Postgres”，新项目应通过 Vercel Marketplace 的 Postgres 集成来接入数据库。
- 如果你使用的是 Vercel Hobby，Cron 频率建议保持“每天一次”；更高频率通常需要更高计划。

## 环境变量

参考 [`.env.example`](./.env.example)

- `DATABASE_URL`：标准 Postgres 连接串
- `POSTGRES_URL`：Vercel / Marketplace 常见注入变量
- `DOUBAN_CITY_SLUG`：豆瓣城市 slug，默认 `beijing`
- `DOUBAN_CITY_NAME`：页面展示城市名，默认 `北京`
- `SYNC_WINDOW_HOURS`：页面访问时判定数据过期的小时数，默认 `3`
- `SYNC_SECRET`：手动触发 `/api/admin/sync` 的密钥
- `CRON_SECRET`：Vercel Cron 调用 `/api/cron/sync` 的密钥
