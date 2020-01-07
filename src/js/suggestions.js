const suggestions = [
  {
    label: '!1337x',
    desc: '1337x.to',
    icon: './src/css/icons/suggestions/1337x.ico',
    url: 'https://1337x.to/search/'
  },
  {
    label: '!afr',
    desc: 'Amazon (FR)',
    icon: './src/css/icons/suggestions/amazon.png',
    url: 'https://www.amazon.fr/s?k='
  },
  {
    label: '!a',
    desc: 'Amazon (US)',
    icon: './src/css/icons/suggestions/amazon.png',
    url: 'https://www.amazon.com/s?k='
  },
  {
    label: '!alto',
    desc: 'AlternativeTo',
    icon: './src/css/icons/suggestions/alto.ico',
    url: 'https://alternativeto.net/browse/search?q='
  },
  {
    label: '!css',
    desc: 'CSS Tricks',
    icon: './src/css/icons/suggestions/csstricks.png',
    url: 'https://css-tricks.com/?s='
  },
  {
    label: '!d',
    desc: 'Download a YouTube audio stream',
    icon: './src/css/icons/suggestions/download.png'
  },
  {
    label: '!fdroid',
    desc: 'F-Droid',
    icon: './src/css/icons/suggestions/fdroid.png',
    url: 'https://search.f-droid.org/?q='
  },
  {
    label: '!g',
    desc: 'Google',
    icon: './src/css/icons/suggestions/google.png',
    url: 'https://www.google.com/search?q='
  },
  {
    label: '!gh',
    desc: 'Github',
    icon: './src/css/icons/suggestions/github.ico',
    url: 'https://github.com/search?q='
  },
  {
    label: '!gt',
    desc: 'Google translate',
    icon: './src/css/icons/suggestions/gt.ico',
    url: 'https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text='
  },
  {
    label: '!gmap',
    desc: 'Google Maps',
    icon: './src/css/icons/suggestions/maps.ico',
    url: 'https://www.google.be/maps/search/'
  },
  {
    label: '!htg',
    desc: 'How-to Geek',
    icon: './src/css/icons/suggestions/howtogeek.ico',
    url: 'https://www.howtogeek.com/search/?q='
  },
  {
    label: '!iv',
    desc: 'Invidio.us',
    icon: './src/css/icons/suggestions/invidious.png',
    url: 'https://invidio.us/search?q='
  },
  {
    label: '!jq',
    desc: 'Jquery API',
    icon: './src/css/icons/suggestions/jquery.ico',
    url: 'https://api.jquery.com/?ns0=1&s='
  },
  {
    label: '!ldlc',
    desc: 'LDLC',
    icon: './src/css/icons/suggestions/ldlc.png',
    url: 'https://www.ldlc.com/fr-be/recherche/'
  },
  {
    label: '!li',
    desc: 'LinkedIn',
    icon: './src/css/icons/suggestions/linkedin.ico',
    url: 'https://www.linkedin.com/search/results/all/?keywords='
  },
  {
    label: '!ln',
    desc: 'Les Numériques',
    icon: './src/css/icons/suggestions/ln.png',
    url: 'https://www.lesnumeriques.com/recherche?q='
  },
  {
    label: '!mdn',
    desc: 'Mozilla Developer network',
    icon: './src/css/icons/suggestions/mdn.png',
    url: 'https://developer.mozilla.org/en-US/search?q='
  },
  {
    label: '!mmfr',
    desc: 'Media Markt (BE FR)',
    icon: './src/css/icons/suggestions/mm.png',
    url: 'https://www.mediamarkt.be/fr/search.html?query='
  },
  {
    label: '!mmnl',
    desc: 'Media Markt (BE NL)',
    icon: './src/css/icons/suggestions/mm.png',
    url: 'https://www.mediamarkt.nl/nl/search.html?query='
  },
  {
    label: '!mt',
    desc: 'Marine Traffic',
    icon: './src/css/icons/suggestions/marinetraffic.ico',
    url: 'https://www.marinetraffic.com/en/ais/index/search/all?keyword='
  },
  {
    label: '!pb',
    desc: 'Pages Blanches (BE)',
    icon: './src/css/icons/suggestions/pagesblanches.ico',
    url: 'https://www.pagesblanches.be/chercher/personne/'
  },
  {
    label: '!os',
    desc: 'OpenSubtitles',
    icon: './src/css/icons/suggestions/opensub.ico',
    url: 'https://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-'
  },
  {
    label: '!osm',
    desc: 'OpenStreetMap',
    icon: './src/css/icons/suggestions/osm.png',
    url: 'https://www.openstreetmap.org/search?query='
  },
  {
    label: '!owm',
    desc: 'OpenWeatherMap',
    icon: './src/css/icons/suggestions/owm.ico',
    url: 'https://openweathermap.org/find?q='
  },
  {
    label: '!p',
    desc: 'Play a Youtube audio stream or playlist',
    icon: './src/css/icons/suggestions/play.svg'
  },
  {
    label: '!rarbg',
    desc: 'RARBG',
    icon: './src/css/icons/suggestions/rarbg.png',
    url: 'http://rarbgmirror.org/torrents.php?search='
  },
  {
    label: '!rt',
    desc: 'Rottentomatoes',
    icon: './src/css/icons/suggestions/rottentomatoes.png',
    url: 'https://www.rottentomatoes.com/search/?search='
  },
  {
    label: '!rtbf',
    desc: 'RTBF',
    icon: './src/css/icons/suggestions/rtbf.png',
    url: 'https://www.rtbf.be/info/recherche?q='
  },
  {
    label: '!sc',
    desc: 'SoundCloud',
    icon: './src/css/icons/suggestions/soundcloud.ico',
    url: 'https://soundcloud.com/search?q='
  },
  {
    label: '!so',
    desc: 'Stack Overflow',
    icon: './src/css/icons/suggestions/so.ico',
    url: 'https://stackoverflow.com/search?q='
  },
  {
    label: '!sv',
    desc: 'Instant video search',
    icon: ''
  },
  {
    label: '!torrent',
    desc: 'Oxtorrent.com',
    icon: './src/css/icons/suggestions/torrent.ico',
    url: 'https://www.oxtorrent.com/recherche/'
  },
  {
    label: '!uc',
    desc: 'Unicode table',
    icon: './src/css/icons/suggestions/unicode.ico',
    url: 'https://unicode-table.com/en/search/?q='
  },
  {
    label: '!w',
    desc: 'Wikipedia (EN)',
    icon: './src/css/icons/suggestions/wikipedia.ico',
    url: 'https://en.wikipedia.org/w/index.php?search='
  },
  {
    label: '!wfr',
    desc: 'Wikipedia (FR)',
    icon: './src/css/icons/suggestions/wikipedia.ico',
    url: 'https://fr.wikipedia.org/w/index.php?search='
  },
  {
    label: '!wt',
    desc: 'Wikitionnary (EN)',
    icon: './src/css/icons/suggestions/wt.ico',
    url: 'https://en.wiktionary.org/w/index.php?search='
  },
  {
    label: '!wtfr',
    desc: 'Wikitionnary (FR)',
    icon: './src/css/icons/suggestions/wt.ico',
    url: 'https://fr.wiktionary.org/w/index.php?search='
  },
  {
    label: '!yarn',
    desc: 'Yarn',
    icon: './src/css/icons/suggestions/yarn.ico',
    url: 'https://yarnpkg.com/en/packages?q='
  },
  {
    label: '!yt',
    desc: 'Youtube',
    icon: './src/css/icons/suggestions/yt.ico',
    url: 'https://www.youtube.com/results?search_query='
  }
];
