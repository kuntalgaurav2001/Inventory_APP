import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const API_BASE = 'http://192.168.1.2:8000';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    setError(null);
    // Validation
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone.trim())) {
        setError('Please enter a valid phone number');
        return;
      }
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      // Step 2: Register with backend
      const registerData = {
        uid: userCredential.user.uid,
        email: email,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        phone: phone.trim() || null,
        role: 'all_users',
        password: password
      };
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(registerData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      // Success: Go to main app
      navigation.replace('Main');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.registerContainer}>
        {/* Header/Branding */}
        <View style={styles.headerBar}>
          <View style={styles.branding}>
            <Image source={require('../assets/company_icon.png')} style={styles.companyIcon} />
            <Text style={styles.companyTitle}>Blossoms Aroma</Text>
          </View>
        </View>
        <View style={styles.header}>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Join Blossoms Aroma Chemical Inventory System</Text>
        </View>
        <View style={styles.registerForm}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            editable={!loading}
          />
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name (optional)"
            editable={!loading}
          />
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number (optional, for OTP login)"
            keyboardType="phone-pad"
            editable={!loading}
          />
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            editable={!loading}
          />
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Create Account</Text>}
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.errorMsg}>{error}</Text>}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Already have an account? Login here</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
  },
  registerContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    marginVertical: 40,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginRight: 8,
  },
  companyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 18,
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  registerForm: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#222',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f7f8fa',
    color: '#222',
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorMsg: {
    marginTop: 12,
    color: '#fff',
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
    opacity: 0.95,
  },
  loginLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#4f8cff',
    fontSize: 15,
    fontWeight: '500',
  },
}); 