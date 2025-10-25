import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import axios from 'axios';
import { LanguageContext } from '../context/LanguageContext';

const API_URL = 'http://your-backend-url:5000'; // Update with your backend URL

const ChatScreen = () => {
  const { language, translations } = useContext(LanguageContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    // Initialize session
    setSessionId(`session_${Date.now()}`);

    // Initialize TTS
    Tts.setDefaultLanguage(language);

    // Voice recognition handlers
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Initial greeting
    const greeting = {
      id: Date.now(),
      text: translations[language].greeting,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([greeting]);
    speakText(greeting.text);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsRecording(true);
  };

  const onSpeechEnd = () => {
    setIsRecording(false);
  };

  const onSpeechResults = (event) => {
    const spokenText = event.value[0];
    setInputText(spokenText);
    handleSendMessage(spokenText);
  };

  const onSpeechError = (error) => {
    console.error('Speech error:', error);
    setIsRecording(false);
    Alert.alert('Error', 'Could not recognize speech. Please try again.');
  };

  const startRecording = async () => {
    try {
      await Voice.start(language);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      Alert.alert('Error', 'Could not start voice recognition.');
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const speakText = (text) => {
    Tts.speak(text);
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/analyze-symptoms`, {
        message: text,
        session_id: sessionId,
        language: language,
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
        riskLevel: response.data.risk_level,
      };

      setMessages((prev) => [...prev, aiMessage]);
      speakText(aiMessage.text);

      // Show alert for high-risk symptoms
      if (response.data.risk_level === 'high') {
        Alert.alert(
          translations[language].urgentAttention,
          translations[language].seekImmediateHelp,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Could not connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : styles.aiMessage,
              message.riskLevel === 'high' && styles.highRiskMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.isUser
                  ? styles.userMessageText
                  : styles.aiMessageText,
              ]}
            >
              {message.text}
            </Text>
            {message.riskLevel === 'high' && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningText}>⚠️ Urgent</Text>
              </View>
            )}
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#10b981" />
            <Text style={styles.loadingText}>
              {translations[language].analyzing}...
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={translations[language].typeOrSpeak}
          multiline
          editable={!isRecording}
        />
        <TouchableOpacity
          style={[
            styles.voiceButton,
            isRecording && styles.voiceButtonActive,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.voiceButtonText}>
            {isRecording ? '⏹️' : '🎤'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#10b981',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  highRiskMessage: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#1f2937',
  },
  warningBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  warningText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
  },
  voiceButtonText: {
    fontSize: 24,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    fontSize: 24,
    color: 'white',
  },
});

export default ChatScreen;
