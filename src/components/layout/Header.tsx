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
    <header className="bg-[#2874f0] sticky top-0 z-50">
      <div className="px-3 py-2">
        {/* Top Row - Logo and Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <Link to="/" className="flex flex-col items-start">
              <span className="text-xl font-bold text-white italic">Flipkart</span>
              <span className="text-[10px] text-white/90 flex items-center gap-1">
                Explore <span className="text-yellow-400 font-semibold">Plus</span>
                <span className="text-yellow-400">✦</span>
              </span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-white/10 gap-1 px-2">
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
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 text-xs px-2">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-white text-[#2874f0] hover:bg-gray-100 text-xs px-2">
                  <Link to="/signup">Signup</Link>
                </Button>
              </div>
            )}

            {/* Cart with Badge */}
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-6 w-6 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-[#2874f0] text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for Products, Brands and More"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-sm bg-white text-foreground placeholder:text-muted-foreground text-sm border-0"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2874f0]">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
