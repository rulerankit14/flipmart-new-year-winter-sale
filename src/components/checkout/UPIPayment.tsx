import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QrCode, Check } from 'lucide-react';
import phonePeLogo from '@/assets/phonepe-logo.png';
import phonePeBanner from '@/assets/phonepe-banner.webp';
import gpayLogo from '@/assets/gpay-logo.png';
import paytmLogo from '@/assets/paytm-logo.png';
import scanToPayIcon from '@/assets/scan-to-pay-icon.png';

interface UPIPaymentProps {
  amount: number;
  qrCodeUrl: string;
  onPaymentConfirm: (utrNumber: string, paymentMethod: string) => void;
  disabled?: boolean;
  buttonText?: string;
  upiId?: string;
  merchantName?: string;
}

// UPI deep link configurations
const UPI_APPS = {
  PhonePe: {
    scheme: 'phonepe://pay',
    fallback: 'https://phon.pe/ru_all',
  },
  GPay: {
    scheme: 'tez://upi/pay',
    fallback: 'https://pay.google.com',
  },
  Paytm: {
    scheme: 'paytmmp://pay',
    fallback: 'https://paytm.com',
  },
};

const UPIPayment: React.FC<UPIPaymentProps> = ({ 
  amount, 
  qrCodeUrl, 
  onPaymentConfirm,
  disabled = false,
  buttonText,
  upiId = 'merchant@paytm',
  merchantName = 'Flipkart'
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 6, seconds: 12 });
  const [appOpened, setAppOpened] = useState(false);

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

  const generateUPILink = (appKey: keyof typeof UPI_APPS) => {
    const app = UPI_APPS[appKey];
    const params = new URLSearchParams({
      pa: upiId,
      pn: merchantName,
      am: amount.toString(),
      cu: 'INR',
      tn: `Payment for order`,
    });
    return `${app.scheme}?${params.toString()}`;
  };

  const generateGenericUPILink = () => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: merchantName,
      am: amount.toString(),
      cu: 'INR',
      tn: `Payment for order`,
    });
    return `upi://pay?${params.toString()}`;
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    
    if (method === 'Scan To Pay') {
      setShowQR(true);
      return;
    }

    // Try to open the app
    const appKey = method as keyof typeof UPI_APPS;
    if (UPI_APPS[appKey]) {
      const upiLink = generateUPILink(appKey);
      
      // Create a hidden link and click it to open the app
      const link = document.createElement('a');
      link.href = upiLink;
      link.click();
      
      setAppOpened(true);
      setShowQR(true);
    }
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
          {appOpened && selectedMethod !== 'Scan To Pay' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-green-700 font-medium">
                ✓ {selectedMethod} app opened
              </p>
              <p className="text-sm text-green-600 mt-1">
                Complete the payment in the app, then enter UTR below
              </p>
            </div>
          )}
          
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {appOpened && selectedMethod !== 'Scan To Pay' 
                  ? 'Or scan QR Code to Pay' 
                  : 'Scan QR Code to Pay'}
              </span>
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
              {appOpened && selectedMethod !== 'Scan To Pay'
                ? `Didn't open? Scan this QR code with ${selectedMethod}`
                : `Open ${selectedMethod} and scan this QR code`}
            </p>
            <p className="text-lg font-bold text-primary mt-2">
              Amount: ₹{amount.toLocaleString('en-IN')}
            </p>
            
            {/* Retry open app button */}
            {selectedMethod !== 'Scan To Pay' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => handleMethodSelect(selectedMethod)}
              >
                Open {selectedMethod} again
              </Button>
            )}
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
              setAppOpened(false);
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
        <img 
          src={phonePeBanner} 
          alt="Get 20% Cashback when you pay with PhonePe UPI" 
          className="w-full h-auto"
        />
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
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={phonePeLogo} alt="PhonePe" className="w-12 h-12 object-cover" />
            </div>
            <span className="text-lg font-medium text-gray-800">PhonePe</span>
          </button>

          {/* GPay Option */}
          <button
            onClick={() => handleMethodSelect('GPay')}
            className="w-full flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
            disabled={disabled}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <img src={gpayLogo} alt="Google Pay" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-lg font-medium text-gray-800">Google Pay</span>
          </button>

          {/* Paytm Option */}
          <button
            onClick={() => handleMethodSelect('Paytm')}
            className="w-full flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
            disabled={disabled}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200">
              <img src={paytmLogo} alt="Paytm" className="w-10 h-6 object-contain" />
            </div>
            <span className="text-lg font-medium text-gray-800">Paytm</span>
          </button>

          {/* Scan To Pay Option */}
          {/* Scan To Pay Option */}
          <button
            onClick={() => handleMethodSelect('Scan To Pay')}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            disabled={disabled}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={scanToPayIcon} alt="Scan To Pay" className="w-12 h-12 object-contain" />
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
