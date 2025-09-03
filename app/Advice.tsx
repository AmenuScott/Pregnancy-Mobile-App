import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { adviceBySymptomAndTrimester } from './adviceData';

interface Symptom {
  id: number;
  name: string;
  icon: string;
}

interface CustomSymptom {
  id: string;
  name: string;
}

interface AdviceItem {
  title: string;
  advice: string[];
  urgency: 'low' | 'medium' | 'high';
}

type AdviceData = {
  [key: number]: AdviceItem;
};

// Mock advice data based on symptoms
const adviceData: AdviceData = {
  1: { // Nausea
    title: 'Managing Nausea',
    advice: [
      'Eat small, frequent meals throughout the day',
      'Try ginger tea or ginger candies',
      'Avoid strong smells that trigger nausea',
      'Stay hydrated with small sips of water',
      'Consider vitamin B6 supplements (consult your doctor first)',
    ],
    urgency: 'low',
  },
  2: { // Headache
    title: 'Headache Relief',
    advice: [
      'Rest in a dark, quiet room',
      'Apply a cold or warm compress to your head',
      'Practice relaxation techniques',
      'Stay hydrated',
      'Consult your doctor before taking any medication',
    ],
    urgency: 'medium',
  },
  3: { // Fatigue
    title: 'Managing Fatigue',
    advice: [
      'Take short naps when possible',
      'Prioritize getting 7-9 hours of sleep at night',
      'Eat iron-rich foods',
      'Stay hydrated and maintain a balanced diet',
      'Light exercise like walking can boost energy',
    ],
    urgency: 'low',
  },
  4: { // Back Pain
    title: 'Back Pain Relief',
    advice: [
      'Practice good posture',
      'Use a pregnancy support belt',
      'Apply heat to sore areas',
      'Sleep with a pregnancy pillow',
      'Try prenatal yoga or gentle stretching',
    ],
    urgency: 'medium',
  },
  5: { // Swelling
    title: 'Reducing Swelling',
    advice: [
      'Elevate your feet when sitting or lying down',
      'Avoid standing for long periods',
      'Wear comfortable, supportive shoes',
      'Reduce sodium intake',
      'Stay hydrated and avoid excessive heat',
    ],
    urgency: 'medium',
  },
  6: { // Dizziness
    title: 'Managing Dizziness',
    advice: [
      'Change positions slowly',
      'Stay hydrated',
      'Eat small, frequent meals',
      'Avoid hot showers or baths',
      'If severe or accompanied by other symptoms, contact your doctor immediately',
    ],
    urgency: 'high',
  },
  7: { // Cramps
    title: 'Relieving Cramps',
    advice: [
      'Stay hydrated',
      'Gentle stretching',
      'Apply warm (not hot) compress to the area',
      'Rest on your left side',
      'If severe or rhythmic, contact your healthcare provider immediately',
    ],
    urgency: 'high',
  },
  8: { // Insomnia
    title: 'Improving Sleep',
    advice: [
      'Establish a regular sleep schedule',
      'Create a comfortable sleep environment',
      'Use pregnancy pillows for support',
      'Avoid caffeine and large meals before bed',
      'Practice relaxation techniques like deep breathing',
    ],
    urgency: 'low',
  },
  9: { // Heartburn
    title: 'Heartburn Relief',
    advice: [
      'Eat smaller, more frequent meals',
      'Avoid spicy, fatty, or acidic foods',
      'Stay upright after eating',
      'Sleep with your upper body elevated',
      'Talk to your doctor about safe antacids',
    ],
    urgency: 'low',
  },
  10: { // Mood Swings
    title: 'Managing Mood Swings',
    advice: [
      'Practice self-care and relaxation techniques',
      'Get regular exercise',
      'Ensure adequate sleep',
      'Connect with other pregnant women or support groups',
      'Talk to your healthcare provider if mood changes are severe',
    ],
    urgency: 'medium',
  },
};

// Default advice for custom symptoms
const customSymptomAdvice = {
  title: 'Managing Your Symptom',
  advice: [
    'Track when this symptom occurs and what might trigger it',
    'Note the severity and duration of the symptom',
    'Discuss this symptom with your healthcare provider at your next appointment',
    'Rest and stay hydrated',
    'Consider keeping a symptom journal to share with your doctor'
  ],
  urgency: 'medium' as 'low' | 'medium' | 'high',
};

// This is needed for the symptom names in the advice screen
const symptoms: Symptom[] = [
  { id: 1, name: 'Nausea', icon: 'medical-outline' },
  { id: 2, name: 'Headache', icon: 'fitness-outline' },
  { id: 3, name: 'Fatigue', icon: 'bed-outline' },
  { id: 4, name: 'Back Pain', icon: 'body-outline' },
  { id: 5, name: 'Swelling', icon: 'water-outline' },
  { id: 6, name: 'Dizziness', icon: 'sync-outline' },
  { id: 7, name: 'Cramps', icon: 'pulse-outline' },
  { id: 8, name: 'Insomnia', icon: 'moon-outline' },
  { id: 9, name: 'Heartburn', icon: 'flame-outline' },
  { id: 10, name: 'Mood Swings', icon: 'happy-outline' },
];

interface RouteParams {
  symptoms?: string;
  customSymptoms?: string;
  trimester?: string;
}

