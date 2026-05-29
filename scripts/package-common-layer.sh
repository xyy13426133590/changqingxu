#!/usr/bin/env bash
# 打包 cloudfunctions/common 为云函数 Layer 上传包
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMMON="$ROOT/cloudfunctions/common"
OUT="$ROOT/cloudfunctions/common-layer.zip"

cd "$COMMON"
npm install --production
cd "$ROOT/cloudfunctions"
rm -f common-layer.zip
zip -r common-layer.zip common -x "common/node_modules/.cache/*"

echo "完成: $OUT"
echo "下一步: 云开发控制台 → 层管理 → 新建 common-layer (Nodejs18.15) → 上传 zip → 挂载 /opt"
