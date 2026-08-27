# Design Document

## Overview

本模块不引入任何运行时代码，产出三个纯文档入口。它们共同构成「正典层」：后续 plugin / extension / rules 模块全部从这里派生，保证薄适配器不漂移。

## Architecture

```text
README.md / README.zh.md      ← 人类入口：定位 + 安装索引
AGENTS.md                     ← Agent 入口：always-on 正典（自举 + 派生源）
docs/agent-portability.md     ← 维护者入口：适配矩阵（checkpoint 走查对账）
```

## Key Decisions

### Decision 1: AGENTS.md 双重职责

**Context:** AGENTS.md 既要在本仓库自举（Agent 在 ctx 仓库内工作时的记忆指针），又要充当 instruction-tier 正典供规则副本派生。

**Options Considered:**
- **Option A: 自举与正典分两份文件** — Pros: 职责纯净 / Cons: 两处同步成本，副本派生源含糊。Effort: low
- **Option B: 一份兼任** — Pros: 单一真源，同步成本为零。Effort: low

**Decision:** Option B。

**Rationale:** ctx 仓库本身就是 ctx 的第一个用户（自举场景与目标项目场景同构：都有 `.agents/context/`）；单一正典为未来任何 instruction-tier 派生提供唯一基准。

### Decision 2: README 双语不走凭据机制

**Context:** 项目已有 skills/skills-zh 双语纪律（英文正典 + 中文镜像）。

**Decision:** README.md 英文正典 + README.zh.md 手工同步镜像；不套用 `.i18n.yaml` blob 凭据（那是 context checkpoint 三件套专用契约）。

**Rationale:** 双语定位一致；但不把 doctor 的凭据协议扩展到非缓存文件，避免契约范围膨胀。同步质量由 review 保证。

### Decision 3: 与 ponytail 的定位声明

**Context:** 同为 skill 仓库且形态相近，易被误认为 fork。

**Decision:** README 明确：ctx 与 ponytail 互补——ponytail 管写代码的行为模式（always-on），ctx 管会话记忆的持久化（按需操作）；ctx 只借鉴其 agent-portability 分层与 Adapter Rule，不依赖其任何文件。

**Rationale:** 避免用户误装同域功能，也明确依赖边界（ctx 不依赖 ponytail 即可运行）。

## Correctness Properties

### Property 1: 冷启动可发现

*For any* 仅加载 AGENTS.md 的新会话，若 `.agents/context/index.md` 存在，则 Agent 能说出根索引路径与恢复入口，无需读取 SKILL.md。

**Validates: Requirements 2.1, 2.4**

### Property 2: 矩阵与实物一致

*For any* agent-portability.md 中列出的文件路径，仓库中存在对应文件。

**Validates: Requirements 3.3**
