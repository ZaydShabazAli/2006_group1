import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LocationContext } from '../context/locationContext';
import CrimeTypeGrid from '../../components/CrimeTypeGrid';
import LocationInfo from '../../components/LocationInfo';
import CrimeReportModal from '../../components/CrimeReportModal';
import { crimeTypes, getDefaultCrimeTypes, normalizeTitle, CrimeType } from '../../data/crimeTypes';
import { 
  fetchNearestStation, 
  fetchTopCrimes, 
  fetchUserEmail, 
  submitCrimeReport,
  NearestStation,
  Location as LocationType
} from '../../services/crimeReportService';

type Nav = {
  navigate: (value: string, options?: { screen: string }) => void;
};

export default function ReportScreen() {
  const { location } = useContext(LocationContext);
  const navigation = useNavigation<Nav>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCrimeType, setSelectedCrimeType] = useState<CrimeType | null>(null);
  const [nearestStation, setNearestStation] = useState<NearestStation | null>(null);
  const [topCrimes, setTopCrimes] = useState<string[]>([]);
  const [displayedCrimeTypes, setDisplayedCrimeTypes] = useState(getDefaultCrimeTypes());

  useEffect(() => {
    if (location) {
      handleLocationUpdate();
    }
  }, [location]);

  useEffect(() => {
    updateDisplayedCrimeTypes();
  }, [topCrimes]);

  const handleLocationUpdate = async () => {
    if (!location) return;
    
    try {
      const station = await fetchNearestStation(location as LocationType);
      setNearestStation(station);
      
      if (station.divcode) {
        const crimes = await fetchTopCrimes(station.name, station.divcode);
        setTopCrimes(crimes);
      }
    } catch (error) {
      console.error("Error fetching station data:", error);
    }
  };

  const updateDisplayedCrimeTypes = () => {
    if (topCrimes.length === 0) return;
    
    const mappedTopCrimes = topCrimes
      .map(crime => crimeTypes.find(btn => normalizeTitle(btn.title) === normalizeTitle(crime)))
      .filter(Boolean) as CrimeType[];
    
    // Always include "Others" category
    const othersCategory = crimeTypes.find(btn => btn.title === "Others");
    if (othersCategory && !mappedTopCrimes.some(crime => crime.id === othersCategory.id)) {
      mappedTopCrimes.push(othersCategory);
    }
    
    setDisplayedCrimeTypes(mappedTopCrimes.length > 0 ? mappedTopCrimes : getDefaultCrimeTypes());
  };

  const handleCrimeTypeSelect = (crimeType: CrimeType) => {
    setSelectedCrimeType(crimeType);
    setModalVisible(true);
  };

  const handleConfirmPress = async () => {
    if (!location || location.name === "Unknown Location") {
      Alert.alert("Error", "Location is unknown. Please select your location manually from the map.");
      navigation.navigate('(tabs)', { screen: 'map' });
      return;
    }

    if (!selectedCrimeType || !nearestStation) {
      Alert.alert("Error", "Missing required information. Please try again.");
      return;
    }

    try {
      const userEmail = await fetchUserEmail();
      
      await submitCrimeReport({
        crime_type: selectedCrimeType.title,
        location: location.name,
        email: userEmail,
        latitude: location.latitude,
        longitude: location.longitude,
        police_station: nearestStation.name,
      });
      
      Alert.alert("Success", "Crime report submitted successfully!");
      setModalVisible(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", error.message || "Failed to submit crime report. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Lodge a Police Report</Text>
        
        <CrimeTypeGrid 
          crimeTypes={displayedCrimeTypes}
          onSelectCrimeType={handleCrimeTypeSelect}
        />
        
        <LocationInfo
          location={location as LocationType || null}
          nearestStation={nearestStation}
          onLocationPress={() => navigation.navigate('(tabs)', { screen: 'map' })}
        />
        
        <CrimeReportModal
          visible={modalVisible}
          selectedCrimeType={selectedCrimeType}
          location={location as LocationType || null}
          nearestStation={nearestStation}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirmPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
