# Implementation Plan: bilingual-gate

## Overview

策略：Foundation-First——语言契约先在文档层冻结（checkpoint-format / file-naming / ctx-understanding §10），lib/doctor 门禁与 SKILL.md 联动并行推进，仓库自持文件对齐与负例注入随后，全链走查收口。

## Tasks

## Phase 1: 契约冻结

- [x] 8.1 语言契约文档冻结
  - checkpoint-format.md 新增 Language contract 小节（零 CJK 与代码豁免、占比口径与 30% 阈值、镜像结构孪生四维、`（中文镜像）`标题后缀、双语文例）；file-naming.md 双语三件套一节同步门禁描述；docs/ctx-understanding.md §10 同步；skills-zh 两份镜像同步
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.3, 3.4_

## Phase 2: 门禁与流程实现

- [x] 8.2 lib.mjs 语言与结构助手
  - `stripCodeSpans` / `cjkCount` / `latinCount` / `cjkRatio` / `collectHeadings` / `collectTableIds` / `CJK_RE` / `MIRROR_CJK_MIN_RATIO`；零第三方依赖
  - _Requirements: 2.1, 2.2, 2.3, 2.6_
- [x] 8.3 doctor 三类新规则
  - `canon-language` / `mirror-language` / `mirror-structure` 接线（double-read canon+zh、companion 缺失跳过）；既有类别与退出码协议不动
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
- [x] 8.4 SKILL.md 成文纪律与验收环
  - standing rule 4 改写为 English-first 成文纪律（禁止中文草稿转译、镜像从成品正典派生、结构关键词两侧英文）；ctx-create / ctx-append 步骤以 doctor 修至 healthy 收尾；skills-zh/ctx/SKILL.zh.md 同步
  - _Requirements: 3.1, 3.2, 3.4_

## Phase 3: 对齐与验收

- [x] 8.5 仓库自持文件对齐 + 负例注入 + 正例回归
  - examples 两份镜像补 front matter 并核对标题后缀；`.agents/context` 镜像 H1 对齐；`--update-i18n` 刷新凭据；负例逐类注入（canon-language ×2、mirror-language ×2、mirror-structure ×2）；examples ×2 与 `.agents/context` 回归全绿
  - _Requirements: 3.5, 4.1, 4.2_
- [x] 8.6 Checkpoint — 全链走查
  - 模拟 create → append：英文正典直接成文、镜像派生、doctor 收尾、凭据刷新；三处正例退出码 0；结果向用户汇报后再勾选
  - _Requirements: 3.1, 3.2, 4.3_
  - 结果（2026-09-11）：注入 12/12；临时项目 create→append 走查通过（中文正文当场拦红、修正后两次 healthy）；examples ×2 + .agents/context 回归全绿；用户验收

## Notes

- 排序依据：8.1 是 8.2/8.3/8.4 的共同派生源；8.4 与 8.2/8.3 无代码依赖可并行；8.5 必须在 8.3 生效后进行（对齐产物当场受检）。
- astro-minima 项目文件不在改写范围；其目录在门禁下预期翻红，属符合行为。
- 用户决议：canon 严格零 CJK；不做体积门禁；无 status 豁免；镜像占比下限 30%。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["8.1"] },
    { "id": 1, "tasks": ["8.2", "8.4"] },
    { "id": 2, "tasks": ["8.3"] },
    { "id": 3, "tasks": ["8.5"] },
    { "id": 4, "tasks": ["8.6"] }
  ]
}
```

Task status is maintained in `.agents/specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
