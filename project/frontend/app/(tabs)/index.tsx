import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { MapPin, ShieldPlus, ChevronLeft } from 'lucide-react-native';
import { LocationContext } from '../context/locationContext'; // Ensure the import path is correct
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import TheftIcon from '../../assets/crime_icons/theft';
import OutrageOFModestyIcon from '../../assets/crime_icons/outrage_of_modesty';
import RobberyIcon from '../../assets/crime_icons/robbery';
import OthersIcon from '../../assets/crime_icons/others';
import TheftOfMotorVehicleIcon from '../../assets/crime_icons/theft_of_motor_vehicle';
import HousebreakingIcon from '../../assets/crime_icons/housebreaking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants'; 

type Nav = {
  navigate: (value: string, options?: { screen: string }) => void;
};

export default function ReportScreen() {
  const { location } = useContext(LocationContext); // Access location from context
  const navigation = useNavigation<Nav>(); // Initialize navigation
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedButton, setSelectedButton] = useState<{ title: string; color: string; icon?: JSX.Element } | null>(null);
  const [message, setMessage] = useState<string | object>('');
  const [nearestStation, setNearestStation] = useState<{ name: string; travel_distance_km: number; travel_time_min: number } | null>(null);
  const [topCrimes, setTopCrimes] = useState<string[]>([]);

  useEffect(() => {
    if (location) {
      fetchNearestStation();
    }
  }, [location]);

  const buttons = [
    { id: '1', title: 'Outrage of Modesty', icon: <OutrageOFModestyIcon size={70} color="#fff" />, color: '#F44336' },
    { id: '2', title: 'Snatch Theft', icon: <TheftIcon size={60} color="#fff" />, color: '#4CAF50' },
    { id: '3', title: 'Robbery', icon: <RobberyIcon size={60} color="#fff" />, color: '#2196F3' },
    { id: '4', title: 'Others', icon: <OthersIcon size={60} color="#fff" />, color: '#00BCD4' },
    { id: '5', title: 'Theft of Motor Vehicle', icon: <TheftOfMotorVehicleIcon size={70} color="#fff" />, color: '#AC54B4' },
    { id: '6', title: 'Housebreaking', icon: <HousebreakingIcon size={85} color="#fff" />, color: '#F26B38' },
  ];

  const normalize = (str: string) => str.trim().toLowerCase();

const filteredButtons = topCrimes.length > 0
  ? [
      ...topCrimes.map(crime =>
        buttons.find(btn => normalize(btn.title) === normalize(crime))
      ).filter((btn): btn is { id: string; title: string; icon: JSX.Element; color: string } => Boolean(btn)), // Map top crimes to buttons and filter out undefined
      buttons.find(btn => btn.title === "Others")! // Ensure "Others" is always included and non-null
    ]
  : [
      buttons.find(btn => btn.title === "Outrage of Modesty")!,
      buttons.find(btn => btn.title === "Housebreaking")!,
      buttons.find(btn => btn.title === "Theft of Motor Vehicle")!,
      buttons.find(btn => btn.title === "Others")!
    ];


  const fetchNearestStation = async () => {
    if (!location) return;
  
    try {
      const response = await axios.get(`${BASE_URL}/api/location/nearest`, {
        params: {
          lat: location.latitude,
          lon: location.longitude,
        },
      });
  
      console.log("✅ Nearest station response:", response.data);
  
      const station = response.data.nearest_station;
      setNearestStation(station);
  
      // 👉 Fetch top crimes for the station
      const rankingResponse = await axios.post(`${BASE_URL}/get_top_crimes`, {
        station_name: station.name,
        divcode: station.divcode,  // Ensure your backend sends this in nearest_station!
      });
  
      setTopCrimes(rankingResponse.data.top_crimes);
      console.log("🔥 Top crimes:", rankingResponse.data.top_crimes);
    } catch (error) {
      console.error("❌ Error fetching nearest station or ranking:", error);
    }
  };  

const handleConfirmPress = async () => {
  const validateLocation = async () => {
    if (!location || location.name === "Unknown Location") {
      alert("Location is unknown. Please select your location manually from the map.");
      navigation.navigate('(tabs)', { screen: 'map' });
      throw new Error("Invalid location.");
    }
  };

  await validateLocation();

  const fetchEmail = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error("User not authenticated. Please log in.");
      }
  
  const response = await axios.get<{ email: string }>(
    `http://${ip}:8000/api/users/email`,
    {
      headers: {
                'Authorization': `Bearer ${token}`, // Ensure token is dynamically retrieved
      }
    }
  );
  return response.data.email;
    } catch (error: any) {
      console.error("Error fetching email:", error);
      throw new Error(error.response?.data?.msg || "Failed to fetch email.");
    }
  };

  let userEmail = '';
  try {
    userEmail = await fetchEmail();
  } catch (error: any) {
    setMessage(error.message || "An unknown error occurred.");
    return;
  }
    if (selectedButton && location) {
        try {
            const payload = {
                crime_type: selectedButton.title,
                location: location.name,
                email: userEmail, // Replace with actual user email
                latitude: location.latitude,
                longitude: location.longitude,
                police_station: nearestStation ? nearestStation.name : 'Unknown',
            };
            console.log('Payload being sent:', payload);
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error("User not authenticated. Please log in.");
            }
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
            console.log('Headers being sent:', headers);
            await axios.post(`http://${ip}:8000/api/crime-report`, payload, { headers });
            alert('Crime report submitted successfully!');
        } catch (error) {
            console.log('Error submitting crime report:', error);
            alert('Failed to submit crime report. Please try again.');
        }
    } else {
        alert('Location or selected button data is not available.');
    }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Lodge a Police Report</Text>
        <FlatList
          data={filteredButtons}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContainer}
renderItem={({ item }: { item: { id: string; title: string; icon: JSX.Element; color: string } }) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: item.color }]}
    onPress={() => {
      setSelectedButton({ title: item.title, color: item.color, icon: item.icon });
      setModalVisible(true);
    }}
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
                {nearestStation ? (
                  <Text style={styles.locationText}>
                    {nearestStation.name} (
                    {nearestStation.travel_distance_km !== undefined
                      ? `${nearestStation.travel_distance_km.toFixed(2)} km`
                      : 'Distance unavailable'}
                    , ~{Math.round(nearestStation.travel_time_min)} mins away)
                  </Text>
                ) : (
                  <Text style={styles.locationText}>Finding nearest station...</Text>
                )}
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
            <Text style={styles.reportSubheading}>
            {nearestStation
                ? `${nearestStation.name}` // Use location from context
                : 'Fetching location...'}
            </Text>
          </View>
          <View style={styles.confirmGroup}>
            <Text style={styles.modalText}>Confirm report?</Text>
              <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmPress}
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
