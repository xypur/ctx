# 文件命名与双语三件套契约

真源：`docs/ctx-understanding.md` §5 与 §10。`scripts/doctor.mjs` 校验命名与 `.i18n.yaml` 新鲜度。

## 检查点命名

```text
YYYY-MM-DD-HHMM-<kebab-slug>.md
```

示例：

```text
2026-08-26-2115-login-session-fix.md
```

时间戳前缀的职责：

- 记录创建时间，同日内排序无歧义；
- 使字典序 ≈ 时间顺序；
- 同一天多次压缩也不会因纯日期名冲突。

同一分钟出现两个检查点时，按创建顺序以确定性序号 `-02`、`-03`… 后缀解决：

```text
2026-08-26-2115-login-session-fix.md
2026-08-26-2115-login-session-fix-02.md
```

slug 规则：

- 仅小写 kebab-case（`[a-z0-9-]`）；
- 能一眼看出本次压缩的主题；
- 一经确定不得改名——改名会破坏 prev 链接与索引行。

## 双语三件套

每个正典检查点恰好由共享同一 `<base>` 的三个文件组成：

```text
2026-08-26-2115-login-session-fix.md          # 英文正典 — Agent 默认读取
2026-08-26-2115-login-session-fix.zh.md       # 中文镜像 — 人类 / 明确中文请求
2026-08-26-2115-login-session-fix.i18n.yaml   # 配对凭据
```

`.i18n.yaml` schema：

```yaml
en_blob: <正典 .md 的 sha1 git blob hash>
zh_blob: <.zh.md 的 sha1 git blob hash>
synced_at: 2026-08-27 09:41
```

规则：

1. 正典是权威版本；镜像内容必须始终与之等价。
2. 镜像绝不作为独立行出现在任何索引中；索引只链接正典。
3. `prev:` 链与所有交叉链接都指向正典路径，永不指向镜像。
4. 编辑任一侧之后：先同步另一侧，再重算双侧 blob hash 并重写 `.i18n.yaml`。被编辑一侧落后于已同步 hash 即为 stale，doctor 会标记。
