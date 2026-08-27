# Specs Index

Organized by functional module, each module is a self-contained directory (requirements / design / tasks / CHANGELOG).

Read this file before any module document: use the Status Bar, Module Status Table, and Task Summary below to determine which module(s) and task(s) the current request touches, then open only the relevant module documents on demand.

> 📍 **Status Bar** · 全模块 [`implemented`] · 13/13 done · 0 blocked ·
> Next task: none（全部完成，待用户验收归档） · Next gate: none remaining
> Last updated: 2026-08-27 (all modules implemented)

## Module Status Table

| Module | Status | Progress | Depends on | Notes |
|--------|--------|----------|------------|-------|
| cache-contract | implemented | 4/4 (100%) | - | 三份 reference 契约文档已落地 |
| operations | implemented | 5/5 (100%) | cache-contract | SKILL.md 五操作规则已落地 |
| tooling | implemented | 4/4 (100%) | cache-contract | init/doctor 脚本 12 项注入测试全过 |

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
```

策略为 Hybrid：契约阶段 Foundation-First，之后 operations 与 tooling 两条 Feature-Slice 并行推进，各自以 Checkpoint 收口。

## Change Log

| Date | Change |
|------|--------|
| 2026-08-27 | 初始化 .specs：依据 docs/ctx-understanding.md（会话级存储 + 扁平布局 + front matter tags 决议）拆分为 cache-contract / operations / tooling 三个模块 |
| 2026-08-27 | 三模块全部实施完成：references ×3、SKILL.md、init/doctor 脚本；doctor 注入测试 12/12 通过，五操作生命周期走查 doctor 复检 healthy。待用户验收后归档 |
| 2026-08-27 | skill 迁移至根目录 skills/ctx，新增 skills-zh/ctx 中文镜像（.zh.md 后缀）；examples/ 添加三个可直接通过 doctor 的示例目录 |
