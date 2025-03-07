import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from 'react-native-markdown-display'; 
import { GEMINI_API_KEY } from "@env"; 

// const GEMINI_API_KEY = "enter-your-api-key-here"; 

// Define the topic constraint
const SYSTEM_PROMPT = `You are an AI assistant called Nyssa that helps women with their period tracking and help advice regarding period assistant advice and health chat like a doctor and health advisor. 
Here's the user's period data from our database:  user was on period from 6-8 march 2025 with mild pain and cramps. your expected period date in the enxt month is 7-8 April, 2025. Tell these info only when asked.
You will only answer questions around your job. If the user asks anything unrelated to health, period or provided data, politely refuse to answer.`;

// Define types for messages
interface Message {
  type: 'user' | 'ai';
  text: string;
}

// Define API response types
interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: {
    message?: string;
  };
}

const GeminiAssistantScreen: React.FC = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return Alert.alert("Error", "Message cannot be empty");

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to chat
    const updatedMessages: Message[] = [...messages, { type: "user", text: userMessage }];
    setMessages(updatedMessages);
    
    setIsLoading(true);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}` }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          }),
        }
      );

      const data: GeminiResponse = await res.json();
      
      // Proper response extraction according to Gemini API structure
      let aiResponse = "No response from AI";
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const contentParts = data.candidates[0].content.parts;
        if (contentParts && contentParts.length > 0) {
          aiResponse = contentParts[0].text || "Empty response";
        }
      } else if (data.error) {
        // Handle API error
        console.error("Gemini API Error:", data.error);
        aiResponse = `Error: ${data.error.message || "Unknown error"}`;
      }

      // Add AI response to chat
      setMessages([...updatedMessages, { type: "ai", text: aiResponse }]);
      setResponse(aiResponse);
    } catch (error: any) {
      console.error("Request Error:", error);
      Alert.alert("Error", "Failed to communicate with Gemini API: " + error.message);
      
      // Add error message to chat
      setMessages([...updatedMessages, { type: "ai", text: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a8e2d", "#146922"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#1a8e2d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nyssa : AI Period Assistant</Text>
        </View>

        <ScrollView style={styles.chatContainer}>
          {messages.length === 0 ? (
            <Text style={styles.welcomeText}>
              Hello! I'm Nyssa your personal AI period and health Advisor. How can I help you today?
            </Text>
          ) : (
            messages.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageBubble, 
                  msg.type === "user" ? styles.userMessage : styles.aiMessage
                ]}
              >
                {msg.type === "user" ? (
                  <Text style={styles.messageText}>{msg.text}</Text>
                ) : (
                  // Use Markdown component for AI messages
                  <Markdown style={markdownStyles}>
                    {msg.text}
                  </Markdown>
                )}
              </View>
            ))
          )}
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Text>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your period..."
            value={input}
            onChangeText={setInput}
            multiline
          />

          <TouchableOpacity 
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const markdownStyles = {
  // Base text style
  body: {
    color: '#333',
    fontSize: 16,
  },
  // Bold text
  strong: {
    fontWeight: 'bold',
  },
  // Italic text
  em: {
    fontStyle: 'italic',
  },
  // Heading styles
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  // List styles
  bullet_list: {
    marginLeft: 20,
  },
  ordered_list: {
    marginLeft: 20,
  },
  // Link style
  link: {
    color: '#1a8e2d',
    textDecorationLine: 'underline',
  },
  // Code blocks
  code_block: {
    backgroundColor: '#f6f8fa',
    padding: 10,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Inline code
  code_inline: {
    backgroundColor: '#f6f8fa',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    padding: 2,
  },
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 140 : 120,
  },
  content: { 
    flex: 1, 
    paddingTop: Platform.OS === "ios" ? 50 : 30, 
    paddingHorizontal: 20 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingBottom: 20 
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "white", 
    marginLeft: 15 
  },
  chatContainer: { 
    flex: 1, 
    marginVertical: 20 
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic"
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: "#dcf8c6",
    alignSelf: "flex-end",
    borderTopRightRadius: 5,
  },
  aiMessage: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  loadingIndicator: {
    padding: 10,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 30 : 10,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  sendButton: {
    height: 50,
    width: 80,
    backgroundColor: "#1a8e2d",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#a5d8ac",
  },
  sendButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});

export default GeminiAssistantScreen;