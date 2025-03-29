import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // State for the phone number input
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); // Added state to store success or error messages
  const [isWeakPassword, setIsWeakPassword] = useState(false);

  // Function to validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  // Function to check password strength
  const checkPasswordStrength = () => {
    let isWeak = false;

    // Ensure password exists and perform strength checks
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
      const response = await axios.post("http://192.168.0.101:3001/api/users/signup", {
        name,
        email,
        phone,
        password,
      },{
        headers: {
          'Content-Type': 'application/json',  // <-- Ensure correct header
        },
      });

      // Success message after successful sign-up
      setMessage(response.data.msg); // Displaying success message from API
      alert(`Sign-up successful for ${name}!`);
      router.replace('/(tabs)'); // Redirect to login after sign-up
    } catch (error: any) {
      setMessage("Error: " + error.response?.data?.msg || "Something went wrong.");
      console.error("Sign-up error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name ? `Hello, ${name}!` : 'Sign Up'}</Text>
      {message && <Text style={styles.message}>{message}</Text>} {/* Display message here */}

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
          keyboardType="phone-pad" // Use phone-pad keyboard for numeric input
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
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
    color: 'red', // Color for error message, change to green for success
  }
});
