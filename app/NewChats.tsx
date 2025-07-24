"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"

export default function NewChatsScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  type Contact = {
    id: string
    name: string
    avatar: string
    online: boolean
  }

  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const token = await AsyncStorage.getItem("token")
        const userId = await AsyncStorage.getItem("userId")

        console.log("🔍 Debug: Token exists:", !!token)
        console.log("🔍 Debug: User ID:", userId)

        const response = await fetch("https://pregwell-backend.onrender.com/api/patients", {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("🔍 Debug: Response status:", response.status)
        console.log("🔍 Debug: Response ok:", response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.log("🔍 Debug: Error response:", errorText)
          throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        console.log("🔍 Debug: Raw data received:", data)
        console.log("🔍 Debug: Number of users:", data.length)

        // Exclude current user from contacts
        const filteredData = data.filter((u: { id: string | null }) => u.id !== userId)
        console.log("🔍 Debug: After filtering current user:", filteredData.length)
        
        setContacts(filteredData)
      } catch (err) {
        console.error("Fetch error:", err)
        setContacts([])
        alert(`Could not load users: ${err}`)
      }
      setLoading(false)
    }

    fetchUsers()
  }, [])

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.simpleBack} onPress={() => router.back()}>
          <Text style={styles.simpleBackArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start New Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={filteredContacts.length === 0 ? styles.emptyList : {}}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts found.</Text>
          </View>
        ) : (
          filteredContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() =>
                router.push({
                  pathname: "/ChatScreen/[id]",
                  params: {
                    id: contact.id,
                    receiverName: contact.name,
                  },
                })
              }
            >
              <Image
source={{
    uri: contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`,
  }}
  style={styles.avatar}
/>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: contact.online ? "#4CAF50" : "#BDBDBD" },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {contact.online ? "Online" : "Offline"}
                  </Text>
                </View>
              </View>
              <View style={styles.messageButton}>
                <Text style={styles.messageButtonText}>Chat</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3E5F5",
  },
  simpleBack: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  simpleBackArrow: {
    color: "#333",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  searchBar: {
    margin: 20,
    marginBottom: 10,
    backgroundColor: "#F3E5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#E1BEE7",
  },
  contactInfo: {
    flex: 1,
    justifyContent: "center",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#888",
  },
  messageButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#9C27B0",
  },
  messageButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: {
    color: "#9C27B0",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
