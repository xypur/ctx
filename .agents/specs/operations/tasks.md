# Implementation Plan: operations

## Overview

把五个操作写成 SKILL.md 及配套的最小引用。策略：Feature-Slice——按动词逐个切片，每片完成后立即可被人工试走。

## Tasks

## Phase 1: 操作规则落地

- [x] 2.1 创建 `skills/ctx/SKILL.md` 骨架
  - front matter（name/description）、五操作总览一行表、共通节（意图询问、历史保留）
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 7.1, 7.2_
- [x] 2.2 编写 ctx-create 与 ctx-append 完整流程
  - 步骤化含冲突处理、superseded 时序约束、Update Log 追加格式、三件套同步顺序
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_
- [x] 2.3 编写 ctx-resume 渐进披露流程
  - L1→L2→L3 读取规则、默认不读中文镜像、结束报告模板
  - _Requirements: 5.1, 5.2, 5.3_
- [x] 2.4 编写 ctx-archive 迁移流程
  - 三类链接修复清单、拒绝条件
  - _Requirements: 6.1, 6.2, 6.3_
- [x] 2.5 Checkpoint — 五操作模拟走查
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2_
  - 在临时 fixture 目录上模拟一次完整生命周期：ctx-create（feature+bug-fix 混合会话）→ ctx-append ×2 → ctx-archive → ctx-resume；核对每一步产物符合 cache-contract 与本模块验收标准，问题反馈给用户后再放行。

## Notes

- 排序策略：Feature-Slice（详见 Overview）
- 本模块零代码；所有行为的“可执行形态”就是 SKILL.md 文本本身

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "2.4"] },
    { "id": 2, "tasks": ["2.3"] },
    { "id": 3, "tasks": ["2.5"] }
  ]
}
```

Task status is maintained in `.agents/specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
