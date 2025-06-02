// src/utils/locationUtils.js - Utilitários simples de localização

export const DEFAULT_LOCATIONS = {
  'sao-paulo': {
    latitude: -23.5505,
    longitude: -46.6333,
    nome: 'São Paulo, SP'
  },
  'rio-de-janeiro': {
    latitude: -22.9068,
    longitude: -43.1729,
    nome: 'Rio de Janeiro, RJ'
  },
  'belo-horizonte': {
    latitude: -19.9191,
    longitude: -43.9386,
    nome: 'Belo Horizonte, MG'
  },
  'brasilia': {
    latitude: -15.7801,
    longitude: -47.9292,
    nome: 'Brasília, DF'
  },
  'salvador': {
    latitude: -12.9714,
    longitude: -38.5014,
    nome: 'Salvador, BA'
  },
  'fortaleza': {
    latitude: -3.7172,
    longitude: -38.5433,
    nome: 'Fortaleza, CE'
  }
};

// Localização padrão (São Paulo)
export const getDefaultLocation = () => {
  return DEFAULT_LOCATIONS['sao-paulo'];
};

// Obter localização do usuário com fallback
export const getUserLocation = (onSuccess, onError) => {
  if (!navigator.geolocation) {
    const defaultLoc = getDefaultLocation();
    onSuccess(defaultLoc.latitude, defaultLoc.longitude, 'fallback');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      onSuccess(
        position.coords.latitude, 
        position.coords.longitude, 
        'gps'
      );
    },
    (error) => {
      console.warn('Erro ao obter GPS, usando localização padrão:', error.message);
      const defaultLoc = getDefaultLocation();
      onSuccess(defaultLoc.latitude, defaultLoc.longitude, 'fallback');
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 300000 // 5 minutos
    }
  );
};

// Calcular distância entre dois pontos (fórmula de Haversine)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distância em km
};

// Formatar coordenadas para exibição
export const formatCoordinates = (latitude, longitude) => {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

// Verificar se coordenadas são válidas
export const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

// Obter cidade mais próxima das coordenadas
export const getNearestCity = (userLat, userLon) => {
  let nearestCity = null;
  let minDistance = Infinity;

  Object.entries(DEFAULT_LOCATIONS).forEach(([key, location]) => {
    const distance = calculateDistance(
      userLat, userLon, 
      location.latitude, location.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = { ...location, key, distance };
    }
  });

  return nearestCity;
};