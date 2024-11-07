import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';


const API_KEY = '671d8580428dc5a338f237c4d4b35861';

export default function WeatherApp() {
  const [location, setLocation] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  const getLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission de localisation refusée');
      setLoading(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      fetchForecast(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      setErrorMsg('Erreur lors de la récupération de la localisation');
      setLoading(false);
    }
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: {
          lat: lat,
          lon: lon,
          appid: API_KEY,
          units: 'metric',
        },
      });
      setCity(response.data.city.name);
      setForecast(response.data.list);
      setLoading(false);
      setCurrentDate(getCurrentDateString());
    } catch (error) {
      setErrorMsg('Erreur lors de la récupération des prévisions météo');
      setLoading(false);
    }
  };

  const getCurrentDateString = () => {
    const currentDate = new Date();
    return `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
  };

  useEffect(() => {
    getLocation();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    return `${formattedDate} - ${date.getHours()}:${date.getMinutes()}`;
  };

  const getCurrentWeather = () => {
    if (forecast.length > 0) {
      const currentWeather = forecast[0];
      return (
        <View style={styles.currentWeather}>
          <Text style={styles.cityText}>{city}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.tempText}>Température: {currentWeather.main.temp}°C</Text>
          <Text style={styles.descriptionText}>{currentWeather.weather[0].description}</Text>
          <Image
            source={{ uri: `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png` }}
            style={styles.icon}
          />
        </View>
      );
    }
    return null;
  };

  const renderForecastItem = ({ item, index }) => {
    if (index > 0 && index % 8 === 0) {
      return (
        <TouchableOpacity style={styles.forecastItem} onPress={() => setShowForecast(!showForecast)}>
          <Text style={styles.time}>{formatTime(item.dt)}</Text>
          <Text style={styles.tempText}>Température: {item.main.temp}°C</Text>
          <Text style={styles.descriptionText}>{item.weather[0].description}</Text>
          <Image
            source={{ uri: `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
            style={styles.icon}
          />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <View style={styles.weatherContainer}>
              {getCurrentWeather()}
              {showForecast && (
                <FlatList
                  data={forecast}
                  renderItem={renderForecastItem}
                  keyExtractor={(item, index) => index.toString()}
                />
              )}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setShowForecast(!showForecast)}>
                  <Text style={styles.buttonText}>{showForecast ? 'Masquer les prévisions' : 'Afficher les prévisions'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={getLocation}>
                  <Text style={styles.buttonText}>Obtenir la météo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 15,
  },
  weatherContainer: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    maxHeight: 600, 
    paddingVertical: 20,
    paddingHorizontal: 15,
    flex: 1, 
    overflow: 'scroll', 
  },
  cityText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  forecastItem: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  time: {
    fontWeight: '500',
    fontSize: 16,
    color: '#1C1C1E',
  },
  tempText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  descriptionText: {
    fontSize: 14,
    color: '#636366',
    marginBottom: 10,
  },
  icon: {
    width: 50,
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'column', 
    justifyContent: 'flex-end',
    alignItems: 'center', 
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20, 
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10, 
    width: '100%',
    maxWidth: 250, 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
