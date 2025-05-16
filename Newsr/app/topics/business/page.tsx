'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/app/lib/supabase'
import { Clock, TrendingUp, ArrowUp, ArrowDown, Globe, DollarSign, BarChart3, FileText, Bitcoin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import styles from '@/app/styles/Business.module.css'
import PollWidget from '@/app/components/ui/PollsSection'
import MarketTicker from '@/app/topics/business/components/MarketTicker'
import MarketOverview from '@/app/topics/business/components/MarketOverview'
import FinancialDataGrid from '@/app/topics/business/components/FinancialDataGrid'
import BusinessArticles from '@/app/topics/business/components/BusinessArticles'
import BusinessPolls from '@/app/topics/business/components/BusinessPolls'
import WeeklySentimentPoll from '@/app/topics/business/components/WeeklySentimentPoll'
import InvestmentStrategyPoll from '@/app/topics/business/components/InvestmentStrategyPoll'
import EconomicOutlookPoll from '@/app/topics/business/components/EconomicOutlookPoll'
import IndustryPerformancePoll from '@/app/topics/business/components/IndustryPerformancePoll'
import WorkplaceModelPoll from '@/app/topics/business/components/WorkplaceModelPoll'
import RelatedPolls from '@/app/topics/business/components/RelatedPolls'
import RelatedArticles from '@/app/topics/business/components/RelatedArticles'
import StockTicker from '@/app/components/StockTicker'
import MarketIndices from '@/app/components/MarketIndices'
import CryptoTicker from '@/app/components/CryptoTicker'
import { fetchMultipleForexPairs, getFallbackForexData, ForexData } from '@/app/lib/services/stockServices'
import TopicDigest from '@/app/components/TopicDigest'

export default function BusinessPage() {
  const [forexData, setForexData] = useState<ForexData[]>([])
  const [commoditiesData, setCommoditiesData] = useState([
    { name: 'Gold', value: '$2,043.50', change: '+0.8%', positive: true },
    { name: 'Oil (WTI)', value: '$74.35', change: '-1.2%', positive: false },
    { name: 'Natural Gas', value: '$2.81', change: '+2.1%', positive: true }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch forex data
        const forexPairs = [
          { from: 'EUR', to: 'USD' },
          { from: 'GBP', to: 'USD' },
          { from: 'USD', to: 'JPY' }
        ]
        
        const forexResult = await fetchMultipleForexPairs(forexPairs)
        
        if (forexResult.length > 0) {
          setForexData(forexResult)
        } else {
          setForexData(getFallbackForexData())
        }
        
        // Note: We're keeping commodities as mock data since most free APIs 
        // don't provide commodities data without authentication
      } catch (error) {
        console.error('Error fetching financial data:', error)
        setForexData(getFallbackForexData())
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Refresh data every 15 minutes
    const intervalId = setInterval(fetchData, 15 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className={styles.container}>
      {/* Market Ticker */}
      <StockTicker height={48} className="mb-8 rounded-md shadow" />
      
      {/* Topic Digest */}
      <TopicDigest category="business" />
      
      {/* Market Overview */}
      <section className={styles.section}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BarChart3 className="mr-2" />
          Market Indices
        </h2>
        
        <MarketIndices className="mb-8" />
        
        {/* Cryptocurrency Section */}
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Bitcoin className="mr-2" />
          Cryptocurrencies
        </h2>
        
        <CryptoTicker className="mb-8" />
        
        <div className={styles.dataGrid}>
          <div className={styles.dataCard}>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5" />
              <h2 className="text-xl font-bold">Forex Markets</h2>
            </div>
            <div className={styles.dataTable}>
              {forexData.map((pair, index) => (
                <div key={index} className={styles.dataRow}>
                  <span className="font-bold">{pair.pair}</span>
                  <span>{pair.value}</span>
                  <span className={pair.positive ? styles.positive : styles.negative}>
                    {pair.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.dataCard}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5" />
              <h2 className="text-xl font-bold">Commodities</h2>
            </div>
            <div className={styles.dataTable}>
              {commoditiesData.map((commodity, index) => (
                <div key={index} className={styles.dataRow}>
                  <span className="font-bold">{commodity.name}</span>
                  <span>{commodity.value}</span>
                  <span className={commodity.positive ? styles.positive : styles.negative}>
                    {commodity.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Business Articles */}
      <section className={styles.section}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <FileText className="mr-2" />
          Latest Business News
        </h2>
        <BusinessArticles />
      </section>

      {/* Polls */}
      <section className={styles.section}>
        <h2 className="text-2xl font-bold mb-6">Financial Insights</h2>
        <BusinessPolls />
      </section>
    </div>
  )
}

