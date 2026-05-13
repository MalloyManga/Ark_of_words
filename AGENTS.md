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

## 2. 安全与执行红线

1. **只读命令授权**：可以自由运行 `git status`、`ls`、`dir`、`cat` 等查看类命令来了解项目环境。
2. **禁止私自 Git 变动**：不要私自运行 `git add`、`git commit`、`git push`、`git checkout` 等改变代码库状态的命令。
3. **禁止私自运行服务**：代码修改完成后不要私自运行 `npm run dev` 等长期服务命令，只能由用户本人手动运行。
4. **禁止私自安装依赖**：如需引入新的第三方库，必须先说明原因并取得用户同意，由用户本人执行安装。
5. **禁止私自删除文件**：任何删除文件或重构目录结构的操作，必须先询问用户并得到明确的 `Yes` 确认。
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
