document.addEventListener('DOMContentLoaded', () => {
  const status = document.getElementById('portal-status');
  function reportStorageError(error) {
    console.error('Unable to save or restore portal preferences:', error);
    status.hidden = false;
    status.textContent = 'Dine valg kan ikke gemmes eller gendannes i denne browser.';
  }
  function readPreference(key, validate, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      if (!validate(value)) throw new Error(`Invalid preference: ${key}`);
      return value;
    } catch (error) {
      reportStorageError(error);
      return fallback;
    }
  }
  function savePreference(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      reportStorageError(error);
    }
  }

  const sectionKey = 'guinhub-open-sections';
  const openSections = new Set(readPreference(sectionKey,
    value => Array.isArray(value) && value.every(id => typeof id === 'string'),
    ['f26-content', 'f26-roles-content']));
  const collapsibles = [];
  function setExpanded(entry, expanded) {
    entry.button.setAttribute('aria-expanded', String(expanded));
    entry.content.hidden = !expanded;
    entry.content.dataset.open = String(expanded);
    entry.content.style.maxHeight = expanded ? 'none' : '0px';
    entry.content.style.overflow = expanded ? 'visible' : 'hidden';
  }
  document.querySelectorAll('.collapsible-header').forEach(header => {
    const content = document.getElementById(header.dataset.target);
    const title = header.querySelector('.gh-section-title');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gh-section-toggle';
    button.setAttribute('aria-controls', content.id);
    const chevron = document.createElement('i');
    chevron.className = 'bi bi-chevron-right';
    chevron.setAttribute('aria-hidden', 'true');
    button.append(chevron, document.createTextNode(title.textContent));
    title.replaceChildren(button);
    const entry = { button, content };
    collapsibles.push(entry);
    setExpanded(entry, openSections.has(content.id));
    header.addEventListener('click', event => {
      if (event.target.closest('button') !== button) button.click();
    });
    button.addEventListener('click', () => {
      if (openSections.has(content.id)) openSections.delete(content.id);
      else openSections.add(content.id);
      savePreference(sectionKey, [...openSections]);
      setExpanded(entry, openSections.has(content.id));
    });
  });

  const favouriteKey = 'guinhub-favourites';
  const favourites = new Set(readPreference(favouriteKey,
    value => Array.isArray(value) && value.every(url => typeof url === 'string'), []));
  const cards = [...document.querySelectorAll('.link-card')];
  const sections = [...document.querySelectorAll('.page-wrapper > section:not(#favourites-section)')];
  const favouritesGrid = document.getElementById('favourites-grid');
  const favouritesSection = document.getElementById('favourites-section');
  const filter = document.getElementById('link-filter');
  const filterToggle = document.getElementById('filter-toggle');
  const filterPanel = document.getElementById('link-filter-panel');
  const filterStatus = document.getElementById('filter-status');
  const normalise = text => text.toLocaleLowerCase('da').normalize('NFD').replace(/\p{M}/gu, '');
  const entries = cards.map(card => {
    const link = card.querySelector('a');
    const section = sections.find(section => section.contains(card));
    return {
      card, url: link.getAttribute('href'),
      title: card.querySelector('.link-card-title').textContent,
      search: normalise(`${link.textContent} ${section.querySelector('.gh-section-title').textContent}`)
    };
  });

  function addFavouriteButton(card, entry) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gh-favourite';
    const selected = favourites.has(entry.url);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'Fjern' : 'Tilføj'} ${entry.title} ${selected ? 'fra' : 'til'} favoritter`);
    const icon = document.createElement('i');
    icon.className = selected ? 'bi bi-star-fill' : 'bi bi-star';
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon);
    button.addEventListener('click', () => {
      const inFavourites = card.parentElement === favouritesGrid;
      if (favourites.has(entry.url)) favourites.delete(entry.url);
      else favourites.add(entry.url);
      savePreference(favouriteKey, [...favourites]);
      renderFavourites();
      applyFilter();
      const focusCard = inFavourites ? favouritesGrid.querySelector('.link-card:not([hidden])') : entry.card;
      const focusButton = focusCard?.getClientRects().length
        ? focusCard.querySelector('.gh-favourite') : filterToggle;
      focusButton.focus({ preventScroll: true });
    });
    card.append(button);
  }
  function renderFavourites() {
    favouritesGrid.replaceChildren();
    const rendered = new Set();
    entries.forEach(entry => {
      entry.card.querySelector('.gh-favourite')?.remove();
      addFavouriteButton(entry.card, entry);
      if (!favourites.has(entry.url) || rendered.has(entry.url)) return;
      rendered.add(entry.url);
      const clone = entry.card.cloneNode(true);
      clone.hidden = false;
      clone.querySelector('.gh-favourite').remove();
      addFavouriteButton(clone, entry);
      favouritesGrid.append(clone);
    });
    favouritesSection.hidden = favouritesGrid.children.length === 0;
  }
  function applyFilter() {
    const terms = normalise(filter.value.trim()).split(/\s+/).filter(Boolean);
    entries.forEach(entry => {
      entry.card.hidden = !terms.every(term => entry.search.includes(term));
    });
    sections.forEach(section => {
      section.hidden = !entries.some(entry => section.contains(entry.card) && !entry.card.hidden);
    });
    collapsibles.forEach(entry => {
      const hasCards = entry.content.querySelector('.link-card');
      setExpanded(entry, terms.length
        ? Boolean(hasCards && entry.content.querySelector('.link-card:not([hidden])'))
        : openSections.has(entry.content.id));
    });
    [...favouritesGrid.children].forEach(card => {
      const entry = entries.find(entry => entry.url === card.querySelector('a').getAttribute('href'));
      card.hidden = entry.card.hidden;
    });
    favouritesSection.hidden = !favouritesGrid.querySelector('.link-card:not([hidden])');
    const count = entries.filter(entry => !entry.card.hidden).length;
    filterStatus.textContent = terms.length ? `${count} links fundet` : '';
  }
  filterToggle.addEventListener('click', () => {
    filterPanel.hidden = !filterPanel.hidden;
    filterToggle.setAttribute('aria-expanded', String(!filterPanel.hidden));
    if (!filterPanel.hidden) filter.focus();
    else {
      filter.value = '';
      applyFilter();
    }
  });
  filter.addEventListener('input', applyFilter);
  document.getElementById('filter-clear').addEventListener('click', () => {
    filter.value = '';
    applyFilter();
    filter.focus();
  });
  filterPanel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      filterToggle.click();
      filterToggle.focus();
    }
  });
  renderFavourites();
});
