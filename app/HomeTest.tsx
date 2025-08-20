import React from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeTest() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#E0BBFF", "#9C27B0", "#7B1FA2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome! 🌺</Text>
          <Text style={styles.headerSubtitle}>How are you feeling today?</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.debugText}>✅ ScrollView is working!</Text>
        
        {/* Test Card 1 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pregnancy Journey</Text>
          <Text style={styles.cardText}>Track your progress here</Text>
        </View>

        {/* Test Card 2 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Health & Wellness</Text>
          <View style={styles.cardGrid}>
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/Symptoms')}>
              <Ionicons name="medical-outline" size={24} color="#E91E63" />
              <Text style={styles.gridText}>Symptoms</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/Tips')}>
              <Ionicons name="bulb-outline" size={24} color="#E91E63" />
              <Text style={styles.gridText}>Tips</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Card 3 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Community</Text>
          <View style={styles.cardGrid}>
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/myAI')}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#E91E63" />
              <Text style={styles.gridText}>AI Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/Messages')}>
              <Ionicons name="chatbubbles-outline" size={24} color="#E91E63" />
              <Text style={styles.gridText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.debugText}>🎉 End of content reached!</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  debugText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#E91E63',
    fontWeight: 'bold',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  cardText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  gridText: {
    fontSize: 12,
    color: '#2C3E50',
    marginTop: 5,
    textAlign: 'center',
  },
});