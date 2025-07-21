"use client";

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Message = { id: string; text: string; sender: "user" | "bot" };

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello! How can I assist you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("msg", userMsg.text);

      const res = await fetch("http://10.232.248.236:8080/get", {
        method: "POST",
        body: formData,
      });

      const botText = await res.text();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "⚠️ Could not connect to backend.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.sender === "user" ? styles.user : styles.bot,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      <SafeAreaView style={styles.container}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chat}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#9C27B0" />
            <Text style={styles.loadingText}>Assistant is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} disabled={loading}>
            <Ionicons name="send" size={24} color="#9C27B0" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  chat: {
    paddingBottom: 10,
  },
  message: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    marginHorizontal: 10,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#9C27B0",
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: "#9C27B0",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 8,
    paddingBottom: 8,
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 5,
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 13,
  },
});

export default ChatbotScreen;
