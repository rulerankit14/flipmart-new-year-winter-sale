import React, { useState } from 'react';
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
import { Loader2, CheckCircle, CreditCard, Banknote, Truck } from 'lucide-react';
import UPIPayment from '@/components/checkout/UPIPayment';
import paytmQrCode from '@/assets/paytm-qr.png';

const COD_CHARGE = 59;

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
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  if (!user) {
    navigate('/login');
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
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const placeOrder = async (paymentId: string, paymentStatus: string) => {
    setLoading(true);

    try {
      const shippingAddress = `${formData.fullName}\n${formData.phone}\n${formData.address}\n${formData.city} - ${formData.pincode}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          status: 'confirmed',
          payment_status: paymentStatus,
          payment_id: paymentId,
        })
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
    if (!validateForm()) return;
    placeOrder(`UPI:${method.toUpperCase()}:${utrNumber}`, 'paid');
  };

  const handleCODClick = () => {
    if (!validateForm()) return;
    setShowCodModal(true);
  };

  const handleCODConfirmPayment = (utrNumber: string, method: string) => {
    setShowCodModal(false);
    placeOrder(`COD:FEE_PAID:${method.toUpperCase()}:${utrNumber}`, 'cod_fee_paid');
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
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your full address"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Enter your pincode"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
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
                  <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">UPI Payment</p>
                        <p className="text-sm text-muted-foreground">GPay, PhonePe, Paytm, Other UPI</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-green-600" />
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
                    qrCodeUrl={paytmQrCode}
                    onPaymentConfirm={handleUPIPayment}
                    disabled={loading}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 uppercase text-muted-foreground">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span>₹{((item.product?.selling_price || 0) * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Delivery</span>
                      <span>FREE</span>
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

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

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
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
              qrCodeUrl={paytmQrCode}
              onPaymentConfirm={handleCODConfirmPayment}
              disabled={loading}
              buttonText={`Pay ₹${COD_CHARGE} to Confirm Order`}
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
