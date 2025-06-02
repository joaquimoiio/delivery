import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapSelector.css';

// Fix para os ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition, setCoordinates }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPosition = [lat, lng];
      setPosition(newPosition);
      setCoordinates({
        latitude: lat.toFixed(7),
        longitude: lng.toFixed(7)
      });
    },
  });

  return position ? <Marker position={position}></Marker> : null;
};

const MapSelector = ({ isOpen, onClose, onSelectCoordinates, initialCoordinates }) => {
  const [position, setPosition] = useState(
    initialCoordinates ? [initialCoordinates.latitude, initialCoordinates.longitude] : null
  );
  const [coordinates, setCoordinates] = useState(
    initialCoordinates || { latitude: '', longitude: '' }
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPosition = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPosition);
        setCoordinates({
          latitude: parseFloat(lat).toFixed(7),
          longitude: parseFloat(lon).toFixed(7)
        });
      } else {
        alert('Localização não encontrada. Tente outro termo de busca.');
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      alert('Erro ao buscar localização. Tente novamente.');
    }
  };

  const handleConfirm = () => {
    if (coordinates.latitude && coordinates.longitude) {
      onSelectCoordinates(coordinates);
      onClose();
    } else {
      alert('Por favor, selecione uma localização no mapa primeiro.');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="map-selector-overlay">
      <div className="map-selector-modal">
        <div className="map-selector-header">
          <h3>📍 Selecionar Coordenadas</h3>
          <button className="close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="map-selector-search">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite um endereço para buscar..."
              className="search-input"
            />
          </form>
          <p className="search-hint">
            Ou clique no mapa para selecionar uma localização
          </p>
        </div>

        <div className="map-container">
          <MapContainer
            center={position || [-3.1190275, -60.0217314]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker 
              position={position} 
              setPosition={setPosition}
              setCoordinates={setCoordinates}
            />
          </MapContainer>
        </div>

        {coordinates.latitude && coordinates.longitude && (
          <div className="selected-address">
            <strong>Coordenadas Selecionadas:</strong>
            <p>
              <strong>Latitude:</strong> {coordinates.latitude}<br/>
              <strong>Longitude:</strong> {coordinates.longitude}
            </p>
          </div>
        )}

        <div className="map-selector-actions">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancelar
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            Confirmar Coordenadas
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
