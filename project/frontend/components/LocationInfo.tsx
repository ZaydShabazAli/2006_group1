import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, ShieldPlus } from 'lucide-react-native';
import { Location } from '../services/crimeReportService';
import { NearestStation } from '../services/crimeReportService';

interface LocationInfoProps {
  location: Location | null;
  nearestStation: NearestStation | null;
  onLocationPress: () => void;
}

const LocationInfo = ({ location, nearestStation, onLocationPress }: LocationInfoProps) => {
  return (
    <>
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={onLocationPress}
      >
        <View style={styles.locationRow}>
          <MapPin size={32} color="#007AFF" style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle}>My Current Location</Text>
            <Text style={styles.locationText}>
              {location ? location.name : 'Fetching location...'}
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
                , {Math.round(nearestStation.travel_time_min)} mins away)
              </Text>
            ) : (
              <Text style={styles.locationText}>Finding nearest station...</Text>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  locationContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
    marginLeft: 4,
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
    paddingHorizontal: 8,
    flexShrink: 1,
  },
});

export default LocationInfo;