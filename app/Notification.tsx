"use client"

import { Ionicons } from "@expo/vector-icons"
import { formatDistanceToNow } from "date-fns"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { RectButton, Swipeable } from "react-native-gesture-handler"

const { width, height } = Dimensions.get("window")

type NotificationItem = {
  id: number
  title: string
  message: string
  time: Date
  read: boolean
  type: "reminder" | "tip" | "update" | "appointment" | "milestone"
  priority: "high" | "medium" | "low"
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Prenatal Vitamin Reminder",
    message: "Don't forget to take your prenatal vitamins today! They're essential for your baby's development.",
    time: new Date(),
    read: false,
    type: "reminder",
    priority: "high",
  },
  {
    id: 2,
    title: "Weekly Tip",
    message: "Drink at least 8-10 glasses of water daily to stay hydrated during pregnancy.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    type: "tip",
    priority: "medium",
  },
  {
    id: 3,
    title: "Appointment Reminder",
    message: "Your next prenatal checkup is scheduled for tomorrow at 2:00 PM.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: true,
    type: "appointment",
    priority: "high",
  },
  {
    id: 4,
    title: "Pregnancy Milestone",
    message: "Congratulations! You've reached 24 weeks. Your baby is now the size of a corn cob!",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: false,
    type: "milestone",
    priority: "medium",
  },
  {
    id: 5,
    title: "New Content Available",
    message: "Check out our latest articles about second trimester nutrition and exercise.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true,
    type: "update",
    priority: "low",
  },
]

