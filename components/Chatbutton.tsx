// React Native version of ChatButton

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatModal from './ChatModal'; // Ensure this matches your actual file path and uses RN code

const ChatButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsModalOpen(true)}
        style={styles.chatButton}
        accessibilityLabel="Chat with Legal Assistant"
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>

      <ChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 100,
  },
  chatButton: {
    backgroundColor: '#b98a11',
    padding: 16,
    borderRadius: 50,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatButton;
