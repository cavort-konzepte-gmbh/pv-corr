import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '../../types/theme';
import { MapPin, X } from 'lucide-react';

interface MapSelectorProps {
  currentTheme: Theme;
  initialLat?: string;
  initialLng?: string;
  onSelect: (lat: string, lng: string) => void;
  onClose: () => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({
  currentTheme,
  initialLat,
  initialLng,
  onSelect,
  onClose
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{lat: number, lng: number} | null>(
    initialLat && initialLng 
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : null
  );

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    const initialPosition = selectedPosition || { lat: 51.1657, lng: 10.4515 }; // Germany center
    
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: selectedPosition ? 15 : 6,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: currentTheme.colors.surface }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: currentTheme.colors.text.primary }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: currentTheme.colors.background }]
        }
      ]
    });

    let markerInstance: google.maps.Marker | null = null;
    
    if (selectedPosition) {
      markerInstance = new google.maps.Marker({
        position: selectedPosition,
        map: mapInstance,
        draggable: true
      });

      markerInstance.addListener('dragend', () => {
        const position = markerInstance?.getPosition();
        if (position) {
          setSelectedPosition({
            lat: position.lat(),
            lng: position.lng()
          });
        }
      });
    }

    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      const position = e.latLng;
      if (!position) return;

      const lat = position.lat();
      const lng = position.lng();

      if (markerInstance) {
        markerInstance.setPosition({ lat, lng });
      } else {
        markerInstance = new google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
          draggable: true
        });

        markerInstance.addListener('dragend', () => {
          const newPosition = markerInstance?.getPosition();
          if (newPosition) {
            setSelectedPosition({
              lat: newPosition.lat(),
              lng: newPosition.lng()
            });
          }
        });
      }

      setSelectedPosition({ lat, lng });
      setMarker(markerInstance);
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onSelect(
        selectedPosition.lat.toFixed(6),
        selectedPosition.lng.toFixed(6)
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-6 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col bg-surface">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg flex items-center gap-2 text-primary">
            <MapPin className="text-accent-primary" size={20} />
            Select Location
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-80 text-secondary"
          >
            <X size={20} />
          </button>
        </div>

        <div 
          ref={mapRef} 
          className="w-full h-[500px] rounded mb-4 border-theme border-solid"
        />

        {selectedPosition && (
          <div className="flex items-center justify-between">
            <div className="text-secondary">
              Selected: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"                
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded text-sm text-white bg-accent-primary"                
              >
                Confirm Location
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSelector;