import React, { useState, useEffect } from 'react';

// This component displays the current OTP during development 
// It reads the value from localStorage
const OtpViewer = () => {
  const [otp, setOtp] = useState<string>("");
  const [showOtp, setShowOtp] = useState<boolean>(false);
  
  useEffect(() => {
    const checkOtp = () => {
      const storedOtp = localStorage.getItem('tempOTP');
      if (storedOtp) {
        setOtp(storedOtp);
      } else {
        setOtp("");
      }
    };
    
    // Check immediately
    checkOtp();
    
    // Check every 2 seconds for new OTPs
    const intervalId = setInterval(checkOtp, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (!otp) {
    return null;
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '10px',
        background: 'black',
        color: 'lime',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 9999,
        cursor: 'pointer',
        opacity: showOtp ? 1 : 0.6
      }}
      onClick={() => setShowOtp(!showOtp)}
    >
      {showOtp ? (
        <>
          <div>Current OTP: <strong>{otp}</strong></div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>
            (Click to hide)
          </div>
        </>
      ) : (
        <div>Click to show OTP</div>
      )}
    </div>
  );
};

export default OtpViewer;