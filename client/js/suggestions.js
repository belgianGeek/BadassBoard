const suggestions = [
  {
    label: '!1337x',
    desc: '1337x.am',
    icon: './client/scss/icons/suggestions/1337x.ico',
    url: 'https://www.1337x.am/search/'
  },
  {
    label: '!afr',
    desc: 'Amazon (FR)',
    icon: './client/scss/icons/suggestions/amazon.png',
    url: 'https://www.amazon.fr/s?k='
  },
  {
    label: '!a',
    desc: 'Amazon (US)',
    icon: './client/scss/icons/suggestions/amazon.png',
    url: 'https://www.amazon.com/s?k='
  },
  {
    label: '!alto',
    desc: 'AlternativeTo',
    icon: './client/scss/icons/suggestions/alto.ico',
    url: 'https://alternativeto.net/browse/search?q='
  },
  {
    label: '!css',
    desc: 'CSS Tricks',
    icon: './client/scss/icons/suggestions/csstricks.png',
    url: 'https://css-tricks.com/?s='
  },
  {
    label: '!d',
    desc: 'Download a YouTube audio stream',
    icon: './client/scss/icons/suggestions/download.png'
  },
  {
    label: '!fdroid',
    desc: 'F-Droid',
    icon: './client/scss/icons/suggestions/fdroid.png',
    url: 'https://search.f-droid.org/?q='
  },
  {
    label: '!g',
    desc: 'Google',
    icon: './client/scss/icons/suggestions/google.png',
    url: 'https://www.google.com/search?q='
  },
  {
    label: '!gh',
    desc: 'Github',
    icon: './client/scss/icons/suggestions/github.ico',
    url: 'https://github.com/search?q='
  },
  {
    label: '!gt',
    desc: 'Google translate',
    icon: './client/scss/icons/suggestions/gt.ico',
    url: 'https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text='
  },
  {
    label: '!gmap',
    desc: 'Google Maps',
    icon: './client/scss/icons/suggestions/maps.ico',
    url: 'https://www.google.be/maps/search/'
  },
  {
    label: '!htg',
    desc: 'How-to Geek',
    icon: './client/scss/icons/suggestions/howtogeek.ico',
    url: 'https://www.howtogeek.com/search/?q='
  },
  {
    label: '!iv',
    desc: 'invidious.fdn.fr',
    icon: './client/scss/icons/suggestions/invidious.png',
    url: 'https://invidious.fdn.fr/search?q='
  },
  {
    label: '!jq',
    desc: 'Jquery API',
    icon: './client/scss/icons/suggestions/jquery.ico',
    url: 'https://api.jquery.com/?ns0=1&s='
  },
  {
    label: '!k',
    desc: 'korben.info',
    icon: './client/scss/icons/suggestions/korben.png',
    url: 'https://korben.info/search/'
  },
  {
    label: '!ldlc',
    desc: 'LDLC',
    icon: './client/scss/icons/suggestions/ldlc.png',
    url: 'https://www.ldlc.com/fr-be/recherche/'
  },
  {
    label: '!lg',
    desc: 'Les Grignoux',
    icon: './client/scss/icons/suggestions/grignoux.png',
    url: 'https://www.grignoux.be//fr/recherche?search='
  },
  {
    label: '!li',
    desc: 'LinkedIn',
    icon: './client/scss/icons/suggestions/linkedin.ico',
    url: 'https://www.linkedin.com/search/results/all/?keywords='
  },
  {
    label: '!ln',
    desc: 'Les Numériques',
    icon: './client/scss/icons/suggestions/ln.png',
    url: 'https://www.lesnumeriques.com/recherche?q='
  },
  {
    label: '!mdn',
    desc: 'Mozilla Developer network',
    icon: './client/scss/icons/suggestions/mdn.png',
    url: 'https://developer.mozilla.org/en-US/search?q='
  },
  {
    label: '!mmfr',
    desc: 'Media Markt (BE FR)',
    icon: './client/scss/icons/suggestions/mm.png',
    url: 'https://www.mediamarkt.be/fr/search.html?query='
  },
  {
    label: '!mmnl',
    desc: 'Media Markt (BE NL)',
    icon: './client/scss/icons/suggestions/mm.png',
    url: 'https://www.mediamarkt.nl/nl/search.html?query='
  },
  {
    label: '!mt',
    desc: 'Marine Traffic',
    icon: './client/scss/icons/suggestions/marinetraffic.ico',
    url: 'https://www.marinetraffic.com/en/ais/index/search/all?keyword='
  },
  {
    label: '!pb',
    desc: 'Pages Blanches (BE)',
    icon: './client/scss/icons/suggestions/pagesblanches.ico',
    url: 'https://www.pagesblanches.be/chercher/personne/'
  },
  {
    label: '!os',
    desc: 'OpenSubtitles',
    icon: './client/scss/icons/suggestions/opensub.ico',
    url: 'https://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-'
  },
  {
    label: '!osm',
    desc: 'OpenStreetMap',
    icon: './client/scss/icons/suggestions/osm.png',
    url: 'https://www.openstreetmap.org/search?query='
  },
  {
    label: '!owm',
    desc: 'OpenWeatherMap',
    icon: './client/scss/icons/suggestions/owm.ico',
    url: 'https://openweathermap.org/find?q='
  },
  {
    label: '!p',
    desc: 'Play a Youtube audio stream or playlist',
    icon: './client/scss/icons/suggestions/play.svg'
  },
  {
    label: '!r',
    desc: 'Reddit',
    icon: './client/scss/icons/suggestions/reddit.webp',
    url: 'https://www.reddit.com/search?q='
  },
  {
    label: '!rarbg',
    desc: 'RARBG',
    icon: './client/scss/icons/suggestions/rarbg.png',
    url: 'http://rarbgmirror.org/torrents.php?search='
  },
  {
    label: '!rt',
    desc: 'Rottentomatoes',
    icon: './client/scss/icons/suggestions/rottentomatoes.png',
    url: 'https://www.rottentomatoes.com/search/?search='
  },
  {
    label: '!rtbf',
    desc: 'RTBF',
    icon: './client/scss/icons/suggestions/rtbf.png',
    url: 'https://www.rtbf.be/info/recherche?q='
  },
  {
    label: '!sc',
    desc: 'SoundCloud',
    icon: './client/scss/icons/suggestions/soundcloud.ico',
    url: 'https://soundcloud.com/search?q='
  },
  {
    label: '!so',
    desc: 'Stack Overflow',
    icon: './client/scss/icons/suggestions/so.ico',
    url: 'https://stackoverflow.com/search?q='
  },
  {
    label: '!torrent',
    desc: 'Oxtorrent.com',
    icon: './client/scss/icons/suggestions/torrent.ico',
    url: 'https://www.oxtorrent.com/recherche/'
  },
  {
    label: '!uc',
    desc: 'Unicode table',
    icon: './client/scss/icons/suggestions/unicode.ico',
    url: 'https://unicode-table.com/en/search/?q='
  },
  {
    label: '!w',
    desc: 'Wikipedia (EN)',
    icon: './client/scss/icons/suggestions/wikipedia.ico',
    url: 'https://en.wikipedia.org/w/index.php?search='
  },
  {
    label: '!wfr',
    desc: 'Wikipedia (FR)',
    icon: './client/scss/icons/suggestions/wikipedia.ico',
    url: 'https://fr.wikipedia.org/w/index.php?search='
  },
  {
    label: '!wt',
    desc: 'Wikitionnary (EN)',
    icon: './client/scss/icons/suggestions/wt.ico',
    url: 'https://en.wiktionary.org/w/index.php?search='
  },
  {
    label: '!wtfr',
    desc: 'Wikitionnary (FR)',
    icon: './client/scss/icons/suggestions/wt.ico',
    url: 'https://fr.wiktionary.org/w/index.php?search='
  },
  {
    label: '!yarn',
    desc: 'Yarn',
    icon: './client/scss/icons/suggestions/yarn.ico',
    url: 'https://yarnpkg.com/en/packages?q='
  },
  {
    label: '!yt',
    desc: 'Youtube',
    icon: './client/scss/icons/suggestions/yt.ico',
    url: 'https://www.youtube.com/results?search_query='
  },{
    label: '!bbc',
    desc: 'BBC News',
    icon: './client/scss/icons/suggestions/bbc.png',
    url: 'https://www.bbc.co.uk/search?q='
  }
];
