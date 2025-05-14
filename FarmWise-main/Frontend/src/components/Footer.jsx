import React,{ useState } from "react";

const Footer = () => {
    return (
      <footer className="bg-green-900 text-white py-8">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-green-400">Farmwise</h2>
            <p className="mt-2 text-sm opacity-80">
              Empowering farmers with AI-driven insights, organic farming best practices, and expert guidance.
            </p>
          </div>
  
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li><a href="/about" className="hover:text-green-400">About Us</a></li>
              <li><a href="/blog" className="hover:text-green-400">Blog</a></li>
              <li><a href="/discussion" className="hover:text-green-400">Community</a></li>
              <li><a href="/contact" className="hover:text-green-400">Contact</a></li>
            </ul>
          </div>
  
          <div>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <p className="mt-2 text-sm opacity-80">support@farmwise.com</p>
            <p className="mt-1 text-sm opacity-80">123 Green Fields, Agrotech City</p>
            <p className="mt-1 text-sm opacity-80">+1 234 567 890</p>
          </div>
  
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="hover:text-green-400"><i className="fab fa-facebook"></i></a>
              <a href="#" className="hover:text-green-400"><i className="fab fa-twitter"></i></a>
              <a href="#" className="hover:text-green-400"><i className="fab fa-instagram"></i></a>
              <a href="#" className="hover:text-green-400"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
  
        <div className="border-t border-green-700 mt-6 pt-4 text-center text-sm opacity-80">
          &copy; {new Date().getFullYear()} Farmwise. All rights reserved.
        </div>
      </footer>
    );
  };
  
  export default Footer;
  