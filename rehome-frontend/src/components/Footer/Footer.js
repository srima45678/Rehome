// Footer.js
// Bottom section of every page
// Like footer on Daraz or Amazon

import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-10">
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* 4 column grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Column 1 - About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛋️</span>
              <span className="text-xl font-bold text-yellow-400">ReHome</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nepal's trusted marketplace for buying and selling quality second-hand furniture.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Browse Products", "Sell Furniture", "How it Works"].map(link => (
                <li key={link}>
                  <Link to="/" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              {["Sofa & Couch", "Beds & Mattress", "Tables & Desks", "Chairs", "Wardrobes"].map(cat => (
                <li key={cat}>
                  <Link to="/" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📧 support@rehome.com.np</li>
              <li>📞 +977-9800000000</li>
              <li>📍 Kathmandu, Nepal</li>
            </ul>

            {/* Social media */}
            <div className="flex gap-3 mt-4">
              {["📘", "📸", "🐦"].map((icon, i) => (
                <button key={i}
                  className="bg-gray-700 hover:bg-yellow-400 w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                  {icon}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 ReHome. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/" className="text-gray-500 hover:text-white text-sm">Privacy Policy</Link>
            <Link to="/" className="text-gray-500 hover:text-white text-sm">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;