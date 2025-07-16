import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get('window');

// Sample data for nutrition tracking
const dailyGoals = {
  water: { current: 6, target: 8, unit: "glasses" },
  calories: { current: 1800, target: 2200, unit: "kcal" },
  protein: { current: 45, target: 75, unit: "g" },
  iron: { current: 18, target: 27, unit: "mg" },
  calcium: { current: 800, target: 1200, unit: "mg" },
  folate: { current: 320, target: 600, unit: "mcg" },
};

const recommendedFoods = [
  {
    id: "1",
    name: "Kontomire (Cocoyam Leaves)",
    category: "Leafy Greens",
    benefits: "Rich in folate, iron, and vitamins A & C",
    image: require("../assets/images/kontomire.png"),
    color: "#4CAF50",
    localName: "Kontomire",
  },
  {
    id: "2",
    name: "Fresh Fish",
    category: "Protein",
    benefits: "High in omega-3, protein, and DHA for baby's brain",
    image: require("../assets/images/fish.png"),
    color: "#2196F3",
    localName: "Nam",
  },
  {
    id: "3",
    name: "Pawpaw (Papaya)",
    category: "Fruits",
    benefits: "Rich in vitamin C, folate, and digestive enzymes",
    image: require("../assets/images/pawpaw.png"),
    color: "#FF9800",
    localName: "Borɔfrɛ",
  },
  {
    id: "4",
    name: "Groundnuts",
    category: "Nuts & Seeds",
    benefits: "High in protein, healthy fats, and folate",
    image: require("../assets/images/groundnuts.png"),
    color: "#8D6E63",
    localName: "Nkate",
  },
  {
    id: "5",
    name: "Garden Eggs",
    category: "Vegetables",
    benefits: "Rich in fiber, potassium, and antioxidants",
    image: require("../assets/images/gardeneggs.png"),
    color: "#9C27B0",
    localName: "Kwahu nsusua",
  },
  {
    id: "6",
    name: "Red Palm Oil",
    category: "Healthy Fats",
    benefits: "Rich in vitamin A and healthy fats",
    image: require("../assets/images/palm-oil.png"),
    color: "#FF5722",
    localName: "Abeɛ",
  },
];

const avoidFoods = [
  {
    id: "1",
    name: "Raw Fish",
    reason: "Risk of foodborne illness",
    icon: "fish-outline",
    color: "#F44336",
  },
  {
    id: "2",
    name: "Alcohol",
    reason: "Can harm baby's development",
    icon: "wine-outline",
    color: "#F44336",
  },
  {
    id: "3",
    name: "High Mercury Fish",
    reason: "Can affect baby's nervous system",
    icon: "warning-outline",
    color: "#FF9800",
  },
  {
    id: "4",
    name: "Unpasteurized Dairy",
    reason: "Risk of listeria infection",
    icon: "alert-circle-outline",
    color: "#F44336",
  },
];

const mealSuggestions = [
  {
    id: "1",
    meal: "Breakfast",
    suggestion: "Hausa Koko with Koose",
    description: "Traditional millet porridge with bean cakes",
    time: "7:00 AM",
    calories: 350,
    color: "#FF9800",
  },
  {
    id: "2",
    meal: "Mid-Morning",
    suggestion: "Fresh Orange & Groundnuts",
    description: "Vitamin C boost with healthy fats",
    time: "10:00 AM",
    calories: 200,
    color: "#4CAF50",
  },
  {
    id: "3",
    meal: "Lunch",
    suggestion: "Jollof Rice with Grilled Fish",
    description: "Balanced meal with kontomire stew",
    time: "1:00 PM",
    calories: 550,
    color: "#2196F3",
  },
  {
    id: "4",
    meal: "Afternoon",
    suggestion: "Kelewele with Yogurt",
    description: "Spiced plantain with probiotics",
    time: "4:00 PM",
    calories: 250,
    color: "#9C27B0",
  },
  {
    id: "5",
    meal: "Dinner",
    suggestion: "Banku with Okra Stew",
    description: "Fermented corn meal with vegetables",
    time: "7:00 PM",
    calories: 450,
    color: "#FF5722",
  },
];

const getNutritionGoals = (trimester: number) => {
  if (trimester === 1) return {
    water: { current: 6, target: 8, unit: "glasses" },
    calories: { current: 1800, target: 2000, unit: "kcal" },
    protein: { current: 45, target: 60, unit: "g" },
    iron: { current: 18, target: 27, unit: "mg" },
    calcium: { current: 800, target: 1000, unit: "mg" },
    folate: { current: 320, target: 400, unit: "mcg" },
  };
  if (trimester === 2) return {
    water: { current: 6, target: 8, unit: "glasses" },
    calories: { current: 2000, target: 2200, unit: "kcal" },
    protein: { current: 55, target: 75, unit: "g" },
    iron: { current: 21, target: 30, unit: "mg" },
    calcium: { current: 900, target: 1200, unit: "mg" },
    folate: { current: 400, target: 600, unit: "mcg" },
  };
  if (trimester === 3) return {
    water: { current: 7, target: 9, unit: "glasses" },
    calories: { current: 2200, target: 2400, unit: "kcal" },
    protein: { current: 60, target: 80, unit: "g" },
    iron: { current: 24, target: 35, unit: "mg" },
    calcium: { current: 1000, target: 1300, unit: "mg" },
    folate: { current: 500, target: 700, unit: "mcg" },
  };
  return dailyGoals;
};

