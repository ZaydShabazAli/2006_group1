import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const dummyAlerts = [
  { id: '1', type: 'Theft', location: 'Orchard Road', time: '2 hours ago' },
  { id: '2', type: 'Vandalism', location: 'Marina Bay', time: '5 hours ago' },
];

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Recent Alerts</Text>
      <FlatList
        data={dummyAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <Text style={styles.alertType}>{item.type}</Text>
            <Text style={styles.alertLocation}>{item.location}</Text>
            <Text style={styles.alertTime}>{item.time}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertType: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  alertLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  alertTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999',
  },
});