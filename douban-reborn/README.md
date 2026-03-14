# 映场

一个从零搭建的电影评分与评论站点，目标是替代失真的传统电影评分页。

## 已实现

- 自动抓取豆瓣“正在上映”片单
- SQLite 持久化电影、评论和同步记录
- 电影详情页、社区评分和评论发布
- 访问时自动检查数据是否过期
- Windows 计划任务支持开机启动和定时同步
- 生产构建与本地公网暴露

## 本地运行

```bash
npm install
npm run dev
```

生产模式：

```bash
npm run build
npm run start
```

手动同步豆瓣片单：

```bash
npm run sync
```

安装 Windows 计划任务：

```bash
npm run setup:tasks
```

## 环境变量

参考 [`.env.example`](./.env.example)：

- `DOUBAN_CITY_SLUG`：豆瓣城市 slug，默认 `beijing`
- `DOUBAN_CITY_NAME`：站内展示城市名，默认 `北京`
- `SYNC_WINDOW_HOURS`：页面自动检查同步的过期窗口，默认 `3`
- `SYNC_SECRET`：保护 `/api/admin/sync` 的触发密钥

## 技术栈

- Next.js 16 + App Router
- React 19
- Tailwind CSS 4
- better-sqlite3
- Cheerio

## 部署说明

当前项目已经适配自托管场景。若需要更稳定的正式线上域名，建议后续补充：

- Cloudflare 账户与 named tunnel
- 或任意云主机 / 容器平台凭据

在没有云平台账号的情况下，也可以先使用 `cloudflared tunnel --url http://localhost:3000` 暴露公网临时地址。
