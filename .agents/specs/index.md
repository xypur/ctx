# Specs Index

Organized by functional module, each module is a self-contained directory (requirements / design / tasks / CHANGELOG).

Read this file before any module document: use the Status Bar, Module Status Table, and Task Summary below to determine which module(s) and task(s) the current request touches, then open only the relevant module documents on demand.

> 📍 **Status Bar** · 全模块归档 [`archived`] · 31/31 done · 0 blocked ·
> Next task: none（规格库收口，无待办） · Next gate: none remaining
> Last updated: 2026-08-27（type-outline 验收归档：新格式契约全面生效，仓库内零 legacy 骨架）

## Module Status Table

| Module | Status | Progress | Depends on | Notes |
|--------|--------|----------|------------|-------|
| cache-contract | archived | 4/4 (100%) | - | 三份 reference 契约文档已落地 |
| operations | archived | 5/5 (100%) | cache-contract | SKILL.md 五操作规则已落地 |
| tooling | archived | 4/4 (100%) | cache-contract | init/doctor 脚本 12 项注入测试全过 |
| distribution | archived | 4/4 (100%) | - | P0 分发面完成：AGENTS.md 正典 + 适配矩阵 + README 双语 |
| extension-pi-opencode | archived | 5/5 (100%) | distribution | P1 完成：pi 包（@xypur/ctx）与扩展 + OpenCode 零 JS 命令 |
| plugin-claude-codex | archived | 4/4 (100%) | distribution, extension-pi-opencode | P2 完成：插件清单（Codex 先）+ SessionStart hook + 五命令 |
| type-outline | archived | 5/5 (100%) | - | 格式反转完成：类型节大纲 + tags 推导 + doctor 单骨架 + 存量改写 |

`Progress` = `done/total (pct)` counting every task checkbox in `<module>/tasks.md`. Status values: `draft` → `design` → `implementing` → `implemented` → `archived`. Archived modules stay listed with status `archived`; their directories are not moved.

## Task Summary

Global index of every task across modules. Add one row per task in `<module>/tasks.md`; keep the checkbox state in sync.

| Task | Status | Module | Title | Depends on |
|------|--------|--------|-------|------------|
| cache-contract.1.1 | [x] | cache-contract | 布局与索引契约 | - |
| cache-contract.1.2 | [x] | cache-contract | 命名与双语三件套契约 | - |
| cache-contract.1.3 | [x] | cache-contract | 检查点模板与写作规则 | - |
| cache-contract.1.4 | [x] | cache-contract | Checkpoint — 契约审阅 | cache-contract.1.1, cache-contract.1.2, cache-contract.1.3 |
| operations.2.1 | [x] | operations | SKILL.md 总体行为与触发 | cache-contract.1.4 |
| operations.2.2 | [x] | operations | ctx-create / ctx-append 流程 | operations.2.1 |
| operations.2.3 | [x] | operations | ctx-resume 渐进式披露 | operations.2.2 |
| operations.2.4 | [x] | operations | ctx-archive 与生命周期迁移 | operations.2.1 |
| operations.2.5 | [x] | operations | Checkpoint — 五操作模拟走查 | operations.2.2, operations.2.3, operations.2.4 |
| tooling.3.1 | [x] | tooling | init 脚手架脚本 | cache-contract.1.4 |
| tooling.3.2 | [x] | tooling | doctor 结构校验 | cache-contract.1.4 |
| tooling.3.3 | [x] | tooling | i18n 校验与刷新 | tooling.3.2 |
| tooling.3.4 | [x] | tooling | Checkpoint — 错误注入与空骨架通过 | tooling.3.1, tooling.3.2, tooling.3.3 |
| distribution.4.1 | [x] | distribution | 根 AGENTS.md 正典 | - |
| distribution.4.2 | [x] | distribution | agent-portability 适配矩阵 | distribution.4.1 |
| distribution.4.3 | [x] | distribution | README 双语 | distribution.4.2 |
| distribution.4.4 | [x] | distribution | Checkpoint — 冷启动走查 | distribution.4.3 |
| extension-pi-opencode.5.1 | [x] | extension-pi-opencode | 根 package.json（@xypur/ctx） | - |
| extension-pi-opencode.5.2 | [x] | extension-pi-opencode | hooks/ctx-hint.js 共享常量 | distribution.4.1 |
| extension-pi-opencode.5.3 | [x] | extension-pi-opencode | pi-extension 命令与启动提示 | extension-pi-opencode.5.1, extension-pi-opencode.5.2 |
| extension-pi-opencode.5.4 | [x] | extension-pi-opencode | OpenCode 命令文件 | distribution.4.1 |
| extension-pi-opencode.5.5 | [x] | extension-pi-opencode | Checkpoint — 安装与等价走查 | extension-pi-opencode.5.3, extension-pi-opencode.5.4 |
| plugin-claude-codex.6.1 | [x] | plugin-claude-codex | hooks/ctx-activate.js | extension-pi-opencode.5.2 |
| plugin-claude-codex.6.2 | [x] | plugin-claude-codex | 命令五条 × 两宿主形态 | distribution.4.1 |
| plugin-claude-codex.6.3 | [x] | plugin-claude-codex | 插件清单与 marketplace（Codex 先） | plugin-claude-codex.6.1, plugin-claude-codex.6.2 |
| plugin-claude-codex.6.4 | [x] | plugin-claude-codex | Checkpoint — 安装与注入走查 | plugin-claude-codex.6.3 |
| type-outline.7.1 | [x] | type-outline | 契约文档改写（format/layout/understanding/zh） | - |
| type-outline.7.2 | [x] | type-outline | SKILL.md 联动（rule 5 + tags 推导） | type-outline.7.1 |
| type-outline.7.3 | [x] | type-outline | doctor 规则集新增（五类 + fixture） | type-outline.7.1 |
| type-outline.7.4 | [x] | type-outline | 存量完全改写（bootstrap + examples） | type-outline.7.2, type-outline.7.3 |
| type-outline.7.5 | [x] | type-outline | Checkpoint — 新骨架全链走查 | type-outline.7.4 |

