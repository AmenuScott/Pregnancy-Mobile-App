"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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

  // Ensure receiverId is a string
  const receiverIdString = Array.isArray(receiverId) ? receiverId[0] : receiverId
  // Ensure receiverName is a string
  const receiverNameString = Array.isArray(receiverName) ? receiverName[0] : receiverName

type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp?: string;
  status?: "sending" | "sent";
};

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

  // 📖 Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!senderId || !receiverIdString) return
    
    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) return

      await fetch(`https://pregwell-backend.onrender.com/api/messages/mark-read/${receiverIdString}/${senderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Emit socket event to update other clients
      socket.emit('messages_read', { senderId: receiverIdString, receiverId: senderId })
    } catch (error) {
      console.error("❌ Error marking messages as read:", error)
    }
  }, [senderId, receiverIdString])

  // 🔁 Load message history and mark as read
  useEffect(() => {
    if (senderId && receiverIdString) {
      fetch(`https://pregwell-backend.onrender.com/api/messages/thread/${senderId}/${receiverIdString}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("❌ Fetch error:", err))
      
      // Mark messages as read when opening chat
      markMessagesAsRead()
    }
  }, [senderId, receiverIdString, markMessagesAsRead])

  // 📥 Receive messages
  useEffect(() => {
socket.on("receive_message", async (msg: any) => {
  const isMatch =
    (msg.sender_id === senderId && msg.receiver_id === receiverIdString) ||
    (msg.sender_id === receiverIdString && msg.receiver_id === senderId);

  if (isMatch) {
    setMessages((prev) => {
      // If it's a sent message, replace the temp one with backend one
      const withoutTemp = prev.filter((m) => m.id !== msg.id && m.content !== msg.content);
      const newMessage: Message = { 
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        status: "sent"
      };
      return [...withoutTemp, newMessage];
    });
    
    // Mark new messages as read immediately if chat is open
    if (msg.sender_id === receiverIdString) {
      markMessagesAsRead()
    }
  } else {
    // Save notification for messages from other chats
    if (msg.receiver_id === senderId) {
      await saveReceivedMessageNotification(msg);
    }
    showLocalNotification("📩 New Message", "You received a new message");
  }
});

    return () => {
      socket.off("receive_message")
    }
  }, [senderId, receiverIdString, markMessagesAsRead])

// 📱 Save notification for received message
const saveReceivedMessageNotification = async (msg: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    // Get sender name
    const senderName = msg.sender_name || "Someone";
    
    // Save to notifications
    await fetch("https://pregwell-backend.onrender.com/api/notifications", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: senderId,
        title: `New message from ${senderName}`,
        message: msg.content,
        type: "message",
        related_data: { sender_id: msg.sender_id, chat_id: msg.sender_id }
      })
    });
  } catch (error) {
    console.error("Error saving notification:", error);
  }
};

// 🔔 Handle background message notifications
const handleBackgroundMessage = async (msg: any) => {
  if (msg.receiver_id === senderId && msg.sender_id !== receiverIdString) {
    // Message from someone else - save notification
    await saveReceivedMessageNotification(msg);
    
    // Show push notification
    showLocalNotification(
      `New message from ${msg.sender_name || "Someone"}`,
      msg.content
    );
  }
};

// 📱 Setup message notification listeners
useEffect(() => {
  // Listen for messages when app is in background
  socket.on("receive_message", handleBackgroundMessage);
  
  return () => {
    socket.off("receive_message", handleBackgroundMessage);
  };
}, [senderId, receiverIdString]);

  // 🔄 Refresh messages when returning to chat
  useFocusEffect(
    useCallback(() => {
      if (senderId && receiverIdString) {
        markMessagesAsRead()
      }
    }, [senderId, receiverIdString, markMessagesAsRead])
  )

  // 🔄 Refresh when leaving chat
  useEffect(() => {
    return () => {
      // Mark messages as read when leaving chat
      if (senderId && receiverIdString) {
        markMessagesAsRead()
      }
    }
  }, [senderId, receiverIdString, markMessagesAsRead])

  useEffect(() => {
    if (!senderId || !receiverIdString) return
    if (text.trim()) {
      socket.emit("typing", { senderId, receiverId: receiverIdString })
    } else {
      socket.emit("stop_typing", { senderId, receiverId: receiverIdString })
    }
  }, [text, senderId, receiverIdString])

  useEffect(() => {
    socket.on("typing", ({ senderId: typingUserId, receiverId: to }) => {
      if (to === senderId && typingUserId === receiverIdString) {
        setIsTyping(true)
      }
    })

    socket.on("stop_typing", ({ senderId: typingUserId, receiverId: to }) => {
      if (to === senderId && typingUserId === receiverIdString) {
        setIsTyping(false)
      }
    })

    return () => {
      socket.off("typing")
      socket.off("stop_typing")
    }
  }, [senderId, receiverIdString])

  useEffect(() => {
  socket.on("message_deleted", (deletedId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== deletedId));
  });

  return () => {
    socket.off("message_deleted");
  };
}, []);


  // 📨 Send
const handleSend = async () => {
  if (!text.trim() || !senderId || !receiverIdString) return;

  const tempId = Date.now(); // temporary unique ID
  const message: Message = {
    id: tempId,
    sender_id: senderId,
    receiver_id: receiverIdString,
    content: text.trim(),
    status: "sending",
  };

  // Add to UI immediately
  setMessages((prev) => [...prev, message]);
  socket.emit("send_message", message);
  
  // Send notification to receiver
  await sendNotificationToReceiver(receiverIdString, text.trim());
  
  setText("");
  flatListRef.current?.scrollToEnd({ animated: true });
};

// 📱 Send notification to receiver
const sendNotificationToReceiver = async (receiverId: string, messageContent: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const senderName = receiverNameString || "Someone";
    
    // Save notification to backend
    await fetch("https://pregwell-backend.onrender.com/api/notifications", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: receiverId,
        title: `New message from ${senderName}`,
        message: messageContent,
        type: "message",
        related_data: { sender_id: senderId, chat_id: receiverIdString }
      })
    });

  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const handleDelete = (id: number) => {
  Alert.alert(
    "Delete Message",
    "Are you sure you want to delete this message?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setMessages((prev) => prev.filter((msg) => msg.id !== id));
          socket.emit("delete_message", id); // 🔁 emits to backend
        },
      },
    ]
  );
};




  // 💬 Render message
const renderItem = ({ item }: { item: Message }) => {
  const isSender = item.sender_id === senderId;
  return (
    <TouchableOpacity onLongPress={() => handleDelete(item.id)}>
      <View style={styles.messageContainer}>
        <View style={[styles.message, isSender ? styles.sender : styles.receiver]}>
          <View style={styles.messageMeta}>
            <Text
              style={[
                styles.messageText,
                isSender ? styles.senderText : styles.receiverText,
              ]}
            >
              {item.content}
            </Text>

            {isSender && (
              <Text style={styles.tick}>
                {item.status === "sending" ? "⏳" : "✓"}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};



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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2d3436" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{receiverNameString || "Chat"}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#2d3436" />
          </TouchableOpacity>
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
              <Text style={styles.typingText}>{receiverNameString} is typing</Text>
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
  },
  moreButton: {
    padding: 8,
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

  messageMeta: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 6,
},
tick: {
  fontSize: 14,
  color: "#ccc",
  marginLeft: 6,
},

})
