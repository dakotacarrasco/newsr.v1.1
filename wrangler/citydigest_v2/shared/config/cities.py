"""City configuration data for the CityDigest application."""

# Dictionary of supported cities with their configuration
CITIES = {
    "atlanta": {
        "name": "Atlanta",
        "state": "Georgia",
        "sources": [
            {
                "name": "Atlanta Journal-Constitution",
                "url": "https://www.ajc.com/",
                "type": "newspaper"
            },
            {
                "name": "11Alive",
                "url": "https://www.11alive.com/",
                "type": "tv"
            },
            {
                "name": "City of Atlanta",
                "url": "https://www.atlantaga.gov/",
                "type": "government"
            }
        ]
    },
    "des_moines": {
        "name": "Des Moines",
        "state": "Iowa",
        "sources": [
            {
                "name": "Des Moines Register",
                "url": "https://www.desmoinesregister.com/",
                "type": "newspaper"
            },
            {
                "name": "KCCI",
                "url": "https://www.kcci.com/",
                "type": "tv"
            },
            {
                "name": "City of Des Moines",
                "url": "https://www.dsm.city/",
                "type": "government"
            }
        ]
    },
    "abq": {
        "name": "Albuquerque",
        "state": "New Mexico",
        "sources": [
            {
                "name": "Albuquerque Journal",
                "url": "https://www.abqjournal.com/",
                "type": "newspaper"
            },
            {
                "name": "KOB 4",
                "url": "https://www.kob.com/",
                "type": "tv"
            },
            {
                "name": "City of Albuquerque",
                "url": "https://www.cabq.gov/",
                "type": "government"
            }
        ]
    },
    "tucson": {
        "name": "Tucson",
        "state": "Arizona",
        "sources": [
            {
                "name": "Arizona Daily Star",
                "url": "https://tucson.com/",
                "type": "newspaper"
            },
            {
                "name": "KOLD News 13",
                "url": "https://www.kold.com/",
                "type": "tv"
            },
            {
                "name": "City of Tucson",
                "url": "https://www.tucsonaz.gov/",
                "type": "government"
            }
        ]
    },
    "dallas": {
        "name": "Dallas",
        "state": "Texas",
        "sources": [
            {
                "name": "Dallas Morning News",
                "url": "https://www.dallasnews.com/",
                "type": "newspaper"
            },
            {
                "name": "WFAA",
                "url": "https://www.wfaa.com/",
                "type": "tv"
            },
            {
                "name": "City of Dallas",
                "url": "https://dallascityhall.com/",
                "type": "government"
            }
        ]
    },
    "denver": {
        "name": "Denver",
        "state": "Colorado",
        "sources": [
            {
                "name": "Denver Post",
                "url": "https://www.denverpost.com/",
                "type": "newspaper"
            },
            {
                "name": "9NEWS",
                "url": "https://www.9news.com/",
                "type": "tv"
            },
            {
                "name": "City of Denver",
                "url": "https://www.denvergov.org/",
                "type": "government"
            }
        ]
    },
    "seattle": {
        "name": "Seattle",
        "state": "Washington",
        "sources": [
            {
                "name": "Seattle Times",
                "url": "https://www.seattletimes.com/",
                "type": "newspaper"
            },
            {
                "name": "KING 5",
                "url": "https://www.king5.com/",
                "type": "tv"
            },
            {
                "name": "City of Seattle",
                "url": "https://www.seattle.gov/",
                "type": "government"
            }
        ]
    },
    "portland": {
        "name": "Portland",
        "state": "Oregon",
        "sources": [
            {
                "name": "The Oregonian",
                "url": "https://www.oregonlive.com/",
                "type": "newspaper"
            },
            {
                "name": "KGW",
                "url": "https://www.kgw.com/",
                "type": "tv"
            },
            {
                "name": "City of Portland",
                "url": "https://www.portland.gov/",
                "type": "government"
            }
        ]
    },
    "austin": {
        "name": "Austin",
        "state": "Texas",
        "sources": [
            {
                "name": "Austin American-Statesman",
                "url": "https://www.statesman.com/",
                "type": "newspaper"
            },
            {
                "name": "KVUE",
                "url": "https://www.kvue.com/",
                "type": "tv"
            },
            {
                "name": "City of Austin",
                "url": "https://www.austintexas.gov/",
                "type": "government"
            }
        ]
    },
    "chicago": {
        "name": "Chicago",
        "state": "Illinois",
        "sources": [
            {
                "name": "Chicago Tribune",
                "url": "https://www.chicagotribune.com/",
                "type": "newspaper"
            },
            {
                "name": "WGN-TV",
                "url": "https://wgntv.com/",
                "type": "tv"
            },
            {
                "name": "City of Chicago",
                "url": "https://www.chicago.gov/",
                "type": "government"
            }
        ]
    },
    "boston": {
        "name": "Boston",
        "state": "Massachusetts",
        "sources": [
            {
                "name": "Boston Globe",
                "url": "https://www.bostonglobe.com/",
                "type": "newspaper"
            },
            {
                "name": "WCVB",
                "url": "https://www.wcvb.com/",
                "type": "tv"
            },
            {
                "name": "City of Boston",
                "url": "https://www.boston.gov/",
                "type": "government"
            }
        ]
    },
    "miami": {
        "name": "Miami",
        "state": "Florida",
        "sources": [
            {
                "name": "Miami Herald",
                "url": "https://www.miamiherald.com/",
                "type": "newspaper"
            },
            {
                "name": "WPLG Local 10",
                "url": "https://www.local10.com/",
                "type": "tv"
            },
            {
                "name": "City of Miami",
                "url": "https://www.miamigov.com/",
                "type": "government"
            }
        ]
    },
    "san_diego": {
        "name": "San Diego",
        "state": "California",
        "sources": [
            {
                "name": "San Diego Union-Tribune",
                "url": "https://www.sandiegouniontribune.com/",
                "type": "newspaper"
            },
            {
                "name": "KGTV ABC 10",
                "url": "https://www.10news.com/",
                "type": "tv"
            },
            {
                "name": "City of San Diego",
                "url": "https://www.sandiego.gov/",
                "type": "government"
            }
        ]
    },
    "detroit": {
        "name": "Detroit",
        "state": "Michigan",
        "sources": [
            {
                "name": "Detroit Free Press",
                "url": "https://www.freep.com/",
                "type": "newspaper"
            },
            {
                "name": "WXYZ-TV",
                "url": "https://www.wxyz.com/",
                "type": "tv"
            },
            {
                "name": "City of Detroit",
                "url": "https://detroitmi.gov/",
                "type": "government"
            }
        ]
    },
    "las_vegas": {
        "name": "Las Vegas",
        "state": "Nevada",
        "sources": [
            {
                "name": "Las Vegas Review-Journal",
                "url": "https://www.reviewjournal.com/",
                "type": "newspaper"
            },
            {
                "name": "KLAS 8 News Now",
                "url": "https://www.8newsnow.com/",
                "type": "tv"
            },
            {
                "name": "City of Las Vegas",
                "url": "https://www.lasvegasnevada.gov/",
                "type": "government"
            }
        ]
    },
    "minneapolis": {
        "name": "Minneapolis",
        "state": "Minnesota",
        "sources": [
            {
                "name": "Star Tribune",
                "url": "https://www.startribune.com/",
                "type": "newspaper"
            },
            {
                "name": "WCCO-TV",
                "url": "https://www.cbsnews.com/minnesota/",
                "type": "tv"
            },
            {
                "name": "City of Minneapolis",
                "url": "https://www.minneapolismn.gov/",
                "type": "government"
            }
        ]
    },
    "nashville": {
        "name": "Nashville",
        "state": "Tennessee",
        "sources": [
            {
                "name": "The Tennessean",
                "url": "https://www.tennessean.com/",
                "type": "newspaper"
            },
            {
                "name": "WSMV-TV",
                "url": "https://www.wsmv.com/",
                "type": "tv"
            },
            {
                "name": "City of Nashville",
                "url": "https://www.nashville.gov/",
                "type": "government"
            }
        ]
    },
    "charlotte": {
        "name": "Charlotte",
        "state": "North Carolina",
        "sources": [
            {
                "name": "Charlotte Observer",
                "url": "https://www.charlotteobserver.com/",
                "type": "newspaper"
            },
            {
                "name": "WCNC Charlotte",
                "url": "https://www.wcnc.com/",
                "type": "tv"
            },
            {
                "name": "City of Charlotte",
                "url": "https://charlottenc.gov/",
                "type": "government"
            }
        ]
    },
    "salt_lake_city": {
        "name": "Salt Lake City",
        "state": "Utah",
        "sources": [
            {
                "name": "The Salt Lake Tribune",
                "url": "https://www.sltrib.com/",
                "type": "newspaper"
            },
            {
                "name": "KSL-TV",
                "url": "https://www.ksl.com/",
                "type": "tv"
            },
            {
                "name": "City of Salt Lake City",
                "url": "https://www.slc.gov/",
                "type": "government"
            }
        ]
    },
    "oklahoma_city": {
        "name": "Oklahoma City",
        "state": "Oklahoma",
        "sources": [
            {
                "name": "The Oklahoman",
                "url": "https://www.oklahoman.com/",
                "type": "newspaper"
            },
            {
                "name": "KOCO 5 News",
                "url": "https://www.koco.com/",
                "type": "tv"
            },
            {
                "name": "City of Oklahoma City",
                "url": "https://www.okc.gov/",
                "type": "government"
            }
        ]
    },
    "st_louis": {
        "name": "St. Louis",
        "state": "Missouri",
        "sources": [
            {
                "name": "St. Louis Post-Dispatch",
                "url": "https://www.stltoday.com/",
                "type": "newspaper"
            },
            {
                "name": "KSDK NewsChannel 5",
                "url": "https://www.ksdk.com/",
                "type": "tv"
            },
            {
                "name": "City of St. Louis",
                "url": "https://www.stlouis-mo.gov/",
                "type": "government"
            }
        ]
    },
    "kansas_city": {
        "name": "Kansas City",
        "state": "Kansas",
        "sources": [
            {
                "name": "The Kansas City Star",
                "url": "https://www.kansascity.com/",
                "type": "newspaper"
            },
            {
                "name": "KMBC 9 News",
                "url": "https://www.kmbc.com/",
                "type": "tv"
            },
            {
                "name": "City of Kansas City",
                "url": "https://www.kcmo.gov/",
                "type": "government"
            }
        ]
    },
    "richmond": {
        "name": "Richmond",
        "state": "Virginia",
        "sources": [
            {
                "name": "Richmond Times-Dispatch",
                "url": "https://www.richmond.com/",
                "type": "newspaper"
            },
            {
                "name": "NBC12",
                "url": "https://www.nbc12.com/",
                "type": "tv"
            },
            {
                "name": "City of Richmond",
                "url": "https://www.rva.gov/",
                "type": "government"
            }
        ]
    },
    "milwaukee": {
        "name": "Milwaukee",
        "state": "Wisconsin",
        "sources": [
            {
                "name": "Milwaukee Journal Sentinel",
                "url": "https://www.jsonline.com/",
                "type": "newspaper"
            },
            {
                "name": "WTMJ-TV",
                "url": "https://www.tmj4.com/",
                "type": "tv"
            },
            {
                "name": "City of Milwaukee",
                "url": "https://city.milwaukee.gov/",
                "type": "government"
            }
        ]
    },
    "birmingham": {
        "name": "Birmingham",
        "state": "Alabama",
        "sources": [
            {
                "name": "The Birmingham News",
                "url": "https://www.al.com/birmingham/",
                "type": "newspaper"
            },
            {
                "name": "WBRC FOX6 News",
                "url": "https://www.wbrc.com/",
                "type": "tv"
            },
            {
                "name": "City of Birmingham",
                "url": "https://www.birminghamal.gov/",
                "type": "government"
            }
        ]
    },
    "hartford": {
        "name": "Hartford",
        "state": "Connecticut",
        "sources": [
            {
                "name": "Hartford Courant",
                "url": "https://www.courant.com/",
                "type": "newspaper"
            },
            {
                "name": "WFSB Channel 3",
                "url": "https://www.wfsb.com/",
                "type": "tv"
            },
            {
                "name": "City of Hartford",
                "url": "https://www.hartfordct.gov/",
                "type": "government"
            }
        ]
    },
    "louisville": {
        "name": "Louisville",
        "state": "Kentucky",
        "sources": [
            {
                "name": "Louisville Courier-Journal",
                "url": "https://www.courier-journal.com/",
                "type": "newspaper"
            },
            {
                "name": "WLKY",
                "url": "https://www.wlky.com/",
                "type": "tv"
            },
            {
                "name": "City of Louisville",
                "url": "https://louisvilleky.gov/",
                "type": "government"
            }
        ]
    },
    "charleston": {
        "name": "Charleston",
        "state": "South Carolina",
        "sources": [
            {
                "name": "The Post and Courier",
                "url": "https://www.postandcourier.com/",
                "type": "newspaper"
            },
            {
                "name": "Live 5 News",
                "url": "https://www.live5news.com/",
                "type": "tv"
            },
            {
                "name": "City of Charleston",
                "url": "https://www.charleston-sc.gov/",
                "type": "government"
            }
        ]
    }
}

# Get list of all city codes
CITY_CODES = list(CITIES.keys())

# Get list of all city names
CITY_NAMES = [city["name"] for city in CITIES.values()] 