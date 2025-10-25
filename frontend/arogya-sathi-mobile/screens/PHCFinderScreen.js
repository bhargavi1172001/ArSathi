import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { LanguageContext } from '../context/LanguageContext';

const API_URL = 'http://your-backend-url:5000';

const PHCFinderScreen = () => {
  const { language, translations } = useContext(LanguageContext);
  const [healthCenters, setHealthCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocationAndFetchPHCs();
  }, []);

  const getLocationAndFetchPHCs = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find nearby health centers.'
        );
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      // Fetch nearby PHCs
      const response = await axios.post(`${API_URL}/api/find-nearby-phc`, {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setHealthCenters(response.data.health_centers);
    } catch (error) {
      console.error('Error fetching PHCs:', error);
      Alert.alert('Error', 'Could not fetch nearby health centers.');
    } finally {
      setLoading(false);
    }
  };

  const makePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openMaps = (name) => {
    // Open Google Maps with search query
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
    Linking.openURL(url);
  };

  const renderHealthCenter = ({ item }) => (
    <View style={styles.centerCard}>
      <View style={styles.centerHeader}>
        <Text style={styles.centerName}>{item.name}</Text>
        <Text style={styles.centerDistance}>{item.distance}</Text>
      </View>

      <View style={styles.servicesContainer}>
        {item.services.map((service, index) => (
          <View key={index} style={styles.serviceBadge}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
      </View>

      <View style={styles.centerInfo}>
        <Text style={styles.infoText}>⏰ {item.hours}</Text>
        <Text style={styles.infoText}>📞 {item.phone}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => makePhoneCall(item.phone)}
        >
          <Text style={styles.buttonText}>
            📞 {translations[language].call}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => openMaps(item.name)}
        >
          <Text style={styles.buttonText}>
            🗺️ {translations[language].getDirections}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>
          Finding nearby health centers...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {translations[language].nearbyHealthCenters}
        </Text>
        <Text style={styles.headerSubtitle}>
          Showing {healthCenters.length} facilities near you
        </Text>
      </View>

      <FlatList
        data={healthCenters}
        renderItem={renderHealthCenter}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  centerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  centerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  centerName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  centerDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    color: '#4b5563',
  },
  centerInfo: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PHCFinderScreen;
