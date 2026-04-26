# Lingo Cube - 项目文档

## 项目概述

Lingo Cube 是一个前后端分离的项目，前端 Vue 3 + TypeScript，后端 Go + Gin，支持独立部署。

## 技术栈

| 层     | 技术                          | 版本      |
| ------ | ----------------------------- | --------- |
| 前端   | Vue 3 + TypeScript + Vite     | latest    |
| 状态管理 | Pinia                       | latest    |
| 路由   | Vue Router 4                  | latest    |
| HTTP   | Axios                         | latest    |
| 后端   | Go + Gin                      | 1.16+     |
| 部署   | Docker + Nginx                | -         |

## 目录结构

```
lingo_cube/
├── Makefile                    # 根目录命令
├── docker-compose.yml          # 容器编排
├── .gitignore
├── lingo_cube_web/             # 前端项目 (Vue 3 + TS + Vite)
│   ├── src/
│   │   ├── api/                # API 请求封装
│   │   ├── assets/             # 静态资源 (图片、字体等)
│   │   ├── components/         # 公共可复用组件
│   │   ├── router/             # Vue Router 路由配置
│   │   ├── stores/             # Pinia 状态管理
│   │   ├── views/              # 页面级组件
│   │   ├── App.vue             # 根组件
│   │   ├── main.ts             # 应用入口
│   │   ├── style.css           # 全局样式
│   │   └── vite-env.d.ts       # Vite 类型声明
│   ├── Dockerfile              # 前端镜像 (多阶段构建: node build → nginx serve)
│   ├── nginx.conf              # Nginx 配置 (SPA fallback + API 代理)
│   ├── vite.config.ts          # Vite 配置 (@别名 + dev proxy)
│   ├── tsconfig.json
│   └── package.json
└── lingo_cube_server/          # 后端项目 (Go + Gin)
    ├── config/                 # 应用配置 (端口等)
    ├── handler/                # HTTP 请求处理器
    ├── middleware/              # 中间件 (CORS, Logger)
    ├── model/                  # 数据模型 / 响应格式
    ├── route/                  # 路由注册
    ├── service/                # 业务逻辑层
    ├── main.go                 # 入口文件
    ├── Dockerfile              # 后端镜像 (golang build → alpine run)
    └── go.mod / go.sum
```

## 开发命令

```bash
# ==================== 前端 ====================
cd lingo_cube_web

npm run dev          # 启动开发服务器 (端口 3000)
npm run build        # 生产构建 → dist/
npm run preview      # 预览生产构建

# ==================== 后端 ====================
cd lingo_cube_server

go run main.go       # 启动开发服务器 (端口 8080)
go build -o server . # 编译二进制
./server             # 运行编译产物

# ==================== 根目录 ====================
make dev-web         # 启动前端 dev
make dev-server      # 启动后端 dev
docker-compose up -d # Docker 一键部署
docker-compose down  # 停止 Docker
```

## API 规范

- 后端所有接口挂载在 `/api` 路径下
- 统一响应格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

- Vite dev server 自动将 `/api/*` 代理到 `http://localhost:8080`
- 生产环境由 Nginx 反向代理 `/api/` → `server:8080`

## 端口约定

| 环境     | 前端       | 后端       |
| -------- | ---------- | ---------- |
| 开发     | localhost:3000 | localhost:8080 |
| 生产     | 80         | 8080       |

## 前端代理配置

`vite.config.ts` 中配置了 dev proxy：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

## 注意事项

1. **Go 版本**：当前环境 Go 1.16，使用 Gin v1.7.7 兼容版本。如果升级 Go 到 1.21+，可以升级到最新 Gin。
2. **npm registry**：当前 npm 配置了 cnpmjs 镜像，网络不佳时可切换到 `https://registry.npmjs.org/`。
3. **前端构建**：`vue-tsc` 类型检查在 `npm run build` 时执行，开发模式下 `npm run dev` 跳过类型检查以获得更快的热更新。
4. **无 Git 仓库**：当前目录未初始化 Git，需要时请手动 `git init`。
