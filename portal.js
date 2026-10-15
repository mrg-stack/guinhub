document.addEventListener('DOMContentLoaded', () => {
  function trackEvent(name, data) {
    if (location.hostname !== 'mrg-stack.github.io' || !window.umami?.track) return;
    window.umami.track(name, data)?.catch(error => {
      console.warn('Unable to send portal analytics event:', error);
    });
  }
  let activeTheme = document.documentElement.dataset.themeId;
  if (activeTheme) trackEvent('theme-active', { theme: activeTheme });
  const themeObserver = new MutationObserver(() => {
    const theme = document.documentElement.dataset.themeId;
    if (!theme || theme === activeTheme) return;
    trackEvent(activeTheme ? 'theme-changed' : 'theme-active', { theme });
    activeTheme = theme;
  });
  themeObserver.observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme-id']
  });

  const menuToggle = document.getElementById('menu-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const menu = menuToggle.closest('.gh-menu');
  function setMenuOpen(open) {
    settingsPanel.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
  }
  menuToggle.addEventListener('click', () => setMenuOpen(settingsPanel.hidden));
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) setMenuOpen(false);
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !settingsPanel.hidden) {
      event.preventDefault();
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

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

  const sectionKey = 'guinhub-open-sections-v2';
  const previousOpenSections = readPreference('guinhub-open-sections',
    value => Array.isArray(value) && value.every(id => typeof id === 'string'), []);
  const sectionDefaults = [
    'ek-links', 'office-links', 'development-links', 'hr-links',
    'f26-content', 'f26-roles-content', 'e25a-links', 'e25b-links'
  ];
  const openSections = new Set(readPreference(sectionKey,
    value => Array.isArray(value) && value.every(id => typeof id === 'string'),
    [...new Set([...previousOpenSections, ...sectionDefaults])]));
  const collapsibles = [];
  const favouritesOnly = document.getElementById('favourites-only');
  const favouritesOnlyKey = 'guinhub-favourites-only';
  let favouritesOnlyMode = readPreference(favouritesOnlyKey, value => typeof value === 'boolean', false);
  favouritesOnly.checked = favouritesOnlyMode;
  function setFavouritesOnly(enabled) {
    favouritesOnlyMode = enabled;
    favouritesOnly.checked = enabled;
    savePreference(favouritesOnlyKey, enabled);
  }
  function setExpanded(entry, expanded) {
    entry.button.setAttribute('aria-expanded', String(expanded));
    entry.content.hidden = !expanded;
    entry.content.dataset.open = String(expanded);
    entry.content.style.maxHeight = expanded ? 'none' : '0px';
    entry.content.style.overflow = expanded ? 'visible' : 'hidden';
  }
  document.querySelectorAll('.collapsible-header').forEach(header => {
    const content = document.getElementById(header.dataset.target);
    const title = header.matches('.gh-section-title') ? header : header.querySelector('.gh-section-title');
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
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      if (favouritesOnlyMode) {
        setFavouritesOnly(false);
        openSections.clear();
      }
      if (isExpanded) openSections.delete(content.id);
      else openSections.add(content.id);
      savePreference(sectionKey, [...openSections]);
      applyFilter();
    });
  });

  const favouriteKey = 'guinhub-favourites';
  const favourites = new Set(readPreference(favouriteKey,
    value => Array.isArray(value) && value.every(url => typeof url === 'string'), []));
  const cards = [...document.querySelectorAll('.link-card')];
  const sections = [...document.querySelectorAll('.page-wrapper > section:not(#favourites-section)')];
  const favouritesGrid = document.getElementById('favourites-grid');
  const favouritesSection = document.getElementById('favourites-section');
  const favouritesEmpty = document.getElementById('favourites-empty');
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
      section: link.closest('.collapsible-content').id,
      search: normalise(`${link.textContent} ${section.querySelector('.gh-section-title').textContent} ${card.closest('.e25-column')?.querySelector('h3')?.textContent || ''}`)
    };
  });

  function trackLinkClick(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target.closest('.link-card a');
    if (!link) return;
    const entry = entries.find(entry => entry.url === link.getAttribute('href'));
    if (entry) trackEvent('link-click', { link: entry.title, section: entry.section });
  }
  document.addEventListener('click', trackLinkClick);
  document.addEventListener('auxclick', trackLinkClick);

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
      trackEvent(favourites.has(entry.url) ? 'favourite-added' : 'favourite-removed',
        { link: entry.title, section: entry.section });
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
    entries.forEach(entry => {
      entry.card.querySelector('.gh-favourite')?.remove();
      addFavouriteButton(entry.card, entry);
    });
    favourites.forEach(url => {
      const entry = entries.find(entry => entry.url === url);
      if (!entry) return;
      const clone = entry.card.cloneNode(true);
      clone.hidden = false;
      clone.querySelector('.gh-favourite').remove();
      addFavouriteButton(clone, entry);
      addDragHandle(clone, entry);
      favouritesGrid.append(clone);
    });
    updateFavouritesVisibility();
  }
  function moveFavourite(card, target) {
    const children = [...favouritesGrid.children];
    const forward = children.indexOf(card) < children.indexOf(target);
    favouritesGrid.insertBefore(card, forward ? target.nextSibling : target);
    favourites.clear();
    [...favouritesGrid.children].forEach(item => {
      favourites.add(item.querySelector('a').getAttribute('href'));
    });
    savePreference(favouriteKey, [...favourites]);
    const position = [...favouritesGrid.children].indexOf(card) + 1;
    document.getElementById('favourites-order-status').textContent =
      `${card.querySelector('.link-card-title').textContent}: plads ${position} af ${favourites.size}`;
  }
  function addDragHandle(card, entry) {
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'gh-drag-handle';
    handle.setAttribute('aria-label', `Flyt ${entry.title}`);
    handle.setAttribute('aria-describedby', 'favourites-reorder-help');
    handle.title = 'Træk for at flytte, eller brug piletasterne';
    const icon = document.createElement('i');
    icon.className = 'bi bi-three-dots-vertical';
    icon.setAttribute('aria-hidden', 'true');
    handle.append(icon);
    card.append(handle);
    let pointerId = null;
    let dropTarget = null;
    function finishDrag(event) {
      if (event.pointerId !== pointerId) return;
      const target = dropTarget;
      pointerId = null;
      dropTarget?.classList.remove('gh-drop-target');
      dropTarget = null;
      card.classList.remove('gh-dragging');
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      if (event.type === 'pointerup' && target) moveFavourite(card, target);
    }
    handle.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      handle.focus({ preventScroll: true });
      pointerId = event.pointerId;
      handle.setPointerCapture(pointerId);
      card.classList.add('gh-dragging');
    });
    handle.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.link-card');
      dropTarget?.classList.remove('gh-drop-target');
      dropTarget = target && target !== card && target.parentElement === favouritesGrid ? target : null;
      dropTarget?.classList.add('gh-drop-target');
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => {
      handle.addEventListener(type, finishDrag);
    });
    handle.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const visible = [...favouritesGrid.children].filter(item => !item.hidden);
      const direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
      const target = visible[visible.indexOf(card) + direction];
      if (target) moveFavourite(card, target);
    });
  }
  function updateFavouritesVisibility() {
    const hasFavourites = favouritesGrid.children.length > 0;
    favouritesSection.hidden = !hasFavourites && !favouritesOnlyMode;
    favouritesEmpty.hidden = hasFavourites || !favouritesOnlyMode;
  }
  function applyFilter() {
    const terms = normalise(filter.value.trim()).split(/\s+/).filter(Boolean);
    entries.forEach(entry => {
      entry.card.hidden = !terms.every(term => entry.search.includes(term));
    });
    sections.forEach(section => {
      section.hidden = favouritesOnlyMode || !entries.some(entry => section.contains(entry.card) && !entry.card.hidden);
    });
    collapsibles.forEach(entry => {
      const hasCards = entry.content.querySelector('.link-card');
      const hasMatches = Boolean(hasCards && entry.content.querySelector('.link-card:not([hidden])'));
      setExpanded(entry, !favouritesOnlyMode && (terms.length ? hasMatches : openSections.has(entry.content.id)));
    });
    [...favouritesGrid.children].forEach(card => {
      const entry = entries.find(entry => entry.url === card.querySelector('a').getAttribute('href'));
      card.hidden = entry.card.hidden;
    });
    updateFavouritesVisibility();
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
  filter.addEventListener('input', () => {
    if (filter.value.trim() && favouritesOnlyMode) {
      setFavouritesOnly(false);
    }
    applyFilter();
  });
  favouritesOnly.addEventListener('change', () => {
    setFavouritesOnly(favouritesOnly.checked);
    if (favouritesOnlyMode) filter.value = '';
    applyFilter();
  });
  document.getElementById('filter-clear').addEventListener('click', () => {
    filter.value = '';
    applyFilter();
    filter.focus();
  });
  filterPanel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      filterToggle.click();
      filterToggle.focus();
    }
  });
  renderFavourites();
  applyFilter();
});
