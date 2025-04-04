import React, { useRef, useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Trash2 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureCapture: (signatureData: string) => void;
  initialSignature?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onSignatureCapture, 
  initialSignature 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas to be responsive
        const resizeCanvas = () => {
          const parent = canvas.parentElement;
          if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = 200; // Fixed height
            
            // Set styles for signature
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';
            
            // If there's an initial signature, draw it
            if (initialSignature) {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
              };
              img.src = initialSignature;
            }
          }
        };
        
        // Set initial size
        resizeCanvas();
        
        // Update on window resize
        window.addEventListener('resize', resizeCanvas);
        
        setContext(ctx);
        
        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
  }, [initialSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    setIsDrawing(true);
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Get canvas position
    const rect = canvasRef.current!.getBoundingClientRect();
    
    context.beginPath();
    context.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      
      // Prevent scrolling while drawing
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Get canvas position
    const rect = canvasRef.current!.getBoundingClientRect();
    
    context.lineTo(clientX - rect.left, clientY - rect.top);
    context.stroke();
    
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing || !context) return;
    
    context.closePath();
    setIsDrawing(false);
    
    // Capture the signature and pass it to the parent component
    if (canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL('image/png');
      onSignatureCapture(signatureData);
    }
  };

  const clearSignature = () => {
    if (!context || !canvasRef.current) return;
    
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
    onSignatureCapture('');
  };

  return (
    <Card className="p-4">
      <div className="mb-2 flex justify-between items-center">
        <div className="text-sm font-medium">Sign here</div>
        {hasSignature && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSignature}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="border border-gray-300 rounded bg-white">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="mt-2 text-center text-xs text-gray-500">
        {hasSignature 
          ? "Your signature has been captured" 
          : "Sign using your mouse or finger"}
      </div>
    </Card>
  );
};

export { SignaturePad };
