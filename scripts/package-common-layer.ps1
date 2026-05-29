# 打包 cloudfunctions/common 为云函数 Layer 上传包
# 用法：在项目根目录执行 .\scripts\package-common-layer.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$commonDir = Join-Path $root 'cloudfunctions\common'
$outZip = Join-Path $root 'cloudfunctions\common-layer.zip'

if (-not (Test-Path $commonDir)) {
  Write-Error "未找到 $commonDir"
}

Write-Host '安装 common 依赖...'
Push-Location $commonDir
npm install --production
Pop-Location

if (Test-Path $outZip) { Remove-Item $outZip -Force }

Write-Host '打包 zip...'
Compress-Archive -Path (Join-Path $commonDir '*') -DestinationPath $outZip -Force

Write-Host "完成: $outZip"
Write-Host '下一步: 云开发控制台 → 云函数 → 层管理 → 新建层 common-layer (Nodejs18.15) → 上传此 zip → 挂载路径 /opt'
