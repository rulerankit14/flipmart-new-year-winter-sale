import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, ChevronDown, Menu, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-start">
            <span className="text-xl font-bold text-primary-foreground italic">Flipkart</span>
            <span className="text-[10px] text-primary-foreground/80 flex items-center gap-1">
              Explore <span className="text-secondary font-semibold">Plus</span>
              <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/header/header-sprite-3c93b4.svg" alt="" className="h-3" />
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-sm bg-white text-foreground placeholder:text-muted-foreground"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 gap-1">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">Account</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary/80">
                <Link to="/login">Login</Link>
              </Button>
            )}

            {/* Cart */}
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary/80 relative">
              <Link to="/cart" className="flex items-center gap-1">
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden md:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="mt-2 md:hidden">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-sm bg-white"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
