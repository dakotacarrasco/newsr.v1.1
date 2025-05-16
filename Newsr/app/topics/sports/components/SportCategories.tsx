'use client'

import Link from 'next/link'
// Import icons correctly
import { 
  Award, 
  ChevronRight, 
  Circle as Ball, 
  CircleDot as Basketball, 
  Target as Cricket, 
  Volleyball as Tennis,
  Bike, 
  Car 
} from 'lucide-react'

export default function SportCategories() {
  // Array of sport categories with icons and colors
  const sportsCategories = [
    {
      name: 'Football',
      icon: Ball,
      color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
      link: '/topics/sports/football',
      competitions: ['Premier League', 'La Liga', 'Champions League', 'World Cup'],
      teams: ['Manchester United', 'Real Madrid', 'Bayern Munich', 'Barcelona']
    },
    {
      name: 'Basketball',
      icon: Basketball,
      color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
      link: '/topics/sports/basketball',
      competitions: ['NBA', 'EuroLeague', 'FIBA World Cup', 'NCAA'],
      teams: ['Lakers', 'Celtics', 'Bulls', 'Warriors']
    },
    {
      name: 'Cricket',
      icon: Cricket,
      color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
      link: '/topics/sports/cricket',
      competitions: ['IPL', 'The Ashes', 'T20 World Cup', 'Test Championship'],
      teams: ['India', 'Australia', 'England', 'New Zealand']
    },
    {
      name: 'Tennis',
      icon: Tennis,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
      link: '/topics/sports/tennis',
      competitions: ['Wimbledon', 'US Open', 'Australian Open', 'French Open'],
      players: ['Novak Djokovic', 'Carlos Alcaraz', 'Iga Świątek', 'Coco Gauff']
    },
    {
      name: 'Cycling',
      icon: Bike,
      color: 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200',
      link: '/topics/sports/cycling',
      competitions: ['Tour de France', 'Giro d\'Italia', 'Vuelta a España', 'UCI World Championships'],
      teams: ['UAE Team Emirates', 'Jumbo-Visma', 'Ineos Grenadiers', 'Soudal Quick-Step']
    },
    {
      name: 'Motorsport',
      icon: Car,
      color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
      link: '/topics/sports/motorsport',
      competitions: ['Formula 1', 'MotoGP', 'NASCAR', 'WRC'],
      teams: ['Red Bull Racing', 'Mercedes', 'Ferrari', 'McLaren']
    }
  ]

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Award className="w-6 h-6 text-red-600 mr-2" />
          <h2 className="text-2xl font-bold">Sports Coverage</h2>
        </div>
        <Link href="/topics/sports/all" className="text-blue-600 hover:underline flex items-center">
          View All Sports
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sportsCategories.map((sport) => {
          const SportIcon = sport.icon
          return (
            <div key={sport.name} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className={`flex items-center p-4 border-b ${sport.color.split(' ')[0]} ${sport.color.split(' ')[1]}`}>
                <SportIcon className="w-5 h-5 mr-2" />
                <h3 className="font-bold">{sport.name}</h3>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Top Competitions</h4>
                  <div className="flex flex-wrap gap-2">
                    {sport.competitions.map((competition) => (
                      <Link 
                        key={competition} 
                        href={`/topics/sports/${sport.name.toLowerCase()}/${competition.toLowerCase().replace(/\s+/g, '-')}`}
                        className={`text-xs font-medium px-2 py-1 rounded-full border ${sport.color}`}
                      >
                        {competition}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {sport.teams ? 'Popular Teams' : 'Top Players'}
                  </h4>
                  <div className="grid grid-cols-2 gap-1">
                    {(sport.teams || sport.players)?.map((item) => (
                      <Link 
                        key={item} 
                        href={`/topics/sports/${sport.name.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-gray-600 hover:text-blue-600 hover:underline flex items-center"
                      >
                        <ChevronRight className="w-3 h-3 mr-1 text-gray-400" />
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                  <Link href={sport.link} className={`inline-flex items-center text-sm font-medium ${sport.color.split(' ')[1]} hover:underline`}>
                    All {sport.name} Coverage
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
} 