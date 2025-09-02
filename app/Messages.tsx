"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useCallback, useState, useEffect, memo } from "react"
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import socket from "./utils/socket"

type Chat = {
  id: string
  name: string
  content: string
  created_at: string
  unreadCount?: number
}

const MessagesScreen = () => {
  const router = useRouter()
  const [messages, setMessages] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false) // network in-flight (refresh/search)
  const [initialLoading, setInitialLoading] = useState(true) // first load gate
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<'all' | 'unread'>('all')

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("token")
      const userId = await AsyncStorage.getItem("userId")
      if (!token || !userId) throw new Error("User not authenticated")

      const response = await fetch(`https://pregwell-backend.onrender.com/api/messages/inbox/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch inbox")
      const data = await response.json()
      setMessages(
        data.sort(
          (a: Chat, b: Chat) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      )
    } catch (error) {
      console.error("❌ Error fetching inbox:", error)
      if (initialLoading) setMessages([])
    } finally {
      setLoading(false)
      if (initialLoading) setInitialLoading(false)
    }
  }, [])

  // 📖 Mark all messages as read
  const markAllMessagesAsRead = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      const userId = await AsyncStorage.getItem("userId")
      if (!token || !userId) return

      // Mark all unread messages as read
      const unreadChats = messages.filter(chat => chat.unreadCount && chat.unreadCount > 0)
      
      for (const chat of unreadChats) {
        await fetch(`https://pregwell-backend.onrender.com/api/messages/mark-read/${chat.id}/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }

      // Emit socket event to update other clients
      unreadChats.forEach(chat => {
        socket.emit('messages_read', { senderId: chat.id, receiverId: userId })
      })
    } catch (error) {
      console.error("❌ Error marking all messages as read:", error)
    }
  }, [messages])

  // 🔄 Refresh messages when returning to screen
  useFocusEffect(
    useCallback(() => {
      fetchMessages()
      // Mark all messages as read when opening Messages screen
      markAllMessagesAsRead()
    }, [fetchMessages, markAllMessagesAsRead])
  )

  // 📡 Real-time updates for unread counts
  useEffect(() => {
    const userId = AsyncStorage.getItem("userId")
    
    // Listen for messages being read
    socket.on("messages_read", ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
      userId.then(id => {
        if (receiverId === id) {
          // Update unread count for this chat
          setMessages(prev => 
            prev.map(chat => 
              chat.id === senderId 
                ? { ...chat, unreadCount: 0 }
                : chat
            )
          )
        }
      })
    })

    // Listen for new messages
    socket.on("receive_message", (msg: any) => {
      userId.then(id => {
        if (msg.receiver_id === id) {
          // Update unread count for sender
          setMessages(prev => 
            prev.map(chat => 
              chat.id === msg.sender_id 
                ? { 
                    ...chat, 
                    unreadCount: (chat.unreadCount || 0) + 1,
                    content: msg.content,
                    created_at: msg.created_at || new Date().toISOString()
                  }
                : chat
            )
          )
        }
      })
    })

    return () => {
      socket.off("messages_read")
      socket.off("receive_message")
    }
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchMessages()
    setRefreshing(false)
  }, [fetchMessages])

  const filteredMessages = messages
    .filter(msg => msg.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(msg => viewMode === 'all' ? true : (msg.unreadCount ?? 0) > 0)

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return (
          date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) || ""
        )
      } else if (diffInHours < 168) {
        return date.toLocaleDateString([], { weekday: "short" }) || ""
      } else {
        return (
          date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          }) || ""
        )
      }
    } catch (error) {
      return ""
    }
  }

  const MessageItem = memo(({ item }: { item: Chat }) => {
    const initials = (item.name || '')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() =>
          router.push({
            pathname: "/ChatScreen/[id]",
            params: {
              id: item.id,
              receiverName: item.name || "Unknown",
            },
          })
        }
        activeOpacity={0.75}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient colors={['#6c5ce7', '#8e44ad']} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          {(item.unreadCount ?? 0) > 0 && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name || 'Unknown'}
            </Text>
            <Text style={styles.chatTime}>{formatTime(item.created_at)}</Text>
          </View>
          <View style={styles.chatFooter}>
            <Text numberOfLines={2} style={styles.lastMessage}>
              {typeof item.content === 'string' ? item.content : String(item.content)}
            </Text>
            {(item.unreadCount ?? 0) > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {(item.unreadCount ?? 0) > 99 ? '99+' : String(item.unreadCount)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  })

  const renderItem = ({ item }: { item: Chat }) => <MessageItem item={item} />

  const ListHeader = () => (
    <View>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        {([['all','All'], ['unread','Unread']] as const).map(([key, label]) => {
          const active = viewMode === key
          return (
            <TouchableOpacity
              key={key}
              style={[styles.tabChip, active && styles.tabChipActive]}
              onPress={() => setViewMode(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{label}</Text>
              {key === 'unread' && messages.some(m => (m.unreadCount ?? 0) > 0) && (
                <View style={styles.unreadDot} />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6c5ce7" />
      <View style={styles.topHeaderWrapper}>
        <LinearGradient colors={["#6c5ce7", "#8e44ad"]} style={styles.gradientHeader}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.headerTitleAlt}>Messages</Text>
              <Text style={styles.headerSubtitleAlt}>{`${messages.length} conversation${messages.length !== 1 ? 's' : ''}`}</Text>
            </View>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/NewChats')} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBarAlt}>
            <Ionicons name="search" size={18} color="#fff" />
            <TextInput
              placeholder="Search conversations"
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.searchInputAlt}
              value={search}
              onChangeText={setSearch}
            />
            {initialLoading && <ActivityIndicator size="small" color="#fff" />}
            {search.length > 0 && !loading && (
              <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.6}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
      <View style={styles.containerRounded}>
        <FlatList
          data={filteredMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={<ListHeader />}
            contentContainerStyle={filteredMessages.length === 0 ? styles.emptyContainer : styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6c5ce7"]} tintColor="#6c5ce7" />
            }
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
                  </View>
                  <Text style={styles.emptyTitle}>No conversations</Text>
                  <Text style={styles.emptySubtitle}>Tap below to start your first chat.</Text>
                  <TouchableOpacity
                    style={styles.startChatButton}
                    onPress={() => router.push('/NewChats')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.startChatText}>Start Chat</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
  {initialLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6c5ce7" />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default MessagesScreen

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#6c5ce7' },
  topHeaderWrapper: { backgroundColor: '#6c5ce7' },
  gradientHeader: { paddingTop: Platform.OS === 'android' ? 40 : 20, paddingHorizontal: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  headerIconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitles: { flex: 1, alignItems: 'center' },
  headerTitleAlt: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSubtitleAlt: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  searchBarAlt: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  searchInputAlt: { flex: 1, fontSize: 15, color: '#fff' },
  containerRounded: { flex: 1, backgroundColor: '#f8f9fa', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, paddingTop: 12 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 10 },
  tabChip: { paddingHorizontal: 18, height: 40, borderRadius: 20, backgroundColor: '#eceef3', flexDirection: 'row', alignItems: 'center' },
  tabChipActive: { backgroundColor: '#6c5ce7' },
  tabChipText: { fontSize: 14, fontWeight: '600', color: '#4a4f58' },
  tabChipTextActive: { color: '#fff' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e17055', marginLeft: 6 },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  chatCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 4 },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00b894",
    borderWidth: 3,
    borderColor: "#fff",
  },
  chatContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chatName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2d3436",
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 13,
    color: "#74b9ff",
    fontWeight: "500",
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  lastMessage: {
    fontSize: 15,
    color: "#636e72",
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  unreadBadge: {
    backgroundColor: "#e17055",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#636e72",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  startChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#6c5ce7",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startChatText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },
})
