import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthData {
  token: string | null;
  userId: string | null;
  profileCompleted: string | null;
}

/**
 * Safely retrieves and validates authentication data from AsyncStorage
 */
export const getAuthData = async (): Promise<AuthData> => {
  try {
    const [token, userId, profileCompleted] = await AsyncStorage.multiGet([
      "token",
      "userId", 
      "profileCompleted"
    ]);

    return {
      token: token[1],
      userId: userId[1],
      profileCompleted: profileCompleted[1]
    };
  } catch (error) {
    console.error("Error retrieving auth data:", error);
    return {
      token: null,
      userId: null,
      profileCompleted: null
    };
  }
};

/**
 * Validates if user is properly authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { token, userId } = await getAuthData();
  return !!(token && userId);
};

/**
 * Safely clears all authentication data
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(["token", "userId", "profileCompleted"]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

/**
 * Validates and stores authentication data safely
 */
export const setAuthData = async (token: string, userId: string, profileCompleted: boolean | string): Promise<boolean> => {
  try {
    if (!token || !userId) {
      console.error("Invalid auth data provided");
      return false;
    }

    await AsyncStorage.multiSet([
      ["token", token],
      ["userId", userId.toString()],
      ["profileCompleted", (profileCompleted === true || profileCompleted === "true") ? "true" : "false"]
    ]);

    // Verify data was stored correctly
    const { token: storedToken, userId: storedUserId } = await getAuthData();
    return !!(storedToken && storedUserId);
  } catch (error) {
    console.error("Error storing auth data:", error);
    return false;
  }
};