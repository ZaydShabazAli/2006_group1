import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios'; // Import axios for HTTP requests
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants';

type CheckUserResponse = {
  exists: boolean;
};

type LoginResponse = {
  token: string;
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State to display error or success message

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      const checkUserResponse = await axios.post<CheckUserResponse>(
        `${BASE_URL}/api/users/check2`, 
        { email },
        { timeout: 5000 } // Add timeout
        
      );

  
      if (!checkUserResponse.data.exists) {
        alert('User does not exist! Please sign up!');
        return;
      }
      // Send login request to backend
      const response = await axios.post<LoginResponse>(
        `${BASE_URL}/api/users/login`,
        { email, password },
        { timeout: 5000 }
      );

      // Now TypeScript knows that 'token' exists on 'response.data'
      console.log("Login response:", response.data);
      const { token } = response.data;

      // Store the token (you can use async storage, context, or redux to save the token)
      await AsyncStorage.setItem('userToken', token);
      // For now, we're just logging it to the console
      console.log("Login successful, token:", token);
      if (response.data.token) {
        alert(`Login successful!`);
        router.replace('/(tabs)');
        return;
      }
      // Redirect the user after successful login
        // Adjust this to your main screen or home page

    } catch (error: any) {
      // Log the error to inspect the response structure
      console.log('Error response:', error.response);
      console.log("Error response detail:", error.response?.data?.detail);
      if (error.response?.data?.detail === "Server error: 400: Password Incorrect") {
        alert("Incorrect password. Please try again.");
      } else {
        alert("Something went wrong. Please try again.");
      }
  
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CrimeWatch</Text>

      {/* Display error or success message */}
      {message && <Text style={styles.message}>{message}</Text>}

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  input: {
    fontFamily: 'Inter-Regular',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  link: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 16,
  },
  message: {
    color: 'red', // Set the color for error message
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});
