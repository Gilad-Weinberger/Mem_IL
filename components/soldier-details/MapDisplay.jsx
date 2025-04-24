import React, { useEffect, useRef, useState } from 'react';

const MapDisplay = ({ locationUrl }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState('');

  // Load the Google Maps script
  useEffect(() => {
    // Check if the script is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }
    
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}`;
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

  // Parse coordinates from URL
  useEffect(() => {
    if (!locationUrl) return;
    
    try {
      // Try to extract coordinates from Google Maps URL or direct coordinates
      let lat, lng;
      
      if (locationUrl.includes('@')) {
        // Extract from Google Maps URL format
        const match = locationUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      } else if (locationUrl.includes('q=')) {
        // Extract from maps?q=lat,lng format
        const match = locationUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      } else if (locationUrl.includes(',')) {
        // Direct lat,lng format
        const [latStr, lngStr] = locationUrl.split(',').map(v => v.trim());
        lat = parseFloat(latStr);
        lng = parseFloat(lngStr);
      }
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates({ lat, lng });
      }
    } catch (e) {
      console.error("Error parsing location URL:", e);
    }
  }, [locationUrl]);

  // Initialize map once script is loaded and we have coordinates
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !coordinates) return;
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: coordinates,
      zoom: 15,
      mapTypeId: 'hybrid', // Shows satellite with roads
      mapTypeControl: true,
      streetViewControl: true,
    });
    
    // Add a marker for the tomb location
    new window.google.maps.Marker({
      position: coordinates,
      map: map,
      title: "מיקום קבר",
      animation: window.google.maps.Animation.DROP
    });
    
    // Get address for the location
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coordinates }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      }
    });
    
  }, [mapLoaded, coordinates]);

  // If no location is provided, show a message
  if (!locationUrl) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-lg font-semibold mb-2">מיקום קבר:</p>
      
      <div 
        ref={mapRef}
        className="w-full h-[300px] rounded-lg overflow-hidden mb-2"
      />
      
      {address && (
        <div className="text-sm text-gray-300 mt-1 mb-2">
          כתובת: {address}
        </div>
      )}
      
      <a 
        href={locationUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mt-2"
      >
        <svg className="w-5 h-5 mr-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        םתח בגוגל מפות
      </a>
    </div>
  );
};

export default MapDisplay;