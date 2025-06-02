import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import './MapSelector.css';

// Fix para os ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeocoderControl = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    // Configuração melhorada do geocoder para buscar endereços completos
    const geocoder = L.Control.Geocoder.nominatim({
      serviceUrl: 'https://nominatim.openstreetmap.org/',
      geocodingQueryParams: {
        format: 'json',
        addressdetails: 1,
        limit: 10,
        extratags: 1,
        namedetails: 1,
        countrycodes: 'br', // Foca no Brasil
        'accept-language': 'pt-BR,pt,en'
      }
    });

    const control = L.Control.geocoder({
      query: '',
      placeholder: 'Digite o endereço completo (ex: Rua das Flores, 123, São Paulo, SP)',
      defaultMarkGeocode: false,
      geocoder,
      collapsed: false,
      position: 'topleft',
      errorMessage: 'Endereço não encontrado. Tente ser mais específico.',
      iconLabel: 'Buscar endereço'
    }).on('markgeocode', function (e) {
      const { center, name, properties } = e.geocode;

      // Monta um endereço mais completo usando as propriedades retornadas
      let fullAddress = name;
      if (properties && properties.address) {
        const addr = properties.address;
        const parts = [];

        if (addr.road) parts.push(addr.road);
        if (addr.house_number) parts.push(addr.house_number);
        if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        if (addr.state) parts.push(addr.state);
        if (addr.postcode) parts.push(`CEP: ${addr.postcode}`);

        if (parts.length > 0) {
          fullAddress = parts.join(', ');
        }
      }

      onLocationSelect({
        latitude: center.lat.toFixed(7),
        longitude: center.lng.toFixed(7),
        address: fullAddress,
        properties: properties
      });
      map.setView(center, 18); // Zoom maior para endereços específicos
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, onLocationSelect]);

  return null;
};

const LocationMarker = ({ position, setPosition, setCoordinates, setAddress }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPosition = [lat, lng];
      setPosition(newPosition);

      const coordinates = {
        latitude: lat.toFixed(7),
        longitude: lng.toFixed(7)
      };
      setCoordinates(coordinates);

      // Geocodificação reversa melhorada para obter endereço completo
      const geocoder = L.Control.Geocoder.nominatim({
        serviceUrl: 'https://nominatim.openstreetmap.org/',
        geocodingQueryParams: {
          format: 'json',
          addressdetails: 1,
          zoom: 18,
          extratags: 1,
          namedetails: 1,
          'accept-language': 'pt-BR,pt,en'
        }
      });

      geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), (results) => {
        if (results.length > 0) {
          const result = results[0];
          let fullAddress = result.name;

          // Monta endereço completo se houver dados estruturados
          if (result.properties && result.properties.address) {
            const addr = result.properties.address;
            const parts = [];

            if (addr.road) parts.push(addr.road);
            if (addr.house_number) parts.push(addr.house_number);
            if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
            if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
            if (addr.state) parts.push(addr.state);

            if (parts.length > 0) {
              fullAddress = parts.join(', ');
            }
          }

          setAddress(fullAddress);
        } else {
          setAddress(`Localização: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      });
    },
  });

  return position ? <Marker position={position}></Marker> : null;
};

const MapSelector = ({ isOpen, onClose, onSelectCoordinates }) => {
  const [position, setPosition] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' });
  const [address, setAddress] = useState('');

  const defaultCenter = [-23.5505, -46.6333]; // São Paulo

  const handleLocationSelect = (locationData) => {
    const newPosition = [parseFloat(locationData.latitude), parseFloat(locationData.longitude)];
    setPosition(newPosition);
    setCoordinates({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });
    setAddress(locationData.address);
  };

  const handleConfirm = () => {
    if (!coordinates.latitude || !coordinates.longitude) {
      alert('Selecione uma localização no mapa');
      return;
    }

    onSelectCoordinates({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      address: address
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="map-selector-overlay">
      <div className="map-selector-modal">
        <div className="map-selector-header">
          <h3>Selecionar Localização</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="map-selector-content">
          <p className="map-instructions">
            <strong>Como usar:</strong> Use a barra de pesquisa no mapa para encontrar um endereço específico
            ou clique diretamente no mapa para selecionar uma localização.
            Para endereços completos, digite: "Rua Augusta, 123, São Paulo, SP"
          </p>

          <div className="map-container">
            <MapContainer
              center={position || defaultCenter}
              zoom={13}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeocoderControl onLocationSelect={handleLocationSelect} />
              <LocationMarker
                position={position}
                setPosition={setPosition}
                setCoordinates={setCoordinates}
                setAddress={setAddress}
              />
            </MapContainer>
          </div>

          {coordinates.latitude && coordinates.longitude && (
            <div className="selected-location">
              <h4>Localização Selecionada:</h4>
              <p><strong>Endereço:</strong> {address}</p>
              <p><strong>Latitude:</strong> {coordinates.latitude}</p>
              <p><strong>Longitude:</strong> {coordinates.longitude}</p>
            </div>
          )}

          <div className="map-selector-actions">
            <button className="btn btn-primary" onClick={handleConfirm}>
              Confirmar Localização
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
