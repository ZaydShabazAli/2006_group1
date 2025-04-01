import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';

// Create a context for location
const LocationContext = createContext<{
  location: { latitude: number; longitude: number } | null;
  setLocation: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number } | null>>;
}>({ location: null, setLocation: () => {} });

// Custom hook to use the LocationContext
export const useLocation = () => useContext(LocationContext);
 
// Custom hook to get the user's initial live location
export const useUserLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this app.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      let coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation(coords); // Set the user's live location
    })();
  }, []);

  return location; // Only return the initial live location
};

export default function MapScreen() {
  const initialLocation = useUserLocation(); // Get the user's initial live location
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null); // Manage location state locally
  const mapRef = useRef<MapView>(null); // Reference to the MapView

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation); // Set the initial location
    }
  }, [initialLocation]);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };
    setLocation(newLocation); // Update the context location
    console.log('New location:', newLocation); // Log the new location directly
    mapRef.current?.animateToRegion({
      ...newLocation,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }); // Smoothly animate the map to the new location
  };

  const resetToDefaultLocation = () => {
    if (initialLocation) {
      setLocation(initialLocation); // Reset the location to the initial live location
      mapRef.current?.animateToRegion({
        ...initialLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }); // Smoothly animate the map to the initial location
      console.log('Default location:', initialLocation); // Log the initial location directly
    } else {
      Alert.alert('Location not available', 'Unable to reset to your current location.');
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: initialLocation?.latitude || 1.3521, // Default to Singapore initially
            longitude: initialLocation?.longitude || 103.8198,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleMapPress}
        >
          {location && (
            <Marker
              coordinate={location}
              title="Selected Location"
            />
          )}
        </MapView>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaultLocation}>
          <Text style={styles.resetButtonText}>↺</Text>
        </TouchableOpacity>
      </View>
    </LocationContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
