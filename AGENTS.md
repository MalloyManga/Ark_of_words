# 🤖 Ark_of_words: AI Agent System Instructions & Architecture Guidelines

## 1. 学习目标与代码核心规范 (Learning & Code Standards)

作为协助开发的 Agent 你必须严格遵从以下规范 这一切都是为了协助开发者更好地学习最新前沿技术

1. **原理解析** 此项目以学习为核心目的 每次给出代码或架构方案时 请必须简短地向我解释这背后的知识点或核心原理
2. **绝不妥协的类型** **绝对绝对不能在 TypeScript 中使用任何 `any`** 所有变量 面向对象及接口必须有严谨清晰的类型定义
3. **最佳实践** 编写的代码必须高度符合 Vue 3 Nuxt 3 TypeScript 的当前流行最佳实践
4. **JSDoc 注释规范** 所有组件 函数声明与逻辑流必须使用 JSDoc 格式编写注释 并且使用中文编写
5. **严禁中文标点** 在所有的代码注释中 **绝对禁止使用任何中文标点符号** 所有本该是标点符号的地方 统一使用 **空格** 代替

## 2. 安全与执行红线 (Safety & Execution Guardrails)

**作为具备终端执行权限的 Agent，你必须严格遵守以下越权红线：**

1. **只读命令授权**：你可以自由运行 `git status`, `ls`, `dir`, `cat` 等查看类命令来了解项目环境。
2. **【绝对禁止】Git 变动**：绝对不允许私自运行 `git add`, `git commit`, `git push`、`git checkout` 等改变代码库状态的命令。
3. **【绝对禁止】私自运行服务**：代码修改完毕后，绝对不允许私自运行 `npm run dev` 等启动命令，只能由我本人手动运行。
4. **【绝对禁止】私自安装依赖**：如果需要引入新的第三方库，必须先向我说明原因并征得同意，由我本人亲自执行 `npm install`。
5. **【绝对禁止】删除文件**：任何涉及删除文件或重构目录结构的操作，必须先询问我并得到明确的 `Yes` 确认。

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
