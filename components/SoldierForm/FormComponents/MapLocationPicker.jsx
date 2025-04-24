import React, { useState, useEffect, useRef } from "react";

const MapLocationPicker = ({ value, onChange, error }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  
  // Load the Google Maps script
  useEffect(() => {
    // Check if the script is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }
    
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    googleMapScript.addEventListener('load', () => {
      setMapLoaded(true);
    });
    document.body.appendChild(googleMapScript);
    
    return () => {
      // Clean up if component unmounts before script loads
      document.body.removeChild(googleMapScript);
    };
  }, []);
  
  // Initialize the map once the script is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    // Default to central Israel if no location is set
    const defaultLocation = { lat: 31.7683, lng: 35.2137 };
    let initialLocation = defaultLocation;
    
    // Try to parse existing value
    if (value) {
      try {
        // Format could be either a URL or a lat,lng string
        if (value.includes('@')) {
          // Extract from Google Maps URL format
          const match = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (match) {
            initialLocation = {
              lat: parseFloat(match[1]),
              lng: parseFloat(match[2])
            };
          }
        } else if (value.includes(',')) {
          // Direct lat,lng format
          const [lat, lng] = value.split(',').map(v => parseFloat(v.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            initialLocation = { lat, lng };
          }
        }
      } catch (e) {
        console.error("Error parsing location:", e);
      }
    }
    
    // Create the map
    const map = new window.google.maps.Map(mapRef.current, {
      center: initialLocation,
      zoom: 12,
      mapTypeId: 'hybrid', // Shows satellite with roads
      mapTypeControl: true,
      streetViewControl: true,
    });
    
    setMapInstance(map);
    
    // Create a marker
    const marker = new window.google.maps.Marker({
      position: initialLocation,
      map: map,
      draggable: true,
      title: "מיקום קבר"
    });
    
    markerRef.current = marker;
    
    // Create geocoder for reverse lookups
    const geocoder = new window.google.maps.Geocoder();
    
    // Update on marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      const locationString = `${lat},${lng}`;
      
      // Generate a Google Maps URL for the position
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      
      // Update the form value with the URL
      if (onChange) {
        const changeEvent = {
          target: {
            name: 'tombLocation',
            value: googleMapsUrl
          }
        };
        onChange(changeEvent);
      }
      
      // Look up address info
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setLocationAddress(results[0].formatted_address);
        } else {
          setLocationAddress('');
        }
      });
    });
    
    // Also handle clicks on the map to set the marker
    map.addListener('click', (e) => {
      marker.setPosition(e.latLng);
      
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      
      if (onChange) {
        const changeEvent = {
          target: {
            name: 'tombLocation',
            value: googleMapsUrl
          }
        };
        onChange(changeEvent);
      }
      
      // Look up address info
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setLocationAddress(results[0].formatted_address);
        } else {
          setLocationAddress('');
        }
      });
    });
    
    // Initial reverse geocoding
    geocoder.geocode({ location: initialLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        setLocationAddress(results[0].formatted_address);
      }
    });
    
  }, [mapLoaded, value, onChange]);
  
  return (
    <div className="mb-4">
      <label className="block text-white mb-2" htmlFor="tombLocation">
        מיקום קבר
      </label>
      <div 
        ref={mapRef} 
        style={{ height: '300px', width: '100%' }} 
        className="rounded-lg mb-2"
      ></div>
      
      {locationAddress && (
        <div className="text-sm text-gray-300 mt-1 mb-2">
          כתובת: {locationAddress}
        </div>
      )}
      
      <div className="text-sm text-gray-300 mb-2">
        ניתן לגרור את הסמן או ללחוץ על המפה כדי לבחור מיקום
      </div>
      
      {value && (
        <div className="flex items-center mt-1">
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            פתח במפות גוגל
          </a>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 mt-1 text-sm">{error}</p>
      )}
    </div>
  );
};

export default MapLocationPicker;