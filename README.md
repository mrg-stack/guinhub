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
  - Top-right hamburger opens a compact settings pane with a directly accessible theme selector, Filter, and “Vis kun favoritter”; Escape or clicking outside closes the pane
  - Filter panel inside the menu for finding portal links by name, description, or section; Escape closes it
  - Star buttons add or remove browser-local favourites in a dedicated shortcuts row
  - Always-visible Favorites handles support mouse/touch dragging and arrow-key reordering; the order is saved in the current browser
  - “Vis kun favoritter” hides all other link sections, including their headings, without changing their saved open/closed state; the checkbox choice persists across reloads in the current browser
  - Keyboard-accessible toggles for every link section and semester subsection, with remembered open/closed state
  - “Er det fredag?” automatic status
  - Mailto links to quickly contact the team or the class

---

## 📦 Files

- [index.html](index.html) → Main web portal page
- [index.css](index.css) → Theme and layout styling
- [portal.js](portal.js) → Link filtering, favourites, and semester preferences
- Uses:
  - **Bootstrap Icons** via CDN
  - **System fonts**
  - **Static HTML, CSS, and JavaScript** with no backend

Favourites and expanded sections are stored only in the current browser. The current semester and its roles start expanded on a first visit. Filtering temporarily reveals matching semester links without changing saved expansion preferences. Storage errors are reported on the page.

The upcoming **2. Sem ØIT-GBG-DA-E26** section follows HR and mirrors the E25 shared links, Hold A/B groups, and semester roles. It is marked WIP and starts collapsed. Pending links are inactive and cannot be favourited; only GUINark is linked, opening the F27 planning workbook in desktop Excel. Semester role assignments remain blank.

## Analytics

Umami Cloud tracks pageviews on `mrg-stack.github.io`. The tracking script and custom events are restricted to that hostname so local previews do not send analytics events. Page URL query strings and fragments are excluded.

Custom events in the Umami dashboard:

| Event | Properties | Meaning |
| --- | --- | --- |
| `link-click: Outlook [office-links]` | `link`, `section` | Shortcut activation, including favourites, keyboard activation, and middle-clicks |
| `favourite-added: Outlook [office-links]` | `link`, `section` | A shortcut was added to favourites |
| `favourite-removed: Outlook [office-links]` | `link`, `section` | A shortcut was removed from favourites |
| `theme-active: vinyl-lounge` | `theme` | Active theme once per page load, including restored preferences |
| `theme-changed: cobalt-coral` | `theme` | Active theme changed, including the special Canada theme |

Event names include the item so counts can be compared directly in the dashboard's Events list without opening property breakdowns. The names above are examples; each shortcut/theme has its own event. Section IDs distinguish identically named shortcuts in different semesters. Older action-only events remain in historical data and are not renamed.

Custom properties contain only shortcut titles, section IDs, and theme IDs, not destination URLs, email addresses, names, search text, or the saved favourites list. Favourite events measure changes, not the number of people currently favouriting a shortcut; existing favourites are not uploaded. Links with zero clicks will not appear in event reports. Analytics blockers may prevent collection; portal functionality does not depend on analytics being available.

## Link checks

[Check public links](.github/workflows/check-links.yml) runs weekly, on relevant changes, and manually through GitHub Actions. Run it locally with Node.js 22 or newer:

```sh
node scripts/check-links.mjs
node --test tests/check-links.test.mjs
```

The checker tests an explicit allowlist of public-resource hosts. Login-dependent services (including Office, EK internal systems, and mail/desktop deep links) require manual verification. HTTP 401, 403, and 429 responses are labelled for review rather than treated as broken links; other unsuccessful responses and network failures fail the check. Results appear in the workflow summary. Update the allowlist in [scripts/check-links.mjs](scripts/check-links.mjs) when adding new public-resource hosts.

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
