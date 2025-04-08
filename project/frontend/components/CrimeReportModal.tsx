import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { CrimeType } from '../data/crimeTypes';
import { Location, NearestStation } from '../services/crimeReportService';

interface CrimeReportModalProps {
  visible: boolean;
  selectedCrimeType: CrimeType | null;
  location: Location | null;
  nearestStation: NearestStation | null;
  onClose: () => void;
  onConfirm: () => void;
}

const CrimeReportModal = ({
  visible,
  selectedCrimeType,
  location,
  nearestStation,
  onClose,
  onConfirm
}: CrimeReportModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: selectedCrimeType?.color || '#fff' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
        >
          <View style={styles.backButtonContent}>
            <ChevronLeft size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>

        {selectedCrimeType?.icon && (
          <View style={styles.modalIcon}>
            {React.cloneElement(selectedCrimeType.icon, { size: 250 })}
          </View>
        )}

        <Text style={styles.modalTitle}>{selectedCrimeType?.title}</Text>
        <View style={styles.horizontalLine} /> 
        <View style={styles.reportDetailsGroup}>
          <Text style={styles.reportHeading}>
            {location ? location.name : 'Fetching location...'}
          </Text>
          <Text style={styles.reportSubheading}>{new Date().toLocaleString()}</Text>
          <Text style={styles.reportHeading}>
            {nearestStation ? nearestStation.name : 'Fetching location...'}
          </Text>
          {nearestStation ? (
            <Text style={styles.reportSubheading}>
              {nearestStation.travel_distance_km !== undefined
                ? `${nearestStation.travel_distance_km.toFixed(2)} km`
                : 'Distance unavailable'}
              , ~{Math.round(nearestStation.travel_time_min)} mins away
            </Text>
          ) : (
            <Text style={styles.reportSubheading}>Finding nearest station...</Text>
          )}
        </View>
        <View style={styles.confirmGroup}>
          <Text style={styles.modalText}>Confirm report?</Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 24,
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 12,
    padding: 8,
    borderRadius: 8,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
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
    alignItems: 'center',
  },
  confirmGroup: {
    alignItems: 'center',
    marginTop: 16,
  },
  horizontalLine: {
    height: 1.5,
    backgroundColor: '#ccc',
    marginVertical: 8,
    width: '80%',
  },
  reportDetailsGroup: {
    alignItems: 'center',
    marginTop: 20,
  },
  reportHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  reportSubheading: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default CrimeReportModal;