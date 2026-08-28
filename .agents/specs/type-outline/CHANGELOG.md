# type-outline Change Log

## 2026-08-27

- 创建模块规格：requirements 5 组 / design 6 决策 3 性质 / tasks 5 条（Foundation-First，契约先冻结）。
- 用户四项决议入册：①章=类型、方法=节内子字段（采纳助手建议）；②tags 真源反转（类型节→tags，doctor 校验双向相等）；③doctor 单骨架、不兼容旧版、存量完全改写（内容保留式重排 + Update Log 留痕）；④canonical 定序 architecture → process → feature → simplification → bug-fix → testing，空类型节整体省略。
- 模块创建后等待用户「开始」指令，未获指令前不实施。

## 2026-08-27（归档后修订）

- 子字段由加粗标签（`**Decision**:` 内联形态）升级为三级标题（`### Decision` 独占行 + 正文）：结构显式进大纲，解析从约定变分隔。四子字段词表、空省略规则、`###` 级不做他用不变。
- lib.mjs#parseBody 改扫 `### `；未知 `### ` 计 `subfield-invalid`；加粗标签不再具有语法地位（视为普通正文）。
- 存量六个检查点文件机械转换 + i18n 凭据刷新；doctor 三目录全绿。
