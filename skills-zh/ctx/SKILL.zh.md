---
name: ctx
description: >-
  将 AI 会话上下文压缩为面向决策的项目记忆，存放于 .agents/context/。当用户要求
  保存上下文、压缩会话（“存一下”“保存这个上下文”）、从缓存恢复此前工作（恢复上下文），
  或维护检查点索引时使用；不适用于普通 git 提交或任务笔记。
---

# ctx — 会话上下文压缩与缓存

把冗长的会话工作压缩成简短的决策检查点，让未来的任何 Agent 无需回放历史即可继续工作。
一次压缩 = 一个会话检查点的三件套写入：英文正典 + 中文镜像 + 凭据。

权威参考文档（按需阅读，中文镜像）：

- `references/cache-layout.zh.md` — 目录形态与索引格式
- `references/file-naming.zh.md` — 命名、三件套、`.i18n.yaml`
- `references/checkpoint-format.zh.md` — front matter 模式与正文骨架

与 `skills/ctx/` 英文正典同步维护；本目录是同一份技能的中文镜像，不独立演进。

## 操作总览

| 操作 | 含义 | 使用时机 |
|---|---|---|
| `ctx` | 查看缓存状态 + 根索引摘要 | 定位方向，或在 create/append 之前 |
| `ctx-create` | 开启新的会话检查点三件套 | 一个会话的第一次压缩 |
| `ctx-append` | 向当前会话检查点合并更多内容 | 同一会话的后续压缩 |
| `ctx-resume` | 渐进式披露恢复此前工作 | 开始可能受历史影响的工作 |
| `ctx-archive` | 把被取代记录移入 archive/ | 取代完成后的日常整理 |

## 共通规则

1. **意图不明必须询问。** 用户的保存请求若无法判断是新建还是续写，先问
   “create 还是 append？”——绝不默默替用户选择。
2. **历史永不清除。** 被取代标记 `status: superseded`；归档只是移动文件；
   什么都不删除。更新一律走 `Update Log`，不做覆盖式重写。
3. **诚实记录。** 需求行携带真实状态
   （solved / partial / unresolved / deferred / rejected）；验证只写
   passed / failed / Not run。
4. 英文正典优先；宣布操作完成前必须先同步中文镜像 + `.i18n.yaml`。
5. 不创建分类子目录或额外索引——分类只存在于 front matter 的 tags。

## ctx-create

1. 读根 `index.md`；确定目标：新的 `thread` slug（kebab-case），或正在被取代的既有线程。
2. 选初始 `tags`（受控词表）。混合了 feature 与 bug-fix 的会话直接在同一份检查点里同时打两个标签。
3. 按 `file-naming.md` 命名；同分钟冲突时使用下一个 `-NN` 序号。
4. 按 `checkpoint-format.md` 写英文正典；设 `created=updated=now`、
   `prev` = 上一 head 路径或 null、`head: true`、`status: active`。
5. 翻译生成 `<base>.zh.md`，计算双侧 blob hash，写 `<base>.i18n.yaml`。
6. 根索引：追加 Records 行 + 线程行（被取代的旧 head 移除其行），把本文档置为 head。
7. 只有在第 4–6 步完整承接旧记录的仍然有效的事实之后，才把前一 head 的 `status` 改为 `superseded`。

若当前分钟已存在同名 slug，优先补充有区分度的词汇，而不是立刻跳到 `-02`。

若项目存在 `.agents/specs/` 目录，Requirements 表直接引用其需求条款号
（如 `cache-contract 3.4`），不要重新定义需求——见 `checkpoint-format.md`
的“规格联动会话”。

## ctx-append

通过根索引 Active Threads 定位 head（找不到则报告并建议运行 `ctx`；不得擅自新建）。

1. 保持文件名、`created`、`thread` 不变；刷新 `updated`。
2. 对实际存在的 Problem / Requirements / Decision / Consequences / Verification 各节做结构化增量合并：
   新事实就地整合、状态带证据推进；绝不在文末粘贴第二份完整摘要。
3. 向 `Update Log` 追加一条带时间戳的变化记录。
4. tags 可以增加取值；仍然适用的标签不得移除。
5. 同步镜像 + 重写 `.i18n.yaml` hash；摘要变化时更新根索引 Records 行。

## ctx-resume

渐进式披露——尽量少读：

| 层级 | 读取内容 | 规则 |
|---|---|---|
| L1 | 根 `index.md` | 永远最先读 |
| L2 | 选中的英文正典检查点 | 只读与手头任务相关的 |
| L3 | `prev:` 祖先链和/或 `archive/index.md` | 仅当 L2 缺事实或需追溯演变 |

默认不读镜像。结束时报告：恢复到的位置、活动线程状态、以及 `next:` 行动项。

若项目同时存在 `.agents/specs/index.md`，在读完根上下文索引后紧接着读它。
权威分工：`.agents/specs/` 是模块/任务状态的唯一真源（状态栏、下一任务、
需求条款）；上下文索引是会话记忆的唯一真源。ctx 操作只读取规格状态并引用
其条款号——绝不编辑规格文档。

## ctx-archive

仅针对 `status: superseded`（或 `archived`）的候选记录：

1. 三件套整体移动到 `archive/`。
2. 设 `status: archived`、`head: false`（随移动一并修改 front matter）。
3. 原子化修复链接：根索引删除该行；归档索引顶部插入条目；
   其他文档中指向被移动正典的 `prev:` 全部改写为新相对路径。
4. 若任一 active 记录仍经 `prev:` 引用它且取代流程未完成——拒绝执行，
   先完成取代再重试。
