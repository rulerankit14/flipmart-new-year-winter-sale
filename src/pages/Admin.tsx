import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Package, ShoppingCart, Users, X, CreditCard, Save, Upload, QrCode, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableProductRowProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

const SortableProductRow = ({ product, onEdit, onDelete }: SortableProductRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'hsl(var(--muted))' : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    >
      <td className="p-4 align-middle">
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </td>
      <td className="p-4 align-middle">{product.name}</td>
      <td className="p-4 align-middle">₹{product.original_price}</td>
      <td className="p-4 align-middle">₹{product.selling_price}</td>
      <td className="p-4 align-middle">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
};

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({ name: '', description: '', original_price: '', selling_price: '', image_urls: [''], category_id: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', image_url: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', original_price: '', selling_price: '', image_urls: [''], category_id: '' });
  const [upiSettings, setUpiSettings] = useState({ merchant_upi_id: '', merchant_name: '', merchant_qr_url: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      return;
    }
    if (isAdmin) fetchData();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    const [productsRes, categoriesRes, ordersRes, settingsRes] = await Promise.all([
      supabase.from('products').select('*').order('display_order', { ascending: true }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('settings').select('*'),
    ]);
    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (settingsRes.data) {
      const settings: { [key: string]: string } = {};
      settingsRes.data.forEach((s: any) => {
        settings[s.key] = s.value;
      });
      setUpiSettings({
        merchant_upi_id: settings['merchant_upi_id'] || '',
        merchant_name: settings['merchant_name'] || '',
        merchant_qr_url: settings['merchant_qr_url'] || '',
      });
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Update or insert UPI ID
      await supabase
        .from('settings')
        .upsert({ key: 'merchant_upi_id', value: upiSettings.merchant_upi_id }, { onConflict: 'key' });
      
      // Update or insert merchant name
      await supabase
        .from('settings')
        .upsert({ key: 'merchant_name', value: upiSettings.merchant_name }, { onConflict: 'key' });

      // Update or insert QR URL
      await supabase
        .from('settings')
        .upsert({ key: 'merchant_qr_url', value: upiSettings.merchant_qr_url }, { onConflict: 'key' });
      
      toast({ title: 'Settings saved successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `payment-qr.${fileExt}`;
      const filePath = fileName;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('payment-qr')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-qr')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setUpiSettings({ ...upiSettings, merchant_qr_url: publicUrl });

      toast({ title: 'QR code uploaded successfully!' });
    } catch (error: any) {
      toast({ title: 'Error uploading QR code', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingQr(false);
    }
  };

  const handleAddProduct = async () => {
    const validImageUrls = productForm.image_urls.filter(url => url.trim() !== '');
    // Get the max display_order and add 1 for new product
    const maxOrder = products.length > 0 ? Math.max(...products.map(p => p.display_order || 0)) : -1;
    const { data: productData, error } = await supabase.from('products').insert({
      name: productForm.name,
      description: productForm.description,
      original_price: parseFloat(productForm.original_price),
      selling_price: parseFloat(productForm.selling_price),
      image_url: validImageUrls[0] || null,
      category_id: productForm.category_id || null,
      display_order: maxOrder + 1,
    }).select().single();
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    
    // Add additional images to product_images table
    if (validImageUrls.length > 0 && productData) {
      const imageInserts = validImageUrls.map((url, index) => ({
        product_id: productData.id,
        image_url: url,
        display_order: index
      }));
      await supabase.from('product_images').insert(imageInserts);
    }
    
    toast({ title: 'Product added!' }); 
    setProductForm({ name: '', description: '', original_price: '', selling_price: '', image_urls: [''], category_id: '' });
    setDialogOpen(false); 
    fetchData();
  };

  const addImageField = () => {
    setProductForm({ ...productForm, image_urls: [...productForm.image_urls, ''] });
  };

  const removeImageField = (index: number) => {
    const newUrls = productForm.image_urls.filter((_, i) => i !== index);
    setProductForm({ ...productForm, image_urls: newUrls.length > 0 ? newUrls : [''] });
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...productForm.image_urls];
    newUrls[index] = value;
    setProductForm({ ...productForm, image_urls: newUrls });
  };

  const handleAddCategory = async () => {
    const { error } = await supabase.from('categories').insert({ name: categoryForm.name, slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'), image_url: categoryForm.image_url || null });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Category added!' }); setCategoryForm({ name: '', slug: '', image_url: '' }); fetchData(); }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting product', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product deleted successfully!' });
      fetchData();
    }
  };

  const handleEditProduct = async (product: any) => {
    setEditingProduct(product);
    // Fetch product images
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('display_order', { ascending: true });
    
    const imageUrls = images && images.length > 0 
      ? images.map((img: any) => img.image_url) 
      : [product.image_url || ''];
    
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      original_price: product.original_price?.toString() || '',
      selling_price: product.selling_price?.toString() || '',
      image_urls: imageUrls,
      category_id: product.category_id || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    const validImageUrls = editForm.image_urls.filter(url => url.trim() !== '');
    
    const { error } = await supabase
      .from('products')
      .update({
        name: editForm.name,
        description: editForm.description,
        original_price: parseFloat(editForm.original_price),
        selling_price: parseFloat(editForm.selling_price),
        image_url: validImageUrls[0] || null,
        category_id: editForm.category_id || null,
      })
      .eq('id', editingProduct.id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    
    // Delete existing images and re-insert
    await supabase.from('product_images').delete().eq('product_id', editingProduct.id);
    
    if (validImageUrls.length > 0) {
      const imageInserts = validImageUrls.map((url, index) => ({
        product_id: editingProduct.id,
        image_url: url,
        display_order: index
      }));
      await supabase.from('product_images').insert(imageInserts);
    }
    
    toast({ title: 'Product updated!' });
    setEditDialogOpen(false);
    setEditingProduct(null);
    fetchData();
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      setProducts(newProducts);

      // Update display_order for all affected products
      try {
        const updates = newProducts.map((product, index) => 
          supabase.from('products').update({ display_order: index }).eq('id', product.id)
        );
        await Promise.all(updates);
        toast({ title: 'Product order updated!' });
      } catch (error: any) {
        toast({ title: 'Error updating order', description: error.message, variant: 'destructive' });
        fetchData(); // Revert on error
      }
    }
  };

  const addEditImageField = () => {
    setEditForm({ ...editForm, image_urls: [...editForm.image_urls, ''] });
  };

  const removeEditImageField = (index: number) => {
    const newUrls = editForm.image_urls.filter((_, i) => i !== index);
    setEditForm({ ...editForm, image_urls: newUrls.length > 0 ? newUrls : [''] });
  };

  const updateEditImageUrl = (index: number, value: string) => {
    const newUrls = [...editForm.image_urls];
    newUrls[index] = value;
    setEditForm({ ...editForm, image_urls: newUrls });
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <Button variant="ghost" onClick={() => navigate('/')}>Back to Store</Button>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="p-6 flex items-center gap-4"><Package className="h-10 w-10 text-primary" /><div><p className="text-2xl font-bold">{products.length}</p><p className="text-muted-foreground">Products</p></div></CardContent></Card>
          <Card><CardContent className="p-6 flex items-center gap-4"><ShoppingCart className="h-10 w-10 text-primary" /><div><p className="text-2xl font-bold">{orders.length}</p><p className="text-muted-foreground">Orders</p></div></CardContent></Card>
          <Card><CardContent className="p-6 flex items-center gap-4"><Users className="h-10 w-10 text-primary" /><div><p className="text-2xl font-bold">{categories.length}</p><p className="text-muted-foreground">Categories</p></div></CardContent></Card>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Product</Button></DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Name</Label><Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
                      <div><Label>Original Price (₹)</Label><Input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} /></div>
                      <div><Label>Selling Price (₹)</Label><Input type="number" value={productForm.selling_price} onChange={e => setProductForm({...productForm, selling_price: e.target.value})} /></div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Product Images</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                            <Plus className="h-4 w-4 mr-1" />Add Image
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {productForm.image_urls.map((url, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <Input 
                                placeholder={`Image URL ${index + 1}`}
                                value={url} 
                                onChange={e => updateImageUrl(index, e.target.value)} 
                              />
                              {productForm.image_urls.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeImageField(index)}>
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">First image will be the main product image</p>
                      </div>
                      <div><Label>Description</Label><Textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /></div>
                      <Button onClick={handleAddProduct} className="w-full">Add Product</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Original</TableHead>
                        <TableHead>Selling</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        {products.map((p) => (
                          <SortableProductRow
                            key={p.id}
                            product={p}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                          />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
              </CardContent>
            </Card>

            {/* Edit Product Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Name</Label><Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                  <div><Label>Original Price (₹)</Label><Input type="number" value={editForm.original_price} onChange={e => setEditForm({...editForm, original_price: e.target.value})} /></div>
                  <div><Label>Selling Price (₹)</Label><Input type="number" value={editForm.selling_price} onChange={e => setEditForm({...editForm, selling_price: e.target.value})} /></div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Product Images</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addEditImageField}>
                        <Plus className="h-4 w-4 mr-1" />Add Image
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {editForm.image_urls.map((url, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input 
                            placeholder={`Image URL ${index + 1}`}
                            value={url} 
                            onChange={e => updateEditImageUrl(index, e.target.value)} 
                          />
                          {editForm.image_urls.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeEditImageField(index)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">First image will be the main product image</p>
                  </div>
                  <div><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /></div>
                  <Button onClick={handleUpdateProduct} className="w-full">Update Product</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-4">
            <Card><CardHeader><CardTitle>Add Category</CardTitle></CardHeader><CardContent className="flex gap-4">
              <Input placeholder="Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
              <Input placeholder="Slug" value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} />
              <Button onClick={handleAddCategory}>Add</Button>
            </CardContent></Card>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-4">
            <Card><CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader><CardContent>
              <Table><TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>{orders.map(o => (<TableRow key={o.id}><TableCell className="font-mono">{o.id.slice(0,8)}...</TableCell><TableCell>₹{o.total_amount}</TableCell><TableCell>{o.status}</TableCell><TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell></TableRow>))}</TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Settings
                </CardTitle>
                <CardDescription>
                  Configure your UPI payment settings for receiving customer payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="merchant_upi_id">Merchant UPI ID</Label>
                    <Input
                      id="merchant_upi_id"
                      placeholder="yourname@paytm"
                      value={upiSettings.merchant_upi_id}
                      onChange={(e) => setUpiSettings({ ...upiSettings, merchant_upi_id: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      This UPI ID will be used for receiving all customer payments (e.g., yourname@paytm, yourname@upi)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="merchant_name">Merchant/Business Name</Label>
                    <Input
                      id="merchant_name"
                      placeholder="Your Business Name"
                      value={upiSettings.merchant_name}
                      onChange={(e) => setUpiSettings({ ...upiSettings, merchant_name: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will be displayed to customers during payment
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment QR Code</Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="border rounded-lg p-4 bg-muted/50 flex flex-col items-center gap-3">
                        {upiSettings.merchant_qr_url ? (
                          <img 
                            src={upiSettings.merchant_qr_url} 
                            alt="Payment QR Code" 
                            className="w-32 h-32 object-contain"
                          />
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-lg">
                            <QrCode className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrUpload}
                            className="hidden"
                            disabled={uploadingQr}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="pointer-events-none"
                            disabled={uploadingQr}
                          >
                            {uploadingQr ? (
                              <>Uploading...</>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                {upiSettings.merchant_qr_url ? 'Replace QR' : 'Upload QR'}
                              </>
                            )}
                          </Button>
                        </label>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Upload your payment QR code image. This will be shown to customers during checkout for "Scan to Pay" option.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Recommended: PNG or JPG, square aspect ratio (e.g., 400x400 pixels)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveSettings} 
                  disabled={savingSettings}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
