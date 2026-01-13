import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Smartphone, QrCode, Check } from 'lucide-react';

interface UPIPaymentProps {
  amount: number;
  qrCodeUrl: string;
  onPaymentConfirm: (utrNumber: string, paymentMethod: string) => void;
  disabled?: boolean;
  buttonText?: string;
}

const paymentMethods = [
  { id: 'gpay', name: 'Google Pay', icon: '🟢', color: 'bg-green-50 border-green-200' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', color: 'bg-purple-50 border-purple-200' },
  { id: 'paytm', name: 'Paytm', icon: '🔵', color: 'bg-blue-50 border-blue-200' },
  { id: 'upi', name: 'Other UPI', icon: '📱', color: 'bg-gray-50 border-gray-200' },
];

const UPIPayment: React.FC<UPIPaymentProps> = ({ 
  amount, 
  qrCodeUrl, 
  onPaymentConfirm,
  disabled = false,
  buttonText
}) => {
  const [selectedMethod, setSelectedMethod] = useState('gpay');
  const [utrNumber, setUtrNumber] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleProceed = () => {
    setShowQR(true);
  };

  const handleConfirmPayment = () => {
    if (utrNumber.trim().length < 6) {
      return;
    }
    onPaymentConfirm(utrNumber, selectedMethod);
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Smartphone className="h-5 w-5 text-primary" />
          <span>Pay via UPI</span>
        </div>

        <RadioGroup 
          value={selectedMethod} 
          onValueChange={setSelectedMethod}
          className="grid grid-cols-2 gap-3"
        >
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={method.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                  peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                  hover:bg-muted ${method.color}`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className="font-medium">{method.name}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {!showQR ? (
          <Button 
            onClick={handleProceed} 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={disabled}
          >
            {buttonText || `Proceed to Pay ₹${amount.toLocaleString('en-IN')}`}
          </Button>
        ) : (
          <div className="space-y-4">
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
                Open <strong>{paymentMethods.find(m => m.id === selectedMethod)?.name}</strong> and scan this QR code
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
              onClick={() => setShowQR(false)}
            >
              Choose different payment method
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UPIPayment;