const DietScreen = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [pregnancyProfile, setPregnancyProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      const response = await fetch(`https://pregwell-backend.onrender.com/api/patients/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPregnancyProfile(data);
    };
    fetchProfile();
  }, []);

  const goals = pregnancyProfile ? getNutritionGoals(pregnancyProfile.trimester) : dailyGoals;

  const renderNutritionGoal = (key: React.Key | null | undefined, goal: { current: number; target: number; unit: string; } | { current: number; target: number; unit: string; } | { current: number; target: number; unit: string; } | { current: number; target: number; unit: string; } | { current: number; target: number; unit: string; } | { current: number; target: number; unit: string; }) => {
    const percentage = (goal.current / goal.target) * 100;
    
    return (
      <View key={key} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{String(key).charAt(0).toUpperCase() + String(key).slice(1)}</Text>
          <Text style={styles.goalValue}>
            {goal.current}/{goal.target} {goal.unit}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={percentage >= 100 ? ["#4CAF50", "#66BB6A"] : ["#9C27B0", "#BA68C8"]}
              style={[styles.progressBarFill, { width: `${Math.min(percentage, 100)}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    );
  };

  type RecommendedFood = {
    id: string;
    name: string;
    category: string;
    benefits: string;
    image: any;
    color: string;
    localName: string;
  };

  const renderRecommendedFood = ({ item }: { item: RecommendedFood }) => (
    <TouchableOpacity style={styles.foodCard}>
      <LinearGradient
        colors={[`${item.color}15`, `${item.color}05`]}
        style={styles.foodCardGradient}
      >
        <Image source={item.image} style={styles.foodImage} />
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodLocalName}>({item.localName})</Text>
          <Text style={styles.foodCategory}>{item.category}</Text>
          <Text style={styles.foodBenefits}>{item.benefits}</Text>
        </View>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: item.color }]}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMealSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.mealCard}>
      <LinearGradient
        colors={[`${item.color}15`, `${item.color}05`]}
        style={styles.mealCardGradient}
      >
        <View style={styles.mealHeader}>
          <View>
            <Text style={styles.mealType}>{item.meal}</Text>
            <Text style={styles.mealTime}>{item.time}</Text>
          </View>
          <View style={[styles.caloriesBadge, { backgroundColor: item.color }]}>
            <Text style={styles.caloriesText}>{item.calories} cal</Text>
          </View>
        </View>
        <Text style={styles.mealSuggestion}>{item.suggestion}</Text>
        <Text style={styles.mealDescription}>{item.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={["#E0BBFF", "#9C27B0", "#7B1FA2"]} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nutrition & Diet</Text>
            <TouchableOpacity style={styles.calendarButton}>
              <Ionicons name="calendar" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerSubtitle}>
            <Ionicons name="nutrition" size={20} color="white" style={styles.headerIcon} />
            <Text style={styles.subtitleText}>
              Nourish yourself and your baby
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["overview", "foods", "meals", "avoid"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.tabButtonActive
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text 
                style={[
                  styles.tabButtonText,
                  selectedTab === tab && styles.tabButtonTextActive
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === "overview" && (
          <>
            {/* Daily Water Intake */}
            <View style={styles.waterSection}>
              <LinearGradient
                colors={["#E3F2FD", "#BBDEFB"]}
                style={styles.waterGradient}
              >
                <View style={styles.waterHeader}>
                  <Ionicons name="water" size={24} color="#2196F3" />
                  <Text style={styles.waterTitle}>Daily Water Intake</Text>
                </View>
                <View style={styles.waterProgress}>
                  <Text style={styles.waterCount}>
                    {dailyGoals.water.current} / {dailyGoals.water.target} glasses
                  </Text>
                  <View style={styles.waterGlasses}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <Ionicons
                        key={i}
                        name={i < dailyGoals.water.current ? "water" : "water-outline"}
                        size={20}
                        color={i < dailyGoals.water.current ? "#2196F3" : "#BDBDBD"}
                        style={styles.waterGlass}
                      />
                    ))}
                  </View>
                  <TouchableOpacity style={styles.addWaterButton}>
                    <Text style={styles.addWaterText}>Add Glass</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Nutrition Goals */}
            <View style={styles.goalsSection}>
              <Text style={styles.sectionTitle}>Today's Nutrition Goals</Text>
              <View style={styles.goalsGrid}>
                {Object.entries(dailyGoals).slice(1).map(([key, goal]) =>
                  renderNutritionGoal(key, goal)
                )}
              </View>
              {pregnancyProfile && pregnancyProfile.health_conditions && (
                <Text style={{ color: "#F44336", marginTop: 10 }}>
                  Note: You have {pregnancyProfile.health_conditions.join(", ")}. Please follow your doctor's dietary advice.
                </Text>
              )}
            </View>

            {/* Quick Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <LinearGradient colors={["#E8F5E8", "#F1F8E9"]} style={styles.statGradient}>
                    <Ionicons name="trending-up" size={24} color="#4CAF50" />
                    <Text style={styles.statValue}>+2.5kg</Text>
                    <Text style={styles.statLabel}>Weight Gain</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statCard}>
                  <LinearGradient colors={["#FFF3E0", "#FFF8E1"]} style={styles.statGradient}>
                    <Ionicons name="flame" size={24} color="#FF9800" />
                    <Text style={styles.statValue}>1,850</Text>
                    <Text style={styles.statLabel}>Calories Today</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statCard}>
                  <LinearGradient colors={["#F3E5F5", "#FCE4EC"]} style={styles.statGradient}>
                    <Ionicons name="checkmark-circle" size={24} color="#9C27B0" />
                    <Text style={styles.statValue}>85%</Text>
                    <Text style={styles.statLabel}>Goals Met</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </>
        )}

        {selectedTab === "foods" && (
          <View style={styles.foodsSection}>
            <Text style={styles.sectionTitle}>Recommended Ghanaian Foods</Text>
            <Text style={styles.sectionSubtitle}>
              Local foods that are perfect for your pregnancy journey
            </Text>
            <FlatList
              data={recommendedFoods}
              renderItem={renderRecommendedFood}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {selectedTab === "meals" && (
          <View style={styles.mealsSection}>
            <Text style={styles.sectionTitle}>Today's Meal Plan</Text>
            <Text style={styles.sectionSubtitle}>
              Traditional Ghanaian meals for optimal nutrition
            </Text>
            <FlatList
              data={mealSuggestions}
              renderItem={renderMealSuggestion}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {selectedTab === "avoid" && (
          <View style={styles.avoidSection}>
            <Text style={styles.sectionTitle}>Foods to Avoid</Text>
            <Text style={styles.sectionSubtitle}>
              Keep you and your baby safe by avoiding these foods
            </Text>
            {avoidFoods.map((food) => (
              <View key={food.id} style={styles.avoidCard}>
                <View style={[styles.avoidIcon, { backgroundColor: `${food.color}15` }]}>
                  <Ionicons name={food.icon} size={24} color={food.color} />
                </View>
                <View style={styles.avoidInfo}>
                  <Text style={styles.avoidName}>{food.name}</Text>
                  <Text style={styles.avoidReason}>{food.reason}</Text>
                </View>
                <Ionicons name="alert-circle" size={20} color={food.color} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={["#9C27B0", "#7B1FA2"]}
          style={styles.fabGradient}
        >
          <Ionicons name="restaurant" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  calendarButton: {
    padding: 8,
  },
  headerSubtitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  tabContainer: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  tabButtonActive: {
    backgroundColor: "#9C27B0",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5D6D7E",
  },
  tabButtonTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  waterSection: {
    marginBottom: 25,
  },
  waterGradient: {
    borderRadius: 20,
    padding: 20,
  },
  waterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  waterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 10,
  },
  waterProgress: {
    alignItems: "center",
  },
  waterCount: {
    fontSize: 16,
    color: "#5D6D7E",
    marginBottom: 15,
  },
  waterGlasses: {
    flexDirection: "row",
    marginBottom: 15,
  },
  waterGlass: {
    marginHorizontal: 5,
  },
  addWaterButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addWaterText: {
    color: "white",
    fontWeight: "600",
  },
  goalsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 15,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  goalCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  goalValue: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    marginRight: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9C27B0",
  },
  statsSection: {
    marginBottom: 25,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: "31%",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statGradient: {
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 4,
  },
  foodsSection: {
    marginBottom: 25,
  },
  foodCard: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  foodCardGradient: {
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  foodLocalName: {
    fontSize: 14,
    color: "#7F8C8D",
    fontStyle: "italic",
  },
  foodCategory: {
    fontSize: 12,
    color: "#9C27B0",
    fontWeight: "600",
    marginTop: 2,
  },
  foodBenefits: {
    fontSize: 12,
    color: "#5D6D7E",
    marginTop: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  mealsSection: {
    marginBottom: 25,
  },
  mealCard: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mealCardGradient: {
    borderRadius: 15,
    padding: 15,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mealType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  mealTime: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  caloriesBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  caloriesText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  mealSuggestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  avoidSection: {
    marginBottom: 25,
  },
  avoidCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avoidIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avoidInfo: {
    flex: 1,
  },
  avoidName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  avoidReason: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    shadowColor: "#9C27B0",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DietScreen;