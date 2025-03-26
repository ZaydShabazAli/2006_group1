import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { MapPin, ShieldPlus } from 'lucide-react-native';
import * as Location from 'expo-location'; // Import expo-location

export default function ReportScreen() {
  const [location, setLocation] = useState<string>('Fetching location...'); // State for the location
  const buttons = [
    { id: '1', title: 'Outrage of Modesty' },
    { id: '2', title: 'Theft' },
    { id: '3', title: 'Robbery' },
    { id: '4', title: 'Others' },
  ];

  const handleButtonPress = (title: string) => {
    alert(`You selected: ${title}`);
  };

  useEffect(() => {
    const fetchLocation = async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Permission to access location was denied.');
        return;
      }

      // Get the current position
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // Optionally, reverse geocode to get a human-readable address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        setLocation(`${address.name}, ${address.city}, ${address.country}`);
      } else {
        setLocation(`Lat: ${latitude}, Lon: ${longitude}`);
      }
    };

    fetchLocation();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Lodge a Police Report</Text>
        <FlatList
          data={buttons}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleButtonPress(item.title)}
            >
              <Text style={styles.buttonText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <MapPin size={32} color="#007AFF" style={styles.icon} />
            <View>
              <Text style={styles.locationTitle}>My Current Location</Text>
              <Text style={styles.locationText}>{location}</Text> {/* Display the real-time location */}
            </View>
          </View>
        </View>
        <View style={styles.locationContainer}>
  <View style={styles.locationRow}>
    <ShieldPlus size={32} color="#007AFF" style={styles.icon} />
    <View style={{ flex: 1 }}> {/* Ensure the container restricts the width */}
      <Text style={styles.locationTitle}>Nearest Police Station:</Text>
      <Text
        style={styles.locationText}
        numberOfLines={1} // Limit the text to one line
        ellipsizeMode="tail" // Add "..." at the end if the text overflows
      >
        123 Main Street, Singapore
      </Text>
    </View>
  </View>
</View>
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
  gridContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 160,
    height: 160,
    backgroundColor: '#007AFF',
    margin: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#555',
    paddingHorizontal: 8, // Add horizontal padding to prevent overflow
    flexShrink: 1, // Allow the text to shrink if it overflows
  },
});