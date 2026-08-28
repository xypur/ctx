---
created: 2026-08-27 13:55 +08:00
updated: 2026-08-27 13:55 +08:00
tags: [architecture, process, feature, bug-fix, testing]
status: active
thread: ctx-skill
prev: null
head: true
next: 本会话后续压缩用 ctx-append 续写本文件；提交前把 doctor 纳入常规检查
---

# Context Checkpoint: 端到端落地 ctx 技能（中文镜像）

> 本文件是 `2026-08-27-1355-ctx-skill-bootstrap.md` 的中文镜像，内容与英文正典等价；
> AI 默认读取英文正典。front matter 与英文侧逐字段一致。
>
> 长会话在压缩之间丢失设计决策和未完成线索。本项目需要面向决策的上下文缓存，
> 让任何未来 Agent 无需回放历史即可继续工作——本次会话完成了该系统的设计、
> 规格、实现和首次实战。

## architecture

**Requirements**

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R1 | 设计改为会话级存储：扁平 `.agents/context/`、分类降为由正文类型节推导的 tags、操作改名 ctx-create/ctx-append | solved | docs/ctx-understanding.md §3–§15，见提交 8407708 |

**Decision**：
1. 会话即存储单位；一次压缩编辑一份检查点三件套。混合 feature+bug-fix 工作
   经多个类型节共享同一文件；任务跨会话历史由 thread/prev/head 链承载。
2. 操作按文件系统语义命名：`ctx-create` 开新三件套，`ctx-append` 合并进当前
   head；语义不明的“保存”必须询问，不许擅自猜。
3. 检查点正文从 15 节模板收缩到紧凑分析骨架（Problem/Requirements/Decision/
   Consequences/Verification/Update Log）；下一步放进可选 front matter `next:`。
   （2026-08-27 起被类型节大纲取代——见 type-outline。）
4. 双语配对凭据使用内存复算的 git blob hash（`lib.mjs#blobHash`，
   `sha1("blob <len>\0"+内容)`）；脚本只保留在英文侧。

**Consequences**：收益：检索最多两级跳转（索引 → 检查点）、小压缩零额外成本、
中文读者获得等价镜像、契约漂移可被 doctor 机械检出。代价/取舍：单会话文件在
话题繁多时会变大（以 append 合并缓解而非拆分）；数据量增大后 tags 的语义筛选
弱于目录；保持中英镜像同步依赖人工纪律，仅靠 i18n-stale 检测兜底。

## process

**Requirements**

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R2 | 创建带需求↔设计↔任务可追溯性的 specs 计划 | solved | .specs/（cache-contract、operations、tooling），index.md 中全部 `implemented` |

**Decision**：技能发布在项目根（`skills/ctx`，镜像 `skills-zh/ctx`），整体复制
接入其他仓库；宿主适配层只映射 slash command，绝不复制规则。

## feature

**Requirements**

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R3 | 实现技能：五操作 SKILL.md + 三份契约 reference + 零依赖 init/doctor 脚本 | solved | skills/ctx/{SKILL.md,references/*,scripts/*.mjs} |
| R4 | 提供中文镜像技能，文件统一 `.zh.md` 后缀，置于 skills-zh/ | solved | skills-zh/ctx/SKILL.zh.md + references/*.zh.md |
| R7 | 生成示例缓存，演示契约含混合类型节 | solved | examples/{empty-skeleton,login-redesign,csv-import} 全部 doctor-healthy |
| R8 | 技能位于仓库根 skills/（非 .agents/skills/），脚本不翻译，中文镜像命名统一 | solved | 最终布局见 understanding §3 |

**Verification**：passed —— 三个示例目录全部 doctor-healthy。

## bug-fix

**Decision**：实现期两处修正记入 tooling CHANGELOG：thread slug 校验改用独立
kebab-case 正则；`--update-i18n` 不再把当次治愈的侧计为违约。

## testing

**Requirements**

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R5 | doctor 通过全部违约类别的错误注入 | solved | fixture 12/12（bad-tag、head-dup、prev-broken、status-enum、triplet-missing、naming、stray-dir、index-miss、i18n-stale→自愈） |
| R6 | 全生命周期走查：create → append → supersede → archive → doctor healthy | solved | /tmp 走查夹具，修复 prev 链接后 doctor exit=0 |

**Verification**：passed —— 工具注入测试 12/12（逐违约类别注入、空骨架健康
闭环、update-i18n 自愈）；生命周期走查经 doctor 复查 exit=0；提交 8407708
收录完整目录树且状态干净。

## Update Log

- 2026-08-27 13:55: 创建检查点（引导会话的第一次真实压缩）。
- 2026-08-27: 格式迁移——正文大纲按 type-outline 规格改写为类型节；事实全部保留，仅结构重排。
