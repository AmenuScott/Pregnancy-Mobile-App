import * as Device from "expo-device"
import * as Notifications from "expo-notifications"

export const setupNotification = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      alert("Push notifications permission not granted!")
      return
    }
  } else {
    alert("Must use physical device for Push Notifications")
  }
}

export const showLocalNotification = (title: string, body: string) => {
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // show immediately
  })
}
