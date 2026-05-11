# Ark_of_words

基于《明日方舟》干员语音的日语听写与打字练习 Web 应用。听写干员的经典语音，练习日语键盘输入，学习单词的原型与词性！

## ✨ 项目规划与特性

- **🎧 听音打字练习**：听干员语音进行日语打字练习，智能判断正误（过滤标点符号，统一使用空格区分）。
- **📊 难度分级**：
  - **简单**：“编入队伍”到“作战中4”等偏短的作战语音。
  - **困难**：“任命助理”到“交谈”等多句组合的日常长语音。
- **🎵 K歌级歌词滚动**：结合语音与时间轴，实现卡拉OK级别的逐词/逐句高亮滚动效果。
- **📚 智能单词解析**：利用自然语言处理（NLP）解析句中的单词，提供原形还原（如 `見て` -> `見る`）并辅助日语学习。
- **🖼️ 沉浸式图文体验**：干员精美立绘展示。

## 🛠️ 技术栈选择

- **前端框架**：[Nuxt.js](https://nuxt.com/) / Vue 3
- **样式方案**：[Tailwind CSS](https://tailwindcss.com/)
- **文本数据获取**：使用 Node.js (Cheerio / Puppeteer) 预爬取 PRTS Wiki 数据。
- **日语形态素解析**：`kuromoji.js` (在静态阶段或客户端完成词性还原)。
- **部署方案**：Nuxt SSG 纯静态生成，零成本部署（如 Vercel, Netlify 或 Cloudflare Pages）。

## 🚀 快速开始

### 1. 克隆项目环境
```bash
# 替换为你的真实 GitHub 仓库地址
git clone https://github.com/your-username/Ark_of_words.git
cd Ark_of_words
```

### 2. 安装依赖包
```bash
npm install
# 或者使用 pnpm install / yarn install
```

### 3. 启动开发服务器
```bash
npm run dev
```
启动后在浏览器中访问 `http://localhost:3000` 即可查看项目页面。

### 4. 构建静态站点

本项目设计为纯静态部署以节约服务器成本，在正式发布前运行以下命令：
```bash
npm run generate
```

## 📄 声明

本项目为个人学习开源项目。项目中所使用的游戏相关文本、音频、图片等素材，其版权均属于上海鹰角网络科技有限公司（Hypergryph）。
