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

export default function HomeSimple() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#E0BBFF", "#9C27B0", "#7B1FA2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Welcome Beautiful! 🌺</Text>
        <Text style={styles.headerSubtitle}>How are you feeling today?</Text>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>✅ Content is loading successfully!</Text>
        </View>
        
        {/* Pregnancy Journey Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Pregnancy Journey</Text>
          <Text style={styles.cardText}>Track your progress and milestones</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '30%' }]} />
            </View>
            <Text style={styles.progressText}>30% Complete</Text>
          </View>
        </View>

        {/* Health Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Health & Wellness</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/Symptoms')}
            >
              <Ionicons name="medical-outline" size={24} color="#E91E63" />
              <Text style={styles.buttonText}>Symptoms</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/Tips')}
            >
              <Ionicons name="bulb-outline" size={24} color="#E91E63" />
              <Text style={styles.buttonText}>Tips</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Community</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/myAI')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#E91E63" />
              <Text style={styles.buttonText}>AI Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/Messages')}
            >
              <Ionicons name="chatbubbles-outline" size={24} color="#E91E63" />
              <Text style={styles.buttonText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>🎉 End of content - layout is working!</Text>
        </View>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  debugContainer: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  debugText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 12,
    color: '#2C3E50',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
  },
});