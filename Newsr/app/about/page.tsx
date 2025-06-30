'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About Newsr</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Your trusted source for news and updates from around the world.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-16">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">About the Creator</h2>
          <div className="prose prose-lg max-w-none mx-auto text-gray-600 dark:text-gray-400">
            <p className="text-lg leading-relaxed mb-6">
              My name is Dakota Carrasco, and I am a finance professional working to sharpen my full-stack development skills through building this website. This project represents my journey into technology and my commitment to expanding my technical expertise beyond traditional finance roles.
            </p>
            <p className="text-lg leading-relaxed mb-8">
              If you have questions or would like to connect, please reach out to me at{' '}
              <a href="mailto:dakota@newsr.io" className="text-blue-600 hover:text-blue-700 font-medium">
                dakota@newsr.io
              </a>{' '}
              or connect with me on{' '}
              <a 
                href="https://www.linkedin.com/in/dakota-carrasco/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                LinkedIn
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* Careers Section CTA */}
      <div className="bg-blue-600 text-white rounded-lg overflow-hidden">
        <div className="p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            We're looking for talented individuals to help build the future of digital news. 
            Explore our open positions and join us in creating something meaningful.
          </p>
          <Link 
            href="/careers" 
            className="inline-block px-6 py-3 border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
          >
            View Open Positions
          </Link>
        </div>
      </div>
    </div>
  );
} 