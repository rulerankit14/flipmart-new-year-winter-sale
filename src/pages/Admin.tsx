import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Package, ShoppingCart, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({ name: '', description: '', original_price: '', selling_price: '', image_url: '', stock: '', category_id: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', image_url: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      return;
    }
    if (isAdmin) fetchData();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    const [productsRes, categoriesRes, ordersRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    setLoading(false);
  };

  const handleAddProduct = async () => {
    const { error } = await supabase.from('products').insert({
      name: productForm.name,
      description: productForm.description,
      original_price: parseFloat(productForm.original_price),
      selling_price: parseFloat(productForm.selling_price),
      image_url: productForm.image_url || null,
      stock: parseInt(productForm.stock) || 0,
      category_id: productForm.category_id || null,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Product added!' }); setProductForm({ name: '', description: '', original_price: '', selling_price: '', image_url: '', stock: '', category_id: '' }); setDialogOpen(false); fetchData(); }
  };

  const handleAddCategory = async () => {
    const { error } = await supabase.from('categories').insert({ name: categoryForm.name, slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'), image_url: categoryForm.image_url || null });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Category added!' }); setCategoryForm({ name: '', slug: '', image_url: '' }); fetchData(); }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchData();
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
          <TabsList><TabsTrigger value="products">Products</TabsTrigger><TabsTrigger value="categories">Categories</TabsTrigger><TabsTrigger value="orders">Orders</TabsTrigger></TabsList>
          
          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Product</Button></DialogTrigger>
                  <DialogContent><DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Name</Label><Input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
                      <div><Label>Original Price (₹)</Label><Input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} /></div>
                      <div><Label>Selling Price (₹)</Label><Input type="number" value={productForm.selling_price} onChange={e => setProductForm({...productForm, selling_price: e.target.value})} /></div>
                      <div><Label>Stock</Label><Input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} /></div>
                      <div><Label>Image URL</Label><Input value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} /></div>
                      <div><Label>Description</Label><Textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /></div>
                      <Button onClick={handleAddProduct} className="w-full">Add Product</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Original</TableHead><TableHead>Selling</TableHead><TableHead>Stock</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>{products.map(p => (<TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>₹{p.original_price}</TableCell><TableCell>₹{p.selling_price}</TableCell><TableCell>{p.stock}</TableCell><TableCell><Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody>
                </Table>
              </CardContent>
            </Card>
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
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
