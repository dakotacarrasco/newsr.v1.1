#!/usr/bin/env python3

# City configuration dictionary
CITIES = {
    "abq": {
        "name": "Albuquerque",
        "region": "New Mexico",
        "latitude": 35.0844,
        "longitude": -106.6504,
        "keywords": [
            "albuquerque", "bernalillo county", "abq", "santa fe", "rio rancho", 
            "new mexico", "nm", "unm", "lobo", "sandia", "kirtland", "burque"
        ],
        "scraper_class": "ABQNewsScraper",
        "scrape_frequency": "daily",  # daily, weekly, etc.
        "active": True
    },
    "tucson": {
        "name": "Tucson",
        "region": "Arizona",
        "latitude": 32.2226,
        "longitude": -110.9747,
        "keywords": [
            "tucson", "pima county", "arizona", "az", "university of arizona", 
            "wildcats", "catalina", "marana", "oro valley"
        ],
        "scraper_class": "TucsonNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "dallas": {
        "name": "Dallas",
        "region": "Texas",
        "latitude": 32.7767,
        "longitude": -96.7970,
        "keywords": [
            "dallas", "dfw", "north texas", "dallas-fort worth", "tarrant county", 
            "dallas county", "fort worth", "irving", "plano", "frisco", "richardson",
            "mavs", "cowboys", "stars", "rangers", "smu", "highland park"
        ],
        "scraper_class": "DallasNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    # New cities added below
    "denver": {
        "name": "Denver",
        "region": "Colorado",
        "latitude": 39.7392,
        "longitude": -104.9903,
        "keywords": [
            "denver", "mile high city", "colorado", "co", "boulder", "aurora", 
            "lakewood", "highlands ranch", "littleton", "centennial", "broncos", 
            "nuggets", "avalanche", "rockies", "cu boulder", "denver metro"
        ],
        "scraper_class": "DenverNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "seattle": {
        "name": "Seattle",
        "region": "Washington",
        "latitude": 47.6062,
        "longitude": -122.3321,
        "keywords": [
            "seattle", "king county", "washington", "wa", "puget sound", "bellevue", 
            "tacoma", "everett", "redmond", "kirkland", "seahawks", "mariners", 
            "kraken", "sounders", "uw", "university of washington", "amazon", "microsoft"
        ],
        "scraper_class": "SeattleNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "portland": {
        "name": "Portland",
        "region": "Oregon",
        "latitude": 45.5152,
        "longitude": -122.6784,
        "keywords": [
            "portland", "multnomah county", "oregon", "or", "beaverton", "hillsboro", 
            "gresham", "lake oswego", "trail blazers", "timbers", "thorns", "psu", 
            "portland state", "willamette", "rose city"
        ],
        "scraper_class": "PortlandNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "austin": {
        "name": "Austin",
        "region": "Texas",
        "latitude": 30.2672,
        "longitude": -97.7431,
        "keywords": [
            "austin", "travis county", "texas", "tx", "round rock", "cedar park", 
            "pflugerville", "georgetown", "ut austin", "university of texas", 
            "longhorns", "sxsw", "acl fest", "capitol", "zilker"
        ],
        "scraper_class": "AustinNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "chicago": {
        "name": "Chicago",
        "region": "Illinois",
        "latitude": 41.8781,
        "longitude": -87.6298,
        "keywords": [
            "chicago", "cook county", "illinois", "il", "evanston", "naperville", 
            "schaumburg", "oak park", "bears", "bulls", "blackhawks", "cubs", 
            "white sox", "northwestern", "university of chicago", "loyola", "windy city"
        ],
        "scraper_class": "ChicagoNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "boston": {
        "name": "Boston",
        "region": "Massachusetts",
        "latitude": 42.3601,
        "longitude": -71.0589,
        "keywords": [
            "boston", "suffolk county", "massachusetts", "ma", "cambridge", "somerville", 
            "brookline", "newton", "red sox", "celtics", "bruins", "patriots", "harvard", 
            "mit", "boston university", "northeastern", "fenway"
        ],
        "scraper_class": "BostonNewsScraper",
        "scrape_frequency": "weekly",  # Set to weekly as an example
        "active": True
    },
    "miami": {
        "name": "Miami",
        "region": "Florida",
        "latitude": 25.7617,
        "longitude": -80.1918,
        "keywords": [
            "miami", "miami-dade county", "florida", "fl", "miami beach", "coral gables", 
            "hialeah", "doral", "heat", "dolphins", "marlins", "panthers", "university of miami", 
            "fiu", "south beach", "brickell", "wynwood"
        ],
        "scraper_class": "MiamiNewsScraper",
        "scrape_frequency": "daily",
        "active": False  # Example of an inactive city
    },
    "san_diego": {
        "name": "San Diego",
        "region": "California",
        "latitude": 32.7157,
        "longitude": -117.1611,
        "keywords": [
            "san diego", "sd", "san diego county", "california", "ca", "la jolla", 
            "chula vista", "oceanside", "escondido", "carlsbad", "padres", "chargers", 
            "ucsd", "sdsu", "balboa park", "coronado", "del mar", "gaslamp"
        ],
        "scraper_class": "SanDiegoNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "detroit": {
        "name": "Detroit",
        "region": "Michigan",
        "latitude": 42.3314,
        "longitude": -83.0458,
        "keywords": [
            "detroit", "wayne county", "michigan", "mi", "tigers", "red wings", 
            "pistons", "lions", "motown", "motor city", "great lakes", "ford", 
            "gm", "chrysler"
        ],
        "scraper_class": "DetroitNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "las_vegas": {
        "name": "Las Vegas",
        "region": "Nevada",
        "latitude": 36.1699,
        "longitude": -115.1398,
        "keywords": [
            "las vegas", "vegas", "clark county", "nevada", "nv", "strip", 
            "raiders", "golden knights", "casino", "gaming", "henderson", "summerlin"
        ],
        "scraper_class": "LasVegasNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "minneapolis": {
        "name": "Minneapolis",
        "region": "Minnesota",
        "latitude": 44.9778,
        "longitude": -93.2650,
        "keywords": [
            "minneapolis", "twin cities", "hennepin county", "minnesota", "mn", 
            "vikings", "timberwolves", "twins", "wild", "st paul", "mall of america"
        ],
        "scraper_class": "MinneapolisNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "nashville": {
        "name": "Nashville",
        "region": "Tennessee",
        "latitude": 36.1627,
        "longitude": -86.7816,
        "keywords": [
            "nashville", "davidson county", "tennessee", "tn", "predators", 
            "titans", "grand ole opry", "music row", "country music", "vanderbilt"
        ],
        "scraper_class": "NashvilleNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "charlotte": {
        "name": "Charlotte",
        "region": "North Carolina",
        "latitude": 35.2271,
        "longitude": -80.8431,
        "keywords": [
            "charlotte", "mecklenburg county", "north carolina", "nc", "panthers", 
            "hornets", "banking", "queens city", "bank of america", "wells fargo"
        ],
        "scraper_class": "CharlotteNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "salt_lake_city": {
        "name": "Salt Lake City",
        "region": "Utah",
        "latitude": 40.7608,
        "longitude": -111.8910,
        "keywords": [
            "salt lake city", "slc", "salt lake county", "utah", "ut", "jazz", 
            "real salt lake", "mormon", "lds", "wasatch", "university of utah"
        ],
        "scraper_class": "SaltLakeCityNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "oklahoma_city": {
        "name": "Oklahoma City",
        "region": "Oklahoma",
        "latitude": 35.4676,
        "longitude": -97.5164,
        "keywords": [
            "oklahoma city", "okc", "oklahoma county", "oklahoma", "ok", "thunder", 
            "sooners", "bricktown", "chesapeake", "devon"
        ],
        "scraper_class": "OklahomaCityNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "st_louis": {
        "name": "St. Louis",
        "region": "Missouri",
        "latitude": 38.6270,
        "longitude": -90.1994,
        "keywords": [
            "st louis", "saint louis", "st louis county", "missouri", "mo", 
            "cardinals", "blues", "gateway arch", "washington university", "forest park"
        ],
        "scraper_class": "StLouisNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "kansas_city": {
        "name": "Kansas City",
        "region": "Kansas",
        "latitude": 39.0997,
        "longitude": -94.5786,
        "keywords": [
            "kansas city", "kc", "wyandotte county", "kansas", "ks", "chiefs", 
            "royals", "sporting kc", "plaza", "overland park", "johnson county"
        ],
        "scraper_class": "KansasCityNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "richmond": {
        "name": "Richmond",
        "region": "Virginia",
        "latitude": 37.5407,
        "longitude": -77.4360,
        "keywords": [
            "richmond", "henrico county", "virginia", "va", "vcu rams", 
            "university of richmond", "james river", "capitol", "carytown", "fan district"
        ],
        "scraper_class": "RichmondNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "milwaukee": {
        "name": "Milwaukee",
        "region": "Wisconsin",
        "latitude": 43.0389,
        "longitude": -87.9065,
        "keywords": [
            "milwaukee", "milwaukee county", "wisconsin", "wi", "bucks", "brewers", 
            "marquette", "lake michigan", "menomonee valley", "third ward", "summerfest"
        ],
        "scraper_class": "MilwaukeeNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "birmingham": {
        "name": "Birmingham",
        "region": "Alabama",
        "latitude": 33.5207,
        "longitude": -86.8025,
        "keywords": [
            "birmingham", "jefferson county", "alabama", "al", "uab blazers", 
            "vulcan", "iron city", "magic city", "civil rights", "red mountain"
        ],
        "scraper_class": "BirminghamNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "hartford": {
        "name": "Hartford",
        "region": "Connecticut",
        "latitude": 41.7658,
        "longitude": -72.6734,
        "keywords": [
            "hartford", "hartford county", "connecticut", "ct", "yard goats", 
            "uconn", "insurance", "mark twain", "state capitol", "bushnell park"
        ],
        "scraper_class": "HartfordNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "des_moines": {
        "name": "Des Moines",
        "region": "Iowa",
        "latitude": 41.5868,
        "longitude": -93.6250,
        "keywords": [
            "des moines", "polk county", "iowa", "ia", "drake bulldogs", 
            "iowa cubs", "state capitol", "east village", "principal", "wells fargo"
        ],
        "scraper_class": "DesMoinesNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "louisville": {
        "name": "Louisville",
        "region": "Kentucky",
        "latitude": 38.2527,
        "longitude": -85.7585,
        "keywords": [
            "louisville", "jefferson county", "kentucky", "ky", "cardinals", 
            "churchill downs", "kentucky derby", "bourbon", "muhammad ali", "ohio river"
        ],
        "scraper_class": "LouisvilleNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "charleston": {
        "name": "Charleston",
        "region": "South Carolina",
        "latitude": 32.7765,
        "longitude": -79.9311,
        "keywords": [
            "charleston", "charleston county", "south carolina", "sc", "citadel", 
            "college of charleston", "port", "historic district", "folly beach", 
            "mount pleasant"
        ],
        "scraper_class": "CharlestonNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    }
}

def get_city_config(city_code):
    """Get configuration for a specific city"""
    return CITIES.get(city_code)

def get_active_cities():
    """Get list of active city codes"""
    return [code for code, config in CITIES.items() if config.get("active", False)]

def get_cities_by_frequency(frequency):
    """Get list of active city codes with specified scrape frequency"""
    return [code for code, config in CITIES.items() 
            if config.get("active", False) and config.get("scrape_frequency") == frequency] 