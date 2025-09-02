"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState, useCallback, useMemo } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  RefreshControl,
  StyleSheet,
} from "react-native"
// Removed NotificationBell from this screen header to declutter
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface Notification {
  id: string;
  is_read: boolean;
  title: string;
  message: string;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const resolveUserId = useCallback(async () => {
    const ids = [await AsyncStorage.getItem('userId'), await AsyncStorage.getItem('user_id')];
    if (ids[0]) return ids[0];
    if (ids[1]) return ids[1];
    const composite = await AsyncStorage.getItem('user');
    if (composite) {
      try { const parsed = JSON.parse(composite); return parsed?.id || parsed?._id || parsed?.userId || null; } catch {}
    }
    return null;
  }, [])

  const fetchNotifications = useCallback( async () => {
    setLoading(true);
    try {
      const userId = await resolveUserId();
      if (!userId) { setNotifications([]); return; }
      const res = await fetch(`https://pregwell-backend.onrender.com/api/notifications/${userId}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load notifications');
      setNotifications([]);
    } finally { setLoading(false); }
  }, [resolveUserId])



  const markAsRead = async (id: string) => {
    // optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    try {
      await fetch(`https://pregwell-backend.onrender.com/api/notifications/${id}/mark-as-read`, { method: 'PUT' })
    } catch (e) {
      // revert if failed
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n))
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (!unreadIds.length) return
    // optimistic
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    try {
      await Promise.all(unreadIds.map(id => fetch(`https://pregwell-backend.onrender.com/api/notifications/${id}/mark-as-read`, { method: 'PUT' })))
    } catch (e) {
      fetchNotifications() // fallback full refresh
    }
  }

  const deleteNotification = async (id: string) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        // optimistic remove
        const prev = notifications
        setNotifications(prev.filter(n => n.id !== id))
        try {
          await fetch(`https://pregwell-backend.onrender.com/api/notifications/${id}`, { method: 'DELETE' })
        } catch (e) {
          setNotifications(prev) // revert
        }
      }}
    ])
  }

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchNotifications()
    setRefreshing(false)
  }, [fetchNotifications])

  const filtered = useMemo(() => notifications
    .filter(n => filter === 'all' ? true : !n.is_read)
    .filter(n => (n.title + n.message).toLowerCase().includes(search.toLowerCase())), [notifications, filter, search])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const relative = (iso: string) => {
    const d = dayjs(iso)
    if (!d.isValid()) return ''
    const diffHours = dayjs().diff(d, 'hour')
    return diffHours < 24 ? d.fromNow() : d.format('MMM D, HH:mm')
  }

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={[styles.card, !item.is_read && styles.cardUnread]}>
      <View style={styles.cardTopRow}>
        <View style={styles.iconCircle}> 
          <Ionicons name={item.is_read ? 'notifications-outline' : 'alert'} size={18} color={item.is_read ? '#6c5ce7' : '#E91E63'} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.title, !item.is_read && styles.titleUnread]} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
          <View style={styles.metaRow}>
            {!item.is_read && <View style={styles.unreadDot} />}
            <Text style={styles.time}>{relative(item.created_at)}</Text>
          </View>
        </View>
        <View style={styles.actionsCol}>
          {!item.is_read && (
            <TouchableOpacity onPress={() => markAsRead(item.id)} style={styles.smallAction}>
              <Ionicons name='checkmark-done' size={16} color='#fff' />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => deleteNotification(item.id)} style={[styles.smallAction, { backgroundColor: '#d33' }]}> 
            <Ionicons name='trash' size={14} color='#fff' />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#6c5ce7','#8e44ad']} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={22} color='#fff' />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.searchBar}> 
          <Ionicons name='search' size={18} color='rgba(255,255,255,0.8)' />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder='Search notifications'
            placeholderTextColor='rgba(255,255,255,0.6)'
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name='close' size={18} color='rgba(255,255,255,0.8)' />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterRow}>
          {(['all','unread'] as const).map(f => {
            const active = f === filter
            return (
              <TouchableOpacity key={f} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setFilter(f)}>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{f === 'all' ? 'All' : 'Unread'}</Text>
                {f==='unread' && unreadCount>0 && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{unreadCount}</Text></View>}
              </TouchableOpacity>
            )
          })}
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead} disabled={!unreadCount}>
            <Ionicons name='checkmark-done' size={16} color={unreadCount? '#fff':'#aaa'} />
            <Text style={[styles.markAllText,{color: unreadCount? '#fff':'#aaa'}]}>Mark all</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={styles.listWrapper}>
        {loading && <ActivityIndicator style={{ marginTop: 40 }} size='large' color='#6c5ce7' />}
        {!loading && error && <Text style={styles.errorText}>{error}</Text>}
        {!loading && !error && filtered.length === 0 && (
          <View style={styles.emptyState}> 
            <Ionicons name='notifications-off-outline' size={64} color='#ccc' />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up ✨</Text>
          </View>
        )}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6c5ce7']} tintColor='#6c5ce7' />}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerGradient: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex:1, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  searchBar: { flexDirection:'row', alignItems:'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal:12, paddingVertical:8, gap:8 },
  searchInput: { flex:1, color:'#fff', fontSize:14, padding:0 },
  filterRow: { flexDirection: 'row', alignItems:'center', marginTop:14, flexWrap:'wrap' },
  filterChip: { paddingHorizontal:16, height:36, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:18, marginRight:10, flexDirection:'row', alignItems:'center' },
  filterChipActive: { backgroundColor:'#fff' },
  filterChipText: { color:'#fff', fontSize:13, fontWeight:'600' },
  filterChipTextActive: { color:'#6c5ce7' },
  filterBadge: { backgroundColor:'#E91E63', minWidth:18, height:18, borderRadius:9, marginLeft:6, alignItems:'center', justifyContent:'center', paddingHorizontal:4 },
  filterBadgeText: { color:'#fff', fontSize:10, fontWeight:'700' },
  markAllBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal:14, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.08)', marginLeft:'auto', gap:6 },
  markAllText: { fontSize:12, fontWeight:'600' },
  listWrapper: { flex:1, backgroundColor:'#fff', marginTop:-18, borderTopLeftRadius:28, borderTopRightRadius:28 },
  errorText: { textAlign:'center', color:'#d33', marginTop:30 },
  emptyState: { alignItems:'center', marginTop:60, paddingHorizontal:24 },
  emptyTitle: { fontSize:18, fontWeight:'700', color:'#333', marginTop:16 },
  emptySubtitle: { fontSize:14, color:'#666', marginTop:4 },
  card: { backgroundColor:'#fff', borderRadius:16, padding:14, marginBottom:12, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4, elevation:2, borderWidth:1, borderColor:'#f1f1f3' },
  cardUnread: { borderColor:'#d9c9ff', backgroundColor:'#f8f6ff' },
  cardTopRow: { flexDirection:'row' },
  iconCircle: { width:34, height:34, borderRadius:17, backgroundColor:'#f0ebff', alignItems:'center', justifyContent:'center', marginRight:12 },
  cardContent: { flex:1 },
  title: { fontSize:15, fontWeight:'600', color:'#444' },
  titleUnread: { color:'#2c2459' },
  message: { fontSize:13, color:'#555', marginTop:4, lineHeight:18 },
  metaRow: { flexDirection:'row', alignItems:'center', marginTop:8, gap:6 },
  unreadDot: { width:8, height:8, borderRadius:4, backgroundColor:'#E91E63' },
  time: { fontSize:11, color:'#888' },
  actionsCol: { justifyContent:'space-between', alignItems:'flex-end', marginLeft:10 },
  smallAction: { backgroundColor:'#6c5ce7', padding:6, borderRadius:10, marginBottom:6 },
})
