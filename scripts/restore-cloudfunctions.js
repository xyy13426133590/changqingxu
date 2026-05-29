/**
 * Restore cloudfunctions from _restore_from_transcript with prefix rename and /opt requires.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, '_restore_from_transcript')
const DEST = path.join(ROOT, 'cloudfunctions')

const RENAME_MAP = {
  register: 'auth-register',
  login: 'auth-login',
  smsLogin: 'auth-smsLogin',
  sendSms: 'auth-sendSms',
  wechatLogin: 'auth-wechatLogin',
  refreshToken: 'auth-refreshToken',
  realName: 'auth-realName',
  faceVerify: 'auth-faceVerify',
  getMe: 'user-getMe',
  updateProfile: 'user-updateProfile',
  updateFilters: 'user-updateFilters',
  getVipStatus: 'user-getVipStatus',
  getUserCard: 'user-getUserCard',
  getRecommendations: 'user-getRecommendations',
  getDailyRecommendations: 'user-getDailyRecommendations',
  getUserDetail: 'user-getUserDetail',
  reportUser: 'user-reportUser',
  likeUser: 'match-likeUser',
  passUser: 'match-passUser',
  superLikeUser: 'match-superLikeUser',
  getMutualMatches: 'match-getMutualMatches',
  resetSwipeHistory: 'match-resetSwipeHistory',
  getConversations: 'chat-getConversations',
  createConversation: 'chat-createConversation',
  deleteConversation: 'chat-deleteConversation',
  togglePinConversation: 'chat-togglePinConversation',
  getMessages: 'chat-getMessages',
  sendMessage: 'chat-sendMessage',
  markMessagesRead: 'chat-markMessagesRead',
  getVipPlans: 'vip-getVipPlans',
  createVipOrder: 'vip-createVipOrder',
  getVipOrder: 'vip-getVipOrder',
  mockPayOrder: 'vip-mockPayOrder',
  wechatPayNotify: 'vip-wechatPayNotify',
  uploadAvatar: 'upload-uploadAvatar',
  uploadImage: 'upload-uploadImage',
  uploadVoice: 'upload-uploadVoice',
}

const BUSINESS_FN_PKG = (name) => JSON.stringify(
  {
    name,
    version: '1.0.0',
    main: 'index.js',
    dependencies: {
      'wx-server-sdk': '~2.6.3',
      jsonwebtoken: '^9.0.2',
      bcryptjs: '^2.4.3',
    },
  },
  null,
  2,
) + '\n'

function transformContent(content, isCommon) {
  let s = content
  s = s.replace(/require\(['"]\.\.\/common\//g, "require('/opt/")
  s = s.replace(/require\(["']\.\.\/common\//g, 'require("/opt/')
  if (isCommon) {
    s = s.replace(/require\(['"]\.\.\//g, "require('/opt/")
    s = s.replace(/require\(["']\.\.\//g, 'require("/opt/')
    s = s.replace(/path\.join\('\/opt\/common'/g, "path.join('/opt'")
    s = s.replace(/path\.join\("\/opt\/common"/g, 'path.join("/opt"')
  }
  return s
}

function copyDir(srcDir, destDir, isCommon = false) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (ent.name === 'node_modules') continue
    const srcPath = path.join(srcDir, ent.name)
    const destPath = path.join(destDir, ent.name)
    if (ent.isDirectory()) {
      copyDir(srcPath, destPath, isCommon)
    } else {
      let content = fs.readFileSync(srcPath, 'utf8')
      if (ent.name.endsWith('.js') || ent.name.endsWith('.md')) {
        content = transformContent(content, isCommon)
      }
      if (ent.name === 'package.json' && isCommon && ent.name === 'package.json') {
        const pkg = JSON.parse(content)
        pkg.dependencies = {
          ...pkg.dependencies,
          'tencentcloud-sdk-nodejs': '^4.0.0',
        }
        content = JSON.stringify(pkg, null, 2) + '\n'
      }
      fs.writeFileSync(destPath, content)
    }
  }
}

// common layer
const commonSrc = path.join(SRC, 'common')
const commonDest = path.join(DEST, 'common')
copyDir(commonSrc, commonDest, true)

// Fix common package.json deps explicitly
const commonPkgPath = path.join(commonDest, 'package.json')
const commonPkg = {
  name: 'changqingxu-cloud-common',
  version: '1.0.0',
  description: '长情许云函数公共层',
  main: 'index.js',
  dependencies: {
    'wx-server-sdk': '~2.6.3',
    jsonwebtoken: '^9.0.2',
    bcryptjs: '^2.4.3',
    'tencentcloud-sdk-nodejs': '^4.0.0',
  },
}
fs.writeFileSync(commonPkgPath, JSON.stringify(commonPkg, null, 2) + '\n')

// docs at cloudfunctions root
for (const doc of ['README.md', 'env.example', 'DEPLOY_CHECKLIST.md']) {
  const src = path.join(SRC, doc)
  if (fs.existsSync(src)) {
    let content = fs.readFileSync(src, 'utf8')
    content = transformContent(content, false)
    fs.writeFileSync(path.join(DEST, doc), content)
  }
}

// business functions
const created = []
for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
  const indexSrc = path.join(SRC, oldName, 'index.js')
  if (!fs.existsSync(indexSrc)) {
    console.error('MISSING:', indexSrc)
    continue
  }
  const fnDir = path.join(DEST, newName)
  fs.mkdirSync(fnDir, { recursive: true })
  let indexContent = fs.readFileSync(indexSrc, 'utf8')
  indexContent = transformContent(indexContent, false)
  fs.writeFileSync(path.join(fnDir, 'index.js'), indexContent)
  fs.writeFileSync(path.join(fnDir, 'package.json'), BUSINESS_FN_PKG(newName))
  created.push(newName)
}

console.log('Restored', created.length, 'business functions + common layer')
console.log(created.join('\n'))
