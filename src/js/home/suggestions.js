const suggestions = [
  {
    label: '!1337x',
    desc: '1337x.am',
    icon: './src/scss/icons/suggestions/1337x.ico',
    url: 'https://www.1337x.am/search/'
  },
  {
    label: '!afr',
    desc: 'Amazon (FR)',
    icon: './src/scss/icons/suggestions/amazon.png',
    url: 'https://www.amazon.fr/s?k='
  },
  {
    label: '!a',
    desc: 'Amazon (US)',
    icon: './src/scss/icons/suggestions/amazon.png',
    url: 'https://www.amazon.com/s?k='
  },
  {
    label: '!alto',
    desc: 'AlternativeTo',
    icon: './src/scss/icons/suggestions/alto.ico',
    url: 'https://alternativeto.net/browse/search?q='
  },
  {
    label: '!css',
    desc: 'CSS Tricks',
    icon: './src/scss/icons/suggestions/csstricks.png',
    url: 'https://css-tricks.com/?s='
  },
  {
    label: '!d',
    desc: 'Download a YouTube audio stream',
    icon: './src/scss/icons/suggestions/download.png'
  },
  {
    label: '!fdroid',
    desc: 'F-Droid',
    icon: './src/scss/icons/suggestions/fdroid.png',
    url: 'https://search.f-droid.org/?q='
  },
  {
    label: '!g',
    desc: 'Google',
    icon: './src/scss/icons/suggestions/google.png',
    url: 'https://www.google.com/search?q='
  },
  {
    label: '!gh',
    desc: 'Github',
    icon: './src/scss/icons/suggestions/github.ico',
    url: 'https://github.com/search?q='
  },
  {
    label: '!gt',
    desc: 'Google translate',
    icon: './src/scss/icons/suggestions/gt.ico',
    url: 'https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text='
  },
  {
    label: '!gmap',
    desc: 'Google Maps',
    icon: './src/scss/icons/suggestions/maps.ico',
    url: 'https://www.google.be/maps/search/'
  },
  {
    label: '!htg',
    desc: 'How-to Geek',
    icon: './src/scss/icons/suggestions/howtogeek.ico',
    url: 'https://www.howtogeek.com/search/?q='
  },
  {
    label: '!iv',
    desc: 'Invidio.us',
    icon: './src/scss/icons/suggestions/invidious.png',
    url: 'https://invidio.us/search?q='
  },
  {
    label: '!jq',
    desc: 'Jquery API',
    icon: './src/scss/icons/suggestions/jquery.ico',
    url: 'https://api.jquery.com/?ns0=1&s='
  },
  {
    label: '!ldlc',
    desc: 'LDLC',
    icon: './src/scss/icons/suggestions/ldlc.png',
    url: 'https://www.ldlc.com/fr-be/recherche/'
  },
  {
    label: '!lg',
    desc: 'Les Grignoux',
    icon: './src/scss/icons/suggestions/grignoux.png',
    url: 'https://www.grignoux.be//fr/recherche?search='
  },
  {
    label: '!li',
    desc: 'LinkedIn',
    icon: './src/scss/icons/suggestions/linkedin.ico',
    url: 'https://www.linkedin.com/search/results/all/?keywords='
  },
  {
    label: '!ln',
    desc: 'Les Numériques',
    icon: './src/scss/icons/suggestions/ln.png',
    url: 'https://www.lesnumeriques.com/recherche?q='
  },
  {
    label: '!mdn',
    desc: 'Mozilla Developer network',
    icon: './src/scss/icons/suggestions/mdn.png',
    url: 'https://developer.mozilla.org/en-US/search?q='
  },
  {
    label: '!mmfr',
    desc: 'Media Markt (BE FR)',
    icon: './src/scss/icons/suggestions/mm.png',
    url: 'https://www.mediamarkt.be/fr/search.html?query='
  },
  {
    label: '!mmnl',
    desc: 'Media Markt (BE NL)',
    icon: './src/scss/icons/suggestions/mm.png',
    url: 'https://www.mediamarkt.nl/nl/search.html?query='
  },
  {
    label: '!mt',
    desc: 'Marine Traffic',
    icon: './src/scss/icons/suggestions/marinetraffic.ico',
    url: 'https://www.marinetraffic.com/en/ais/index/search/all?keyword='
  },
  {
    label: '!pb',
    desc: 'Pages Blanches (BE)',
    icon: './src/scss/icons/suggestions/pagesblanches.ico',
    url: 'https://www.pagesblanches.be/chercher/personne/'
  },
  {
    label: '!os',
    desc: 'OpenSubtitles',
    icon: './src/scss/icons/suggestions/opensub.ico',
    url: 'https://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-'
  },
  {
    label: '!osm',
    desc: 'OpenStreetMap',
    icon: './src/scss/icons/suggestions/osm.png',
    url: 'https://www.openstreetmap.org/search?query='
  },
  {
    label: '!owm',
    desc: 'OpenWeatherMap',
    icon: './src/scss/icons/suggestions/owm.ico',
    url: 'https://openweathermap.org/find?q='
  },
  {
    label: '!p',
    desc: 'Play a Youtube audio stream or playlist',
    icon: './src/scss/icons/suggestions/play.svg'
  },
  {
    label: '!r',
    desc: 'Reddit',
    icon: './src/scss/icons/suggestions/reddit.webp',
    url: 'https://www.reddit.com/search?q='
  },
  {
    label: '!rarbg',
    desc: 'RARBG',
    icon: './src/scss/icons/suggestions/rarbg.png',
    url: 'http://rarbgmirror.org/torrents.php?search='
  },
  {
    label: '!rt',
    desc: 'Rottentomatoes',
    icon: './src/scss/icons/suggestions/rottentomatoes.png',
    url: 'https://www.rottentomatoes.com/search/?search='
  },
  {
    label: '!rtbf',
    desc: 'RTBF',
    icon: './src/scss/icons/suggestions/rtbf.png',
    url: 'https://www.rtbf.be/info/recherche?q='
  },
  {
    label: '!sc',
    desc: 'SoundCloud',
    icon: './src/scss/icons/suggestions/soundcloud.ico',
    url: 'https://soundcloud.com/search?q='
  },
  {
    label: '!so',
    desc: 'Stack Overflow',
    icon: './src/scss/icons/suggestions/so.ico',
    url: 'https://stackoverflow.com/search?q='
  },
  {
    label: '!torrent',
    desc: 'Oxtorrent.com',
    icon: './src/scss/icons/suggestions/torrent.ico',
    url: 'https://www.oxtorrent.com/recherche/'
  },
  {
    label: '!uc',
    desc: 'Unicode table',
    icon: './src/scss/icons/suggestions/unicode.ico',
    url: 'https://unicode-table.com/en/search/?q='
  },
  {
    label: '!w',
    desc: 'Wikipedia (EN)',
    icon: './src/scss/icons/suggestions/wikipedia.ico',
    url: 'https://en.wikipedia.org/w/index.php?search='
  },
  {
    label: '!wfr',
    desc: 'Wikipedia (FR)',
    icon: './src/scss/icons/suggestions/wikipedia.ico',
    url: 'https://fr.wikipedia.org/w/index.php?search='
  },
  {
    label: '!wt',
    desc: 'Wikitionnary (EN)',
    icon: './src/scss/icons/suggestions/wt.ico',
    url: 'https://en.wiktionary.org/w/index.php?search='
  },
  {
    label: '!wtfr',
    desc: 'Wikitionnary (FR)',
    icon: './src/scss/icons/suggestions/wt.ico',
    url: 'https://fr.wiktionary.org/w/index.php?search='
  },
  {
    label: '!yarn',
    desc: 'Yarn',
    icon: './src/scss/icons/suggestions/yarn.ico',
    url: 'https://yarnpkg.com/en/packages?q='
  },
  {
    label: '!yt',
    desc: 'Youtube',
    icon: './src/scss/icons/suggestions/yt.ico',
    url: 'https://www.youtube.com/results?search_query='
  },{
    label: '!bbc',
    desc: 'BBC News',
    icon: './src/scss/icons/suggestions/bbc.png',
    url: 'https://www.bbc.co.uk/search?q='
  }
];
