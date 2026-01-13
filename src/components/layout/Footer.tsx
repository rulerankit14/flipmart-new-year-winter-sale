import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#172337] text-gray-400 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-gray-200 font-medium mb-4 text-xs uppercase">About</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:underline">Contact Us</Link></li>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="/stories" className="hover:underline">Flipkart Stories</Link></li>
              <li><Link to="/press" className="hover:underline">Press</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-200 font-medium mb-4 text-xs uppercase">Help</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/payments" className="hover:underline">Payments</Link></li>
              <li><Link to="/shipping" className="hover:underline">Shipping</Link></li>
              <li><Link to="/cancellation" className="hover:underline">Cancellation & Returns</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-200 font-medium mb-4 text-xs uppercase">Policy</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/return-policy" className="hover:underline">Return Policy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms Of Use</Link></li>
              <li><Link to="/security" className="hover:underline">Security</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-200 font-medium mb-4 text-xs uppercase">Social</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Twitter</a></li>
              <li><a href="#" className="hover:underline">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-xs">
          <p>© Flipkart 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
