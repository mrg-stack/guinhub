# GUINhub

**GUINhub** is a lightweight internal web portal for the Økonomi & IT program at **Erhvervsakademi København (EK)**.  
It provides quick links to important tools and resources for both **teachers** and **students**.

---

## 🎯 Features

- **Quick access to tools**
  - Itslearning, SharePoint, SDBF, Outlook
  - Excel group sheets (opens in desktop app)
  - ChatGPT shortcut
  - HR and TimeEdit links

- **Course-specific shortcuts**
  - 2nd Semester ØKonomi & IT (GBG-F25) topics
  - Direct access to guidance and group Excel sheets

- **Utilities**
  - DuckDuckGo search bar
  - “Er det fredag?” automatic status
  - Mailto links to quickly contact the team or the class

---

## 📦 Files

- `ek.html` → Main web portal page
- Uses:
  - **Bootstrap Icons** via CDN
  - **Google Fonts (Roboto)**
  - **Inline CSS** for easy standalone deployment

---

## 🚀 Hosting on GitHub Pages 
Latest version of the site is live at:
https://mrg-stack.github.io/guinhub/

## Seasonal Music

- Secret Canada: [O Canada](midi/o-canada.mid), using the supplied strings-and-piano MIDI arrangement. The anthem melody is public domain. [Melody and history](https://en.wikipedia.org/wiki/O_Canada).
- Summer '99: [Aloha Oe](midi/aloha-oe.mid), a new instrumental loop based on the opening refrain of the public-domain song by Queen Lili'uokalani (1878), with plucked accompaniment and a sliding lead. [Song history](https://en.wikipedia.org/wiki/Aloha_%CA%BBOe).
- Christmas '99: [Jingle Bells](midi/jingle-bells.mid), a new bell arrangement of the public-domain melody by James Lord Pierpont (1857).
- Halloween '99: [Dies irae](midi/dies-irae.mid), a new organ arrangement of the opening phrases of the public-domain medieval Gregorian chant. [Melody and historical background](https://en.wikipedia.org/wiki/Dies_irae#13th-century_Gregorian_chant).

The seasonal arrangements other than O Canada were generated for this site. Playback uses the pinned `@tonejs/midi` parser and Web Audio synthesis. Embedded base64 copies in [index.html](index.html) allow playback from a local file URL; keep them byte-identical to the MIDI files when changing the music. Music is opt-in and stops when changing themes. Seasonal effects respect reduced-motion preferences.

