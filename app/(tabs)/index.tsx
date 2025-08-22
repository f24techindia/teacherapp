import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('teacherToken');
            await AsyncStorage.removeItem('teacherId');
            router.replace('/login');
          },
        },
      ]
    );
  };

  const dashboardItems = [
    {
      title: 'Add Class',
      icon: 'add-circle',
      color: '#10b981',
      onPress: () => router.push('/classes/add'),
    },
    {
      title: 'Add Students',
      icon: 'person-add',
      color: '#3b82f6',
      onPress: () => router.push('/students/add'),
    },
    {
      title: 'Manage Students',
      icon: 'people',
      color: '#8b5cf6',
      onPress: () => router.push('/students'),
    },
    {
      title: 'Assignments',
      icon: 'document-text',
      color: '#f59e0b',
      onPress: () => router.push('/assignments'),
    },
    {
      title: 'Manage Fees',
      icon: 'card',
      color: '#ef4444',
      onPress: () => router.push('/fees'),
    },
    {
      title: 'Class Notes',
      icon: 'library',
      color: '#06b6d4',
      onPress: () => router.push('/notes'),
    },
    {
      title: 'Attendance',
      icon: 'checkmark-circle',
      color: '#84cc16',
      onPress: () => router.push('/attendance'),
    },
    {
      title: 'Reports',
      icon: 'bar-chart',
      color: '#f97316',
      onPress: () => router.push('/reports'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back!</Text>
          <Text style={styles.subtitle}>Teacher Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {dashboardItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={32} color="#ffffff" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});