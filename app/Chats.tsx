import { Ionicons } from "@expo/vector-icons";
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
import socket from "./utils/socket"; // 👈 Create this separately


const ChatScreen = () => {
  const { receiverId, receiverName } = useLocalSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const userId = await AsyncStorage.getItem("userId");
      setCurrentUserId(userId);
      socket.emit("join", userId); // Join room
    };

    loadUser();
  }, []);

  // Fetch old messages from DB
  useEffect(() => {
    const fetchMessages = async () => {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`https://pregwell-backend.onrender.com/api/messages/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allMessages = await response.json();
      const conversation = allMessages.filter(
        (m: any) =>
          (m.sender_id == currentUserId && m.receiver_id == receiverId) ||
          (m.sender_id == receiverId && m.receiver_id == currentUserId)
      );
      setMessages(conversation);
    };

    if (currentUserId) fetchMessages();
  }, [currentUserId]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receive_message", (data: { sender_id: string | string[] | null; receiver_id: string | string[] | null; }) => {
      if (
        (data.sender_id == receiverId && data.receiver_id == currentUserId) ||
        (data.sender_id == currentUserId && data.receiver_id == receiverId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [receiverId, currentUserId]);

  const handleSend = () => {
    if (newMessage.trim() === "" || !currentUserId) return;

    const messageData = {
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: newMessage.trim(),
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.messageBubble,
        item.sender_id == currentUserId ? styles.sender : styles.receiver,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{receiverName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3E5F5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9C27B0",
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },
  sender: {
    backgroundColor: "#D1C4E9",
    alignSelf: "flex-end",
  },
  receiver: {
    backgroundColor: "#EDE7F6",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3E5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#9C27B0",
    padding: 10,
    borderRadius: 20,
  },
});