const Notifications = () => {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread">("all")

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current
  const bubbleAnim1 = useRef(new Animated.Value(0)).current
  const bubbleAnim2 = useRef(new Animated.Value(0)).current

  const itemAnims = useRef(initialNotifications.map(() => new Animated.Value(0))).current

  useEffect(() => {
    startAnimations()
  }, [])

  const startAnimations = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    Animated.spring(headerScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start()

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start()

    startBubbleAnimations()
  }

  const startBubbleAnimations = () => {
    const createBubbleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 4000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      )
    }

    createBubbleAnimation(bubbleAnim1, 0).start()
    createBubbleAnimation(bubbleAnim2, 2000).start()
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "reminder":
        return "alarm-outline"
      case "tip":
        return "bulb-outline"
      case "update":
        return "newspaper-outline"
      case "appointment":
        return "calendar-outline"
      case "milestone":
        return "trophy-outline"
      default:
        return "notifications-outline"
    }
  }

  const getNotificationColor = (type: NotificationItem["type"], priority: NotificationItem["priority"]) => {
    if (priority === "high") return "#FF6B9D"

    switch (type) {
      case "reminder":
        return "#FFA726"
      case "tip":
        return "#4ECDC4"
      case "update":
        return "#9C27B0"
      case "appointment":
        return "#FF5722"
      case "milestone":
        return "#FFD700"
      default:
        return "#9C27B0"
    }
  }

  const renderRightActions = (progress: any, dragX: any, id: number) => {
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 50, 100],
      extrapolate: "clamp",
    })

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    })

    return (
      <Animated.View style={[styles.deleteContainer, { transform: [{ translateX: trans }] }]}>
        <RectButton style={styles.deleteButton} onPress={() => deleteNotification(id)}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </Animated.View>
        </RectButton>
      </Animated.View>
    )
  }

  const renderItem = ({ item, index }: { item: NotificationItem; index: number }) => {
    const notificationColor = getNotificationColor(item.type, item.priority)

    return (
      <Animated.View
        style={{
          opacity: itemAnims[index],
          transform: [
            {
              translateY: itemAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
      >
        <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}>
          <TouchableOpacity
            style={[styles.notificationItem, !item.read && styles.unreadNotification]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.notificationContent}>
              <View style={[styles.iconContainer, { backgroundColor: `${notificationColor}20` }]}>
                <Ionicons name={getNotificationIcon(item.type) as any} size={24} color={notificationColor} />
              </View>

              <View style={styles.textContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
                  {!item.read && <View style={[styles.badge, { backgroundColor: notificationColor }]} />}
                  {item.priority === "high" && (
                    <View style={styles.priorityBadge}>
                      <Ionicons name="alert-circle" size={12} color="#FF5722" />
                    </View>
                  )}
                </View>
                <Text style={styles.message} numberOfLines={2}>
                  {item.message}
                </Text>
                <View style={styles.footer}>
                  <Text style={styles.time}>{formatDistanceToNow(item.time, { addSuffix: true })}</Text>
                  <View style={[styles.typeTag, { backgroundColor: `${notificationColor}15` }]}>
                    <Text style={[styles.typeText, { color: notificationColor }]}>{item.type}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    )
  }

  const filteredNotifications = notifications.filter((n) => (selectedFilter === "all" ? true : !n.read))

  const today = filteredNotifications.filter((n) => isToday(n.time))
  const earlier = filteredNotifications.filter((n) => !isToday(n.time))
  const unreadCount = notifications.filter((n) => !n.read).length

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: headerScaleAnim }],
        },
      ]}
    >
      <LinearGradient colors={["#9C27B0", "#7B1FA2"]} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="notifications" size={28} color="white" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && <Text style={styles.headerSubtitle}>{unreadCount} unread messages</Text>}
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead} activeOpacity={0.7}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  )

  const renderFilterTabs = () => (
    <Animated.View
      style={[
        styles.filterContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.filterTab, selectedFilter === "all" && styles.activeFilterTab]}
        onPress={() => setSelectedFilter("all")}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, selectedFilter === "all" && styles.activeFilterText]}>
          All ({notifications.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, selectedFilter === "unread" && styles.activeFilterTab]}
        onPress={() => setSelectedFilter("unread")}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, selectedFilter === "unread" && styles.activeFilterText]}>
          Unread ({unreadCount})
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name="notifications-off-outline" size={64} color="#000000ff" />
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === "unread"
          ? "You're all caught up! No unread notifications."
          : "You don't have any notifications yet."}
      </Text>
    </Animated.View>
  )

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#F3E5F5", "#E1BEE7", "#CE93D8"]} style={styles.backgroundGradient}>
          {/* Animated Background Bubbles */}
          <Animated.View
            style={[
              styles.bubble,
              styles.bubbleTop,
              {
                opacity: bubbleAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.15],
                }),
                transform: [
                  {
                    scale: bubbleAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.bubble,
              styles.bubbleBottom,
              {
                opacity: bubbleAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.1],
                }),
                transform: [
                  {
                    scale: bubbleAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.1],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Notifications</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            {renderHeader()}
            {renderFilterTabs()}

            {filteredNotifications.length === 0 ? (
              renderEmptyState()
            ) : (
              <Animated.View
                style={[
                  styles.listContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {today.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Today</Text>
                    <FlatList
                      data={today}
                      keyExtractor={(item) => `today-${item.id}`}
                      renderItem={renderItem}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false}
                    />
                  </>
                )}

                {earlier.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Earlier</Text>
                    <FlatList
                      data={earlier}
                      keyExtractor={(item) => `earlier-${item.id}`}
                      renderItem={renderItem}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false}
                    />
                  </>
                )}
              </Animated.View>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  )
}

function isToday(date: Date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  bubble: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(156, 39, 176, 0.1)",
  },
  bubbleTop: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  bubbleBottom: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: "#c972d8ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  headerGradient: {
    borderRadius: 20,
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "Black",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  markAllButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  markAllText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  activeFilterTab: {
    backgroundColor: "#ae67baff",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7F8C8D",
  },
  activeFilterText: {
    color: "white",
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
    marginTop: 10,
  },
  notificationItem: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#9C27B0",
  },
  notificationContent: {
    flexDirection: "row",
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "bold",
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityBadge: {
    marginLeft: 4,
  },
  message: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: "#BDC3C7",
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  deleteContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  deleteButton: {
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#BDC3C7",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#BDC3C7",
    textAlign: "center",
    lineHeight: 22,
  },
})

export default Notifications