`Task` is the globally unique id `<module>.<N.M>` (the module dir name + the task's number in `tasks.md`). `Status` mirrors the `- [ ]` / `- [x]` checkbox in `tasks.md`.

**Next task / next gate** are derived from the dependencies, not hand-written:
- **Next task** = the first Task Summary row with `[ ]` whose every `Depends on` id is `[x]`; if none, note "all blocked".
- **Blocked count** = number of `[ ]` tasks whose deps are not all done.
- **Next gate** = the first unchecked phase-terminal (Checkpoint) task in the active module's gate chain.
- Update the Status Bar (and `Progress` / `Last updated`) whenever a task is checked off.

## Execution Order / Dependencies

```text
cache-contract (契约先行)
   ├─→ operations（2.1→2.2→2.3 主链，2.4 并行支线）
   └─→ tooling（3.1/3.2 并行，3.3 串其后）

distribution (P0 正典先行：4.1→4.2→4.3→4.4)
   ├─→ extension-pi-opencode (P1: 5.1/5.2 并行 → 5.3/5.4 并行 → 5.5)
   └─→ plugin-claude-codex (P2: 6.1/6.2 并行 → 6.3 → 6.4)

type-outline (格式反转：7.1 契约冻结 → 7.2/7.3 并行 → 7.4 存量改写 → 7.5)
```

前期三模块以 Hybrid 策略完成（契约 Foundation-First + 双 Feature-Slice）。适配层三模块：distribution Foundation-First 冻结正典；extension-pi-opencode（pi 优先）先行，plugin-claude-codex 串其后（宿主顺序 Codex 先、Claude 后）；矩阵↔实物一致性由各模块 checkpoint 走查对账。type-outline 同为 Foundation-First：契约文档冻结后，SKILL 联动与 doctor 改写并行，存量改写串后，全链走查收口。

## Change Log

| Date | Change |
|------|--------|
| 2026-08-27 | 初始化 .agents/specs：依据 docs/ctx-understanding.md（会话级存储 + 扁平布局 + front matter tags 决议）拆分为 cache-contract / operations / tooling 三个模块 |
| 2026-08-27 | 三模块全部实施完成：references ×3、SKILL.md、init/doctor 脚本；doctor 注入测试 12/12 通过，五操作生命周期走查 doctor 复检 healthy。待用户验收后归档 |
| 2026-08-27 | skill 迁移至根目录 skills/ctx，新增 skills-zh/ctx 中文镜像（.zh.md 后缀）；examples/ 添加三个可直接通过 doctor 的示例目录 |
| 2026-08-27 | 规格根目录迁移 `.specs/` → `.agents/specs/`（与 .agents/context、.agents/skills 统一命名空间），通过 validate-specs.js 校验；检查点新增"规格联动会话"引用规则（create 引用规格条款号、resume 分工读取双索引） |
| 2026-08-27 | 新增适配层规划四模块（对照 ~/dev/references/ponytail 的 docs/agent-portability.md 分层）：distribution（P0 正典与分发面）、extension-pi-opencode（pi 包扩展 + OpenCode 零 JS 命令）、plugin-claude-codex（Claude/Codex 插件 + hook + 命令）、rules-copies（规则副本 + check-adapters 对账）；核心原则沿用 ponytail Adapter Rule——行为只在 skills/ctx，适配器保持薄 |
| 2026-08-27 | 用户确认三项决议并重排：pi 优先于 Codex/Claude（extension-pi-opencode 重编号为模块 5，plugin-claude-codex 为模块 6，宿主顺序 Codex 先）；包名定为 `@xypur/ctx`；README 双语确认。优先级反转的连带调整：激活提示常量上移至 `hooks/ctx-hint.js`（由先行模块 5.2 交付），避免后模块被前模块依赖 |
| 2026-08-27 | 用户裁剪 P3：rules-copies 模块整体移除（纯广度层、无下游依赖，YAGNI）；矩阵↔实物对账职责并入各模块 checkpoint 走查；distribution / plugin-claude-codex / extension-pi-opencode 三模块的 requirements 与 design 引用同步修订，随后进入实施 |
| 2026-08-27 | 适配层实施完成并全部验收：distribution（4350f38）、extension-pi-opencode（aa5166f）、plugin-claude-codex（f8dd2ae）三模块 checkpoint 逐一走查通过；用户确认将六个模块全部置为 archived，可选项（ctx 检查点记录、LICENSE）不做 |
| 2026-08-27 | 用户新决议：检查点正文大纲从分析方法骨架（Problem/Requirements/Decision/Consequences/Verification）改为类型骨架（architecture/process/feature/simplification/bug-fix/testing），方法降级为节内子字段；tags 真源反转（节→tags）；doctor 单骨架不兼容旧版、存量完全改写；定序 Architecture→Process→Feature→Simplification→Bug-fix→Testing、空节省略。新立 type-outline 模块（5 任务），规格已创建，待用户「开始」指令后实施 |
| 2026-08-27 | type-outline 实施完成：契约文档/SKILL/doctor/存量改写四步落地，注入测试与回归全绿，create→append→resume 走查通过（含 tags-section-mismatch 守门验证），内容保全 12 项抽查零丢失；用户验收后模块归档，新格式契约全面生效 |
