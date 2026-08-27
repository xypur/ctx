# tooling Change Log

## 2026-08-27（实现期修订）

- doctor 的 violation 类别字典新增 `structure`（缺失根索引 / 缺失 archive 目录或其索引），原十类不含“缺失”型违约。
- `--update-i18n` 运行时当次修复的凭据不再计入 violation（改打 `healed <side>` 日志），使单次 heal 命令退出码直接反映命令后状态；未修其他行为。
- thread slug 校验由复用命名正则改为独立 kebab-case 正则，修正了对合法 slug 的误报。

## 2026-08-27

- 创建模块规格：requirements 5 组 / design 3 决策 4 性质 / tasks 4 条（Risk-First 排序，doctor 先行）。
- 关键决议记录：零依赖 Node ESM；blob hash 内存复算优先；固定 violation 类别字典作为可测断言面。

## 2026-08-27（位置迁移）

- 脚本随 skill 迁移至 `skills/ctx/scripts/`（.agents 下不再保留副本）；脚本语言不翻译。fixture 注入测试在迁移后重跑仍 12/12 通过。
