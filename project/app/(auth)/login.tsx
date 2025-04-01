import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios'; // Import axios for HTTP requests

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
      // Send login request to backend
      const response = await axios.post("http://192.168.0.101:3001/api/users/login", {
        email,
        password,
      });

      // Assuming the server sends the token back on successful login
      const { token } = response.data;

      // Store the token (you can use async storage, context, or redux to save the token)
      // For now, we're just logging it to the console
      console.log("Login successful, token:", token);

      // Redirect the user after successful login
      router.replace('/(tabs)');  // Adjust this to your main screen or home page

    } catch (error: any) {
      // Handle errors from the server
      setMessage("Error: " + error.response?.data?.msg || "Something went wrong.");
      console.error("Login error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CrimeWatch</Text>

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