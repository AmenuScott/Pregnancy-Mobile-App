// React Native ChatModal converted from your React Web component

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or use lucide-react-native if available

type ChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  type Message = {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
  };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('msg', userMessage.content);

      const response = await fetch('http://localhost:8080/get', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to get response');

      const botResponse = await response.text();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.messageRight : styles.messageLeft,
      ]}
    >
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timestamp}>{item.timestamp.toLocaleTimeString()}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Chat with Legal Assistant</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {isLoading && (
            <Text style={styles.loading}>Bot is typing...</Text>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Type your message..."
              style={styles.input}
              onSubmitEditing={handleSendMessage}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={isLoading}
              style={[styles.sendButton, isLoading && { opacity: 0.5 }]}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  messagesList: {
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#b98a11',
  },
  botBubble: {
    backgroundColor: '#eee',
  },
  messageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#b98a11',
    borderRadius: 20,
    padding: 10,
  },
  loading: {
    textAlign: 'left',
    fontSize: 12,
    paddingLeft: 12,
    color: 'gray',
  },
});

export default ChatModal;