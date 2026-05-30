import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Rider Bike Icon
const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const TrackingMap = ({ orderId, onBack }) => {
  const [riderLocation, setRiderLocation] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState("Preparing");

  useEffect(() => {
    // Connect to backend Socket.io
    const socket = io("http://localhost:5000");

    // Listen for rider location updates specific to this order
    socket.on(`locationUpdate_${orderId}`, (data) => {
      setRiderLocation({ lat: data.lat, lng: data.lng });
      setDeliveryStatus("On the way");
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  return (
    <div className="tracking-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <button onClick={onBack} style={{ marginBottom: '15px', padding: '10px', background: '#e23744', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', maxWidth: '150px' }}>← Back to Home</button>
      <h2>Track Your Order: {orderId}</h2>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '5px', marginBottom: '15px' }}>
        <strong>Status: </strong> 
        <span style={{ color: deliveryStatus === 'Preparing' ? '#ff9800' : '#4caf50', fontWeight: 'bold' }}>{deliveryStatus}</span>
        {riderLocation && <span style={{display: 'block', marginTop: '5px', fontSize: '13px', color: '#666'}}>Rider is nearby and sharing live location!</span>}
      </div>

      <div style={{ flex: 1, borderRadius: '10px', overflow: 'hidden', border: '2px solid #ddd', minHeight: '400px' }}>
        <MapContainer center={riderLocation || [26.9790, 84.8550]} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {riderLocation && (
            <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
              <Popup>Your order is here!</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default TrackingMap;
