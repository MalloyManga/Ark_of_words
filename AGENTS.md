# Ark_of_words: AI Agent System Instructions & Architecture Guidelines

## 1. 学习目标与代码核心规范

作为协助开发的 Agent 必须遵守以下规范。这个项目以学习最新前端技术为核心目标。

1. **原理解析**：每次给出代码或架构方案时，需要简短说明背后的知识点或核心原理。
2. **类型严谨**：TypeScript 中不要使用 `any`。变量、对象和接口都应有清晰类型。
3. **最佳实践**：代码应符合 Vue 3、Nuxt、TypeScript 当前主流实践。
4. **Vue SFC 顺序**：`.vue` 文件统一使用 `<script setup>` 在最上方、`<template>` 在中间、`<style>` 在最后。
5. **Tailwind 优先**：能使用 Tailwind CSS 工具类完成的样式，不要写原生 CSS。
6. **原生 CSS 使用边界**：类似 typewriter 这种完整动画效果可以写在原生 CSS 中。如果出现大量 CSS 复用，应抽象语义化 class 到 CSS 文件里，并使用 Tailwind CSS v4 directives 组织复用样式。
7. **注释规范**：复杂逻辑需要使用中文 JSDoc 或简短中文注释解释意图。
8. **中文标点限制**：代码注释中尽量避免中文标点，必要分隔处使用空格。
9. **Props 风格**：Vue 组件 props 应优先使用具名 `interface` 声明类型 并在需要默认值时使用 `defineProps<Props>()` 解构写法。
10. **Nuxt 自动引入**：Nuxt 项目中组件和常用组合式函数优先使用自动引入 除静态资源或确有必要的模块外 不要在脚本块手动 import。
11. **注释密度**：涉及状态机 定时器 动画 数据转换 生命周期 副作用等逻辑时 注释应足够详细 目标是不逐行阅读代码也能大致理解模块在做什么。
12. **命名语义化**：变量 函数 类型名应表达业务含义和状态含义 避免过短或只描述技术形态的命名。用户审查后修改过的命名应作为后续同类代码的风格参考。

## 2. 安全与执行红线

1. **只读命令授权**：可以自由运行 `git status`、`ls`、`dir`、`cat` 等查看类命令来了解项目环境。
2. **Git 只读限制**：不要私自运行 `git add`、`git commit`、`git push`、`git checkout`、`git restore` 等改变代码库状态或回退文件的命令。Git 相关操作只允许查看类命令 例如 `git status`、`git diff`、`git log`。
3. **禁止私自运行服务**：代码修改完成后不要私自运行 `npm run dev` 等长期服务命令，只能由用户本人手动运行。
4. **开发阶段不跑 build**：日常 UI 开发和小改动不运行 `npm run build` 或等价构建命令 子代理也必须遵守。需要完整构建验证时必须先说明原因并取得用户同意。
5. **禁止私自安装依赖**：如需引入新的第三方库，必须先说明原因并取得用户同意，由用户本人执行安装。
6. **禁止私自删除文件**：任何删除文件或重构目录结构的操作，必须先询问用户并得到明确的 `Yes` 确认。
7. **子代理使用策略**：只有特别大的改动 需要并行探索 或者风险较高的独立检查才使用子代理。微调 小改动 命名调整 文档补充 样式小修等任务默认由主进程直接完成。
8. **Type Check 执行位置**：`npx.cmd nuxi typecheck` 只在主进程执行。子代理完成后由主进程统一运行并确认结果。
9. **子代理关闭要求**：子代理达到完成状态后必须及时关闭，避免长期占用代理槽位。
10. **保护用户审查修改**：用户会在审查代码过程中手动修改部分内容 这些用户手动修改过的内容除非确有必要不要再次改动；如果发现问题或需要覆盖用户修改，必须先向用户确认。尤其不要反复恢复用户已经删除的 class 或已经调整过的 CSS 数值 例如间距 光标高度 字号等视觉微调。
<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

## Subagents

- ALWAYS wait for every spawned subagent to reach a terminal status before yielding, acting on partial results, or spawning followups.
  - On Codex, this means calling the `wait` tool with the subagent's thread id (requires `multi_agent_v2`). Do NOT infer completion from elapsed time.
  - On Claude Code / OpenCode, this means awaiting the Task/agent tool result before continuing.
- NEVER cancel or re-spawn a subagent that hasn't finished. If a subagent appears stuck, raise the wait timeout (Codex default 30s, max 1h) before judging it broken.
- Spawn subagents automatically when:
  - Parallelizable work (e.g., install + verify, npm test + typecheck, multiple tasks from plan)
  - Long-running or blocking tasks where a worker can run independently
  - Isolation for risky changes or checks

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
