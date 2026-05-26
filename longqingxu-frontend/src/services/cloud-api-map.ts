/**
 * REST 路径 → 云函数名映射表
 */
export const CLOUD_API_MAP = {
  auth: {
    register: 'register',
    login: 'login',
    smsLogin: 'smsLogin',
    sendSms: 'sendSms',
    wechatLogin: 'wechatLogin',
    refreshToken: 'refreshToken',
    realName: 'realName',
    faceVerify: 'faceVerify',
  },
  users: {
    getMe: 'getMe',
    updateProfile: 'updateProfile',
    updateFilters: 'updateFilters',
    getVipStatus: 'getVipStatus',
    getUserCard: 'getUserCard',
    getRecommendations: 'getRecommendations',
    getDailyRecommendations: 'getDailyRecommendations',
    getUserDetail: 'getUserDetail',
    reportUser: 'reportUser',
  },
  matches: {
    like: 'likeUser',
    pass: 'passUser',
    superLike: 'superLikeUser',
    mutual: 'getMutualMatches',
    resetSwipes: 'resetSwipeHistory',
  },
  conversations: {
    list: 'getConversations',
    create: 'createConversation',
    delete: 'deleteConversation',
    togglePin: 'togglePinConversation',
    messages: 'getMessages',
  },
  messages: {
    send: 'sendMessage',
    markRead: 'markMessagesRead',
  },
  vip: {
    plans: 'getVipPlans',
    createOrder: 'createVipOrder',
    getOrder: 'getVipOrder',
    mockPay: 'mockPayOrder',
  },
  upload: {
    avatar: 'uploadAvatar',
    image: 'uploadImage',
    voice: 'uploadVoice',
  },
} as const