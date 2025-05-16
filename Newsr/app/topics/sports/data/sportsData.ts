// Define all sports categories with their ESPN API endpoints
export const allSports = {
  nfl: {
    name: 'NFL',
    endpoint: 'football/nfl',
    color: 'bg-amber-500',
    inSeason: true,
    icon: '🏈'
  },
  nba: {
    name: 'NBA',
    endpoint: 'basketball/nba',
    color: 'bg-blue-500',
    inSeason: true,
    icon: '🏀'
  },
  nhl: {
    name: 'NHL',
    endpoint: 'hockey/nhl',
    color: 'bg-cyan-500',
    inSeason: true,
    icon: '🏒'
  },
  mensCBB: {
    name: 'College Basketball',
    endpoint: 'basketball/mens-college-basketball',
    color: 'bg-indigo-500',
    inSeason: true,
    icon: '🏀'
  },
  soccer: {
    name: 'Soccer',
    endpoint: 'soccer/eng.1',
    color: 'bg-green-500',
    inSeason: true,
    icon: '⚽'
  },
  mlb: {
    name: 'MLB',
    endpoint: 'baseball/mlb',
    color: 'bg-red-500',
    inSeason: false,
    icon: '⚾'
  },
  collegeFB: {
    name: 'College Football',
    endpoint: 'football/college-football',
    color: 'bg-orange-500',
    inSeason: false,
    icon: '🏈'
  },
  collegeBaseball: {
    name: 'College Baseball',
    endpoint: 'baseball/college-baseball',
    color: 'bg-pink-500',
    inSeason: false,
    icon: '⚾'
  },
  wnba: {
    name: 'WNBA',
    endpoint: 'basketball/wnba',
    color: 'bg-purple-500',
    inSeason: false,
    icon: '🏀'
  },
  womensCBB: {
    name: 'Women\'s College Basketball',
    endpoint: 'basketball/womens-college-basketball',
    color: 'bg-violet-500',
    inSeason: false,
    icon: '🏀'
  }
};

// For soccer, we can offer multiple leagues
export const soccerLeagues = [
  { id: 'eng.1', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'esp.1', name: 'La Liga', flag: '🇪🇸' },
  { id: 'ita.1', name: 'Serie A', flag: '🇮🇹' },
  { id: 'ger.1', name: 'Bundesliga', flag: '🇩🇪' },
  { id: 'usa.1', name: 'MLS', flag: '🇺🇸' },
  { id: 'fra.1', name: 'Ligue 1', flag: '🇫🇷' },
  { id: 'uefa.champions', name: 'Champions League', flag: '🇪🇺' }
];

// Helper function to transform ESPN data for display
export const transformScores = (sportKey: string, data: any[]) => {
  return data?.map(game => {
    // Different sports have slightly different data structures
    return {
      id: game.id,
      league: game.competitions?.[0]?.league?.abbreviation || allSports[sportKey as keyof typeof allSports].name,
      homeTeam: game.competitions?.[0]?.competitors?.[0]?.team?.displayName || 'Home Team',
      awayTeam: game.competitions?.[0]?.competitors?.[1]?.team?.displayName || 'Away Team',
      homeScore: parseInt(game.competitions?.[0]?.competitors?.[0]?.score) || 0,
      awayScore: parseInt(game.competitions?.[0]?.competitors?.[1]?.score) || 0,
      time: game.status?.displayClock || game.status?.type?.shortDetail || 'TBD',
      period: game.status?.period || 0,
      startTime: game.date ? new Date(game.date).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'}) : 'TBD',
      isLive: game.status?.type?.state === 'in' || false,
      isCompleted: game.status?.type?.state === 'post' || false,
      homeLogoUrl: game.competitions?.[0]?.competitors?.[0]?.team?.logo || null,
      awayLogoUrl: game.competitions?.[0]?.competitors?.[1]?.team?.logo || null,
      venue: game.competitions?.[0]?.venue?.fullName || '',
      broadcast: game.competitions?.[0]?.broadcasts?.[0]?.names?.join(', ') || '',
      homeStats: extractStats(game, 0),
      awayStats: extractStats(game, 1)
    };
  }) || [];
};

// Helper function to extract stats based on competitor index
function extractStats(game: any, competitorIndex: number) {
  const stats = game.competitions?.[0]?.competitors?.[competitorIndex]?.statistics || [];
  
  return {
    // Common stats
    possession: stats.find((s: any) => s.name === 'possessionPct')?.displayValue || '',
    
    // Basketball specific
    rebounds: stats.find((s: any) => s.name === 'rebounds')?.displayValue || '',
    assists: stats.find((s: any) => s.name === 'assists')?.displayValue || '',
    threePointPct: stats.find((s: any) => s.name === 'threePointPct')?.displayValue || '',
    
    // Football specific
    totalYards: stats.find((s: any) => s.name === 'totalYards')?.displayValue || '',
    passingYards: stats.find((s: any) => s.name === 'netPassingYards')?.displayValue || '',
    rushingYards: stats.find((s: any) => s.name === 'rushingYards')?.displayValue || '',
    
    // Baseball specific
    hits: stats.find((s: any) => s.name === 'hits')?.displayValue || '',
    errors: stats.find((s: any) => s.name === 'errors')?.displayValue || '',
    
    // Hockey specific
    shotsOnGoal: stats.find((s: any) => s.name === 'shotsOnGoal')?.displayValue || '',
    
    // Soccer specific
    shots: stats.find((s: any) => s.name === 'shots')?.displayValue || '',
    shotsOnTarget: stats.find((s: any) => s.name === 'shotsOnTarget')?.displayValue || '',
  };
} 