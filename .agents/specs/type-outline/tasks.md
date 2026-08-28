# Implementation Plan: type-outline

## Overview

策略：Foundation-First——契约文档先冻结（一切派生物的基准），doctor 与 SKILL.md 并行跟进，存量改写串后，全链走查收口。

## Tasks

## Phase 1: 契约冻结

- [x] 7.1 契约文档改写
  - checkpoint-format.md（类型节骨架 / 子字段 / tags 推导 / 定序）；cache-layout.md 骨架流描述与索引示例行；ctx-understanding.md §8 指针处理；cache-contract/CHANGELOG.md 取代注记；skills-zh 三份镜像同步
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 5.1, 5.2, 5.3, 5.5_
- [x] 7.2 SKILL.md 联动
  - standing rule 5 反转；ctx-create / ctx-append 的 tags 步骤改为写完正文后推导；skills-zh 同步
  - _Requirements: 2.3, 5.4_

## Phase 2: 校验与迁移

- [x] 7.3 doctor 规则集新增
  - lib.mjs 正文解析（标题/子字段扫描）；五类新规则；类别字典追加；fixture 注入测试逐类命中 + 原 12 项回归全绿
  - _Requirements: 2.2, 3.1, 3.2, 3.3, 3.4_
- [x] 7.4 存量完全改写
  - bootstrap 三件套 + csv-import / login-redesign 两套三件套重写（canon + zh，内容保留、结构重排、Update Log 迁移留痕）；--update-i18n 刷新凭据；doctor 对 .agents/context 与示例全绿
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
- [x] 7.5 Checkpoint — 新骨架全链走查
  - _Requirements: 1.x, 2.x, 3.x, 4.x, 5.x_
  - 模拟 create → append → resume：类型节推导 tags、定序、子字段省略；doctor 全仓退出码 0；迁移内容保全核对（逐条对照旧文决策/需求行/Update Log）。结果向用户汇报后再勾选。

## Notes

- 排序依据：7.1 是 7.2/7.3/7.4 的共同派生源；7.4 必须在 doctor 新规则生效后进行（改写产物当场受检）。
- 用户指令：规格创建完成后通知，用户说「开始」后才实施。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["7.1"] },
    { "id": 1, "tasks": ["7.2", "7.3"] },
    { "id": 2, "tasks": ["7.4"] },
    { "id": 3, "tasks": ["7.5"] }
  ]
}
```

Task status is maintained in `.agents/specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
