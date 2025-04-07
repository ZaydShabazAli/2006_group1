import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IP_ADDRESS } from '@env';

const ip = IP_ADDRESS; 

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isWeakPassword, setIsWeakPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); 

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = () => {
    let isWeak = false;

    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*/]/.test(password)) {
      isWeak = true;
    }
    setIsWeakPassword(isWeak);
    return isWeak;
  };

  const handleSignUp = async (e: any) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      alert('Please fill in all fields!');
      return;
    }
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address!');
      return;
    }
    if (phone.length < 8) {
      alert('Please enter a valid phone number!');
      return;
    }
    if (checkPasswordStrength()) {
      alert('Password is weak. Please use at least 8 characters, including an uppercase letter, a number, and a special character.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      type CheckUserResponse = {
        exists: boolean;
      };
      type SignUpResponse = {
        msg: string;
      };      
      const checkUserResponse = await axios.post<CheckUserResponse>(
        `http://${ip}:8000/api/users/check`,
        {
          email,
          phone,
        }
      );
  
      if (checkUserResponse.data.exists) {
        alert('User already exists with this email or phone number.');
        return;
      }
      const response = await axios.post<{ msg: string; token: string }>(
        `http://${ip}:8000/api/users/signup`,
        {
          name,
          email,
          phone,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Store the token in AsyncStorage
      const { token } = response.data;
      await AsyncStorage.setItem('userToken', token);
      

      setMessage(response.data.msg);
      alert(`Sign-up successful for ${name}!`);
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || "Something went wrong.";
      setMessage(String(errorMsg));
      console.error("Sign-up error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name ? `Hello, ${name}!` : 'Sign Up'}</Text>
      {message && <Text style={styles.message}>{message}</Text>} 

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
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
          placeholder="Phone Number"
          placeholderTextColor="#888"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Text style={styles.toggleText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
            <Text style={styles.toggleText}>{confirmPasswordVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 10,
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
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
    color: 'red',
  }
});