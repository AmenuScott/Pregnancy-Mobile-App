import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface Props {
  name: string;
  backgroundColor?: string;
  style?: ViewStyle;
  profilePicture?: string | null
}

const ProfileHeader: React.FC<Props> = ({ name, backgroundColor = "#ffffff55", style }) => {
  // Add safety check for name
  const safeName = name || "User";
  const initials = safeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.initialsCircle, { backgroundColor }, styles.shadow]}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  initialsCircle: {
    borderRadius: 40,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5, // for Android shadow
  },
});

export default ProfileHeader;
