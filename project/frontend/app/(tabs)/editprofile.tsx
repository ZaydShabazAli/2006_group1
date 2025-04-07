import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, FormInput } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { IP_ADDRESS } from '@env';

const ip = IP_ADDRESS;  // replace with your IP

export default function EditProfileScreen() {
  const [message, setMessage] = useState<string | object>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    current_password: '',
    new_password: ''
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await axios.get(`http://${ip}:8000/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setForm({
          name: response.data.name,
          phone: response.data.phone,
          current_password: '',
          new_password: '',
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
        setMessage("Failed to load user information.");
      }
    };

    fetchUserInfo();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setMessage("User not authenticated. Please log in.");
        return;
      }

      await axios.put(
        `http://${ip}:8000/api/users/update`,
        form,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage("Profile updated successfully!");
      alert("Profile updated!");
      router.replace('/(tabs)/profile');
    } catch (error: any) {
      console.error("Update failed:", error);
      setMessage(error.response?.data?.detail || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.mainContent}>
              <Text style={styles.heading}>Edit Profile</Text>

              {typeof message === 'string' && message ? (
                <Text style={[styles.messageText, { color: message.includes("success") ? "green" : "red" }]}>
                  {message}
                </Text>
              ) : null}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Name:</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(text) => handleChange("name", text)}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone:</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Current Password:</Text>
                <TextInput
                  style={styles.input}
                  value={form.current_password}
                  onChangeText={(text) => handleChange("current_password", text)}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>New Password:</Text>
                <TextInput
                  style={styles.input}
                  value={form.new_password}
                  onChangeText={(text) => handleChange("new_password", text)}
                  editable={!isSubmitting}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>{isSubmitting ? "Saving..." : "Save Changes"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#24a0ed',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
  scrollContent: {
    flexGrow: 1, // Ensures the content can grow and scroll
    justifyContent: 'center', // Centers the content vertically
  },
});
