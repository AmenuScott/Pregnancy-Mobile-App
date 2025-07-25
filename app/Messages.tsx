import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,

  View,
} from "react-native";

// Dummy contacts for new chat modal (optional)
const dummyContacts = [
  { id: "101", name: "Dr. Ama Mensah", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
  { id: "102", name: "Nurse Kwame", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: "103", name: "Support Group", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
];

const MessagesScreen = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch all conversations for the user
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      if (!token || !userId) throw new Error("User not authenticated");

      const response = await fetch(`https://pregwell-backend.onrender.com/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();

      // Group messages by conversation (latest message per contact)
      const conversations: { [key: string]: any } = {};
      data.forEach((msg: any) => {
        const contactId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (
          !conversations[contactId] ||
          new Date(msg.time) > new Date(conversations[contactId].time)
        ) {
          conversations[contactId] = {
            id: contactId,
            name: msg.sender_id === userId ? msg.receiver_name : msg.sender_name,
            avatar: msg.sender_id === userId ? msg.receiver_avatar : msg.sender_avatar,
            lastMessage: msg.content,
            time: msg.time,
            unreadCount: msg.unreadCount || 0,
          };
        }
      });

      setMessages(Object.values(conversations));
    } catch (error) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Filter messages by search
  const filteredMessages = messages.filter(
    (msg) =>
      msg.name?.toLowerCase().includes(search.toLowerCase()) ||
      msg.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/Chats",
          params: { receiverId: item.id, receiverName: item.name },
        })
      }
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.message} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with search and new chat */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => router.push("/NewChats")}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#9C27B0" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search chats"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={
          filteredMessages.length === 0
            ? { flex: 1, justifyContent: "center", alignItems: "center" }
            : { paddingBottom: 40 }
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
            <Ionicons name="chatbubble-outline" size={60} color="#E1BEE7" style={{ marginBottom: 10 }} />
            <Text style={{ color: "#9C27B0", fontWeight: "bold", fontSize: 18 }}>Add New Chats</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E5F5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    color: "#555",
    flex: 1,
    fontSize: 14,
  },
  badge: {
    backgroundColor: "#FF4FC3",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default MessagesScreen;