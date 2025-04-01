import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { MapPin, ShieldPlus, ChevronLeft } from 'lucide-react-native';
import { LocationContext } from '../context/locationContext'; // Ensure the import path is correct
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import TheftIcon from '../../assets/crime_icons/theft';
import OutrageOFModestyIcon from '../../assets/crime_icons/outrage_of_modesty';
import RobberyIcon from '../../assets/crime_icons/robbery';
import OthersIcon from '../../assets/crime_icons/others';

export default function ReportScreen() {
  const { location } = useContext(LocationContext); // Access location from context
  const navigation = useNavigation(); // Initialize navigation
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedButton, setSelectedButton] = useState<{ title: string; color: string; icon?: JSX.Element } | null>(null);

  const buttons = [
    { id: '1', title: 'Outrage of Modesty', icon: <OutrageOFModestyIcon size={70} color="#fff" />, color: '#F44336' },
    { id: '2', title: 'Snatch Theft', icon: <TheftIcon size={60} color="#fff" />, color: '#4CAF50' },
    { id: '3', title: 'Robbery', icon: <RobberyIcon size={60} color="#fff" />, color: '#2196F3' },
    { id: '4', title: 'Others', icon: <OthersIcon size={60} color="#fff" />, color: '#00BCD4' },
  ];

  const handleButtonPress = (title: string, color: string, icon?: JSX.Element) => {
    setSelectedButton({ title, color, icon });
    setModalVisible(true);
  };

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
              style={[styles.button, { backgroundColor: item.color }]}
              onPress={() => handleButtonPress(item.title, item.color, item.icon)}
            >
              <Text style={styles.buttonText}>{item.title}</Text>
              {item.icon}
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => navigation.navigate('(tabs)', { screen: 'map' })} // Redirect to the map stack
        >
          <View style={styles.locationRow}>
            <MapPin size={32} color="#007AFF" style={styles.icon} />
            <View>
              <Text style={styles.locationTitle}>My Current Location</Text>
              <Text style={styles.locationText}>
                {location
                  ? `${location.name}` // Use location from context
                  : 'Fetching location...'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
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
              {React.cloneElement(selectedButton.icon, { size: 250 })}
            </View>
          )}

          <Text style={styles.modalTitle}>{selectedButton?.title}</Text>
          <View style={styles.horizontalLine} /> 
          <View style={styles.reportDetailsGroup}>
            
            <Text style={styles.reportHeading}>
              {location
                ? `${location.name}` // Use location from context
                : 'Fetching location...'}
            </Text>
            <Text style={styles.reportSubheading}>{new Date().toLocaleString()}</Text>
            <Text style={styles.reportHeading}>Police Station Name for Report Filing</Text>
            <Text style={styles.reportSubheading}>Approx distance away</Text>
          </View>
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
    marginTop: 10,
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
    marginBottom: 12,
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
    alignItems: 'center', // Center the icon horizontally
  },
  confirmGroup: {
    alignItems: 'center', // Center the text and button horizontally
    marginTop: 16, // Add spacing from the elements above
  },
  horizontalLine: {
    height: 1.5,
    backgroundColor: '#ccc', // Changed to a visible gray color
    marginVertical: 8,
    width: '80%',
  },
  reportDetailsGroup: {
    alignItems: 'center',
    marginTop: 20, // Adjusted spacing
  },
  reportHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4, // Added spacing between headings
    textAlign: 'center',
  },
  reportSubheading: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 24, // Added spacing between subheadings
    textAlign: 'center',
  },
});