import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  apiListMyPosts,
  apiGetMyStats,
  apiDeletePost,
  type MomentPost,
  type MyStats,
} from '@/services/api-moment'

export const useMyMomentsStore = defineStore('my-moments', () => {
  const posts = ref<MomentPost[]>([])
  const page = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)
  const refreshing = ref(false)

  const stats = ref<MyStats>({ postCount: 0, totalLikes: 0, totalComments: 0 })
  const statsLoaded = ref(false)

  /** 加载统计（我的 Tab 菜单入口也需要调用） */
  async function loadStats() {
    try {
      const res = await apiGetMyStats()
      stats.value = res
      statsLoaded.value = true
    } catch {
      // 忽略统计加载失败，不影响主流程
    }
  }

  /** 刷新我的动态列表 */
  async function refresh() {
    if (refreshing.value) return
    refreshing.value = true
    page.value = 1
    hasMore.value = true
    try {
      const [postsRes] = await Promise.all([
        apiListMyPosts({ page: 1, limit: 10 }),
        loadStats(),
      ])
      posts.value = postsRes.posts
      hasMore.value = postsRes.hasMore
      page.value = 1
    } finally {
      refreshing.value = false
    }
  }

  /** 上拉加载更多 */
  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    const nextPage = page.value + 1
    try {
      const res = await apiListMyPosts({ page: nextPage, limit: 10 })
      posts.value.push(...res.posts)
      hasMore.value = res.hasMore
      page.value = nextPage
    } finally {
      loading.value = false
    }
  }

  /** 删除帖子（乐观更新 + 更新统计） */
  async function deletePost(postId: string) {
    const idx = posts.value.findIndex((p) => p.id === postId)
    if (idx === -1) return
    const removed = posts.value.splice(idx, 1)[0]
    try {
      await apiDeletePost(postId)
      // 更新统计
      if (stats.value.postCount > 0) {
        stats.value = {
          ...stats.value,
          postCount: stats.value.postCount - 1,
          totalLikes: Math.max(0, stats.value.totalLikes - (removed.likeCount || 0)),
          totalComments: Math.max(0, stats.value.totalComments - (removed.commentCount || 0)),
        }
      }
    } catch {
      // 回滚
      posts.value.splice(idx, 0, removed)
      uni.showToast({ title: '删除失败，请重试', icon: 'none' })
    }
  }

  /** 发布成功后在列表顶部插入新帖 */
  function prependPost(post: MomentPost) {
    posts.value.unshift(post)
    stats.value = {
      ...stats.value,
      postCount: stats.value.postCount + 1,
    }
  }

  return {
    posts,
    page,
    hasMore,
    loading,
    refreshing,
    stats,
    statsLoaded,
    loadStats,
    refresh,
    loadMore,
    deletePost,
    prependPost,
  }
})
