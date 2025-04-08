import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../constants'; 
import { Ionicons } from '@expo/vector-icons';

type Report = {
  crime_type: string;
  location: string;
  police_station: string;
  created_at: string;
};

export default function AlertsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchReports = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) return;
  
          const response = await axios.get<Report[]>(`${BASE_URL}/api/history`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Sort reports by created_at in descending order (newest first)
          const sortedReports = [...response.data].sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          setReports(sortedReports);
          setFilteredReports(sortedReports);
        } catch (error) {
          console.error("Error fetching reports:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchReports();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredReports(reports);
      return;
    }
    
    const lowercaseQuery = text.toLowerCase();
    const filtered = reports.filter(report => 
      (report.crime_type && report.crime_type.toLowerCase().includes(lowercaseQuery)) ||
      (report.location && report.location.toLowerCase().includes(lowercaseQuery)) ||
      (report.police_station && report.police_station.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredReports(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredReports(reports);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>History</Text>
      
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.alertCard}>
              <Text style={styles.alertType}>{item.crime_type}</Text>
              <Text style={styles.alertLocation}>{item.location}</Text>
              <Text style={styles.alertLocation}>{item.police_station}</Text>
              <Text style={styles.alertTime}>{formatDate(item.created_at)}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#E5E5EA" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 
                  ? `No results for "${searchQuery}"`
                  : "No reports found"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 30,
    marginBottom: 16,
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  searchIcon: {
    marginLeft: 6,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 22,
    fontSize: 17,
    color: '#000',
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertType: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
    color: '#000',
  },
  alertLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  alertTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'center',
  },
});
