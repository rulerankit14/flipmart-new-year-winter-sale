import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QrCode, Check } from 'lucide-react';

interface UPIPaymentProps {
  amount: number;
  qrCodeUrl: string;
  onPaymentConfirm: (utrNumber: string, paymentMethod: string) => void;
  disabled?: boolean;
  buttonText?: string;
}

const UPIPayment: React.FC<UPIPaymentProps> = ({ 
  amount, 
  qrCodeUrl, 
  onPaymentConfirm,
  disabled = false,
  buttonText
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 6, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          return { minutes: 9, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setShowQR(true);
  };

  const handleConfirmPayment = () => {
    if (utrNumber.trim().length < 6 || !selectedMethod) {
      return;
    }
    onPaymentConfirm(utrNumber, selectedMethod);
  };

  if (showQR && selectedMethod) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="font-medium">Scan QR Code to Pay</span>
            </div>
            
            <div className="bg-white p-4 rounded-lg inline-block mx-auto shadow-sm">
              <img 
                src={qrCodeUrl} 
                alt="Payment QR Code" 
                className="w-48 h-48 object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=QR+Code';
                }}
              />
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Open <strong>{selectedMethod}</strong> and scan this QR code
            </p>
            <p className="text-lg font-bold text-primary mt-2">
              Amount: ₹{amount.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="utr" className="text-sm font-medium">
              Enter UTR/Transaction Number after payment *
            </Label>
            <Input
              id="utr"
              placeholder="Enter 12-digit UTR number"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              You can find UTR number in your payment app's transaction details
            </p>
          </div>

          <Button 
            onClick={handleConfirmPayment} 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={disabled || utrNumber.trim().length < 6}
          >
            <Check className="h-4 w-4 mr-2" />
            I have completed the payment
          </Button>

          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={() => {
              setShowQR(false);
              setSelectedMethod(null);
            }}
          >
            Choose different payment method
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Promotional Banner */}
      <div className="rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#5f259f] to-[#6739b7] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* PhonePe Logo */}
            <div className="bg-white rounded-lg p-2">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <circle cx="12" cy="12" r="12" fill="#5f259f"/>
                <path d="M12 4c-1.1 0-2 .9-2 2v4H8c-.55 0-1 .45-1 1s.45 1 1 1h2v6c0 1.1.9 2 2 2s2-.9 2-2v-6h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V6c0-1.1-.9-2-2-2z" fill="white"/>
              </svg>
            </div>
            <span className="text-white text-lg font-semibold">PhonePe</span>
          </div>
          <div className="text-right">
            <p className="text-white font-bold">GET <span className="text-yellow-300">20%</span> CASHBACK</p>
            <p className="text-white/90 text-sm">when you pay with</p>
            <p className="text-white/90 text-sm">PhonePe UPI</p>
            <p className="text-white/60 text-xs mt-1">* Condition Apply</p>
          </div>
        </div>
      </div>

      {/* Offer Timer */}
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-base">
            <span className="text-gray-700">Offer ends in </span>
            <span className="text-orange-500 font-bold">
              {String(timeLeft.minutes).padStart(2, '0')}min {String(timeLeft.seconds).padStart(2, '0')}sec
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardContent className="p-0">
          {/* PhonePe Option */}
          <button
            onClick={() => handleMethodSelect('PhonePe')}
            className="w-full flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
            disabled={disabled}
          >
            <div className="w-12 h-12 rounded-full bg-[#5f259f] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M12 2c-1.1 0-2 .9-2 2v4H8c-.55 0-1 .45-1 1s.45 1 1 1h2v6c0 1.1.9 2 2 2s2-.9 2-2v-6h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-1.1-.9-2-2-2z" fill="white"/>
              </svg>
            </div>
            <span className="text-lg font-medium text-gray-800">PhonePe</span>
          </button>

          {/* GPay Option */}
          <button
            onClick={() => handleMethodSelect('GPay')}
            className="w-full flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
            disabled={disabled}
          >
            <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 48 48" className="w-8 h-8">
                <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
              </svg>
            </div>
            <span className="text-lg font-medium text-gray-800">Google Pay</span>
          </button>

          {/* Paytm Option */}
          <button
            onClick={() => handleMethodSelect('Paytm')}
            className="w-full flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
            disabled={disabled}
          >
            <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
              <span className="text-[#00BAF2] font-bold text-sm">paytm</span>
            </div>
            <span className="text-lg font-medium text-gray-800">Paytm</span>
          </button>

          {/* Scan To Pay Option */}
          <button
            onClick={() => handleMethodSelect('Scan To Pay')}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            disabled={disabled}
          >
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <span className="text-2xl">📲</span>
            </div>
            <span className="text-lg font-medium text-gray-800">Scan To Pay</span>
          </button>
        </CardContent>
      </Card>

      {/* Price Details */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Price Details</h3>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{amount.toLocaleString('en-IN')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <Button 
        className="w-full bg-[#ffc107] hover:bg-[#e5ac00] text-gray-900 font-semibold py-6 text-lg"
        disabled={disabled || !selectedMethod}
        onClick={() => selectedMethod && handleMethodSelect(selectedMethod)}
      >
        {buttonText || 'Continue'}
      </Button>
    </div>
  );
};

export default UPIPayment;
