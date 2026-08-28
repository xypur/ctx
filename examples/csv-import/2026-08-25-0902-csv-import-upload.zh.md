# Context Checkpoint: CSV import chunked upload（中文镜像）

> 本文件是 `2026-08-25-0902-csv-import-upload.md` 的中文镜像，内容与英文正典等价；
> AI 默认读取英文正典。front matter 与英文侧逐字段一致。

## feature

### Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R1 | 导入在 UI 线程之外运行且有可见进度 | solved | 10k 行样例手工观察通过 |

### Decision

批量导入数千行 CSV 会阻塞 UI 线程，且没有进度或失败恢复反馈；
因此把文件切成 500 行一批，由 worker 顺序上传，进度事件驱动确定性进度条。
选择分块而非单个 multipart 请求，是为了让单块重试足够廉价。

### Consequences

UI 保持响应、部分失败可从失败块续传；代价是服务端需要重组
逻辑，小文件会有 N+1 次请求开销。

### Verification

Not run —— 目前只在 dev 构建上做过手工观察。

## Update Log

- 2026-08-25 09:02: 创建检查点。
- 2026-08-27: 格式迁移至类型节大纲（type-outline 规格）；内容保留。
