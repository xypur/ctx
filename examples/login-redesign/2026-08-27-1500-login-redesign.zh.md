# Context Checkpoint: Login redesign（中文镜像）

> 本文件是 `2026-08-27-1500-login-redesign.md` 的中文镜像，内容与英文正典等价；
> AI 默认读取英文正典。front matter 与英文侧逐字段一致。

## Problem

会话过期会把用户硬性登出，且刷新端点早已存在但从未接入请求管线，
长时间编辑会话因此丢失未保存的工作。

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R1 | 会话过期后经静默刷新优雅存活 | solved | `npm test -- auth` 全绿（14 例） |
| R2 | 刷新端点接入请求管线 | solved | e2e `login-refresh.spec.ts` 本地通过 |
| R3 | 审计日志在重试时屏蔽 token 值 | unresolved | 调试模式下拦截器仍记录原始 header |

## Decision

引入共享认证拦截器（`src/auth/interceptor.ts`）：捕获 401、轮换一次 token、
重放原请求，并在任何日志输出前屏蔽 token 值。功能接入（刷新）与缺陷修复
（硬登出）落在同一份检查点；tags 同时携带两个侧面。

## Consequences

过期不再强制登出、无数据丢失；接受的代价是每个过期 token 多一次往返，
以及未来所有客户端改动都必须维护的拦截器复杂度。

## Verification

passed —— `npm test -- auth`（单测）与
`npx playwright test login-refresh`（e2e），均对本地 dev server 执行。

## Update Log

- 2026-08-27 15:00: 创建检查点。
- 2026-08-27 16:10: 追加 R2 证据并新增 R3（第一次 append 压缩）。
