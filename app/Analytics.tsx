"use client";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, RefreshControl, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const [totalSymptoms, setTotalSymptoms] = useState<number>(0);
  const [symptomLogsPerDay, setSymptomLogsPerDay] = useState<number[]>([0,0,0,0,0,0,0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTotalSymptoms = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        // Fetch total count
        const res = await fetch(`https://pregwell-backend.onrender.com/api/symptom_logs/total?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setTotalSymptoms(data.count || 0);
        }
        // Fetch weekly logs
        const resWeek = await fetch(`https://pregwell-backend.onrender.com/api/symptom_logs/per-day?userId=${userId}`);
        if (resWeek.ok) {
          const dataWeek = await resWeek.json();
          const daysOrder = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
          const counts = daysOrder.map(day => dataWeek.find((d: { day: string; }) => d.day === day)?.count || 0);
          setSymptomLogsPerDay(counts);
        }
      }
    } catch (e) {
      setTotalSymptoms(0);
      setSymptomLogsPerDay([0,0,0,0,0,0,0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTotalSymptoms(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTotalSymptoms();
    setRefreshing(false);
  };

  const Card = ({ icon, color, label, value }: { icon: any; color: string; label: string; value: string | number }) => (
    <View style={styles.cardWrapper}>
      <LinearGradient colors={[color + '22', color + '55']} style={styles.card}>
        <View style={styles.cardIcon}><Ionicons name={icon} size={22} color={color} /></View>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header} start={{ x:0, y:0 }} end={{ x:1, y:1 }}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Ionicons name="analytics" size={26} color="#fff" />
            <Text style={styles.headerTitle}>Health Overview</Text>
            <Ionicons name="refresh" size={22} color="#fff" onPress={onRefresh} />
          </View>
        </SafeAreaView>
      </LinearGradient>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />}
        contentContainerStyle={{ padding:20 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading symptom data...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Total Symptoms Logged</Text>
            <View style={styles.grid}>
              <Card
                icon="pulse-outline"
                color="#ff6b6b"
                label="Symptoms Logged"
                value={totalSymptoms}
              />
            </View>
            <Text style={styles.sectionTitle}>Symptoms Trend (Last 7 Days)</Text>
            <View style={styles.chartContainer}>
              <BarChart
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{ data: symptomLogsPerDay }]
                  }}
                  width={Dimensions.get('window').width - 32}
                  height={220}
                  fromZero
                  showValuesOnTopOfBars
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1, index: number = 0) => {
                      const val = symptomLogsPerDay[index] ?? 0;
                      return val >= 3 ? `rgba(255, 99, 71, ${opacity})` : `rgba(0, 122, 255, ${opacity})`;
                    },
                    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                    barPercentage: 0.6,
                  }}
                  style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }} yAxisLabel={''} yAxisSuffix={''}              />
            </View>
            <Text style={{ marginTop: 10, color: '#555', fontSize: 13 }}>
              Higher bars mean more symptoms logged that day (higher risk). If you see higher bars, consider reaching out to your care provider.
            </Text>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightBox}>
              <Ionicons name="bulb-outline" size={22} color="#667eea" />
              <Text style={styles.insightText}>
                {totalSymptoms === 0
                  ? "Your symptoms are being monitored. Remember to continue logging any symptoms you experience to help track your health."
                  : totalSymptoms < 10
                    ? "You're doing well! Keep monitoring and logging your symptoms regularly."
                    : totalSymptoms < 20
                      ? "You've logged several symptoms. Stay alert and consult your care provider if you notice any changes."
                      : "You have logged many symptoms. Please consider reaching out to your healthcare provider for advice."}
              </Text>
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f8fafc' },
  header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal:20, borderBottomLeftRadius:30, borderBottomRightRadius:30 },
  headerContent: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  headerTitle: { color:'#fff', fontSize:20, fontWeight:'700' },
  content: { flex:1 },
  sectionTitle: { fontSize:18, fontWeight:'700', color:'#2d3748', marginBottom:14, marginTop:10 },
  grid: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  cardWrapper: { width:'100%', marginBottom:16 },
  card: { borderRadius:18, padding:16, minHeight:120, justifyContent:'space-between' },
  cardIcon: { backgroundColor:'rgba(255,255,255,0.8)', alignSelf:'flex-start', padding:8, borderRadius:12, marginBottom:6 },
  cardLabel: { fontSize:13, color:'#555', fontWeight:'500' },
  cardValue: { fontSize:32, fontWeight:'700', color:'#1a202c' },
  loadingBox: { alignItems:'center', paddingVertical:60 },
  loadingText: { marginTop:12, color:'#667eea', fontSize:14 },
  insightBox: { flexDirection:'row', alignItems:'flex-start', backgroundColor:'#fff', padding:16, borderRadius:16, shadowColor:'#000', shadowOpacity:0.05, shadowOffset:{ width:0, height:2 }, shadowRadius:6, elevation:3 },
  insightText: { flex:1, marginLeft:10, fontSize:14, color:'#333', lineHeight:20 },
  chartContainer: { marginBottom: 16 },
});
