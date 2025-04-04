import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Camera, Trash2, RotateCw } from 'lucide-react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  initialImage?: string;
}

const CameraComponent: React.FC<CameraProps> = ({ onCapture, initialImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialImage || null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }
      
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      const videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
      
      setStream(videoStream);
      setCameraActive(true);
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access the camera. Please ensure you have given permission.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Match canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 image
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    
    // Stop the camera
    stopCamera();
    
    // Set the captured image
    setCapturedImage(imageDataUrl);
    
    // Pass the image data to the parent component
    onCapture(imageDataUrl);
  }, [onCapture, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const toggleCamera = useCallback(() => {
    if (stream) {
      // Stop the current stream
      stopCamera();
    }
    
    // Toggle the facing mode
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  }, [stream, stopCamera]);

  useEffect(() => {
    if (!capturedImage && !cameraActive) {
      startCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera, stream, capturedImage, cameraActive]);

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {capturedImage ? (
          // Show captured image
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-auto"
            />
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setCapturedImage(null);
                  onCapture('');
                  startCamera();
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={retakePhoto}
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Retake
              </Button>
            </div>
          </div>
        ) : (
          // Show camera view or error message
          <>
            {error ? (
              <div className="p-6 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button 
                  type="button" 
                  onClick={startCamera}
                >
                  Retry Camera Access
                </Button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <Button
                    type="button"
                    onClick={captureImage}
                    className="bg-white text-primary border border-primary hover:bg-primary hover:text-white"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Capture
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={toggleCamera}
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    Switch Camera
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Hidden canvas for capturing images */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  );
};

export { CameraComponent };
