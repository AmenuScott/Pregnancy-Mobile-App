import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {}

class ErrorBoundary extends React.Component<React.PropsWithChildren<Props>> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught in boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Something went wrong</Text>
          <TouchableOpacity 
            onPress={() => this.setState({ hasError: false })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#9C27B0',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export default ErrorBoundary;