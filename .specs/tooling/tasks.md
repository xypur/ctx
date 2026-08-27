# Implementation Plan: tooling

## Overview

三个 ESM 文件 + fixture 测试。策略：Risk-First——先做最可能出错的 doctor 规则集，再补 init（它只是模板渲染）与集成 gate。

## Tasks

## Phase 1: 脚本与验证

- [x] 3.2 实现 `lib.mjs` + `doctor.mjs` 结构校验
  - front matter/索引解析、固定九类规则、violations 输出格式与退出码协议
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1_
- [x] 3.3 实现 i18n 校验与 `--update-i18n`
  - blob hash 内存复算、synced/stale 判定、写回路径与幂等
  - _Requirements: 3.1, 3.2, 3.3, 4.2_
- [x] 3.1 实现 `init.mjs`
  - 内嵌模板渲染 root/archive 索引、已存在拒绝、布局纯度
  - _Requirements: 1.1, 1.2, 1.3_
- [x] 3.4 Checkpoint — 错误注入 + 空骨架通过
  - _Requirements: 2.x, 3.x, 4.x, 5.1_
  - 构建 fixtures 目录注入 schema/naming/triplet/head-dup/prev-broken/tags-vocab/i18n-stale 等样本逐一命中；对 init 全新骨架跑 doctor 得退出码 0；人工 `--update-i18n` 后复查恢复 synced。结果向用户汇报后再勾选。

## Notes

- 排序策略：Risk-First——doctor 规则集是整个模块风险中心，先行实现并单测化（fixture 即测试）
- Phase 顺序有意错开 3.1 于 3.2/3.3 之后：init 依赖的模板以 doctor 会消费的最终形态为准，避免两处模板漂移

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["3.2"] },
    { "id": 1, "tasks": ["3.3"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.4"] }
  ]
}
```

Task status is maintained in `.specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
