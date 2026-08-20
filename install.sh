#!/usr/bin/env bash
# dsh-token-cost installer
# Links the plugin into the DeepSeek Harness web profile and adds the
# token-cost loader row to cordis.patch.yml. Idempotent: safe to re-run.
#
#   bash install.sh
#
# Override with DSH_HOME / DSH_PROFILE when the harness home or profile name
# differs from the defaults (~/.dsh, web).
set -euo pipefail

DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE="${DSH_PROFILE:-web}"
PROFILE_DIR="$DSH_HOME/profiles/$PROFILE"
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="dsh-token-cost"

if [ ! -d "$PROFILE_DIR" ]; then
  echo "error: profile dir not found: $PROFILE_DIR (set DSH_HOME/DSH_PROFILE if needed)" >&2
  exit 1
fi

echo "==> installing $PLUGIN_NAME into profile: $PROFILE_DIR"

# --- 1. link the plugin into the profile's node_modules --------------------
mkdir -p "$PROFILE_DIR/node_modules"
LINK="$PROFILE_DIR/node_modules/$PLUGIN_NAME"
if [ -e "$LINK" ] || [ -L "$LINK" ]; then
  echo "  ✓ already linked: $LINK"
else
  ln -s "$PLUGIN_DIR" "$LINK"
  echo "  ✓ linked $PLUGIN_DIR -> $LINK"
fi

# --- 2. add the loader row to cordis.patch.yml (idempotent) ----------------
PATCH="$PROFILE_DIR/cordis.patch.yml"
if grep -q "id: token-cost" "$PATCH" 2>/dev/null; then
  echo "  ✓ loader row already present in $PATCH"
else
  INSERT=$(cat <<'YAML'

- insert:
    - id: token-cost
      name: 'dsh-token-cost'
      config:
        currency: USD
        cnyUsdRate: 7.2          # >0 时在明细弹层里显示 ≈¥ 换算；0 关闭
        default:                  # 未知模型的回退价
          input: 0.22
          cacheRead: 0.007
          cacheWrite: 0.22
          output: 0.66
          peak:
            input: 0.44
            cacheRead: 0.014
            cacheWrite: 0.44
            output: 1.32
        models:
          deepseek-official/deepseek-v4-flash:
            input: 0.22
            cacheRead: 0.007
            cacheWrite: 0.22
            output: 0.66
            peak:
              input: 0.44
              cacheRead: 0.014
              cacheWrite: 0.44
              output: 1.32
        peakHours: [[9, 12], [14, 18]]   # 高峰时段（本地时间/北京时间）；[] 关闭峰谷价
YAML
)
  # file content minus comment-only and blank lines
  BODY="$(grep -v '^[[:space:]]*#' "$PATCH" 2>/dev/null | sed '/^[[:space:]]*$/d' || true)"
  if [ -z "$BODY" ] || [ "$BODY" = "[]" ]; then
    # trivial/empty patch file -> rewrite header + insert
    cat > "$PATCH" <<EOF
# Your patch layer for this dsh profile, applied after every bundle layer:
# a top-level YAML array of loader patch entries (id-targeted config
# overrides, disables, and insert lists; \`!!js\` expressions allowed).

# ── dsh-token-cost: 实时显示当前会话 token 消耗金额 ─────────────────────────
# 服务端注册 tokenCost 会话投影（按模型单价 × 峰谷时段计价），
# 客户端在会话头部右侧渲染费用小药丸（含高峰红灯/非高峰绿灯）。
# 价格按 美元 / 每 1M token 计；修改价格需重启 DeepSeek Harness Desktop 生效。
$(echo "$INSERT" | sed '1d')
EOF
    echo "  ✓ wrote loader row to $PATCH"
  else
    # non-trivial existing content -> append a top-level list item
    printf '%s\n' "$INSERT" >> "$PATCH"
    echo "  ✓ appended loader row to $PATCH"
  fi
fi

cat <<EOF

✅ 安装完成！
  1. 完全退出并重新打开 DeepSeek Harness Desktop
  2. 打开任意已有用量的会话，头部右侧即可看到费用药丸
     （当前高峰时段红灯，非高峰绿灯；点击可看明细）
  3. 价格与高峰时段在 $PATCH 中配置，改完同样需要重启
EOF
