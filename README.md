# Ark_of_words

**Ark_of_words** 是一个基于《明日方舟》（Arknights）干员语音的日语听写与打字练习 Web 应用。

本项目将游戏内的日语语音切分为短组练习，结合即时按键反馈与自然语言处理（NLP）技术，帮助日语学习者在沉浸式的环境中练习听写、熟悉日文键盘输入，并学习单词的词性与原形。

## ✨ 核心特性

- **🎧 听音打字与实时校验**
  - 提供原声语音播放，支持用户进行日语听写。
  - 逐字符级的输入判定：精确区分并高亮显示正确（绿）、错误（红）、多余（黄）和待输入（灰）状态。
  - 自动过滤标点符号，统一使用空格进行断句，降低非语言性输入干扰。
- **⌨️ 智能多模输入支持**
  - **IME 模式**：支持标准的假名 / 汉字日文输入法。
  - **罗马字模式**：支持直接在页面输入罗马字序列，系统自动映射。
  - 自动检测异常输入行为，并提供平滑的模式切换提示。
- **📚 NLP 智能单词解析**
  - 结合 `Kuromoji.js` 与 `WanaKana`，在服务端完成形态素解析。
  - 自动将句中单词还原为字典原形（如 `見て` -> `見る`）并标注词性，辅助语法学习。
- **📊 动态难度与自定义题库**
  - **标准模式**：内置简单（短指令）、中等（日常对话）、困难（长篇交谈）三种难度，题库自动随机洗牌并按 5 题一组切分。
  - **自由配置**：支持从干员目录中自由筛选、组合特定的台词，生成专属练习池，并持久化保存在本地。
- **⚡ 高性能与低成本架构**
  - 基于 Nitro 的服务端缓存（Cache & SWR）策略，长期缓存第三方 Wiki 数据与 NLP 解析结果，极大降低外部 API 依赖与解析开销。

## 🛠 技术栈

- **核心框架**：[Nuxt 4](https://nuxt.com/) / [Vue 3](https://vuejs.org/)
- **开发语言**：TypeScript
- **UI & 样式**：[Tailwind CSS v4](https://tailwindcss.com/)
- **服务端 & API**：Nitro (Nuxt Server API)
- **自然语言处理**：[Kuromoji.js](https://github.com/takuyaa/kuromoji.js) / [WanaKana](https://wanakana.com/)
- **部署运维**：Docker Compose / Caddy

## 📁 项目结构

```text
Ark_of_words/
├─ app/
│  ├─ pages/          # 页面路由视图
│  ├─ components/     # UI 视图组件与交互模块
│  ├─ composables/    # 核心业务逻辑 (打字判定、状态机、音频控制)
│  ├─ constants/      # 全局常量配置 (难度、模式、静态数据)
│  └─ types/          # 前端展示所需的 TypeScript 类型
├─ shared/
│  ├─ types/          # 前后端共享类型定义
│  └─ utils/          # 跨端共享的数据转换与校验工具
├─ server/
│  ├─ api/            # Nitro Server API 接口
│  └─ domain/         # PRTS 数据抓取、清洗与 NLP 处理逻辑
```

## 🚀 本地开发指南

### 环境要求
- Node.js 22+
- npm (或 pnpm / yarn)

### 快速启动

1. **克隆项目**
   ```bash
   git clone git@github.com:MalloyManga/Ark_of_words.git
   cd Ark_of_words
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   > 启动后，在浏览器中访问 `http://localhost:3000` 即可预览项目。

### 可用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本 (Node Server) |
| `npm run preview` | 在本地预览生产构建产物 |
| `npx nuxi typecheck` | 运行 TypeScript 类型检查 |

> **⚠️ 注意**：本项目依赖 Nuxt Server API 进行数据获取和 NLP 解析，**不支持纯静态导出 (`generate`)**，生产环境需部署为 Node.js 服务。

## 🔌 Server API 接口参考

前端所有的外部数据请求均通过内置的 Nitro API 代理，以解决跨域问题并提供数据缓存：

| HTTP 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/health` | 服务健康检查 |
| `GET` | `/api/operators` | 获取支持的干员目录列表 |
| `GET` | `/api/operators/:operatorId/voices` | 获取指定干员的语音台词与 NLP 解析数据 |

## 📦 部署 (Deployment)

项目根目录包含完整的 `Dockerfile` 与 `docker-compose.yml` 配置，推荐使用 Docker 进行容器化部署。

```bash
docker compose build
docker compose up -d
```

## 🤝 参与贡献

欢迎提交 Issue 报告 Bug 或提出功能建议。
如需提交 Pull Request，请确保：
1. 改动范围清晰，避免一个 PR 包含过多无关修改。
2. 运行 `npx nuxi typecheck` 确保 TypeScript 类型校验通过。
3. 遵循现有的代码风格与组件结构。

## ⚖️ 许可与声明

- **代码授权**：本项目的前端 UI 与业务逻辑源码采用 [MIT License](./LICENSE) 开源。
- **资产声明**：项目中涉及的《明日方舟》（Arknights）相关文本、音频、图片、角色名称等游戏资产，**均不包含在 MIT 协议授权范围内**，其著作权及相关知识产权归 **上海鹰角网络科技有限公司（Hypergryph）** 所有。
- **免责条款**：本项目仅供开发者与日语爱好者进行非商业性质的学习、交流与技术验证使用，严禁用于任何形式的商业盈利。本项目的开源不应被视为对游戏素材的二次授权。