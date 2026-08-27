# Agent Portability

ctx 的适配层遵循单一原则（借鉴 ponytail 的 Adapter Rule）：

> **Adapter Rule** — 核心行为只保留在 `skills/ctx/`（SKILL.md + references + scripts）；
> 各宿主适配器只提供入口（命令、会话启动提示、清单指针），不复制缓存规则与格式契约。

## 适配矩阵（已落地）

本表与仓库实物一一对应：新增适配器先落地文件再登记本行；删除适配器同步移除本行。
核对时机为各模块 checkpoint 走查。

| 宿主 | 文件 | 层级 | 安装方式 | 会话启动提示 |
|------|------|------|----------|--------------|
| 通用（支持 Agent Skills 的宿主：Claude Code / pi / OpenCode / Codex 等） | `skills/ctx/` | skill | 将 `skills/ctx/` 放入宿主技能发现路径，或直接读取 `skills/ctx/SKILL.md` | 无（自然语言触发） |
| pi | `package.json`（`@xypur/ctx`）、`hooks/ctx-hint.js`、`pi-extension/index.js` | package + extension | `pi install git:github.com/xypur/ctx`（或本地路径） | 有（notify 提醒 + 首轮注入一次） |
| OpenCode | `.opencode/command/ctx*.md`（5 文件） | command（零 JS） | 将 5 文件复制进项目 `.opencode/command/` 或全局命令目录 | 无（零运行时） |
| Codex | `.codex-plugin/plugin.json`、`commands/ctx*.toml`、`hooks/claude-codex-hooks.json` | plugin | 以 Codex 插件安装本仓库（skills + 五命令 + SessionStart hook） | 有（SessionStart hook，JSON 形态） |
| Claude Code | `.claude-plugin/plugin.json` + `marketplace.json`、`commands/ctx*.md`、`hooks/claude-codex-hooks.json` | plugin | `/plugin marketplace add xypur/ctx` → `/plugin install ctx@ctx` | 有（SessionStart hook，纯文本 stdout） |

## 规划中

当前无未落地的规划项。P1/P2 四项适配（pi、OpenCode、Codex、Claude Code）均已迁入上表；
instruction-tier 规则副本（Cursor / Windsurf / Cline / Kiro）经用户裁剪不做（P3），
此类宿主以根 `AGENTS.md` 的 resume 指针覆盖。

## 设计边界

- **指令层正典**：仓库根 `AGENTS.md`（本仓库自举 + 未来 instruction-tier 派生的唯一基准）。
- **明确不做**：MCP server（ctx 操作本质是项目内 markdown 读写，宿主原生文件工具即可）；
  每轮注入（ctx 是按需操作型 skill，非 always-on 行为模式）；全宿主规则副本
  （Cursor / Windsurf 等纯广度层已裁剪，恢复工作时以 `AGENTS.md` 的 resume 指针为准）。
