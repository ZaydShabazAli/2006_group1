import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { BASE_URL } from '../../constants';

export default function FeedbackScreen() {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState<string | object>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMessage(''); // Clear the message when the page loads
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setMessage(''); // Clear the message when the page is revisited
    }, [])
  );

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity 
        key={index} 
        onPress={() => setRating(index + 1)}
        disabled={isSubmitting}
      >
        <FontAwesome
          name={index < rating ? 'star' : 'star-o'}
          size={30}
          color={index < rating ? '#FFD700' : '#ccc'}
        />
      </TouchableOpacity>
    ));
  };

const handleSubmit = async () => {
  const fetchEmail = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error("User not authenticated. Please log in.");
      }

  const response = await axios.get<{ email: string }>(
    `${BASE_URL}/api/users/email`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );

  return response.data.email;
    } catch (error: any) {
      console.error("Error fetching email:", error);
      throw new Error(error.response?.data?.msg || "Failed to fetch email.");
    }
  };

  let userEmail = '';
  try {
    userEmail = await fetchEmail();
  } catch (error: any) {
    setMessage(error.message || "An unknown error occurred.");
    return;
  }
      if (!comment.trim()) {
        setMessage("Please enter your feedback");
        return;
      }
    
      if (rating === 0) {
        setMessage("Please select a rating");
        return;
      }
    
      setIsSubmitting(true);
      setMessage('');
    
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setMessage("User not authenticated. Please log in.");
          return;
        }
    
        const response = await axios.post(
          `${BASE_URL}/api/feedback`,
          {
            email: userEmail,
            rating,
            message: comment,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );
    
        setMessage("Feedback submitted successfully!");
        alert("Thank you for your feedback!");
        setRating(0);
        setComment('');
        router.replace('/(tabs)');
    
      } catch (error: any) {
        console.error("Feedback submission error:", error);
        setMessage(
          error.response?.data?.detail || 
          "Failed to submit feedback. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)/profile')}
            disabled={isSubmitting}
          >
            <View style={styles.backButtonContent}>
              <ChevronLeft size={24} color="#24a0ed" />
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.mainContent}>
            <Text style={styles.heading}>Submit Feedback</Text>
            
              {typeof message === 'string' && message ? (
                <Text style={[styles.messageText, { color: message.includes('Thank') ? 'green' : 'red' }]}>
                  {message}
                </Text>
              ) : null}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating:</Text>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Comment:</Text>
              <TextInput
                style={styles.textarea}
                value={comment}
                onChangeText={setComment}
                multiline
                placeholder="Enter your comments"
                placeholderTextColor="#888"
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 20,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    marginTop: 60,
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#444',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 15,
  },
  textarea: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 10,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#24a0ed',
    fontSize: 16,
    fontWeight: '500',
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});
