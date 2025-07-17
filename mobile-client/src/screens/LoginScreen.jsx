import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOW } from '../constants';

const LoginScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { login, loginWithOTP, sendOTP, error, clearError } = useAuth();
  
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  
  // Email login state (Firebase token for now)
  const [firebaseToken, setFirebaseToken] = useState('');
  
  // OTP login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailLogin = async () => {
    if (!firebaseToken.trim()) {
      Alert.alert('Error', 'Please enter Firebase token');
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      const credentials = {
        firebase_token: firebaseToken.trim(),
      };
      
      await login(credentials);
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      await sendOTP(phoneNumber.trim());
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone number');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Error', 'Please enter the OTP code');
      return;
    }

    try {
      setLoading(true);
      clearError();
      
      const otpData = {
        phone_number: phoneNumber.trim(),
        otp_code: otpCode.trim(),
      };
      
      await loginWithOTP(otpData);
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const resetOTP = () => {
    setOtpSent(false);
    setOtpCode('');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    headerBar: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: SPACING.md,
      marginBottom: SPACING.lg,
    },
    branding: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    companyIcon: {
      fontSize: 28,
    },
    companyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.5,
    },
    themeBtn: {
      fontSize: 20,
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: 25,
      padding: SPACING.sm,
      color: '#ffe066',
      minWidth: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...TYPOGRAPHY.h1,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    subtitle: {
      ...TYPOGRAPHY.body2,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.xs,
      marginBottom: SPACING.lg,
      ...SHADOW.small,
    },
    tab: {
      flex: 1,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: BORDER_RADIUS.sm,
      alignItems: 'center',
    },
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      ...TYPOGRAPHY.button,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.white,
    },
    form: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      ...SHADOW.medium,
    },
    inputContainer: {
      marginBottom: SPACING.lg,
    },
    label: {
      ...TYPOGRAPHY.body2,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
      fontWeight: '600',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      fontSize: TYPOGRAPHY.body1.fontSize,
      color: colors.textPrimary,
      backgroundColor: colors.background,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.md,
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    buttonDisabled: {
      backgroundColor: colors.textDisabled,
    },
    buttonText: {
      ...TYPOGRAPHY.button,
      color: colors.white,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    secondaryButtonText: {
      color: colors.primary,
    },
    footer: {
      alignItems: 'center',
      marginTop: SPACING.lg,
    },
    footerText: {
      ...TYPOGRAPHY.body2,
      color: colors.textSecondary,
    },
    linkText: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBar}>
          <View style={styles.branding}>
            <Ionicons name="flask" style={styles.companyIcon} color={colors.primary} />
            <Text style={styles.companyTitle}>Blossoms Aroma</Text>
          </View>
          <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
            <Ionicons 
              name={isDark ? 'sunny' : 'moon'} 
              size={20} 
              color={isDark ? '#ffe066' : colors.textPrimary} 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>Chemical Inventory Login</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'email' && styles.activeTab]}
            onPress={() => setActiveTab('email')}
          >
            <View style={styles.tabContent}>
              <Ionicons name="mail" size={16} color={activeTab === 'email' ? colors.white : colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
                Email Login
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'otp' && styles.activeTab]}
            onPress={() => setActiveTab('otp')}
          >
            <View style={styles.tabContent}>
              <Ionicons name="phone-portrait" size={16} color={activeTab === 'otp' ? colors.white : colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'otp' && styles.activeTabText]}>
                OTP Login
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {activeTab === 'email' ? (
            // Firebase Token Login Form
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Firebase Token</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={firebaseToken}
                  onChangeText={setFirebaseToken}
                  placeholder="Paste your Firebase ID token here"
                  placeholderTextColor={colors.textDisabled}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // OTP Login Form
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textDisabled}
                  keyboardType="phone-pad"
                  editable={!otpSent}
                />
              </View>

              {otpSent && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>OTP Code</Text>
                  <TextInput
                    style={styles.input}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={otpSent ? handleOTPLogin : handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading 
                    ? (otpSent ? 'Verifying...' : 'Sending...') 
                    : (otpSent ? 'Verify OTP' : 'Send OTP')
                  }
                </Text>
              </TouchableOpacity>

              {otpSent && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={resetOTP}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    Change Phone Number
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.linkText}>Contact your administrator</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen; 