# size-rollover Change Log

## 2026-09-11

- 创建模块规格：requirements 4 组 / design 5 决策 3 性质 / tasks 6 条（Foundation-First）。
- 触发背景：检查点无尺寸约束，ctx-append 永久合并同一文件、Update Log 只增不减，长会话读取成本无界。
- 用户四项决议入册：①滚动段只记增量（取代语义显式例外，旧事实靠 prev + L3 追溯）；②只按 canon 字节数计量，阈值 24 KiB；③config.yaml + init 默认生成；④滚动自动执行。
- 用户指令「开始执行」：规格创建后直接实施。
