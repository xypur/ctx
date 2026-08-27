# Implementation Plan: distribution

## Overview

三份纯文档 + 一份中文镜像。策略：Foundation-First——正典文本（AGENTS.md）先于矩阵与 README，因为后两者都要引用它。

## Tasks

## Phase 1: 正典与入口

- [x] 4.1 根 AGENTS.md 正典
  - 自举约定 + 紧凑操作表 + resume 指针；不内嵌格式细节
  - _Requirements: 2.1, 2.2, 2.3, 2.4_
- [x] 4.2 docs/agent-portability.md 适配矩阵
  - 逐宿主路径/层级/安装方式表；Adapter Rule 声明
  - _Requirements: 3.1, 3.2, 3.3_
- [x] 4.3 README.md + README.zh.md
  - 定位、五操作、安装索引（链接矩阵）、与 ponytail 关系声明
  - _Requirements: 1.1, 1.2, 1.3_
- [x] 4.4 Checkpoint — 冷启动走查
  - _Requirements: 1.x, 2.x, 3.x_
  - 模拟新会话：仅凭 AGENTS.md 定位根索引；仅凭 README 找到任一宿主安装路径；核对矩阵行与实物一致。结果向用户汇报后再勾选。

## Notes

- 4.1 是模块 5/6/7 的派生源，必须最先冻结；4.2 引用 4.1 的派生关系，README 引用 4.2 的矩阵。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["4.1"] },
    { "id": 1, "tasks": ["4.2"] },
    { "id": 2, "tasks": ["4.3"] },
    { "id": 3, "tasks": ["4.4"] }
  ]
}
```

Task status is maintained in `.agents/specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
