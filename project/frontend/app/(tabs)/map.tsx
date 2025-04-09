import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, MapPressEvent, Callout } from 'react-native-maps';
import { useLocation } from '../context/locationContext';
import * as Location from 'expo-location';
import { policeStationsData } from '../../data/policeStationData';
import { extractPoliceStationInfo, type PoliceStation } from '../../services/policeDataService';

interface ProcessedPoliceStation {
  name: string;
  type: string;
  tel: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function MapScreen() {
  const { location, setLocation } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [policeStations, setPoliceStations] = useState<ProcessedPoliceStation[]>([]);

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
      setLocation({ ...coords, name: 'Unknown Location' });
    })();

    if (policeStationsData && policeStationsData.features) {
      const processedStations = policeStationsData.features.map(station =>
        extractPoliceStationInfo(station as unknown as PoliceStation)
      );
      setPoliceStations(processedStations);
    }
  }, []);

  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };

    try {
      const [address] = await Location.reverseGeocodeAsync(newLocation);
      const locationName = address ? `${address.name}, ${address.city}` : 'Unknown Location';
      setLocation({ ...newLocation, name: locationName });
      console.log('New location:', { ...newLocation, name: locationName });
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocation({ ...newLocation, name: 'Unknown Location' });
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
      setLocation({ ...coords, name: locationName });
      console.log('Live location:', { ...coords, name: locationName });
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocation({ ...coords, name: 'Unknown Location' });
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
          latitude: location?.latitude || 1.3521,
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
            pinColor="red"
          />
        )}

        {policeStations.map((station, index) => (
          <Marker
            key={index}
            coordinate={station.coordinates}
            title={station.name}
            description={`${station.type} | ${station.tel}`}
            pinColor="blue"
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{station.name}</Text>
                <View style={styles.calloutDivider} />
                <Text>
                  <Text style={styles.calloutLabel}>Tel: </Text>
                  <Text>{station.tel}</Text>
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Bottom Controls */}
      <View style={styles.bottomControlsContainer}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>Selected Location</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendMarker, { backgroundColor: 'blue' }]} />
            <Text style={styles.legendText}>Police Station</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaultLocation}>
          <Text style={styles.resetButtonText}>↺</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
  callout: {
    width: 200,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 14,
    color: '#0066CC',
    textAlign: 'center',
  },
  calloutDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },
  calloutRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  calloutLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  calloutValue: {
    flex: 1,
    color: '#333',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    padding: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  legendMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});
