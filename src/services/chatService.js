import api from './api';

const unwrapList = (res) => ({
  items: res.data.data,
  total: res.data.total ?? res.data.count ?? 0,
  page: res.data.page ?? 1,
  totalPages: res.data.pages ?? 1,
});

// Pure REST client - no Socket.IO (the backend runs as serverless functions
// and can't hold a persistent connection). New messages are picked up by
// polling from ChatScreen / ChatListScreen.
const chatService = {
  getConversations: (params) =>
    api.get('/chat/conversations', { params }).then((res) => ({
      ...unwrapList(res),
      totalUnread: res.data.totalUnread ?? 0,
    })),

  getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }).then(unwrapList),

  startConversation: (data) => api.post('/chat/conversations', data).then((res) => res.data.data),

  sendMessage: (conversationId, data) => api.post(`/chat/conversations/${conversationId}/messages`, data).then((res) => res.data.data),

  markAsRead: (conversationId) => api.put(`/chat/conversations/${conversationId}/read`).then((res) => res.data),
};

export default chatService;
