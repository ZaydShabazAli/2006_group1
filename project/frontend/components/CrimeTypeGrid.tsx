import React from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CrimeType } from '../data/crimeTypes';

interface CrimeTypeGridProps {
  crimeTypes: CrimeType[];
  onSelectCrimeType: (crimeType: CrimeType) => void;
}

const CrimeTypeGrid = ({ crimeTypes, onSelectCrimeType }: CrimeTypeGridProps) => {
  return (
    <FlatList
      data={crimeTypes}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.gridContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: item.color }]}
          onPress={() => onSelectCrimeType(item)}
        >
          <Text style={styles.buttonText}>{item.title}</Text>
          {item.icon}
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    padding: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default CrimeTypeGrid;