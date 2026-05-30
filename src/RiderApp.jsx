import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const RiderApp = () => {
  const [orderId, setOrderId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const handleStartDelivery = () => {
    if (!orderId) {
      alert("Please enter Order ID to start delivery");
      return;
    }

    if (navigator.geolocation) {
      setIsTracking(true);
      
      // Watch position continuously
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });

          // Emitting to Server
          if (socket) {
            socket.emit("updateLocation", { orderId, lat, lng });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Please enable location services to deliver.");
          setIsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );

      // Save watchId to stop later if needed
      window.riderWatchId = watchId;

    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleStopDelivery = () => {
    if (window.riderWatchId) {
      navigator.geolocation.clearWatch(window.riderWatchId);
    }
    setIsTracking(false);
    setCurrentLocation(null);
    setOrderId("");
  };

  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#e23744' }}>Delivery Partner App</h1>
      
      {!isTracking ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
          <input 
            type="text" 
            placeholder="Enter Customer Order ID" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={handleStartDelivery}
            style={{ padding: '15px', fontSize: '18px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Start Delivery Trip 🛵
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '30px', padding: '20px', background: '#e8f5e9', borderRadius: '10px' }}>
          <h2 style={{ color: '#2e7d32' }}>🔴 Delivering Order!</h2>
          <p>Location is being shared with customer...</p>
          {currentLocation && (
            <p style={{ margin: '15px 0', fontSize: '14px', background: '#fff', padding: '10px', borderRadius: '5px' }}>
              <strong>Latitude:</strong> {currentLocation.lat.toFixed(6)} <br/>
              <strong>Longitude:</strong> {currentLocation.lng.toFixed(6)}
            </p>
          )}
          
          <button 
            onClick={handleStopDelivery}
            style={{ marginTop: '10px', padding: '12px 20px', fontSize: '16px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Mark Delivered & Stop Tracking
          </button>
        </div>
      )}
    </div>
  );
}

export default RiderApp;
