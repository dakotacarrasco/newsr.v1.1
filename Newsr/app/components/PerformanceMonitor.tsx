'use client'

import { useEffect, useRef } from 'react'

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export function PerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetric[]>([])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const sendToAnalytics = (metric: PerformanceMetric) => {
      // Store metrics locally
      metricsRef.current.push(metric)

      // Send to analytics service (Google Analytics, etc.)
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: metric.name,
          value: Math.round(metric.value),
          custom_map: {
            metric_rating: metric.rating,
            timestamp: metric.timestamp
          }
        })
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          timestamp: new Date(metric.timestamp).toISOString()
        })
      }

      // Send to custom analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metric),
        }).catch(error => {
          console.error('Failed to send web vitals:', error)
        })
      }
    }

    // Collect Web Vitals with dynamic imports to handle different versions
    const loadWebVitals = async () => {
      try {
        const webVitals = await import('web-vitals')
        
        // Check if the functions exist and call them
        if (webVitals.onCLS) {
          webVitals.onCLS(({ name, value, rating }) => {
            sendToAnalytics({
              name,
              value,
              rating: rating as 'good' | 'needs-improvement' | 'poor',
              timestamp: Date.now()
            })
          })
        }

        if (webVitals.onFID) {
          webVitals.onFID(({ name, value, rating }) => {
            sendToAnalytics({
              name,
              value,
              rating: rating as 'good' | 'needs-improvement' | 'poor',
              timestamp: Date.now()
            })
          })
        }

        if (webVitals.onFCP) {
          webVitals.onFCP(({ name, value, rating }) => {
            sendToAnalytics({
              name,
              value,
              rating: rating as 'good' | 'needs-improvement' | 'poor',
              timestamp: Date.now()
            })
          })
        }

        if (webVitals.onLCP) {
          webVitals.onLCP(({ name, value, rating }) => {
            sendToAnalytics({
              name,
              value,
              rating: rating as 'good' | 'needs-improvement' | 'poor',
              timestamp: Date.now()
            })
          })
        }

        if (webVitals.onTTFB) {
          webVitals.onTTFB(({ name, value, rating }) => {
            sendToAnalytics({
              name,
              value,
              rating: rating as 'good' | 'needs-improvement' | 'poor',
              timestamp: Date.now()
            })
          })
        }
      } catch (error) {
        console.warn('Web Vitals not available:', error)
      }
    }

    loadWebVitals()

    // Monitor custom metrics
    const observeResourceTiming = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource' && entry.name.includes('api/')) {
              sendToAnalytics({
                name: 'API_Response_Time',
                value: entry.duration,
                rating: entry.duration < 1000 ? 'good' : entry.duration < 2500 ? 'needs-improvement' : 'poor',
                timestamp: Date.now()
              })
            }
          })
        })

        try {
          observer.observe({ entryTypes: ['resource'] })
        } catch (error) {
          console.warn('PerformanceObserver not supported:', error)
        }

        return () => observer.disconnect()
      }
    }

    // Monitor long tasks
    const observeLongTasks = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            sendToAnalytics({
              name: 'Long_Task',
              value: entry.duration,
              rating: 'poor',
              timestamp: Date.now()
            })
          })
        })

        try {
          observer.observe({ entryTypes: ['longtask'] })
        } catch (error) {
          console.warn('Long task observer not supported:', error)
        }

        return () => observer.disconnect()
      }
    }

    // Monitor memory usage (if available)
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory
        
        setInterval(() => {
          const heapUsed = memoryInfo.usedJSHeapSize / 1048576 // Convert to MB
          const heapTotal = memoryInfo.totalJSHeapSize / 1048576
          const heapLimit = memoryInfo.jsHeapSizeLimit / 1048576

          sendToAnalytics({
            name: 'Memory_Usage',
            value: heapUsed,
            rating: heapUsed < heapLimit * 0.7 ? 'good' : heapUsed < heapLimit * 0.9 ? 'needs-improvement' : 'poor',
            timestamp: Date.now()
          })
        }, 30000) // Check every 30 seconds
      }
    }

    const resourceCleanup = observeResourceTiming()
    const longTaskCleanup = observeLongTasks()
    monitorMemory()

    return () => {
      resourceCleanup?.()
      longTaskCleanup?.()
    }
  }, [])

  return null // This component doesn't render anything
}

// Hook to access performance metrics
export function usePerformanceMetrics() {
  const metricsRef = useRef<PerformanceMetric[]>([])

  const getMetrics = () => metricsRef.current

  const getMetricsByName = (name: string) => 
    metricsRef.current.filter(metric => metric.name === name)

  const getLatestMetric = (name: string) => {
    const metrics = getMetricsByName(name)
    return metrics[metrics.length - 1]
  }

  const getAverageMetric = (name: string) => {
    const metrics = getMetricsByName(name)
    if (metrics.length === 0) return null
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  return {
    getMetrics,
    getMetricsByName,
    getLatestMetric,
    getAverageMetric
  }
}

// Performance budget checker
export function checkPerformanceBudget() {
  const budgets = {
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    FCP: 1800, // First Contentful Paint
    TTFB: 800  // Time to First Byte
  }

  return {
    isWithinBudget: (metricName: string, value: number) => {
      const budget = budgets[metricName as keyof typeof budgets]
      return budget ? value <= budget : true
    },
    getBudget: (metricName: string) => budgets[metricName as keyof typeof budgets],
    getAllBudgets: () => budgets
  }
}

// Performance tips component
export function PerformanceTips() {
  const { getLatestMetric } = usePerformanceMetrics()
  const { isWithinBudget } = checkPerformanceBudget()

  const tips = [
    {
      metric: 'LCP',
      condition: () => {
        const lcp = getLatestMetric('LCP')
        return lcp && !isWithinBudget('LCP', lcp.value)
      },
      tip: 'Consider optimizing images and reducing server response times to improve Largest Contentful Paint.'
    },
    {
      metric: 'FID',
      condition: () => {
        const fid = getLatestMetric('FID')
        return fid && !isWithinBudget('FID', fid.value)
      },
      tip: 'Reduce JavaScript execution time and optimize event handlers to improve First Input Delay.'
    },
    {
      metric: 'CLS',
      condition: () => {
        const cls = getLatestMetric('CLS')
        return cls && !isWithinBudget('CLS', cls.value)
      },
      tip: 'Set dimensions for images and ads to prevent layout shifts and improve Cumulative Layout Shift.'
    }
  ]

  const applicableTips = tips.filter(tip => tip.condition())

  if (process.env.NODE_ENV !== 'development' || applicableTips.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
      <h3 className="font-bold text-yellow-800 mb-2">Performance Tips</h3>
      <ul className="space-y-1">
        {applicableTips.map((tip, index) => (
          <li key={index} className="text-sm text-yellow-700">
            {tip.tip}
          </li>
        ))}
      </ul>
    </div>
  )
} 