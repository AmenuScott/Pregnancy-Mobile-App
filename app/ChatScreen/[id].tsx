import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { setupNotification, showLocalNotification } from "../utils/notify";
import socket from "../utils/socket";

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { id: receiverId, receiverName } = useLocalSearchParams();
  const [senderId, setSenderId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);


  type Message = {
    id: number;
    sender_id: string;
    receiver_id: string;
    content: string;
    timestamp?: string;
  };

  // 🧠 Setup notifications
  useEffect(() => {
    setupNotification();
  }, []);

  // 🔐 Get sender ID
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("userId");
      setSenderId(id);
      socket.emit("join", id);
    })();
  }, []);

  // 🔁 Load message history
  useEffect(() => {
    if (senderId && receiverId) {
      fetch(
        `https://pregwell-backend.onrender.com/api/messages/thread/${senderId}/${receiverId}`
      )
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("❌ Fetch error:", err));
    }
  }, [senderId, receiverId]);

  // 📥 Receive messages
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      const isMatch =
        (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
        (msg.sender_id === receiverId && msg.receiver_id === senderId);

      if (isMatch) {
        setMessages((prev) => [...prev, msg]);
      } else {
        showLocalNotification("📩 New Message", "You received a new message");
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [senderId, receiverId]);

  useEffect(() => {
  if (!senderId || !receiverId) return;

  if (text.trim()) {
    socket.emit("typing", { senderId, receiverId });
  } else {
    socket.emit("stop_typing", { senderId, receiverId });
  }
}, [text]);


useEffect(() => {
  socket.on("typing", ({ senderId: typingUserId, receiverId: to }) => {
    if (to === senderId && typingUserId === receiverId) {
      setIsTyping(true);
    }
  });

  socket.on("stop_typing", ({ senderId: typingUserId, receiverId: to }) => {
    if (to === senderId && typingUserId === receiverId) {
      setIsTyping(false);
    }
  });

  return () => {
    socket.off("typing");
    socket.off("stop_typing");
  };
}, [senderId, receiverId]);


  // 📨 Send
  const handleSend = () => {
    if (!text.trim() || !senderId || !receiverId) return;

    const message = {
      sender_id: senderId,
      receiver_id: receiverId,
      content: text.trim(),
    };

    socket.emit("send_message", message);
    setMessages((prev) => [...prev, { ...message, id: Date.now() }]);
    setText("");
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  // 💬 Render message
  const renderItem = ({ item }: { item: Message }) => {
    const isSender = item.sender_id === senderId;
    return (
      <View
        style={[styles.message, isSender ? styles.sender : styles.receiver]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* 🧭 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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
          <Text style={styles.name}>{receiverName}</Text>
        </View>

        <View style={styles.onlineDot} />
      </View>

      {/* 💬 Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {isTyping && (
  <View style={{ paddingHorizontal: 14, marginBottom: 6 }}>
    <Text style={{ color: "#888", fontStyle: "italic" }}>
      {receiverName} is typing...
    </Text>
  </View>
)}


      {/* 📝 Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type message..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    fontSize: 24,
    color: "#9C27B0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#E1BEE7",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  message: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 14,
    marginVertical: 6,
  },
  sender: {
    alignSelf: "flex-end",
    backgroundColor: "#9C27B0",
  },
  receiver: {
    alignSelf: "flex-start",
    backgroundColor: "#E1BEE7",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fafafa",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#9C27B0",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 20,
  },
});
