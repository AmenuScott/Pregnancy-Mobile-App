"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { setupNotification, showLocalNotification } from "../utils/notify"
import socket from "../utils/socket"

export default function ChatScreen() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const flatListRef = useRef<FlatList>(null)
  const { id: receiverId, receiverName } = useLocalSearchParams()
  const [senderId, setSenderId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  type Message = {
    id: number
    sender_id: string
    receiver_id: string
    content: string
    timestamp?: string
  }

  // 🧠 Setup notifications
  useEffect(() => {
    setupNotification()
  }, [])

  // 🔐 Get sender ID
  useEffect(() => {
    ;(async () => {
      const id = await AsyncStorage.getItem("userId")
      setSenderId(id)
      socket.emit("join", id)
    })()
  }, [])

  // 🔁 Load message history
  useEffect(() => {
    if (senderId && receiverId) {
      fetch(`https://pregwell-backend.onrender.com/api/messages/thread/${senderId}/${receiverId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("❌ Fetch error:", err))
    }
  }, [senderId, receiverId])

  // 📥 Receive messages
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      const isMatch =
        (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
        (msg.sender_id === receiverId && msg.receiver_id === senderId)
      if (isMatch) {
        setMessages((prev) => [...prev, msg])
      } else {
        showLocalNotification("📩 New Message", "You received a new message")
      }
    })

    return () => {
      socket.off("receive_message")
    }
  }, [senderId, receiverId])

// 🔁 Load message history + mark as read
useEffect(() => {
  if (senderId && receiverId) {
    // 1. Fetch message thread
    fetch(`https://pregwell-backend.onrender.com/api/messages/thread/${senderId}/${receiverId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data)

        // 2. ✅ Mark messages as read from receiver → sender
        fetch(`https://pregwell-backend.onrender.com/api/messages/mark-read/${receiverId}/${senderId}`, {
          method: "PUT",
        })
      })
      .catch((err) => console.error("❌ Fetch error:", err))
  }
}, [senderId, receiverId])


  useEffect(() => {
    socket.on("typing", ({ senderId: typingUserId, receiverId: to }) => {
      if (to === senderId && typingUserId === receiverId) {
        setIsTyping(true)
      }
    })

    socket.on("stop_typing", ({ senderId: typingUserId, receiverId: to }) => {
      if (to === senderId && typingUserId === receiverId) {
        setIsTyping(false)
      }
    })

    return () => {
      socket.off("typing")
      socket.off("stop_typing")
    }
  }, [senderId, receiverId])

  // 📨 Send
  const handleSend = () => {
    if (!text.trim() || !senderId || !receiverId) return

    const message = {
      sender_id: senderId,
      receiver_id: receiverId,
      content: text.trim(),
    }

    socket.emit("send_message", message)
    setMessages((prev) => [...prev, { ...message, id: Date.now() }])
    setText("")
    flatListRef.current?.scrollToEnd({ animated: true })
  }

  // 💬 Render message
  const renderItem = ({ item }: { item: Message }) => {
    const isSender = item.sender_id === senderId
    return (
      <View style={styles.messageContainer}>
        <View style={[styles.message, isSender ? styles.sender : styles.receiver]}>
          <Text style={[styles.messageText, isSender ? styles.senderText : styles.receiverText]}>{item.content}</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* 🧭 HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonContainer} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {receiverName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.name}>{receiverName}</Text>
              <Text style={styles.status}>Online</Text>
            </View>
          </View>

          <View style={styles.onlineDot} />
        </View>

        {/* 💬 Messages */}
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        </View>

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>{receiverName} is typing</Text>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        )}

        {/* 📝 Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, text.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!text.trim()}
            >
              <Text style={styles.sendButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16, // Increased padding
    paddingTop: Platform.OS === "android" ? 20 : 16, // Extra padding for Android
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  backButton: {
    fontSize: 20,
    color: "#6c5ce7",
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  avatar: {
    backgroundColor: "#6c5ce7",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#6c5ce7",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    fontSize: 17,
    color: "#2d3436",
    marginBottom: 2,
  },
  status: {
    fontSize: 13,
    color: "#00b894",
    fontWeight: "500",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00b894",
    borderWidth: 2,
    borderColor: "#fff",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  message: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sender: {
    alignSelf: "flex-end",
    backgroundColor: "#6c5ce7",
    borderBottomRightRadius: 6,
  },
  receiver: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  senderText: {
    color: "#fff",
  },
  receiverText: {
    color: "#2d3436",
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    color: "#74b9ff",
    fontSize: 14,
    fontStyle: "italic",
    marginRight: 8,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#74b9ff",
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2d3436",
    maxHeight: 100,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: "#6c5ce7",
    shadowColor: "#6c5ce7",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonInactive: {
    backgroundColor: "#ddd",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
})
