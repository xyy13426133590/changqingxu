/**
 * REST 路径 -> 云函数名映射表
 */
export const CLOUD_API_MAP = {
  auth: {
    register: 'auth-register',
    login: 'auth-login',
    smsLogin: 'auth-smsLogin',
    sendSms: 'auth-sendSms',
    wechatLogin: 'auth-wechatLogin',
    refreshToken: 'auth-refreshToken',
    realName: 'auth-realName',
    faceVerify: 'auth-faceVerify',
  },
  users: {
    getMe: 'user-getMe',
    updateProfile: 'user-updateProfile',
    updateFilters: 'user-updateFilters',
    getVipStatus: 'user-getVipStatus',
    getUserCard: 'user-getUserCard',
    getRecommendations: 'user-getRecommendations',
    getDailyRecommendations: 'user-getDailyRecommendations',
    getUserDetail: 'user-getUserDetail',
    reportUser: 'user-reportUser',
  },
  matches: {
    like: 'match-likeUser',
    pass: 'match-passUser',
    superLike: 'match-superLikeUser',
    mutual: 'match-getMutualMatches',
    resetSwipes: 'match-resetSwipeHistory',
  },
  conversations: {
    list: 'chat-getConversations',
    create: 'chat-createConversation',
    delete: 'chat-deleteConversation',
    togglePin: 'chat-togglePinConversation',
    messages: 'chat-getMessages',
  },
  messages: {
    send: 'chat-sendMessage',
    markRead: 'chat-markMessagesRead',
  },
  vip: {
    plans: 'vip-getVipPlans',
    createOrder: 'vip-createVipOrder',
    getOrder: 'vip-getVipOrder',
    mockPay: 'vip-mockPayOrder',
  },
  upload: {
    avatar: 'upload-uploadAvatar',
    image: 'upload-uploadImage',
    voice: 'upload-uploadVoice',
    video: 'upload-uploadVideo',
  },
  moments: {
    listFeed: 'moment-listFeed',
    listMyPosts: 'moment-listMyPosts',
    getMyStats: 'moment-getMyStats',
    createPost: 'moment-createPost',
    deletePost: 'moment-deletePost',
    toggleLike: 'moment-toggleLike',
    listComments: 'moment-listComments',
    createComment: 'moment-createComment',
  },
  circles: {
    list: 'circle-list',
  },
} as const

export type CloudFunctionName = (typeof CLOUD_API_MAP)[keyof typeof CLOUD_API_MAP][keyof (typeof CLOUD_API_MAP)[keyof typeof CLOUD_API_MAP]]
