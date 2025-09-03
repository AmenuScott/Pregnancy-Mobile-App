"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAnalyticsSummary } from '../lib/analytics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SummaryData {
  symptom_logs_7d?: number;
  last_menstrual_log?: string;
  chat_msgs_7d?: number;
  baby_dob_saved?: string;
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pregnancyInfo, setPregnancyInfo] = useState<{ week: number; trimester: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAnalyticsSummary();
      setSummary(data);
      // Fetch profile for gestational data
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        const res = await fetch(`https://pregwell-backend.onrender.com/api/patients/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const prof = await res.json();
          if (prof.last_menstrual_period) {
            const lmp = new Date(prof.last_menstrual_period);
            const days = Math.floor((Date.now() - lmp.getTime()) / (1000 * 60 * 60 * 24));
            const week = Math.floor(days / 7);
            let trimester = '1st Trimester';
            if (week > 27) trimester = '3rd Trimester'; else if (week > 12) trimester = '2nd Trimester';
            setPregnancyInfo({ week, trimester });
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const formatDate = (d?: string) => {
    if (!d) return '--';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return '--'; }
  };

  const Card = ({ icon, color, label, value, sub }: { icon: any; color: string; label: string; value: string | number; sub?: string }) => (
    <View style={styles.cardWrapper}>
      <LinearGradient colors={[color + '22', color + '55']} style={styles.card}>
        <View style={styles.cardIcon}><Ionicons name={icon} size={22} color={color} /></View>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue}>{value}</Text>
        {sub && <Text style={styles.cardSub}>{sub}</Text>}
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
          {pregnancyInfo && (
            <View style={styles.gestRow}>
              <Ionicons name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.gestText}>Week {pregnancyInfo.week} • {pregnancyInfo.trimester}</Text>
            </View>
          )}
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
            <Text style={styles.loadingText}>Analyzing recent activity...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Last 7 Days</Text>
            <View style={styles.grid}>
              <Card icon="pulse-outline" color="#ff6b6b" label="Symptoms Logged" value={summary?.symptom_logs_7d ?? 0} />
              <Card icon="chatbubble-ellipses-outline" color="#4ECDC4" label="Chat Messages" value={summary?.chat_msgs_7d ?? 0} />
              <Card icon="female-outline" color="#ffa94d" label="Last Period Log" value={formatDate(summary?.last_menstrual_log)} />
              <Card icon="baby-outline" color="#6a4cff" label="Baby DOB Saved" value={summary?.baby_dob_saved ? 'Yes' : 'No'} sub={summary?.baby_dob_saved ? formatDate(summary?.baby_dob_saved) : '—'} />
            </View>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightBox}>
              <Ionicons name="bulb-outline" size={22} color="#667eea" />
              <Text style={styles.insightText}>
                {summary?.symptom_logs_7d ? 'Keep logging symptoms to build a clearer health pattern.' : 'Start logging symptoms to generate trends.'}
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
  gestRow: { flexDirection:'row', alignItems:'center', marginTop:6 },
  gestText: { color:'rgba(255,255,255,0.9)', marginLeft:8, fontSize:14 },
  content: { flex:1 },
  sectionTitle: { fontSize:18, fontWeight:'700', color:'#2d3748', marginBottom:14, marginTop:10 },
  grid: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  cardWrapper: { width:'48%', marginBottom:16 },
  card: { borderRadius:18, padding:16, minHeight:120, justifyContent:'space-between' },
  cardIcon: { backgroundColor:'rgba(255,255,255,0.8)', alignSelf:'flex-start', padding:8, borderRadius:12, marginBottom:6 },
  cardLabel: { fontSize:13, color:'#555', fontWeight:'500' },
  cardValue: { fontSize:24, fontWeight:'700', color:'#1a202c' },
  cardSub: { fontSize:11, color:'#555', marginTop:4 },
  loadingBox: { alignItems:'center', paddingVertical:60 },
  loadingText: { marginTop:12, color:'#667eea', fontSize:14 },
  insightBox: { flexDirection:'row', alignItems:'flex-start', backgroundColor:'#fff', padding:16, borderRadius:16, shadowColor:'#000', shadowOpacity:0.05, shadowOffset:{ width:0, height:2 }, shadowRadius:6, elevation:3 },
  insightText: { flex:1, marginLeft:10, fontSize:14, color:'#333', lineHeight:20 }
});
