import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://192.168.1.10:8000';

export default function LoginScreen({ navigation }) {
  const { loginWithEmail, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);

  // Email/password login
  const handleEmailLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    const result = await loginWithEmail(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    // Navigation will happen automatically based on auth state
  };

  // OTP login (placeholder, as RecaptchaVerifier is not supported in Expo Go)
  const handleSendOtp = async () => {
    setError('OTP login is not supported in Expo Go. Use email login.');
  };
  const handleVerifyOtp = async () => {
    setError('OTP login is not supported in Expo Go. Use email login.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.loginContainer}>
        {/* Header/Branding */}
        <View style={styles.headerBar}>
          <View style={styles.branding}>
            <Image source={require('../assets/company_icon.png')} style={styles.companyIcon} />
            <Text style={styles.companyTitle}>Blossoms Aroma</Text>
          </View>
        </View>
        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.subheading}>Sign in to your Blossoms Aroma Chemical Inventory account</Text>

        {/* Tabs */}
        <View style={styles.loginTabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'email' && styles.activeTab]}
            onPress={() => setActiveTab('email')}
          >
            <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>Email Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'otp' && styles.activeTab]}
            onPress={() => setActiveTab('otp')}
          >
            <Text style={[styles.tabText, activeTab === 'otp' && styles.activeTabText]}>OTP Login</Text>
          </TouchableOpacity>
        </View>

        {/* Email Login */}
        {activeTab === 'email' && (
          <View style={styles.loginForm}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* OTP Login */}
        {activeTab === 'otp' && (
          <View style={styles.loginForm}>
            <Text style={styles.label}>Phone (with country code)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={!otpSent && !loading}
            />
            {otpSent && (
              <>
                <Text style={styles.label}>OTP</Text>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter the OTP sent to your phone"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              </>
            )}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={otpSent ? handleVerifyOtp : handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>{loading ? (otpSent ? 'Verifying...' : 'Sending OTP...') : (otpSent ? 'Verify OTP' : 'Send OTP')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error */}
        {error && <Text style={styles.errorMsg}>{error}</Text>}

        {/* Register link */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
          <Text style={styles.registerLinkText}>Don't have an account? Register</Text>
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
  loginContainer: {
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
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#222',
  },
  subheading: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
    color: '#666',
  },
  loginTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    justifyContent: 'center',
  },
  tab: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4f8cff',
  },
  tabText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
  loginForm: {
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
  loginButton: {
    backgroundColor: '#4f8cff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  loginButtonText: {
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
  registerLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#4f8cff',
    fontSize: 15,
    fontWeight: '500',
  },
}); 