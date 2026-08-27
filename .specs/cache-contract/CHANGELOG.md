# cache-contract Change Log

## 2026-08-27

- 创建模块规格：requirements 7 组 / design 3 决策 4 性质 / tasks 4 条（1 个 checkpoint）。
- 来源决议：会话级存储取代任务拆分；扁平布局 + archive/ 唯一子目录；分类以 front matter tags 表达；检查点正文收缩至六节；双语沿用 i18n.yaml blob-hash 凭据。

## 2026-08-27（位置迁移）

- skill 本体由 `.agents/skills/ctx/` 迁移至项目根 `skills/ctx/`，并新增 `skills-zh/ctx/` 中文镜像目录（SKILL.md + references 等价翻译；scripts 不翻译、仅存于英文侧）。
- 三份 reference 内容本身未变；镜像翻译以英文正典为准同步维护。
- 追加命名规则：中文镜像技能的所有文件统一带 `.zh.md` 后缀（SKILL.zh.md、references/*.zh.md），内部交叉链接同步更新。
