import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DietScreen = () => {
  const [userId, setUserId] = useState("");
  const [trimester, setTrimester] = useState(1);
  const [foods, setFoods] = useState([]);
  const [meals, setMeals] = useState([]);
  const [avoid, setAvoid] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
const fetchAll = async () => {
  try {
    const id = await AsyncStorage.getItem("userId");
    setUserId(id || "");

    const profileRes = await fetch(
      `https://pregwell-backend.onrender.com/api/pregnancy-profile/${id}`
    );
    const profileText = await profileRes.text();
    console.log("PROFILE RESPONSE:", profileText);

    const profile = JSON.parse(profileText); // manually parse
    setTrimester(profile.trimester || 1);

    const [fRes, mRes, aRes, tRes] = await Promise.all([
      fetch(`https://pregwell-backend.onrender.com/api/recommended-foods/${profile.trimester}`),
      fetch(`https://pregwell-backend.onrender.com/api/meal-ideas/${profile.trimester}`),
      fetch("https://pregwell-backend.onrender.com/api/foods-to-avoid"),
      fetch("https://pregwell-backend.onrender.com/api/nutrition-tips"),
    ]);

    // log each response before parsing
    const fText = await fRes.text();
    const mText = await mRes.text();
    const aText = await aRes.text();
    const tText = await tRes.text();

    console.log("RECOMMENDED FOODS:", fText);
    console.log("MEAL IDEAS:", mText);
    console.log("FOODS TO AVOID:", aText);
    console.log("TIPS:", tText);

    // convert to JSON after verifying it's not HTML
    const fData = JSON.parse(fText);
    const mData = JSON.parse(mText);
    const aData = JSON.parse(aText);
    const tData = JSON.parse(tText);

    setFoods(fData);
    setMeals(mData);
    setAvoid(aData);
    setTips(tData);
    setLoading(false);
  } catch (err) {
    console.error("Error fetching diet data:", err);
    setLoading(false);
  }
};


    fetchAll();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#a36fff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#a36fff", "#e0b3ff"]} style={styles.header}>
        <Text style={styles.headerText}>My Nutrition</Text>
        <Text style={styles.subHeader}>Trimester {trimester}</Text>
      </LinearGradient>

      {/* Recommended Foods */}
      <Text style={styles.sectionTitle}>✅ Recommended Foods</Text>
      {foods.map((food, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{food.name}</Text>
          <Text style={styles.cardSubtitle}>{food.category}</Text>
          <Text style={styles.cardDesc}>{food.benefit}</Text>
        </View>
      ))}

      {/* Meal Ideas */}
      <Text style={styles.sectionTitle}>🍽️ Meal Ideas</Text>
      {meals.map((meal, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{meal.title} ({meal.type})</Text>
          {meal.image_url && (
            <Image source={{ uri: meal.image_url }} style={styles.mealImage} />
          )}
          <Text style={styles.cardSubtitle}>Ingredients: {meal.items.join(", ")}</Text>
          <Text style={styles.cardDesc}>Instructions: {meal.instructions}</Text>
        </View>
      ))}

      {/* Foods to Avoid */}
      <Text style={styles.sectionTitle}>🚫 Foods to Avoid</Text>
      {avoid.map((item, index) => (
        <View key={index} style={styles.cardRed}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDesc}>{item.reason}</Text>
        </View>
      ))}

      {/* Nutrition Tips */}
      <Text style={styles.sectionTitle}>📚 Nutrition Tips</Text>
      {tips.map((tip, index) => (
        <View key={index} style={styles.cardTip}>
          <Text style={styles.cardDesc}>• {tip.tip}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default DietScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf5ff",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subHeader: {
    fontSize: 16,
    color: "#f5e6ff",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    color: "#5e3a8c",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    shadowColor: "#a36fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardRed: {
    backgroundColor: "#ffe6e6",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
  },
  cardTip: {
    backgroundColor: "#f3e7ff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#777",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: "#444",
  },
  mealImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginVertical: 8,
  },
});
