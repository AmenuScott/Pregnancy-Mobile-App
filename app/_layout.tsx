import { Stack } from 'expo-router';
import React, { ErrorInfo } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Error boundary to catch and display rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  // Initialize push notifications (token registration & listeners)
  usePushNotifications();
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            // Add animation to ensure consistent behavior
            animation: 'slide_from_right',
          }} 
        />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8d7da',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#721c24',
    textAlign: 'center',
  },
});