import { useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { useLocation } from '../context/locationContext'; // Correct import path
import * as Location from 'expo-location';

export default function MapScreen() {
  const { location, setLocation } = useLocation(); // Use location from context
  const mapRef = useRef<MapView>(null); // Reference to the MapView

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
      setLocation({ ...coords, name: 'Unknown Location', number: null }); // Set the user's live location in context
    })();
  }, []);

  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };

    try {
      const [address] = await Location.reverseGeocodeAsync(newLocation);
      const locationName = address ? `${address.name}, ${address.city}` : 'Unknown Location';
      setLocation({ ...newLocation, name: locationName, number: null }); // Update location with name and add number property
      console.log('New location:', { ...newLocation, name: locationName });
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocation({ ...newLocation, name: 'Unknown Location', number: null });
    }

    mapRef.current?.animateToRegion({
      ...newLocation,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const resetToDefaultLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to reset location.');
      return;
    }
  
    let currentLocation = await Location.getCurrentPositionAsync({});
    let coords = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };

    try {
      const [address] = await Location.reverseGeocodeAsync(coords);
      const locationName = address ? `${address.name}, ${address.city}` : 'Unknown Location';
      setLocation({ ...coords, name: locationName, number: null }); // Update location with name and add number property
      console.log('Live location:', { ...coords, name: locationName });
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocation({ ...coords, name: 'Unknown Location', number: null });
    }

    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 1.3521, // Default to Singapore initially
          longitude: location?.longitude || 103.8198,
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
