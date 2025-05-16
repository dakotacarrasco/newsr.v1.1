'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, TrendingUp, TrendingDown, ExternalLink, Briefcase } from 'lucide-react'

type CompanyType = 'all' | 'tech-giants' | 'startups' | 'hardware' | 'software'

export default function TechCompanies() {
  const [filter, setFilter] = useState<CompanyType>('all')
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({})
  
  const handleLogoError = (companyName: string) => {
    setLogoErrors(prev => ({ ...prev, [companyName]: true }))
  }
  
  // Mock company data with stock price and news
  const companyData = [
    {
      name: 'Apple',
      ticker: 'AAPL',
      price: 187.42,
      change: +1.82,
      changePercent: +0.98,
      marketCap: '2.95T',
      logo: '/images/technology/companies/apple.png',
      latestNews: 'Apple announces new M3 chip for next-gen MacBooks',
      category: 'tech-giants',
      hardware: true,
      software: true
    },
    {
      name: 'Microsoft',
      ticker: 'MSFT',
      price: 376.17,
      change: +4.25,
      changePercent: +1.14,
      marketCap: '2.80T',
      logo: '/images/technology/companies/microsoft.png',
      latestNews: 'Microsoft expands Azure AI capabilities for enterprise customers',
      category: 'tech-giants',
      hardware: false,
      software: true
    },
    {
      name: 'Google',
      ticker: 'GOOGL',
      price: 140.35,
      change: -1.52,
      changePercent: -1.07,
      marketCap: '1.77T',
      logo: '/images/technology/companies/google.png',
      latestNews: 'Google faces new antitrust lawsuit over ad technology',
      category: 'tech-giants',
      hardware: false,
      software: true
    },
    {
      name: 'NVIDIA',
      ticker: 'NVDA',
      price: 467.65,
      change: +12.33,
      changePercent: +2.71,
      marketCap: '1.15T',
      logo: '/images/technology/companies/nvidia.png',
      latestNews: 'NVIDIA unveils next-generation GPU architecture for AI applications',
      category: 'hardware',
      hardware: true,
      software: false
    },
    {
      name: 'Anthropic',
      ticker: 'Private',
      price: null,
      change: null,
      changePercent: null,
      marketCap: 'Private',
      logo: '/images/technology/companies/anthropic.png',
      latestNews: 'Anthropic raises $450M in Series C funding for AI development',
      category: 'startups',
      hardware: false,
      software: true
    },
    {
      name: 'Salesforce',
      ticker: 'CRM',
      price: 253.82,
      change: -0.95,
      changePercent: -0.37,
      marketCap: '246.73B',
      logo: '/images/technology/companies/salesforce.png',
      latestNews: 'Salesforce integrates Einstein GPT across all cloud platforms',
      category: 'software',
      hardware: false,
      software: true
    }
  ]
  
  // Filter companies based on selected category
  const filteredCompanies = filter === 'all' 
    ? companyData 
    : companyData.filter(company => 
        filter === 'hardware' 
          ? company.hardware 
          : filter === 'software' 
            ? company.software 
            : company.category === filter
      )

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tech Companies</h2>
        <Link href="/topics/technology/companies" className="text-blue-600 hover:underline flex items-center">
          View All
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'tech-giants', label: 'Tech Giants' },
          { id: 'startups', label: 'Startups' },
          { id: 'hardware', label: 'Hardware' },
          { id: 'software', label: 'Software' }
        ].map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === category.id 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
            onClick={() => setFilter(category.id as CompanyType)}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      {/* Company cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden relative mr-3">
                  {!logoErrors[company.name] ? (
                    <Image 
                      src={company.logo}
                      alt={`${company.name} logo`}
                      fill
                      style={{objectFit: 'contain'}}
                      onError={() => handleLogoError(company.name)}
                    />
                  ) : (
                    <Briefcase className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base">{company.name}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">{company.ticker}</span>
                    {company.marketCap && (
                      <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded">
                        {company.marketCap}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {company.price !== null && (
                <div className="text-right">
                  <div className="font-bold">${company.price}</div>
                  <div className={`text-xs flex items-center justify-end ${
                    company.change && company.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {company.change && company.change > 0 ? (
                      <TrendingUp size={12} className="mr-1" />
                    ) : (
                      <TrendingDown size={12} className="mr-1" />
                    )}
                    {company.change && company.change > 0 ? '+' : ''}
                    {company.change}
                    {' '}
                    ({company.changePercent && company.changePercent > 0 ? '+' : ''}
                    {company.changePercent}%)
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h4 className="text-sm font-medium mb-1">Latest News</h4>
              <p className="text-sm text-gray-700 mb-3">{company.latestNews}</p>
              
              <div className="flex justify-between items-center">
                <Link 
                  href={`/topics/technology/companies/${company.name.toLowerCase()}`}
                  className="text-blue-600 text-xs font-medium hover:underline"
                >
                  More about {company.name}
                </Link>
                
                {company.ticker !== 'Private' && (
                  <Link 
                    href={`https://finance.yahoo.com/quote/${company.ticker}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 flex items-center hover:text-gray-700"
                  >
                    Stock Info
                    <ExternalLink size={10} className="ml-1" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 