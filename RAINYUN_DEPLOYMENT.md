# 雨云部署操作手册

## 1. 推荐的服务器规格

MVP 推荐选择雨云香港 Linux 云服务器：

- Ubuntu 22.04 或 24.04
- 2 vCPU
- 2 GB 内存
- 20 GB 以上磁盘
- 公网 IPv4

运行时本身不需要持续占用大量 CPU

2 GB 内存主要用于 Docker 镜像构建 Nuxt 构建和 Kuromoji 词典初始化

## 2. 需要开放的端口

在雨云安全组或防火墙中开放：

- `22/tcp`: SSH 管理
- `80/tcp`: HTTP
- `443/tcp`: HTTPS
- `443/udp`: HTTP/3

不要把 Nuxt 的 `3000` 端口直接开放到公网

Caddy 和 Nuxt 通过 Docker 内部网络通信

## 3. 安装 Docker

登录服务器后执行：

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

退出 SSH 并重新登录后检查：

```bash
docker --version
docker compose version
```

## 4. 获取项目

在准备部署的分支通过审查并推送后执行：

```bash
git clone git@github.com:MalloyManga/Ark_of_words.git
cd Ark_of_words
git switch <准备部署的分支或主分支>
```

当前 Codex 本地分支尚未推送 在你确认前服务器无法取得这些提交

## 5. 配置访问地址

复制环境变量模板：

```bash
cp .env.example .env
```

没有域名时保持：

```dotenv
SITE_ADDRESS=:80
```

部署后通过 `http://服务器公网IP` 访问

有域名并完成 DNS A 记录后改成：

```dotenv
SITE_ADDRESS=example.com
```

Caddy 会自动申请和续期 HTTPS 证书

## 6. 首次构建和启动

```bash
docker compose build
docker compose up -d
```

Docker 构建阶段会执行以下关键检查：

1. `npm ci` 按 lockfile 安装固定依赖
2. `npm run build` 生成 Nuxt node-server
3. 检查 `.output/server/node_modules/kuromoji/dict` 是否存在
4. 缺少词典时立即让镜像构建失败 不启动不完整服务

## 7. 验证运行状态

```bash
docker compose ps
docker compose logs --tail=100 app
curl --fail http://127.0.0.1/api/health
```

健康接口正常返回示例：

```json
{"status":"ok","timestamp":"2026-07-17T00:00:00.000Z"}
```

然后在浏览器测试：

1. 首页和难度选择页
2. 六位干员目录
3. 展开干员后获取 38 条语音
4. 自由选择后进入练习
5. 简单 中等 困难各显示 30 题
6. 日文和罗马字输入判定
7. 当前题目音频播放

## 8. 缓存为什么不会随容器更新消失

Compose 将 Nitro 的 `/app/.data` 挂载到 `nitro_data` named volume

容器内部路径：

```text
/app/.data/cache
```

这里保存 PRTS 目录 语音文本 读音单元和立绘 URL 的 Nitro 文件缓存

更新镜像和重新创建 app 容器不会删除 named volume

不要执行：

```bash
docker compose down -v
```

`-v` 会主动删除缓存卷

普通停止使用：

```bash
docker compose down
```

## 9. 更新版本

```bash
git pull --ff-only
docker compose build app
docker compose up -d
docker compose ps
```

Caddy 数据卷和 Nitro 缓存卷会继续保留

## 10. 查看日志和资源

```bash
docker compose logs -f --tail=100 app
docker compose logs -f --tail=100 caddy
docker stats
docker system df
```

重点观察：

- PRTS 请求是否出现 `403` `429` 或 `5xx`
- Kuromoji 是否只在冷缓存时初始化
- app 容器是否反复重启
- 磁盘和出站流量是否接近套餐限制

## 11. PRTS 音频策略

当前代码使用 PRTS 静态资源地址并设置 `preload="none"`

正式公开前应先确认 PRTS 对第三方直链和按需缓存的态度

如果后续允许自建缓存 应在独立分支实现白名单校验 Range 请求和磁盘缓存 不要让接口成为任意 URL 代理

## 12. 当前无法在本机完成的检查

当前开发电脑没有 Docker

因此本分支只完成了：

- Dockerfile 静态审查
- Compose YAML 结构解析
- Nuxt 配置生成
- 健康接口 TypeScript 语法转换

真实镜像构建 Caddy 配置加载和容器健康检查需要在安装 Docker 后执行
