import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { id: receiverId } = useLocalSearchParams(); // receiver's ID from route
  const [senderId, setSenderId] = useState<string | null>(null);

  type Message = {
    id: number;
    sender_id: string;
    receiver_id: string;
    content: string;
    timestamp?: string;
  };

  // 🧠 Setup notifications on mount
  useEffect(() => {
    setupNotification(); // ✅ Ask for notification permissions
  }, []);

  // 🔐 Get sender ID and join socket room
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("userId");
      setSenderId(id);
      socket.emit("join", id); // join user's own room
    })();
  }, []);

  // 🔁 Fetch old messages from backend
  useEffect(() => {
    if (senderId && receiverId) {
      fetch(`https://pregwell-backend.onrender.com/api/messages/thread/${senderId}/${receiverId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error("❌ Fetch error:", err));
    }
  }, [senderId, receiverId]);

  // 📥 Listen for real-time new messages
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (
        (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
        (msg.sender_id === receiverId && msg.receiver_id === senderId)
      ) {
        setMessages((prev) => [...prev, msg]);
      } else {
        showLocalNotification("📩 New Message", "You received a new message");
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [senderId, receiverId]);

  // 📨 Send message
  const handleSend = () => {
    if (!text.trim() || !senderId || !receiverId) return;

    const message = {
      sender_id: senderId,
      receiver_id: receiverId,
      content: text.trim(),
    };

    socket.emit("send_message", message); // send via socket
    setMessages((prev) => [...prev, { ...message, id: Date.now() }]); // temp ID
    setText(""); // clear input
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  // 💬 Render each message
  const renderItem = ({ item }: { item: Message }) => {
    const isSender = item.sender_id === senderId;
    return (
      <View style={[styles.message, isSender ? styles.sender : styles.receiver]}>
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
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input field and send button */}
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
