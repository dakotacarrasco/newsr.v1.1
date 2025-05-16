'use client'

import Link from 'next/link'
import { Clock, MapPin, ChevronRight, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function UpcomingEvents() {
  const [activeDay, setActiveDay] = useState(0)
  
  // Generate next 7 dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      date: date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    }
  })
  
  // Mock data for upcoming events
  const eventsByDay = [
    // Today
    [
      {
        id: 'event-1',
        title: 'Premier League: Liverpool vs. Arsenal',
        time: '15:00',
        venue: 'Anfield, Liverpool',
        category: 'Football',
        ticketsAvailable: true,
        televised: 'Sky Sports',
        link: '/events/premier-league/liverpool-arsenal'
      },
      {
        id: 'event-2',
        title: 'NBA: Lakers vs. Warriors',
        time: '20:30',
        venue: 'Crypto.com Arena, Los Angeles',
        category: 'Basketball',
        ticketsAvailable: false,
        televised: 'ESPN',
        link: '/events/nba/lakers-warriors'
      },
      {
        id: 'event-3',
        title: 'Formula 1: US Grand Prix Qualifying',
        time: '22:00',
        venue: 'Circuit of The Americas, Austin',
        category: 'Motorsport',
        ticketsAvailable: true,
        televised: 'F1 TV',
        link: '/events/formula-1/us-grand-prix'
      }
    ],
    // Tomorrow
    [
      {
        id: 'event-4',
        title: 'NFL: Chiefs vs. 49ers',
        time: '16:25',
        venue: 'Arrowhead Stadium, Kansas City',
        category: 'American Football',
        ticketsAvailable: false,
        televised: 'CBS',
        link: '/events/nfl/chiefs-49ers'
      },
      {
        id: 'event-5',
        title: 'Formula 1: US Grand Prix Race',
        time: '19:00',
        venue: 'Circuit of The Americas, Austin',
        category: 'Motorsport',
        ticketsAvailable: true,
        televised: 'F1 TV',
        link: '/events/formula-1/us-grand-prix'
      }
    ],
    // Day after
    [
      {
        id: 'event-6',
        title: 'Champions League: Bayern Munich vs. Barcelona',
        time: '20:00',
        venue: 'Allianz Arena, Munich',
        category: 'Football',
        ticketsAvailable: false,
        televised: 'BT Sport',
        link: '/events/champions-league/bayern-barcelona'
      }
    ],
    // Rest of week
    [], [], [], []
  ]
  
  const currentEvents = eventsByDay[activeDay]
  const hasEvents = currentEvents.length > 0

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 text-red-600 mr-2" />
          <h2 className="text-2xl font-bold">Upcoming Sports Events</h2>
        </div>
        <Link href="/events/calendar" className="text-blue-600 hover:underline flex items-center">
          Full Calendar
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {/* Date selector */}
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          {dates.map((date, index) => (
            <button
              key={index}
              className={`flex-shrink-0 py-3 px-5 flex flex-col items-center transition-colors min-w-[80px] border-b-2 ${
                activeDay === index 
                  ? 'border-red-600 text-red-600' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveDay(index)}
            >
              <span className="text-xs font-medium">{date.dayName}</span>
              <span className={`text-lg font-bold ${activeDay === index ? 'text-red-600' : 'text-gray-900'}`}>
                {date.dayNumber}
              </span>
              <span className="text-xs">{date.month}</span>
            </button>
          ))}
        </div>
        
        {/* Events list */}
        {hasEvents ? (
          <div className="divide-y divide-gray-200">
            {currentEvents.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-red-600">{event.category}</span>
                  <span className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {event.time}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2">
                  <Link href={event.link} className="hover:text-blue-600 transition-colors">
                    {event.title}
                  </Link>
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {event.venue}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {event.ticketsAvailable && (
                    <Link
                      href={`${event.link}/tickets`}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium inline-flex items-center"
                    >
                      Tickets Available
                    </Link>
                  )}
                  
                  {event.televised && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium inline-flex items-center">
                      Watch on {event.televised}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 text-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No events scheduled for this day</p>
            <p className="text-sm">Check other dates or view the full calendar</p>
          </div>
        )}
      </div>
    </section>
  )
} 