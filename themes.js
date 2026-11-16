let midiParserPromise;

function loadMidiParser() {
  if (window.Midi) return Promise.resolve(window.Midi);
  if (!midiParserPromise) {
    midiParserPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.28/build/Midi.js';
      script.onload = () => {
        if (window.Midi) resolve(window.Midi);
        else {
          script.remove();
          reject(new Error('MIDI parser did not expose its constructor'));
        }
      };
      script.onerror = () => {
        script.remove();
        reject(new Error('Unable to load MIDI parser'));
      };
      document.head.appendChild(script);
    }).catch(error => {
      midiParserPromise = undefined;
      throw error;
    });
  }
  return midiParserPromise;
}

document.addEventListener('DOMContentLoaded', () => {
  const title = document.getElementById('gh-title');
  const isFridayTest = new URLSearchParams(window.location.search).has('friday');
  if (title && (new Date().getDay() === 5 || isFridayTest)) {
    title.textContent = 'FREDAGhub';
  }

  const THEME_STORAGE_KEY = 'guinhub-theme-choice';
  const DEFAULT_THEME_ID = 'vinyl-lounge';
  const canadaTheme = {
    id: 'secret-canada',
    name: 'Canada',
    mode: 'light',
    primary: '#B51F35',
    accent: '#176344',
    support: '#A96832',
    atmosphere: '#8BC9D8',
    background: '#D7E9EC',
    surface: '#F5EEDF',
    surfaceSoft: '#E8E3CF',
    text: '#26373B',
    muted: '#48575A',
    onPrimary: '#FFFFFF'
  };
  const themes = [
    {
      id: 'early-internet-97',
      name: "Early Internet '97",
      mode: 'dark',
      primary: '#000080',
      accent: '#000080',
      support: '#008080',
      atmosphere: '#008080',
      background: '#008080',
      surface: '#C0C0C0',
      surfaceSoft: '#D4D0C8',
      text: '#000000',
      muted: '#404040',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'mac-os-7',
      name: 'Mac OS 7',
      mode: 'light',
      primary: '#000000',
      accent: '#000000',
      support: '#808080',
      atmosphere: '#FFFFFF',
      background: '#FFFFFF',
      surface: '#E5E5E5',
      surfaceSoft: '#D5D5D5',
      text: '#000000',
      muted: '#404040',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'summer-99',
      name: "Summer '99",
      mode: 'light',
      primary: '#075563',
      accent: '#A3324C',
      support: '#B23F56',
      atmosphere: '#FFD35C',
      background: '#A8E4E8',
      surface: '#F4DFAF',
      surfaceSoft: '#EED5A0',
      text: '#183D46',
      muted: '#3E5A60',
      onPrimary: '#FFF9E9'
    },
    {
      id: 'halloween-99',
      name: "Halloween '99",
      mode: 'dark',
      primary: '#FFB057',
      accent: '#BDE46B',
      support: '#B48CDE',
      atmosphere: '#6F448D',
      background: '#17151B',
      surface: '#292332',
      surfaceSoft: '#392C40',
      text: '#F5EFF3',
      muted: '#CABDD1',
      onPrimary: '#251529'
    },
    {
      id: 'christmas-99',
      name: "Christmas '99",
      mode: 'dark',
      primary: '#FFE09A',
      accent: '#FFE09A',
      support: '#77B88A',
      atmosphere: '#77B88A',
      background: '#103D2E',
      surface: '#681F32',
      surfaceSoft: '#7A2A3D',
      text: '#FFF8EE',
      muted: '#E7CBC9',
      onPrimary: '#3E1520'
    },
    {
      id: 'vinyl-lounge',
      name: 'Vinyl Lounge',
      mode: 'dark',
      primary: '#F4C430',
      accent: '#F4C430',
      support: '#91A565',
      atmosphere: '#36777C',
      background: '#204247',
      surface: '#292432',
      surfaceSoft: '#382E40',
      text: '#F3EFF3',
      muted: '#D1CDD4',
      onPrimary: '#292432'
    },
    {
      id: 'cobalt-coral',
      name: 'Cobalt Signal',
      mode: 'light',
      primary: '#123D78',
      accent: '#C93262',
      support: '#9A6700',
      background: '#B9C7D6',
      surface: '#E2E8EE',
      surfaceSoft: '#A8B8C9',
      text: '#172533',
      muted: '#445463',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'campus-forest',
      name: 'Campus Bloom',
      mode: 'light',
      primary: '#164B3A',
      accent: '#B96800',
      support: '#A04434',
      background: '#AFC5B8',
      surface: '#E2EBE5',
      surfaceSoft: '#94AC9D',
      text: '#1B2D27',
      muted: '#354E45',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'poolside-clay',
      name: 'Poolside Voltage',
      mode: 'light',
      primary: '#064F5C',
      accent: '#8D3E5C',
      support: '#A86F1F',
      background: '#8FC5CC',
      surface: '#DCE8E8',
      surfaceSoft: '#74ADB5',
      text: '#142D33',
      muted: '#2F4A50',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'academic-plum',
      name: 'Academic Electric',
      mode: 'dark',
      primary: '#FBFF00',
      accent: '#0095FF',
      support: '#9D00FF',
      background: '#071C33',
      surface: '#102A45',
      surfaceSoft: '#183B5C',
      text: '#F2F7FA',
      muted: '#AFC1CF',
      onPrimary: '#101A26'
    },
    {
      id: 'daylight-ink',
      name: 'Daylight Circuit',
      mode: 'light',
      primary: '#293A4A',
      accent: '#9E2F62',
      support: '#25669B',
      background: '#C8BA8E',
      surface: '#E8DFC2',
      surfaceSoft: '#B4A374',
      text: '#252C33',
      muted: '#494942',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'apricot-fjord',
      name: 'Apricot + Fjord',
      mode: 'light',
      primary: '#174E68',
      accent: '#BA4258',
      support: '#8C6500',
      background: '#C4CEC3',
      surface: '#E5EAE3',
      surfaceSoft: '#AEBDAF',
      text: '#1C3037',
      muted: '#45575A',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'quattro-dawn',
      name: 'Quattro Dawn',
      mode: 'light',
      primary: '#64204F',
      accent: '#B92E68',
      support: '#246B78',
      background: '#CFA9B0',
      surface: '#EBD7D8',
      surfaceSoft: '#BA8D99',
      text: '#35232D',
      muted: '#553B47',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'solar-paper',
      name: 'Solar Paper',
      mode: 'light',
      primary: '#5E2A68',
      accent: '#A72D61',
      support: '#176B73',
      background: '#D0C184',
      surface: '#ECE4C3',
      surfaceSoft: '#BCAA68',
      text: '#302633',
      muted: '#554A55',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'rose-horizon',
      name: 'Tetrad Pulse',
      mode: 'dark',
      primary: '#FAC914',
      accent: '#14FA56',
      support: '#FA14B8',
      atmosphere: '#1445FA',
      background: '#111522',
      surface: '#1B2233',
      surfaceSoft: '#252E43',
      text: '#F1F4FA',
      muted: '#AEB8CC',
      onPrimary: '#181A20'
    },
    {
      id: 'windows-11-mica',
      name: 'Windows 11 Explorer',
      mode: 'light',
      primary: '#004A8F',
      accent: '#E6A400',
      support: '#0078D4',
      background: '#A9C8DE',
      surface: '#EAF2F8',
      surfaceSoft: '#94B7D1',
      text: '#172B3A',
      muted: '#374F61',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'macos-aqua',
      name: 'macOS Finder',
      mode: 'light',
      primary: '#075680',
      accent: '#25A4E3',
      support: '#687E8E',
      background: '#C9D1D8',
      surface: '#F0F2F4',
      surfaceSoft: '#B5C0C9',
      text: '#20272D',
      muted: '#4A565F',
      onPrimary: '#FFFFFF'
    },
    {
      id: 'omarchy-default',
      name: 'Omarchy Default',
      mode: 'dark',
      primary: '#9ECE6A',
      accent: '#7AA2F7',
      support: '#7DCFFF',
      background: '#1A1B26',
      surface: '#24283B',
      surfaceSoft: '#292E42',
      text: '#C0CAF5',
      muted: '#9AA5CE',
      onPrimary: '#1A1B26'
    },
    {
      id: 'mint-cinnamon',
      name: 'Linux Mint Cinnamon',
      mode: 'dark',
      primary: '#9BCF65',
      accent: '#E98945',
      support: '#8190A5',
      background: '#1B1D1E',
      surface: '#2B2D2E',
      surfaceSoft: '#3A3C3E',
      text: '#F0F1EE',
      muted: '#B8BCB6',
      onPrimary: '#17200F'
    },
    {
      id: 'ubuntu-aubergine',
      name: 'Ubuntu Aubergine',
      mode: 'dark',
      primary: '#FF9A5A',
      accent: '#78C7F0',
      support: '#8BCF68',
      atmosphere: '#C749C8',
      background: '#48223F',
      surface: '#5A3150',
      surfaceSoft: '#6B3E60',
      text: '#FFF6FB',
      muted: '#D7BCCB',
      onPrimary: '#321125'
    },
    {
      id: 'quattro-sunset',
      name: 'Quattro Sunset',
      mode: 'dark',
      primary: '#FF9A68',
      accent: '#F04D85',
      support: '#B86AE3',
      background: '#19101F',
      surface: '#2A172F',
      surfaceSoft: '#3A2042',
      text: '#F8E8EF',
      muted: '#C6A3B4',
      onPrimary: '#2A111D'
    },
    {
      id: 'solar-rally',
      name: 'Solar Rally',
      mode: 'dark',
      primary: '#F5E57A',
      accent: '#D94A82',
      support: '#8551B5',
      background: '#1A152A',
      surface: '#272038',
      surfaceSoft: '#332A46',
      text: '#F1EAF6',
      muted: '#B5A9C2',
      onPrimary: '#211A24'
    },
    {
      id: 'business-midnight',
      name: 'Business Midnight',
      mode: 'dark',
      primary: '#8BABF1',
      accent: '#FE4C61',
      support: '#D6B95C',
      background: '#0C1424',
      surface: '#131F34',
      surfaceSoft: '#192842',
      text: '#E4EBF8',
      muted: '#9EABC0',
      onPrimary: '#0C1424'
    },
    {
      id: 'campus-nocturne',
      name: 'Campus Nocturne',
      mode: 'dark',
      primary: '#D1D75E',
      accent: '#F06C5B',
      support: '#57B8A5',
      background: '#131B17',
      surface: '#1C2821',
      surfaceSoft: '#28372E',
      text: '#E2E9DE',
      muted: '#A2B09F',
      onPrimary: '#172015'
    },
    {
      id: 'poolside-afterdark',
      name: 'Poolside Afterdark',
      mode: 'dark',
      primary: '#72D4DB',
      accent: '#F07A72',
      support: '#9E71D1',
      background: '#0D2027',
      surface: '#162D34',
      surfaceSoft: '#203C44',
      text: '#DCEDEF',
      muted: '#9DB6BA',
      onPrimary: '#102327'
    },
    {
      id: 'academic-ember',
      name: 'Academic Ember',
      mode: 'dark',
      primary: '#FF7B89',
      accent: '#E8D285',
      support: '#9D65C5',
      background: '#211318',
      surface: '#321C24',
      surfaceSoft: '#422631',
      text: '#F5E5E8',
      muted: '#C2A2AA',
      onPrimary: '#281216'
    },
    {
      id: 'violet-signal',
      name: 'Violet Signal',
      mode: 'dark',
      primary: '#D6A9FF',
      accent: '#F06B8A',
      support: '#D9C55A',
      background: '#181322',
      surface: '#271D32',
      surfaceSoft: '#352640',
      text: '#EEE7F5',
      muted: '#B6A8C2',
      onPrimary: '#21152B'
    }
  ];

  const referenceThemeIds = new Set([
    'omarchy-default',
    'mint-cinnamon',
    'solar-rally',
    'business-midnight'
  ]);

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const num = Number.parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function getThemeById(themeId) {
    return themes.find(theme => theme.id === themeId) || themes.find(theme => theme.id === DEFAULT_THEME_ID);
  }

  const musicToggle = document.getElementById('music-toggle');
  const musicStatus = document.getElementById('music-status');
  const jingleBellsMidi = 'TVRoZAAAAAYAAQADAeBNVHJrAAAAPgD/AydKaW5nbGUgQmVsbHMgLSBHVUlOaHViIGJlbGwgYXJyYW5nZW1lbnQA/1EDBoobAP9YBAQCGAgA/y8ATVRyawAAAeIA/wMMSmluZ2xlIEJlbGxzAMAKAJBAToM9gEAAI5BAToM9gEAAI5BATocdgEAAI5BAToM9gEAAI5BAToM9gEAAI5BATocdgEAAI5BAToM9gEAAI5BDToM9gEMAI5A8ToUtgDwAI5A+ToFNgD4AI5BATo5dgEAAI5BBToM9gEEAI5BBToM9gEEAI5BBToUtgEEAI5BBToFNgEEAI5BBToM9gEEAI5BAToM9gEAAI5BAToM9gEAAI5BAToFNgEAAI5BAToFNgEAAI5BAToM9gEAAI5A+ToM9gD4AI5A+ToM9gD4AI5BAToM9gEAAI5A+TocdgD4AI5BDTocdgEMAI5BAToM9gEAAI5BAToM9gEAAI5BATocdgEAAI5BAToM9gEAAI5BAToM9gEAAI5BATocdgEAAI5BAToM9gEAAI5BDToM9gEMAI5A8ToUtgDwAI5A+ToFNgD4AI5BATo5dgEAAI5BBToM9gEEAI5BBToM9gEEAI5BBToUtgEEAI5BBToFNgEEAI5BBToM9gEEAI5BAToM9gEAAI5BAToM9gEAAI5BAToFNgEAAI5BAToFNgEAAI5BDToM9gEMAI5BDToM9gEMAI5BBToM9gEEAI5A+ToM9gD4AI5A8To5dgDwAAP8vAE1UcmsAAAFaAP8DEENocmlzdG1hcyBjaGltZXMAwAoAkDAmhiCAMACBIJA3H4YggDcAgSCQMCaGIIAwAIEgkDcfhiCANwCBIJAwJoYggDAAgSCQNx+GIIA3AIEgkDAmhiCAMACBIJA3H4YggDcAgSCQNSaGIIA1AIEgkDwfhiCAPACBIJAwJoYggDAAgSCQNx+GIIA3AIEgkDcmhiCANwCBIJA+H4YggD4AgSCQNyaGIIA3AIEgkD4fhiCAPgCBIJAwJoYggDAAgSCQNx+GIIA3AIEgkDAmhiCAMACBIJA3H4YggDcAgSCQMCaGIIAwAIEgkDcfhiCANwCBIJAwJoYggDAAgSCQNx+GIIA3AIEgkDUmhiCANQCBIJA8H4YggDwAgSCQMCaGIIAwAIEgkDcfhiCANwCBIJA3JoYggDcAgSCQPh+GIIA+AIEgkDAmhiCAMACBIJA3H4YggDcAAP8vAA==';
  const diesIraeMidi = 'TVRoZAAAAAYAAQADAeBNVHJrAAAAPAD/AyVEaWVzIGlyYWUgLSBHVUlOaHViIG9yZ2FuIGFycmFuZ2VtZW50AP9RAwy3NQD/WAQEAhgIAP8vAE1UcmsAAAIvAP8DGk1lZGlldmFsIERpZXMgaXJhZSBvcGVuaW5nAMATAJA1SYM4gDUAKJA0SYM4gDQAKJA1SYM4gDUAKJAySYM4gDIAKJA0SYM4gDQAKJAwSYM4gDAAKJAySYM4gDIAKJAySYM4gDIAKJA1SYM4gDUAKJA1SYFIgDUAKJA3SYFIgDcAKJA1SYFIgDUAKJA0SYFIgDQAKJAySYFIgDIAKJAwSYFIgDAAKJA0SYM4gDQAKJA1SYM4gDUAKJA0SYM4gDQAKJAySYM4gDIAKJAtSYM4gC0AKJAwSYFIgDAAKJAySYFIgDIAKJAySYM4gDIAKJAySYFIgDIAKJAwSYFIgDAAKJA0SYM4gDQAKJA1SYM4gDUAKJA0SYM4gDQAKJAySYM4gDIAKJA1SYM4gDUAKJA0SYM4gDQAKJA1SYM4gDUAKJAySYM4gDIAKJA0SYM4gDQAKJAwSYM4gDAAKJAySYM4gDIAKJAySYM4gDIAKJA1SYM4gDUAKJA1SYFIgDUAKJA3SYFIgDcAKJA1SYFIgDUAKJA0SYFIgDQAKJAySYFIgDIAKJAwSYFIgDAAKJA0SYM4gDQAKJA1SYM4gDUAKJA0SYM4gDQAKJAySYM4gDIAKJAtSYM4gC0AKJAwSYFIgDAAKJAySYFIgDIAKJAySYM4gDIAKJAySYFIgDIAKJAwSYFIgDAAKJA0SYM4gDQAKJA1SYM4gDUAKJA0SYM4gDQAKJAySYM4gDIAAP8vAE1UcmsAAACBAP8DEExvdyBvcmdhbiBwZWRhbHMAwBMAkCYbAJAtG50IgCYAAIAtAHiQJhsAkC0bnQiAJgAAgC0AeJAmGwCQLRudCIAmAACALQB4kCYbAJAtG50IgCYAAIAtAHiQJhsAkC0bnQiAJgAAgC0AeJAmGwCQLRudCIAmAACALQAA/y8A';
  const alohaOeMidi = 'TVRoZAAAAAYAAQADAeBNVHJrAAAAPQD/AyZBbG9oYSBPZSAtIEdVSU5odWIgcmVmcmFpbiBhcnJhbmdlbWVudAD/UQMKZ1oA/1gEBAIYCAD/LwBNVHJrAAAA6gD/AxBBbG9oYSBPZSByZWZyYWluAMAajRCQP1KBV4A/ABmQQVKDR4BBABmQRFKDR4BEABmQSVKFN4BJABmQQVKBV4BBABmQP1KDR4A/ABmQRFKDR4BEABmQSFKFN4BIABmQRFKBV4BEABmQQ1KCT4BDABmQQVJfgEEAGZBDUoFXgEMAGZBEUoFXgEQAGZBGUoFXgEYAGZBGUoFXgEYAGZBJUoFXgEkAGZBJUoFXgEkAGZBIUocngEgAGZBEUoU3gEQAGZA/UoFXgD8AGZA/UoNHgD8AGZBBUoNHgEEAGZBEUocngEQAAP8vAE1UcmsAAAHXAP8DHFBsdWNrZWQgaXNsYW5kIGFjY29tcGFuaW1lbnQAwBgAkDgtgTmAOAA3kD8jgTmAPwA3kDwtgTmAPAA3kD8jgTmAPwA3kDgtgTmAOAA3kD8jgTmAPwA3kDwtgTmAPAA3kD8jgTmAPwA3kDUtgTmANQA3kD0jgTmAPQA3kDgtgTmAOAA3kD0jgTmAPQA3kDUtgTmANQA3kD0jgTmAPQA3kDgtgTmAOAA3kD0jgTmAPQA3kDgtgTmAOAA3kD8jgTmAPwA3kDwtgTmAPAA3kD8jgTmAPwA3kDgtgTmAOAA3kD8jgTmAPwA3kDwtgTmAPAA3kD8jgTmAPwA3kDctgTmANwA3kD8jgTmAPwA3kDotgTmAOgA3kD8jgTmAPwA3kDctgTmANwA3kD8jgTmAPwA3kDotgTmAOgA3kD8jgTmAPwA3kDgtgTmAOAA3kD8jgTmAPwA3kDwtgTmAPAA3kD8jgTmAPwA3kDgtgTmAOAA3kD8jgTmAPwA3kDwtgTmAPAA3kD8jgTmAPwA3kDgtgTmAOAA3kD8jgTmAPwA3kDwtgTmAPAA3kD8jgTmAPwA3kDgtgTmAOAA3kD8jgTmAPwA3kDwtgTmAPAA3kD8jgTmAPwAA/y8A';
  const oCanadaMidi = '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AURABEMAEDoABywAA0QAATgAACs6ATdFBEY4AUM1AzoxBUEAZSsABDJBAyY7AjcAOkE4AERBAkMACEYAK0EABkM8AT85AzIAACYABCc4ADNFBUQATToACUMABT8ADScAAj0wATMAADo0AENBBTRJAihCZz0AADoAC0FMADo5AT49ASgAAUMAAzVUASlCBTQAZkEADkE4AEZEYz4AA0YACykABkZCAToAAjw5AD81AilLAR06AkEACjUALUVMCUYANENEBkUANEVIAx0AB0MAEj8AGUZDAkE7AT41ADoyAkUAAzwAACkAAyJCAC5IUEEABkYABT4ACDoAByIAAixSAThIATo9AT5iBC4AZzoACiwAATgAATo7AD9PAjxFAjdWACtJBD4AXjoAATwADD8AADo1AT5GATcAACsAADhAAEFFBSlFADViXToAAjgACz4AATUAASkAAkEABzpAAT9HAENFAjdDAjNUACdJgV06AAA3AAY/AAUnAAY6OwBGRgFBQAAyWAEmRgdDAAEzAIERRgAYRkkIQQAvRgABJgADMgABP0cCMFoAPDkBNzgAJEMDOgBUJAAGMAAbK2JjKwAWMF0VPAADPwACNwBDMAAZMlErMgALM2QrMwAcNU0BKT4DREYBPDwAQT4BODGBWTwAAkEAATgAC0E8ACxOAUhLACA+ADxDASkAB0QAAjUAgQ1IABdITyQgAAJBAAEsABAuSQEiRQNBSQI6KgI+KwRIAAI8AGMuAAEiAAcpTHApAAcuSXNBAAI+AAI6AAIuAAczVCszAA81ZCs1ABI/RABGRQA3VAErQQA6OIFsPwAHQ0IAM0kAPUMAR0sAJz4COgABNwAGKwAcRgCBAUcADEdVNzMAA0hJAURAAUcAADhEAD8pAiw4ADw4AT0AA0MAAScASSwAEzwAAz8AA0QAATgABz81AUQ+ATwzAylGAR0/AkgAXR0AAikAEytGAB9FAUNFADo2ATwAAT8AAEA2BEQAVisACx8AC0AABToAAEFLASxEADgrACA7ADw9BUMAaTwAATgAASAAAiwABTorAT9GAjdEAkEAAi5EACJBgWcuAAAiAAE/AAQ3AAYuPwFBSQAiNgY4LwE+NYFeLgADPgAEIgAAOAAAM0ABJzoAP0IAQz8CNzcJQQBdMwAHJwAGLkUDIkJrLgABIgAEJ08AM1NtMwADJwAG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';
  const seasonalMusic = {
    'secret-canada': { title: 'O Canada', midi: oCanadaMidi, voice: 'midi' },
    'summer-99': { title: 'Aloha \u02BBOe - Lili\u02BBuokalani', midi: alohaOeMidi, voice: 'island' },
    'christmas-99': { title: 'Jingle Bells', midi: jingleBellsMidi, voice: 'bells' },
    'halloween-99': { title: 'Dies irae - middelalderlig melodi', midi: diesIraeMidi, voice: 'organ' }
  };
  const parsedMusic = new Map();
  let musicContext;
  let musicScheduleTimer;
  let musicRequest = 0;
  let scheduledMusicNodes = new Set();
  let musicEvents = [];
  let musicDuration = 0;
  let musicStartTime = 0;
  let musicNoteIndex = 0;
  let musicLoopIndex = 0;
  musicToggle.checked = false;

  function scheduleMidiNote(event, startTime, song) {
    const { note, instrument } = event;
    const isOrgan = song.voice === 'organ';
    const isIsland = song.voice === 'island';
    const isIslandLead = isIsland && instrument === 26;
    const isStringTrack = song.voice === 'midi' && instrument === 48;
    const isPianoTrack = song.voice === 'midi' && instrument === 0;
    const endTime = startTime + Math.max(note.duration, 0.04) + 0.18;
    const partials = isOrgan || isIsland || isStringTrack ? [1, 2, 3] : [1, 2.76];

    partials.forEach((partial, index) => {
      const oscillator = musicContext.createOscillator();
      const gain = musicContext.createGain();
      const frequency = 440 * 2 ** ((note.midi - 69) / 12) * partial;
      oscillator.frequency.value = frequency;
      if (isIslandLead) {
        oscillator.frequency.setValueAtTime(frequency * 0.985, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency, startTime + 0.075);
      }

      gain.gain.setValueAtTime(0, startTime);
      if (isStringTrack) {
        const volume = note.velocity * (index === 0 ? 0.12 : index === 1 ? 0.035 : 0.015);
        const attack = Math.min(0.14, note.duration * 0.4);
        gain.gain.linearRampToValueAtTime(volume, startTime + attack);
        gain.gain.linearRampToValueAtTime(volume * 0.88, Math.max(startTime + attack, endTime - 0.2));
      } else if (isIsland) {
        const volume = note.velocity * (index === 0 ? 0.14 : 0.025);
        const attack = isIslandLead ? 0.025 : 0.004;
        gain.gain.linearRampToValueAtTime(volume, startTime + attack);
        gain.gain.exponentialRampToValueAtTime(isIslandLead ? volume * 0.45 : 0.0001, endTime - 0.08);
      } else if (isOrgan) {
        const volume = note.velocity * (index === 0 ? 0.12 : 0.025);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.06);
        gain.gain.linearRampToValueAtTime(volume * 0.8, Math.max(startTime + 0.06, endTime - 0.28));
      } else {
        const volume = note.velocity * (index === 0 ? 0.14 : 0.035);
        gain.gain.linearRampToValueAtTime(volume, startTime + (isPianoTrack ? 0.004 : 0.008));
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime - 0.01);
      }
      gain.gain.linearRampToValueAtTime(0, endTime);
      oscillator.connect(gain);
      gain.connect(musicContext.destination);
      const activeNode = { oscillator, gain };
      scheduledMusicNodes.add(activeNode);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        scheduledMusicNodes.delete(activeNode);
      };
      oscillator.start(startTime);
      oscillator.stop(endTime);
    });
  }

  function scheduleUpcomingNotes(request, song) {
    if (request !== musicRequest || !musicToggle.checked || !musicEvents.length) return;
    const scheduleUntil = musicContext.currentTime + 0.35;

    while (true) {
      if (musicNoteIndex >= musicEvents.length) {
        musicNoteIndex = 0;
        musicLoopIndex++;
      }
      const event = musicEvents[musicNoteIndex];
      const startTime = musicStartTime + musicLoopIndex * musicDuration + event.time;
      if (startTime > scheduleUntil) return;
      scheduleMidiNote(event, startTime, song);
      musicNoteIndex++;
    }
  }

  function stopSeasonalMusic() {
    musicRequest++;
    musicToggle.checked = false;
    musicStatus.hidden = true;
    window.clearInterval(musicScheduleTimer);
    musicScheduleTimer = undefined;
    scheduledMusicNodes.forEach(({ oscillator, gain }) => {
      try {
        oscillator.stop();
      } catch (error) {
      }
      oscillator.disconnect();
      gain.disconnect();
    });
    scheduledMusicNodes.clear();
    musicEvents = [];
    if (musicContext) musicContext.suspend().catch(() => {});
  }

  musicToggle.addEventListener('change', async () => {
    const themeId = document.documentElement.dataset.themeId;
    const song = seasonalMusic[themeId];
    if (!musicToggle.checked || !song) {
      stopSeasonalMusic();
      return;
    }

    const request = ++musicRequest;
    musicStatus.textContent = 'Indlæser musik...';
    musicStatus.hidden = false;
    try {
      musicContext ||= new AudioContext();
      await musicContext.resume();
      if (request !== musicRequest) return;
      const Midi = await loadMidiParser();
      if (request !== musicRequest) return;
      let midi = parsedMusic.get(themeId);
      if (!midi) {
        midi = new Midi(Uint8Array.from(atob(song.midi), character => character.charCodeAt(0)));
        parsedMusic.set(themeId, midi);
      }
      const events = midi.tracks.flatMap(track => track.notes.map(note => ({ note, instrument: track.instrument.number })));
      const firstNoteTime = Math.min(...events.map(event => event.note.time));
      musicEvents = events.map(event => ({ ...event, time: event.note.time - firstNoteTime }))
        .sort((left, right) => left.time - right.time);
      musicDuration = midi.duration - firstNoteTime;
      musicStartTime = musicContext.currentTime + 0.04;
      musicNoteIndex = 0;
      musicLoopIndex = 0;
      scheduleUpcomingNotes(request, song);
      musicScheduleTimer = window.setInterval(() => scheduleUpcomingNotes(request, song), 100);
      musicStatus.hidden = true;
    } catch (error) {
      if (request !== musicRequest) return;
      console.error('Unable to start theme music:', error);
      stopSeasonalMusic();
      parsedMusic.delete(themeId);
      musicStatus.textContent = 'Musikken kunne ikke startes. Prøv igen.';
      musicStatus.hidden = false;
    }
  });

  window.addEventListener('pagehide', stopSeasonalMusic);

  const seasonalEffects = {
    'christmas-99': {
      label: 'Sne', className: 'gh-snow', symbols: ['\u2744', '\u2745', '\u2746', '*'],
      count: 48, minSize: 12, minOpacity: 0.4, opacityRange: 0.45
    },
    'halloween-99': {
      label: 'Uhygge', className: 'gh-snow gh-halloween', symbols: ['\u{1F987}', '\u{1F383}'],
      count: 30, minSize: 24, minOpacity: 0.65, opacityRange: 0.3
    },
    'summer-99': {
      label: 'Sommer', className: 'gh-snow gh-summer', symbols: ['\u26F1\uFE0F', '\u{1F379}', '\u{1F334}'],
      count: 24, minSize: 26, minOpacity: 0.7, opacityRange: 0.25
    },
    'secret-canada': {
      label: 'Eh?', className: 'gh-snow gh-canada', symbols: ['\u{1F341}', '\u{1F3D2}', '\u{1F9AB}', '\u{1FAD9}', '\u{1F1E8}\u{1F1E6}', '\u{1F95E}', 'Eh?', 'Sorry', 'Toque', 'Loonie', 'Toonie', 'Double-double', 'Timmies', 'Timbits', 'Poutine', 'Canuck', 'Tabarnak', "Give'r", 'Bunnyhug'],
      count: 36, minSize: 24, minOpacity: 0.75, opacityRange: 0.25, wordStartIndex: 6
    }
  };

  function updateSeasonalEffects(themeId) {
    const effects = seasonalEffects[themeId];
    const snowToggle = document.getElementById('snow-toggle');
    document.getElementById('snow-control').hidden = !effects;
    document.getElementById('effects-label').textContent = effects ? effects.label : 'Sne';
    document.getElementById('seasonal-effects')?.remove();
    if (!effects || !snowToggle.checked) return;

    const snow = document.createElement('div');
    snow.id = 'seasonal-effects';
    snow.className = effects.className;
    snow.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < effects.count; index++) {
      const flake = document.createElement('span');
      flake.className = 'gh-snowflake';
      flake.textContent = effects.symbols[index % effects.symbols.length];
      if (effects.wordStartIndex !== undefined && index % effects.symbols.length >= effects.wordStartIndex) {
        flake.classList.add('gh-canada-word');
      }
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.fontSize = `${effects.minSize + Math.random() * 16}px`;
      flake.style.opacity = `${effects.minOpacity + Math.random() * effects.opacityRange}`;
      flake.style.animationDuration = `${10 + Math.random() * 14}s`;
      flake.style.animationDelay = `${-Math.random() * 24}s`;
      flake.style.setProperty('--snow-drift', `${Math.random() * 100 - 50}px`);
      snow.appendChild(flake);
    }

    document.body.appendChild(snow);
  }

  function applyTheme(theme) {
    const { primary, accent } = theme;
    const rootStyle = document.documentElement.style;
    const primaryRgb = hexToRgb(primary);
    const accentRgb = hexToRgb(accent);
    const supportRgb = hexToRgb(theme.support || accent);
    const atmosphereRgb = hexToRgb(theme.atmosphere || theme.support || accent);
    const darkMode = theme.mode === 'dark';
    const isReferenceTheme = referenceThemeIds.has(theme.id);

    document.documentElement.dataset.themeMode = theme.mode;
    document.documentElement.dataset.themeId = theme.id;
    rootStyle.setProperty('color-scheme', theme.mode);
    rootStyle.setProperty('--page-bg', theme.background);
    rootStyle.setProperty('--page-blue', primary);
    rootStyle.setProperty('--page-blue-light', primary);
    rootStyle.setProperty('--page-accent', accent);
    rootStyle.setProperty('--page-support', theme.support || accent);
    rootStyle.setProperty('--page-text', theme.text);
    rootStyle.setProperty('--page-muted', theme.muted);
    rootStyle.setProperty('--page-surface', theme.surface);
    rootStyle.setProperty('--page-surface-soft', theme.surfaceSoft);
    rootStyle.setProperty('--page-border-soft', darkMode ? 'rgba(255, 255, 255, 0.13)' : `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.16)`);
    rootStyle.setProperty('--page-shadow', darkMode ? '0 14px 32px rgba(0, 0, 0, 0.45)' : '0 10px 28px rgba(0, 0, 0, 0.10)');
    rootStyle.setProperty('--page-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    rootStyle.setProperty('--page-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    rootStyle.setProperty('--page-support-rgb', `${supportRgb.r}, ${supportRgb.g}, ${supportRgb.b}`);
    rootStyle.setProperty('--page-atmosphere-rgb', `${atmosphereRgb.r}, ${atmosphereRgb.g}, ${atmosphereRgb.b}`);
    rootStyle.setProperty('--page-atmosphere-alpha', isReferenceTheme ? '0' : (darkMode ? '0.08' : '0.22'));
    rootStyle.setProperty('--theme-on-primary', theme.onPrimary);
    rootStyle.setProperty('--page-pill-bg', `rgba(${supportRgb.r}, ${supportRgb.g}, ${supportRgb.b}, ${darkMode ? 0.18 : 0.2})`);
    rootStyle.setProperty('--page-pill-text', theme.text);
    rootStyle.setProperty('--page-icon-color', accent);
    updateSeasonalEffects(theme.id);
    const song = seasonalMusic[theme.id];
    document.getElementById('music-control').hidden = !song;
    document.getElementById('music-control').title = song ? song.title : '';
    stopSeasonalMusic();
    if (theme.id === canadaTheme.id) {
      musicToggle.checked = true;
      musicToggle.dispatchEvent(new Event('change'));
    }
  }

  function reportThemeStorageError(error) {
    console.error('Unable to save or restore theme preference:', error);
    const status = document.getElementById('portal-status');
    status.hidden = false;
    status.textContent = 'Dine valg kan ikke gemmes eller gendannes i denne browser.';
  }

  function getInitialThemeId() {
    try {
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId && themes.some(theme => theme.id === savedThemeId)) {
        return savedThemeId;
      }
    } catch (error) {
      reportThemeStorageError(error);
    }
    return DEFAULT_THEME_ID;
  }

  function setupThemeSelector() {
    const themeSelect = document.getElementById('theme-select');
    if (!themeSelect) return;

    ['light', 'dark', 'vintage', 'seasonal'].forEach(category => {
      const group = document.createElement('optgroup');
      group.label = {
        seasonal: 'Seasonal',
        vintage: 'Vintage OS',
        light: 'Light themes',
        dark: 'Dark themes'
      }[category];
      themes.filter(theme => {
        const themeCategory = seasonalEffects[theme.id]
          ? 'seasonal'
          : ['early-internet-97', 'mac-os-7'].includes(theme.id)
            ? 'vintage'
            : theme.mode;
        return themeCategory === category;
      }).forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.id;
        option.textContent = theme.name;
        group.appendChild(option);
      });
      themeSelect.appendChild(group);
    });

    function restoreTheme() {
      const themeId = getInitialThemeId();
      themeSelect.value = themeId;
      if (document.documentElement.dataset.themeId !== themeId) {
        applyTheme(getThemeById(themeId));
      }
    }

    restoreTheme();
    window.addEventListener('pageshow', restoreTheme);

    themeSelect.addEventListener('change', () => {
      const selectedThemeId = themeSelect.value;
      applyTheme(getThemeById(selectedThemeId));
      try {
        localStorage.setItem(THEME_STORAGE_KEY, selectedThemeId);
      } catch (error) {
        reportThemeStorageError(error);
      }
    });
  }

  setupThemeSelector();

  document.getElementById('snow-toggle').addEventListener('change', () => {
    updateSeasonalEffects(document.documentElement.dataset.themeId);
  });

  document.getElementById('canada-theme-trigger').addEventListener('click', () => {
    const themeSelect = document.getElementById('theme-select');
    const nextTheme = document.documentElement.dataset.themeId === canadaTheme.id
      ? getThemeById(themeSelect.value)
      : canadaTheme;
    applyTheme(nextTheme);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  });

});
