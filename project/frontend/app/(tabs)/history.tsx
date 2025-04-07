import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Report = {
  crime_type: string;
  location: string;
  created_at: string;
};

const ip = "10.91.169.195";

export default function AlertsScreen() {


  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await axios.get<Report[]>(`http://${ip}:8000/api/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.alertCard}>
              <Text style={styles.alertType}>{item.crime_type}</Text>
              <Text style={styles.alertLocation}>{item.location}</Text>
              <Text style={styles.alertTime}>{item.created_at}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertType: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  alertLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  alertTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
  },
});
