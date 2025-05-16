'use client'

import Link from 'next/link'
import { Mail, Github, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react'
import { categories } from '@/lib/constants/categories'
import { siteConfig } from '@/config/site'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">About Newsr</h3>
            <p className="text-gray-400 mb-4">
              Your trusted source for the latest news and in-depth coverage across politics, business, 
              technology, sports, and more.
            </p>
            <div className="flex space-x-4">
              <a href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white">
                <Github size={20} />
              </a>
              <a href="https://facebook.com/newsr" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com/newsr" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/topics/${category.id}`} 
                    className="text-gray-400 hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                  My Account
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for weekly updates.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <hr className="my-8 border-gray-800" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white">
              Terms
            </Link>
            <Link href="/cookie-policy" className="hover:text-white">
              Cookies
            </Link>
            <Link href="/accessibility" className="hover:text-white">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
