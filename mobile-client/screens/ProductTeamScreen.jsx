import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  MaterialIcons,
  FontAwesome5 
} from '@expo/vector-icons';

export default function ProductTeamScreen({ navigation }) {
  const { user, userInfo, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <MaterialIcons name="inventory" size={28} color="#4f8cff" />
            <Text style={styles.title}>Product Team Dashboard</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Welcome, {userInfo?.first_name || user?.email}</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.userInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{userInfo?.first_name} {userInfo?.last_name || ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{userInfo?.email || user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{userInfo?.phone || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User Role</Text>
            <Text style={styles.infoValue}>PRODUCT TEAM</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Verified</Text>
            <Text style={styles.infoValue}>{user.emailVerified ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Backend Status</Text>
            <Text style={[styles.infoValue, { color: '#28a745' }]}>Online</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Status</Text>
            <Text style={[styles.infoValue, { color: '#28a745' }]}>Active</Text>
          </View>
        </View>

        <View style={styles.quickAccessCard}>
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => navigation.navigate('Chemicals')}
          >
            <MaterialCommunityIcons name="flask" size={24} color="#fff" />
            <Text style={styles.quickAccessText}>Chemical Inventory</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAccessButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('ProductInfo')}
          >
            <MaterialIcons name="info" size={24} color="#fff" />
            <Text style={styles.quickAccessText}>Product Information</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAccessButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Reports')}
          >
            <FontAwesome5 name="chart-bar" size={24} color="#fff" />
            <Text style={styles.quickAccessText}>Product Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAccessButton, styles.exportButton]}
            onPress={() => navigation.navigate('ExportData')}
          >
            <Ionicons name="download" size={24} color="#fff" />
            <Text style={styles.quickAccessText}>Export Data</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.permissionsCard}>
          <View style={styles.permissionsHeader}>
            <Ionicons name="shield-checkmark" size={18} color="#6c757d" />
            <Text style={styles.permissionsTitle}>Your Product Team Permissions</Text>
          </View>
          <View style={styles.permissionList}>
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.permissionText}>View chemical inventory</Text>
            </View>
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.permissionText}>View product reports</Text>
            </View>
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.permissionText}>Export data</Text>
            </View>
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.permissionText}>Manage product information</Text>
            </View>
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.permissionText}>View inventory analytics</Text>
            </View>
            <View style={styles.permissionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.permissionText}>Access product specifications</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  userInfoCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  quickAccessCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickAccessButton: {
    backgroundColor: '#4f8cff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  exportButton: {
    backgroundColor: '#ffc107',
  },
  quickAccessText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionsCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 40,
  },
  permissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  permissionList: {
    gap: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
  },
}); 