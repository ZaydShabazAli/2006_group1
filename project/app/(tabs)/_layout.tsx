import { Tabs } from 'expo-router';
import { MapPin, Bell, User, FileText } from 'lucide-react-native'; // Added FileText icon for Report

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#ddd',
        },
        tabBarActiveTintColor: '#007AFF',
      }}>
      <Tabs.Screen
        name="index" // Updated to point to the new index.tsx (previously report.tsx)
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />, // Icon for Report tab
        }}
      />
      <Tabs.Screen
        name="map" // Updated to point to the new map.tsx (previously index.tsx)
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}