"use client";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HealthTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) throw new Error("User ID not found in storage");
        
        const res = await fetch(`https://pregwell-backend.onrender.com/api/patients/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        
        const data = await res.json();
        setUserName(data.first_name || "Mama");
      } catch (error) {
        console.error("User fetch error:", error.message);
        setUserName("Mama");
      }
    };

    const fetchTips = async () => {
      try {
        const res = await fetch("https://pregwell-backend.onrender.com/api/tips");
        if (!res.ok) throw new Error("Failed to fetch tips");

        const data = await res.json();
        setTips(data.tips || []);
      } catch (error) {
        console.error("Tips fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchTips();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#A93E8B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Hi {userName}, here are your health tips 💡</Text>
      </View>

      {/* Tips List */}
      <FlatList
        data={tips}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={() => Linking.openURL(item.link)}
            >
              <Text style={styles.readMoreText}>Read More</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default HealthTips;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F5", // soft pink
  },
  header: {
    backgroundColor: "#A93E8B", // PregWell purple
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  title: {
    padding: 12,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  readMoreButton: {
    backgroundColor: "#FFB6C1", // light pink
    padding: 10,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  readMoreText: {
    color: "#A93E8B",
    fontWeight: "600",
  },
});
