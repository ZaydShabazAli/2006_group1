import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location'; // Import expo-location

// Define the context with default values
export const LocationContext = createContext<{
  location: { latitude: number; longitude: number; name: string } | null;
  setLocation: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number; name: string } | null>>;
}>({
  location: null,
  setLocation: () => {},
});

// Create a provider component
export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; name: string } | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error("Permission to access location was denied");
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const [reverseGeocode] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          name: reverseGeocode.city || reverseGeocode.region || reverseGeocode.country || "Unknown Location",
        });
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);