export default function AdviceScreen() {
  // Get the symptoms parameter from the URL
  const params = useLocalSearchParams() as RouteParams;
  const symptomsParam = params.symptoms;
  const customSymptomsParam = params.customSymptoms;
  const trimesterParam = params.trimester;
  
  // Convert the comma-separated string back to an array of numbers
  const selectedSymptoms = symptomsParam ? 
    symptomsParam.split(',').map(id => parseInt(id, 10)) : [];
  
  // Parse custom symptoms from JSON string
  const customSymptoms: CustomSymptom[] = customSymptomsParam ? 
    JSON.parse(customSymptomsParam) : [];
  
  const getUrgencyLevel = (): 'low' | 'medium' | 'high' => {
    let highestUrgency: 'low' | 'medium' | 'high' = 'low';
    
    // Check standard symptoms
    selectedSymptoms.forEach(id => {
      const symptomUrgency = adviceData[id]?.urgency || 'low';
      if (symptomUrgency === 'high' || (symptomUrgency === 'medium' && highestUrgency === 'low')) {
        highestUrgency = symptomUrgency;
      }
    });
    
    // If there are custom symptoms, set urgency to at least medium
    if (customSymptoms.length > 0 && highestUrgency === 'low') {
      highestUrgency = 'medium';
    }
    
    return highestUrgency;
  };
  
  const urgencyLevel = getUrgencyLevel();
  
  const getUrgencyColor = (): string => {
    switch(urgencyLevel) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      default: return '#4caf50';
    }
  };
  
  const getUrgencyText = (): string => {
    switch(urgencyLevel) {
      case 'high': return 'Contact your doctor soon';
      case 'medium': return 'Monitor your symptoms';
      default: return 'Common pregnancy symptom';
    }
  };

  // Get advice based on symptoms and trimester
  const getAdviceForTrimester = () => {
    const advice: { title: string; advice: string[] }[] = [];
    
    selectedSymptoms.forEach(symptomId => {
      const symptomName = symptoms.find(s => s.id === symptomId)?.name;
      
      if (symptomName) {
        const symptomAdvice = adviceBySymptomAndTrimester[symptomName as keyof typeof adviceBySymptomAndTrimester];
        const trimesterKey = (trimesterParam === "1st Trimester" || trimesterParam === "2nd Trimester" || trimesterParam === "3rd Trimester")
          ? trimesterParam as "1st Trimester" | "2nd Trimester" | "3rd Trimester"
          : undefined;
        const trimesterAdvice = trimesterKey ? symptomAdvice?.[trimesterKey] : undefined;
        advice.push({
          title: `Advice for ${symptomName}`,
          advice: trimesterAdvice
            ? Array.isArray(trimesterAdvice) ? trimesterAdvice : [trimesterAdvice]
            : ["No specific advice for this symptom and trimester."],
        });
      }
    });
    
    // Add custom symptoms advice
    customSymptoms.forEach(symptom => {
      advice.push({
        title: `Managing ${symptom.name}`,
        advice: customSymptomAdvice.advice,
      });
    });
    
    return advice;
  };
  
  const adviceList = getAdviceForTrimester();

  return (
    <LinearGradient
      colors={['#fff9fb', '#f8e4f3']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#9c27b0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pregnancy Advice</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.urgencyContainer}>
            <View style={[styles.urgencyIndicator, { backgroundColor: getUrgencyColor() }]}>
              <Ionicons 
                name={urgencyLevel === 'high' ? 'alert-circle' : 'information-circle'} 
                size={24} 
                color="#fff" 
              />
            </View>
            <View style={styles.urgencyTextContainer}>
              <Text style={styles.urgencyTitle}>Urgency Level</Text>
              <Text style={[styles.urgencyLevel, { color: getUrgencyColor() }]}>
                {getUrgencyText()}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.adviceScrollView}>
            {adviceList.map((item, index) => (
              <View key={index} style={styles.adviceCard}>
                <View style={styles.adviceHeader}>
                  <Ionicons 
                    name="medical-outline" 
                    size={24} 
                    color="#9c27b0" 
                  />
                  <Text style={styles.adviceTitle}>{item.title}</Text>
                </View>
                
                <View style={styles.adviceList}>
                  {item.advice.map((adviceItem, idx) => (
                    <View key={idx} style={styles.adviceItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.adviceText}>{adviceItem}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            
            <View style={styles.disclaimerContainer}>
              <Ionicons name="medical" size={20} color="#9c27b0" />
              <Text style={styles.disclaimerText}>
                This advice is for informational purposes only. Always consult with your healthcare provider for medical advice.
              </Text>
            </View>
          </ScrollView>


        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9c27b0',
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  urgencyIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  urgencyTextContainer: {
    flex: 1,
  },
  urgencyTitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  urgencyLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  adviceScrollView: {
    flex: 1,
    marginBottom: 20,
  },
  adviceCard: {
    backgroundColor: '#f9f4fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#9c27b0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a148c',
    marginLeft: 10,
  },
  customSymptomNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  customSymptomNoteText: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 8,
  },
  adviceList: {
    marginLeft: 10,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ba68c8',
    marginTop: 6,
    marginRight: 10,
  },
  adviceText: {
    flex: 1,
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#616161',
    marginLeft: 10,
    lineHeight: 18,
  },
  contactButton: {
    backgroundColor: '#9c27b0',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#9c27b0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});