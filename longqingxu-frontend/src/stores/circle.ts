import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import {
  apiListFeed,
  apiToggleLike,
  apiListComments,
  apiCreateComment,
  type MomentPost,
  type CommentItem,
} from '@/services/api-moment'

export const useCircleStore = defineStore('circle', () => {
  const posts = ref<MomentPost[]>([])
  const page = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)
  const refreshing = ref(false)
  const circleId = ref<string | undefined>('default_public')

  // 评论状态：{ [postId]: { list, loading, page, hasMore } }
  const commentState = reactive<
    Record<string, { list: CommentItem[]; loading: boolean; page: number; hasMore: boolean }>
  >({})

  // 当前展开评论的帖子 ID
  const commentSheetPostId = ref<string | null>(null)
  const commentInput = ref('')

  /** 刷新 Feed */
  async function refreshFeed() {
    if (refreshing.value) return
    refreshing.value = true
    page.value = 1
    hasMore.value = true
    try {
      const res = await apiListFeed({ circleId: circleId.value, page: 1, limit: 10 })
      posts.value = res.posts
      hasMore.value = res.hasMore
      page.value = 1
    } finally {
      refreshing.value = false
    }
  }

  /** 加载更多 */
  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    const nextPage = page.value + 1
    try {
      const res = await apiListFeed({ circleId: circleId.value, page: nextPage, limit: 10 })
      posts.value.push(...res.posts)
      hasMore.value = res.hasMore
      page.value = nextPage
    } finally {
      loading.value = false
    }
  }

  /** 点赞（乐观更新） */
  async function toggleLike(postId: string) {
    const idx = posts.value.findIndex((p) => p.id === postId)
    if (idx === -1) return

    const post = posts.value[idx]
    const wasLiked = post.isLiked
    // 乐观更新
    posts.value[idx] = {
      ...post,
      isLiked: !wasLiked,
      likeCount: wasLiked ? post.likeCount - 1 : post.likeCount + 1,
    }

    try {
      const res = await apiToggleLike(postId)
      posts.value[idx] = {
        ...posts.value[idx],
        isLiked: res.liked,
        likeCount: res.likeCount,
      }
    } catch {
      // 回滚
      posts.value[idx] = { ...post }
      uni.showToast({ title: '操作失败，请重试', icon: 'none' })
    }
  }

  /** 往 posts 里插入新帖（发布后） */
  function prependPost(post: MomentPost) {
    posts.value.unshift(post)
  }

  /** 删除帖子 */
  function removePost(postId: string) {
    const idx = posts.value.findIndex((p) => p.id === postId)
    if (idx !== -1) posts.value.splice(idx, 1)
  }

  /** 打开评论抽屉 */
  async function openCommentSheet(postId: string) {
    commentSheetPostId.value = postId
    if (!commentState[postId]) {
      commentState[postId] = { list: [], loading: false, page: 0, hasMore: true }
    }
    if (commentState[postId].list.length === 0) {
      await loadComments(postId)
    }
  }

  function closeCommentSheet() {
    commentSheetPostId.value = null
    commentInput.value = ''
  }

  /** 加载评论 */
  async function loadComments(postId: string) {
    if (!commentState[postId]) {
      commentState[postId] = { list: [], loading: false, page: 0, hasMore: true }
    }
    const state = commentState[postId]
    if (state.loading || !state.hasMore) return
    state.loading = true
    const nextPage = state.page + 1
    try {
      const res = await apiListComments({ postId, page: nextPage, limit: 20 })
      state.list.push(...res.comments)
      state.hasMore = res.hasMore
      state.page = nextPage
    } finally {
      state.loading = false
    }
  }

  /** 发布评论 */
  async function submitComment(postId: string) {
    const content = commentInput.value.trim()
    if (!content) {
      uni.showToast({ title: '评论不能为空', icon: 'none' })
      return
    }
    try {
      const newComment = await apiCreateComment({ postId, content })
      if (!commentState[postId]) {
        commentState[postId] = { list: [], loading: false, page: 1, hasMore: false }
      }
      commentState[postId].list.push(newComment)
      commentInput.value = ''

      // 更新 commentCount
      const idx = posts.value.findIndex((p) => p.id === postId)
      if (idx !== -1) {
        posts.value[idx] = {
          ...posts.value[idx],
          commentCount: posts.value[idx].commentCount + 1,
        }
      }
    } catch {
      uni.showToast({ title: '评论失败', icon: 'none' })
    }
  }

  return {
    posts,
    page,
    hasMore,
    loading,
    refreshing,
    circleId,
    commentState,
    commentSheetPostId,
    commentInput,
    refreshFeed,
    loadMore,
    toggleLike,
    prependPost,
    removePost,
    openCommentSheet,
    closeCommentSheet,
    loadComments,
    submitComment,
  }
})
