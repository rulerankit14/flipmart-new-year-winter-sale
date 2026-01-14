import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Truck, ArrowLeft, Check, Shield } from 'lucide-react';
import UPIPayment from '@/components/checkout/UPIPayment';
import paytmQrCode from '@/assets/paytm-qr.png';
import phonePeLogo from '@/assets/phonepe-logo.png';
import gpayLogo from '@/assets/gpay-logo.png';
import paytmLogo from '@/assets/paytm-logo.png';
import upiIcon from '@/assets/upi-icon.svg';
import codIcon from '@/assets/cod-icon.png';

const COD_CHARGE = 59;

type CheckoutStep = 'address' | 'summary' | 'payment';

// Payment logos for rotating banner
const paymentLogos = [
  { id: 'phonepe', logo: phonePeLogo, name: 'PhonePe' },
  { id: 'gpay', logo: gpayLogo, name: 'GPay' },
  { id: 'paytm', logo: paytmLogo, name: 'Paytm' },
];

const PayOnlinePromo = () => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % paymentLogos.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4 border border-blue-200">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-white flex items-center justify-center shadow-sm">
          {paymentLogos.map((item, index) => (
            <img
              key={item.id}
              src={item.logo}
              alt={item.name}
              className={`absolute w-8 h-8 object-contain transition-all duration-500 ease-in-out ${
                index === currentLogoIndex 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-8'
              }`}
            />
          ))}
        </div>
        <p className="text-primary font-semibold text-base">
          Pay online & get EXTRA <span className="text-green-600">₹33 off</span>
        </p>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [showCodModal, setShowCodModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [merchantSettings, setMerchantSettings] = useState({ upiId: 'merchant@paytm', merchantName: 'Flipkart', qrUrl: '' });
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    pincode: '',
    city: '',
    state: 'Andhra Pradesh',
    houseNo: '',
    roadName: '',
  });

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh'
  ];

  // Fetch merchant settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const settings: { [key: string]: string } = {};
        data.forEach((s: any) => {
          settings[s.key] = s.value;
        });
        setMerchantSettings({
          upiId: settings['merchant_upi_id'] || 'merchant@paytm',
          merchantName: settings['merchant_name'] || 'Flipkart',
          qrUrl: settings['merchant_qr_url'] || '',
        });
      }
    };
    fetchSettings();
  }, []);

  // Calculate original price (before discount)
  const originalTotal = items.reduce((sum, item) => sum + (item.product?.original_price || 0) * item.quantity, 0);
  const discount = originalTotal - totalAmount;

  // Redirect to cart if empty (allow guest checkout)
  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phone || !formData.houseNo || !formData.city || !formData.pincode) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return false;
    }
    // Require email for guest users
    if (!user && !formData.email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleAddressContinue = () => {
    if (validateForm()) {
      setCurrentStep('summary');
    }
  };

  const handleSummaryContinue = () => {
    setCurrentStep('payment');
  };

  const placeOrder = async (paymentId: string, paymentStatus: string) => {
    setLoading(true);

    try {
      const shippingAddress = `${formData.fullName}\n${formData.phone}\n${formData.houseNo}, ${formData.roadName}\n${formData.city}, ${formData.state} - ${formData.pincode}`;

      // Create order (for logged-in or guest user)
      const orderData: any = {
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        status: 'confirmed',
        payment_status: paymentStatus,
        payment_id: paymentId,
      };

      if (user) {
        orderData.user_id = user.id;
      } else {
        orderData.guest_email = formData.email;
        orderData.guest_phone = formData.phone;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.product?.selling_price || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();
      
      setOrderId(order.id);
      setOrderPlaced(true);

      toast({
        title: 'Order Placed!',
        description: 'Your order has been placed successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = (utrNumber: string, method: string) => {
    placeOrder(`UPI:${method.toUpperCase()}:${utrNumber}`, 'paid');
  };

  const handleCODClick = () => {
    setShowCodModal(true);
  };

  const handleCODConfirmPayment = (utrNumber: string, method: string) => {
    setShowCodModal(false);
    placeOrder(`COD:FEE_PAID:${method.toUpperCase()}:${utrNumber}`, 'cod_fee_paid');
  };

  const steps = [
    { id: 'address', label: 'Address', number: 1 },
    { id: 'summary', label: 'Order Summary', number: 2 },
    { id: 'payment', label: 'Payment', number: 3 },
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['address', 'summary', 'payment'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-muted">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <CheckCircle className="h-24 w-24 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-2">Thank you for your order</p>
          <p className="text-sm text-muted-foreground mb-8">Order ID: {orderId}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/orders')}>View Orders</Button>
            <Button variant="outline" onClick={() => navigate('/')}>Continue Shopping</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      {/* Header with back button */}
      <header className="bg-primary text-primary-foreground py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => {
              if (currentStep === 'address') navigate('/cart');
              else if (currentStep === 'summary') setCurrentStep('address');
              else setCurrentStep('summary');
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {currentStep === 'address' && 'Add delivery address'}
            {currentStep === 'summary' && 'Order Summary'}
            {currentStep === 'payment' && 'Payments'}
          </h1>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-background border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-0">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                    getStepStatus(step.id) === 'completed' 
                      ? 'bg-primary text-primary-foreground' 
                      : getStepStatus(step.id) === 'current'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  }`}>
                    {getStepStatus(step.id) === 'completed' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`text-sm hidden sm:inline ${
                    getStepStatus(step.id) === 'current' ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    getStepStatus(steps[index + 1].id) !== 'upcoming' 
                      ? 'bg-primary' 
                      : 'bg-muted-foreground/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Step 1: Address */}
        {currentStep === 'address' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name *"
              className="h-14 text-base bg-background"
            />
            {!user && (
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address *"
                className="h-14 text-base bg-background"
              />
            )}
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Mobile number *"
              className="h-14 text-base bg-background"
            />
            <Input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              className="h-14 text-base bg-background"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="h-14 text-base bg-background"
              />
              <select
                name="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-14 text-base bg-background border border-input rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <Input
              name="houseNo"
              value={formData.houseNo}
              onChange={handleChange}
              placeholder="House No., Building Name"
              className="h-14 text-base bg-background"
            />
            <Input
              name="roadName"
              value={formData.roadName}
              onChange={handleChange}
              placeholder="Road name, Area, Colony"
              className="h-14 text-base bg-background"
            />
          </div>
        )}

        {currentStep === 'summary' && (
          <div className="max-w-2xl mx-auto space-y-0">
            {/* Delivery Address */}
            <div className="bg-background p-4 border-b">
              <h3 className="font-bold text-lg mb-1">Delivered to:</h3>
              <p className="text-muted-foreground text-sm">
                {formData.houseNo}, {formData.roadName}, {formData.state}
              </p>
            </div>

            {/* Order Items */}
            <div className="bg-background p-4 border-b">
              {items.map((item) => (
                <div key={item.id} className="pb-4 last:pb-0">
                  <div className="flex gap-4">
                    <img 
                      src={item.product?.image_url || '/placeholder.svg'} 
                      alt={item.product?.name}
                      className="w-20 h-20 object-contain rounded bg-white border"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2 text-base">{item.product?.name}</h4>
                      {/* Assured Badge */}
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 bg-[#2874f0] text-white text-xs px-2 py-0.5 rounded">
                          <span className="font-bold italic">f</span>
                          <span>Assured</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-muted-foreground">Qty: {item.quantity}</span>
                    <span className="text-green-600 font-semibold">
                      {Math.round(((item.product?.original_price || 0) - (item.product?.selling_price || 0)) / (item.product?.original_price || 1) * 100)}%
                    </span>
                    <span className="text-muted-foreground line-through text-sm">
                      ₹{(item.product?.original_price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="font-bold text-lg">
                      ₹{(item.product?.selling_price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Details */}
            <div className="bg-background p-4 border-b">
              <h3 className="font-bold text-lg mb-4">Price Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Price ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span>₹{originalTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">FREE Delivery</span>
                </div>
                <div className="border-t border-dashed pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <p className="text-green-600 font-medium text-sm pt-2">
                  You will save - ₹{discount.toLocaleString('en-IN')} on this order
                </p>
              </div>
            </div>

            {/* Safe and Secure Banner */}
            <div className="bg-gray-100 p-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Safe and secure payments.</span> Easy returns.
                </p>
                <p className="text-sm text-gray-700">100% Authentic products.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 'payment' && (
          <div className="max-w-2xl mx-auto">
            {/* Pay Online Promo Banner */}
            <PayOnlinePromo />
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as 'upi' | 'cod')}
                  className="space-y-3"
                >
                  <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                      <img src={upiIcon} alt="UPI" className="h-10 w-10 object-contain" />
                      <div>
                        <p className="font-medium text-primary">Online Pay</p>
                        <p className="text-sm text-muted-foreground">GPay, PhonePe, Paytm, Other UPI</p>
                      </div>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <img src={codIcon} alt="Cash on Delivery" className="h-10 w-10 object-contain" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Cash on Delivery</p>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">+₹{COD_CHARGE} fee</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Pay ₹{COD_CHARGE} online to confirm COD order</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'upi' && (
                  <UPIPayment
                    amount={totalAmount}
                    qrCodeUrl={merchantSettings.qrUrl || paytmQrCode}
                    onPaymentConfirm={handleUPIPayment}
                    disabled={loading}
                    upiId={merchantSettings.upiId}
                    merchantName={merchantSettings.merchantName}
                  />
                )}

                {paymentMethod === 'cod' && (
                  <Button
                    className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                    onClick={handleCODClick}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${COD_CHARGE} to Confirm COD Order`
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      {/* Sticky Bottom Bar */}
      {(currentStep === 'address' || currentStep === 'summary') && (
        <div className="sticky bottom-0 bg-background border-t p-4">
          <div className="container mx-auto flex items-center justify-between max-w-2xl">
            <div>
              <p className="text-muted-foreground line-through text-sm">₹{originalTotal.toLocaleString('en-IN')}</p>
              <p className="text-xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <Button 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 font-semibold"
              onClick={currentStep === 'address' ? handleAddressContinue : handleSummaryContinue}
            >
              {currentStep === 'address' ? 'Procced' : 'Continue'}
            </Button>
          </div>
        </div>
      )}

      <Footer />

      {/* COD Confirmation Modal */}
      <Dialog open={showCodModal} onOpenChange={setShowCodModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Truck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Cash On Delivery</h2>
          </div>
          <div className="p-6">
            <p className="text-center mb-6">
              <span className="font-semibold">Cash On Delivery</span> is available with a{' '}
              <span className="font-bold text-orange-600">₹{COD_CHARGE} confirmation charge</span>. 
              You must pay this small fee online to confirm your COD order.
            </p>
            <UPIPayment
              amount={COD_CHARGE}
              qrCodeUrl={merchantSettings.qrUrl || paytmQrCode}
              onPaymentConfirm={handleCODConfirmPayment}
              disabled={loading}
              buttonText={`Pay ₹${COD_CHARGE} to Confirm Order`}
              upiId={merchantSettings.upiId}
              merchantName={merchantSettings.merchantName}
            />
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => setShowCodModal(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;