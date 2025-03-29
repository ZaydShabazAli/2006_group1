import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, Button } from 'react-native';
import { MapPin, ShieldPlus, Briefcase, Shield, DollarSign, MoreHorizontal, ChevronLeft } from 'lucide-react-native';
import * as Location from 'expo-location'; // Import expo-location

export default function ReportScreen() {
  const [location, setLocation] = useState<string>('Fetching location...'); // State for the location
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [selectedButton, setSelectedButton] = useState<{ title: string; color: string; icon?: JSX.Element } | null>(null); // State for selected button

  const buttons = [
    { id: '1', title: 'Outrage of Modesty', icon: <Shield size={48} color="#fff" />, color: '#F44336' }, //red
    { id: '2', title: 'Snatch Theft', icon: <Briefcase size={48} color="#fff" />, color: '#4CAF50' }, //green
    { id: '3', title: 'Robbery', icon: <DollarSign size={48} color="#fff" />, color: '#2196F3' }, //blue
    { id: '4', title: 'Others', icon: <MoreHorizontal size={48} color="#fff" />, color: '#00BCD4' }, //cyan
  ];

  const handleButtonPress = (title: string, color: string, icon?: JSX.Element) => {
    setSelectedButton({ title, color, icon }); // Set the selected button details
    setModalVisible(true); // Show the modal
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
              style={[styles.button, { backgroundColor: item.color }]} // Apply dynamic background color
              onPress={() => handleButtonPress(item.title, item.color, item.icon)}
            >
              <Text style={styles.buttonText}>{item.title}</Text>
              {item.icon}
            </TouchableOpacity>
          )}
        />
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <MapPin size={32} color="#007AFF" style={styles.icon} />
            <View>
              <Text style={styles.locationTitle}>My Current Location</Text>
              <Text style={styles.locationText}>{location}</Text> 
            </View>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <ShieldPlus size={32} color="#007AFF" style={styles.icon} />
            <View style={{ flex: 1 }}> 
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

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Close modal on back press
      >
        <View style={[styles.modalContainer, { backgroundColor: selectedButton?.color || '#fff' }]}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.backButtonContent}>
              <ChevronLeft size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </TouchableOpacity>

          {selectedButton?.icon && (
            <View style={styles.modalIcon}>
              {React.cloneElement(selectedButton.icon, { size: 96 })}
            </View>
          )}

          <Text style={styles.modalTitle}>{selectedButton?.title}</Text>
          
          {/* Group Confirmation Text and Confirm Button */}
          <View style={styles.confirmGroup}>
            <Text style={styles.modalText}>Confirm report?</Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => alert('Report submitted!')}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    margin: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center both text and icon
    padding: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8, // Add spacing between text and icon
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 24, // Adjust font size for better alignment
    color: '#FFD700',
    marginBottom: 8, // Add small spacing between the text and the button
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 52, // Add more space from the top
    left: 12,
    padding: 8,
    borderRadius: 8,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff', // Change to black for better contrast
    fontSize: 18,
    // fontWeight: 'bold',
  },
  confirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 120,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#AA6C39',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalIcon: {
    marginVertical: 50, // Add spacing around the icon
    alignItems: 'center', // Center the icon horizontally
  },
  confirmGroup: {
    alignItems: 'center', // Center the text and button horizontally
    marginTop: 50, // Add spacing from the elements above
  },
});