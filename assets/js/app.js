(() => {
  'use strict';

  const CATEGORIES = [
    { id: 'masjid-lama', label: 'Masjid Lama & Raudhah' },
    { id: 'gerbang', label: 'Gerbang & Pintu' },
    { id: 'pelataran', label: 'Pelataran (payung)' },
    { id: 'wanita', label: 'Area Wanita' },
    { id: 'fasilitas', label: 'Fasilitas' },
    { id: 'sekitar', label: 'Sekitar Masjid' }
  ];

  const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]));

  const DOOR_GROUPS = [
    {
      id: 'masjid-lama',
      label: 'Pintu Masjid Lama',
      color: 'hijau',
      colorName: 'hijau',
      ranges: [{ from: 1, to: 42, near: 'bab-as-salam' }]
    },
    {
      id: 'selatan',
      label: 'Selatan',
      color: 'hijau',
      colorName: 'hijau',
      ranges: [
        { from: 201, to: 212, near: 'payung-selatan' },
        { from: 301, to: 312, near: 'payung-selatan' },
        { from: 355, to: 370, near: 'payung-timur' }
      ]
    },
    {
      id: 'barat-daya',
      label: 'Barat Daya',
      color: 'ungu',
      colorName: 'ungu',
      ranges: [{ from: 309, to: 313, near: 'zamzam' }]
    },
    {
      id: 'barat',
      label: 'Barat',
      color: 'oranye',
      colorName: 'oranye',
      ranges: [
        { from: 213, to: 218, near: 'payung-barat' },
        { from: 314, to: 327, near: 'payung-barat' }
      ]
    },
    {
      id: 'timur',
      label: 'Timur',
      color: 'biru',
      colorName: 'biru',
      ranges: [{ from: 231, to: 236, near: 'payung-timur' }, { from: 344, to: 354, near: 'payung-timur' }]
    },
    {
      id: 'utara',
      label: 'Utara',
      color: 'merah',
      colorName: 'merah muda/merah',
      ranges: [{ from: 219, to: 230, near: 'payung-utara' }, { from: 328, to: 343, near: 'payung-utara' }]
    }
  ];

  const REQUIRED_FIELDS = ['id', 'nama', 'x', 'y', 'kategori', 'foto', 'deskripsi', 'tips', 'gerbang'];
  const FONT_STORAGE_KEY = 'peta-nabawi-ukuran-huruf';
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    points: [],
    byId: new Map(),
    markers: new Map(),
    filter: 'all',
    activeId: null,
    sheetOpen: false,
    lightboxOpen: false,
    sheetLastFocus: null,
    lightboxLastFocus: null,
    gallery: {
      pointId: null,
      photos: [],
      index: 0,
      mainImg: null,
      mainAlt: '',
      thumbs: []
    },
    view: {
      scale: 1,
      tx: 0,
      ty: 0,
      stageW: 0,
      stageH: 0,
      viewportW: 0,
      viewportH: 0,
      ready: false,
      animateTimer: 0
    },
    pointers: new Map(),
    drag: null,
    pinch: null,
    tap: null,
    lastTap: null
  };

  const $ = (selector) => document.querySelector(selector);

  const dom = {
    html: document.documentElement,
    fontButtons: Array.from(document.querySelectorAll('[data-font-size]')),
    doorForm: $('#door-form'),
    doorInput: $('#door-input'),
    doorResult: $('#door-result'),
    mapSection: $('#peta'),
    mapViewport: $('#map-viewport'),
    mapStage: $('#map-stage'),
    mapImg: $('#map-img'),
    markers: $('#markers'),
    mapStatus: $('#map-status'),
    mapCount: $('#map-count'),
    filters: $('#category-filters'),
    list: $('#location-list'),
    sheet: $('#point-sheet'),
    sheetBackdrop: $('#sheet-backdrop'),
    sheetClose: $('#sheet-close'),
    sheetGrab: $('#sheet-grab'),
    sheetScroll: $('#sheet-scroll'),
    sheetGallery: $('#sheet-gallery'),
    sheetKicker: $('#sheet-kicker'),
    sheetTitle: $('#sheet-title'),
    sheetDesc: $('#sheet-desc'),
    sheetTipsWrap: $('#sheet-tips-wrap'),
    sheetTipsLabel: $('#sheet-tips-label'),
    sheetTips: $('#sheet-tips'),
    sheetGateWrap: $('#sheet-gate-wrap'),
    sheetGate: $('#sheet-gate'),
    sheetMapBtn: $('#sheet-map-btn'),
    lightbox: $('#lightbox'),
    lightboxImg: $('#lightbox-img'),
    lightboxClose: $('#lightbox-close'),
    lightboxPrev: $('#lightbox-prev'),
    lightboxNext: $('#lightbox-next'),
    lightboxCount: $('#lightbox-count'),
    quickSearch: document.querySelector('[data-quick="search"]')
  };

  let sheetDrag = null;

  init();

  function init() {
    initFontSize();
    initStaticEvents();
    initMapEvents();

    if (dom.mapImg.complete && dom.mapImg.naturalWidth > 0) {
      onMapImageReady();
    } else {
      dom.mapImg.addEventListener('load', onMapImageReady, { once: true });
      dom.mapImg.addEventListener(
        'error',
        () => {
          setMapStatus('Denah dasar tidak bisa dimuat. Periksa berkas assets/map-base.jpg.', true);
        },
        { once: true }
      );
    }

    loadPoints();
  }

  /* ---------- Static UI ---------- */

  function initFontSize() {
    let saved = null;
    try {
      saved = window.localStorage.getItem(FONT_STORAGE_KEY);
    } catch (error) {
      saved = null;
    }

    if (saved === 'large' || saved === 'normal') {
      applyFontSize(saved, false);
    }

    dom.fontButtons.forEach((button) => {
      button.addEventListener('click', () => {
        applyFontSize(button.dataset.fontSize, true);
      });
    });
  }

  function applyFontSize(size, persist) {
    if (size !== 'normal' && size !== 'large') {
      return;
    }

    dom.html.dataset.fontSize = size;
    dom.fontButtons.forEach((button) => {
      const isActive = button.dataset.fontSize === size;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (persist) {
      try {
        window.localStorage.setItem(FONT_STORAGE_KEY, size);
      } catch (error) {
        /* Penyimpanan bisa diblokir oleh browser; ukuran tetap berlaku di halaman ini. */
      }
    }
  }

  function initStaticEvents() {
    dom.doorForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleDoorSearch();
    });

    dom.doorInput.addEventListener('input', () => {
      dom.doorInput.removeAttribute('aria-invalid');
    });

    dom.quickSearch.addEventListener('click', (event) => {
      event.preventDefault();
      const behavior = reducedMotionQuery.matches ? 'auto' : 'smooth';
      $('#pencarian-pintu').scrollIntoView({ behavior, block: 'start' });
      window.setTimeout(
        () => dom.doorInput.focus({ preventScroll: true }),
        reducedMotionQuery.matches ? 0 : 360
      );
    });

    dom.sheetBackdrop.addEventListener('click', closeSheet);
    dom.sheetClose.addEventListener('click', closeSheet);
    dom.lightboxClose.addEventListener('click', closeLightbox);
    dom.lightboxPrev.addEventListener('click', () => stepLightbox(-1));
    dom.lightboxNext.addEventListener('click', () => stepLightbox(1));

    dom.sheetMapBtn.addEventListener('click', () => {
      const id = state.activeId;
      if (!id) {
        return;
      }
      closeSheet();
      window.setTimeout(() => focusPoint(id, true), 40);
    });

    dom.lightbox.addEventListener('click', (event) => {
      if (event.target === dom.lightbox || event.target.classList.contains('lightbox__stage')) {
        closeLightbox();
      }
    });

    initSheetDrag();
    initKeyboard();
  }

  /* ---------- Data ---------- */

  async function loadPoints() {
    try {
      const data = await fetchPoints();
      validatePoints(data);
      state.points = data;
      state.byId = new Map(data.map((point) => [point.id, point]));
      renderAll();
      updateMapStatus();
    } catch (error) {
      showLoadError(error);
    }
  }

  async function fetchPoints() {
    let firstError = null;

    if (typeof window.fetch === 'function') {
      try {
        const response = await window.fetch('assets/js/points.json', { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        firstError = error;
      }
    }

    try {
      return await fetchPointsWithXhr();
    } catch (error) {
      throw firstError || error;
    }
  }

  function fetchPointsWithXhr() {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', 'assets/js/points.json', true);

      if (typeof request.overrideMimeType === 'function') {
        request.overrideMimeType('application/json');
      }

      request.onreadystatechange = () => {
        if (request.readyState !== 4) {
          return;
        }

        if (request.status === 200 || request.status === 0) {
          try {
            resolve(JSON.parse(request.responseText));
          } catch (error) {
            reject(new Error('Isi points.json tidak bisa dibaca sebagai JSON.'));
          }
          return;
        }

        reject(new Error(`HTTP ${request.status}`));
      };

      request.onerror = () => reject(new Error('Permintaan data lokasi gagal.'));
      request.send();
    });
  }

  function validatePoints(data) {
    if (!Array.isArray(data)) {
      throw new Error('Data titik harus berupa array.');
    }

    if (data.length !== 17) {
      throw new Error(`Jumlah titik ${data.length}, seharusnya 17.`);
    }

    const ids = new Set();

    data.forEach((point, index) => {
      REQUIRED_FIELDS.forEach((field) => {
        if (!(field in point)) {
          throw new Error(`Titik ${index + 1} tidak memiliki field ${field}.`);
        }
      });

      if (typeof point.id !== 'string' || point.id.length === 0) {
        throw new Error(`Titik ${index + 1} memiliki id yang tidak valid.`);
      }

      if (ids.has(point.id)) {
        throw new Error(`Id titik ganda: ${point.id}.`);
      }
      ids.add(point.id);

      if (typeof point.nama !== 'string' || point.nama.length === 0) {
        throw new Error(`Titik ${point.id} tidak memiliki nama.`);
      }

      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new Error(`Koordinat titik ${point.id} tidak valid.`);
      }

      if (point.x < 0 || point.x > 100 || point.y < 0 || point.y > 100) {
        throw new Error(`Koordinat titik ${point.id} harus dalam persen 0–100.`);
      }

      if (!CATEGORY_BY_ID.has(point.kategori)) {
        throw new Error(`Kategori titik ${point.id} tidak dikenal: ${point.kategori}.`);
      }

      if (!Array.isArray(point.foto) || point.foto.length === 0 || point.foto.some((file) => typeof file !== 'string' || file.length === 0)) {
        throw new Error(`Daftar foto titik ${point.id} tidak valid.`);
      }

      ['deskripsi', 'tips', 'gerbang'].forEach((field) => {
        if (typeof point[field] !== 'string') {
          throw new Error(`Field ${field} pada titik ${point.id} harus berupa teks.`);
        }
      });
    });
  }

  function showLoadError(error) {
    const isFile = window.location.protocol === 'file:';
    const message = isFile
      ? 'Browser memblokir pembacaan points.json saat halaman dibuka langsung dari file. Jalankan server statis di folder ini, misalnya python3 -m http.server 8000, lalu buka http://localhost:8000.'
      : 'Data lokasi tidak bisa dimuat. Periksa koneksi dan berkas assets/js/points.json.';

    setMapStatus(message, true);
    dom.mapCount.textContent = 'Data tidak termuat';
    dom.doorInput.disabled = true;
    const submit = dom.doorForm.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = true;
    }

    const card = document.createElement('div');
    card.className = 'load-error';
    const title = document.createElement('strong');
    title.textContent = 'Daftar lokasi belum bisa dimuat';
    const text = document.createElement('p');
    text.textContent = message;
    const detail = document.createElement('p');
    detail.textContent = `Detail teknis: ${error && error.message ? error.message : 'tidak diketahui'}.`;
    card.append(title, text, detail);

    dom.list.replaceChildren(card);
    dom.filters.replaceChildren();
  }

  /* ---------- Rendering ---------- */

  function renderAll() {
    renderFilters();
    renderMarkers();
    renderList();
    updateMapCount();
    setFilter('all');
  }

  function renderFilters() {
    const fragment = document.createDocumentFragment();

    fragment.append(createChip('all', 'Semua', null));

    CATEGORIES.forEach((category) => {
      fragment.append(createChip(category.id, category.label, category));
    });

    dom.filters.replaceChildren(fragment);
  }

  function createChip(filterId, label, category) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.filter = filterId;
    chip.setAttribute('aria-pressed', 'false');

    if (!category) {
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
    } else {
      const dot = document.createElement('span');
      dot.className = 'chip__dot';
      dot.setAttribute('aria-hidden', 'true');
      if (category.id === 'gerbang' || category.id === 'sekitar') {
        dot.classList.add(`chip__dot--${category.id}`);
      }
      chip.append(dot);
    }

    const text = document.createElement('span');
    text.textContent = label;
    chip.append(text);

    chip.addEventListener('click', () => setFilter(filterId));
    return chip;
  }

  function setFilter(filterId) {
    if (filterId !== 'all' && !CATEGORY_BY_ID.has(filterId)) {
      return;
    }

    state.filter = filterId;

    dom.filters.querySelectorAll('.chip').forEach((chip) => {
      const isActive = chip.dataset.filter === filterId;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', String(isActive));
    });

    state.markers.forEach((marker, id) => {
      const point = state.byId.get(id);
      const isDimmed = filterId !== 'all' && point && point.kategori !== filterId;
      marker.classList.toggle('is-dimmed', Boolean(isDimmed));
    });

    updateMapCount();
  }

  function updateMapCount() {
    if (!state.points.length) {
      return;
    }

    if (state.filter === 'all') {
      dom.mapCount.textContent = `${state.points.length} titik · ${CATEGORIES.length} kategori`;
      return;
    }

    const category = CATEGORY_BY_ID.get(state.filter);
    const count = state.points.filter((point) => point.kategori === state.filter).length;
    dom.mapCount.textContent = `${count} titik · ${category.label}`;
  }

  function renderMarkers() {
    const fragment = document.createDocumentFragment();
    state.markers.clear();

    state.points.forEach((point, index) => {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'marker';
      marker.dataset.id = point.id;
      marker.dataset.category = point.kategori;
      marker.style.left = `${point.x}%`;
      marker.style.top = `${point.y}%`;
      marker.title = point.nama;
      marker.setAttribute(
        'aria-label',
        `Nomor ${index + 1}: ${point.nama}. Kategori ${categoryLabel(point.kategori)}. Buka detail.`
      );

      const dot = document.createElement('span');
      dot.className = 'marker__dot';
      dot.textContent = String(index + 1);
      marker.append(dot);

      marker.addEventListener('click', () => openSheet(point.id, marker));
      fragment.append(marker);
      state.markers.set(point.id, marker);
    });

    dom.markers.replaceChildren(fragment);
  }

  function renderList() {
    const fragment = document.createDocumentFragment();

    CATEGORIES.forEach((category) => {
      const entries = state.points
        .map((point, index) => ({ point, number: index + 1 }))
        .filter((entry) => entry.point.kategori === category.id);

      if (entries.length === 0) {
        return;
      }

      const section = document.createElement('section');
      section.className = 'location-group';
      section.dataset.category = category.id;

      const headingId = `grup-${category.id}`;
      section.setAttribute('aria-labelledby', headingId);

      const head = document.createElement('div');
      head.className = 'group-head';

      const heading = document.createElement('h3');
      heading.id = headingId;
      heading.textContent = category.label;

      const count = document.createElement('span');
      count.className = 'group-count';
      count.textContent = `${entries.length} lokasi`;

      head.append(heading, count);

      const list = document.createElement('ol');
      list.className = 'location-items';

      entries.forEach(({ point, number }) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'location-row';
        button.dataset.point = point.id;
        button.setAttribute('aria-label', `Buka detail lokasi nomor ${number}: ${point.nama}`);

        const numberEl = document.createElement('span');
        numberEl.className = 'location-index';
        numberEl.setAttribute('aria-hidden', 'true');
        numberEl.textContent = String(number);

        const main = document.createElement('span');
        main.className = 'location-main';

        const name = document.createElement('span');
        name.className = 'location-name';
        name.textContent = point.nama;

        const desc = document.createElement('span');
        desc.className = 'location-desc';
        desc.textContent = point.deskripsi;

        main.append(name, desc);

        if (point.gerbang) {
          const gate = document.createElement('span');
          gate.className = 'location-gate';
          gate.textContent = `Gerbang ${point.gerbang}`;
          main.append(gate);
        }

        button.append(numberEl, main, createIcon('chevron'));
        button.addEventListener('click', () => openSheet(point.id, button));
        item.append(button);
        list.append(item);
      });

      section.append(head, list);
      fragment.append(section);
    });

    dom.list.replaceChildren(fragment);
  }

  /* ---------- Door search ---------- */

  function handleDoorSearch() {
    const rawValue = dom.doorInput.value.trim();
    dom.doorInput.removeAttribute('aria-invalid');

    if (rawValue === '') {
      showDoorError('Nomor pintu belum diisi', 'Masukkan nomor pintu antara 1 dan 370.');
      dom.doorInput.focus();
      return;
    }

    const number = Number(rawValue);

    if (!Number.isInteger(number) || number < 1 || number > 370) {
      showDoorError(
        'Nomor pintu tidak valid',
        'Masukkan nomor bulat antara 1 dan 370. Nomor desimal atau di luar rentang tidak dikenali.'
      );
      dom.doorInput.setAttribute('aria-invalid', 'true');
      dom.doorInput.focus();
      return;
    }

    const matches = findDoorMatches(number);

    if (matches.length === 0) {
      showDoorError(
        `Pintu ${number} tidak ditemukan`,
        'Nomor 43–200 tidak tercantum pada legenda gerbang denah ini. Coba nomor 1–42 atau 201–370.'
      );
      dom.doorInput.setAttribute('aria-invalid', 'true');
      return;
    }

    matches.sort((a, b) => a.span - b.span);

    let targetId = matches[0].range.near;
    let note = '';

    if (number >= 1 && number <= 42) {
      if (number === 1) {
        targetId = 'bab-as-salam';
        note = 'Pintu 1 adalah Bab As-Salam, jalur masuk untuk mengucap salam.';
      } else if (number >= 40 && number <= 42) {
        targetId = 'pintu-raudhah';
        note = 'Pintu 40–42 adalah area Pintu Masuk Raudhah. Izin Raudhah diatur lewat aplikasi Nusuk.';
      } else if (number === 32) {
        targetId = 'wanita-timur';
        note = 'Pintu 32 adalah pintu masuk wanita ke Masjid Lama.';
      } else {
        note = 'Pintu 1–42 adalah pintu-pintu Masjid Lama. Pintu 1 = Bab As-Salam, 40–42 = area Raudhah, 32 = pintu masuk wanita.';
      }
    }

    if (matches.length > 1) {
      note = note
        ? `${note} Nomor ini juga tercantum pada lebih dari satu sisi; ikuti warna gerbang di lokasi.`
        : 'Nomor ini tercantum pada lebih dari satu sisi. Ikuti warna gerbang di lokasi.';
    }

    renderDoorResult(number, matches, targetId, note);
  }

  function findDoorMatches(number) {
    const matches = [];

    DOOR_GROUPS.forEach((group) => {
      group.ranges.forEach((range) => {
        if (number >= range.from && number <= range.to) {
          matches.push({
            group,
            range,
            span: range.to - range.from + 1
          });
        }
      });
    });

    return matches;
  }

  function renderDoorResult(number, matches, targetId, note) {
    const nearPoint = state.byId.get(targetId);
    const nearNumber = nearPoint ? state.points.indexOf(nearPoint) + 1 : 0;

    const card = document.createElement('div');
    card.className = 'door-result';

    const title = document.createElement('h3');
    title.textContent = `Pintu ${number}`;

    const lead = document.createElement('p');
    lead.className = 'door-result__lead';
    lead.textContent =
      matches.length > 1
        ? 'Nomor ini tercantum pada lebih dari satu sisi pada legenda:'
        : 'Nomor ini tercantum pada sisi:';

    const sides = document.createElement('ul');
    sides.className = 'door-result__sides';

    matches.forEach((match) => {
      const item = document.createElement('li');
      item.className = 'door-side';

      const dot = document.createElement('span');
      dot.className = `door-dot door-dot--${match.group.color}`;
      dot.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.textContent = `${match.group.label} (${match.group.colorName}) · ${formatRange(match.range)}`;

      item.append(dot, text);
      sides.append(item);
    });

    card.append(title, lead, sides);

    if (nearPoint && nearNumber > 0) {
      const near = document.createElement('p');
      near.className = 'door-result__near';
      near.append(document.createTextNode('Titik terdekat di denah: '));

      const strong = document.createElement('strong');
      strong.textContent = `${nearPoint.nama} (nomor ${nearNumber})`;
      near.append(strong);
      card.append(near);
    }

    if (note) {
      const noteEl = document.createElement('p');
      noteEl.className = 'door-result__note';
      noteEl.textContent = note;
      card.append(noteEl);
    }

    if (nearPoint) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn--primary';
      button.append(createIcon('pin'));

      const label = document.createElement('span');
      label.textContent = 'Tunjukkan di denah';
      button.append(label);

      button.addEventListener('click', () => {
        setFilter('all');
        focusPoint(nearPoint.id, true);
      });

      card.append(button);
    }

    dom.doorResult.hidden = false;
    dom.doorResult.className = 'door-result';
    dom.doorResult.replaceChildren(card);
  }

  function showDoorError(title, message) {
    const card = document.createElement('div');
    card.className = 'door-result door-result--error';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const text = document.createElement('p');
    text.className = 'door-result__lead';
    text.textContent = message;

    card.append(heading, text);

    dom.doorResult.hidden = false;
    dom.doorResult.className = 'door-result door-result--error';
    dom.doorResult.replaceChildren(card);
  }

  function formatRange(range) {
    return range.from === range.to ? String(range.from) : `${range.from}–${range.to}`;
  }

  /* ---------- Map: sizing and transform ---------- */

  function onMapImageReady() {
    fitMap();
    updateMapStatus();
  }

  function fitMap() {
    if (!dom.mapImg.naturalWidth || !dom.mapImg.naturalHeight) {
      return;
    }

    const viewportWidth = dom.mapViewport.clientWidth;
    const viewportHeight = dom.mapViewport.clientHeight;

    if (viewportWidth === 0 || viewportHeight === 0) {
      return;
    }

    const imageWidth = dom.mapImg.naturalWidth;
    const imageHeight = dom.mapImg.naturalHeight;
    const fit = Math.min(viewportWidth / imageWidth, viewportHeight / imageHeight);
    const stageWidth = imageWidth * fit;
    const stageHeight = imageHeight * fit;

    dom.mapStage.style.width = `${stageWidth}px`;
    dom.mapStage.style.height = `${stageHeight}px`;

    state.view.stageW = stageWidth;
    state.view.stageH = stageHeight;
    state.view.viewportW = viewportWidth;
    state.view.viewportH = viewportHeight;
    state.view.scale = 1;
    state.view.tx = 0;
    state.view.ty = 0;
    state.view.ready = true;

    applyTransform(false);
  }

  function updateMapStatus() {
    if (!state.points.length) {
      return;
    }

    if (state.view.ready) {
      setMapStatus('', false, true);
    } else {
      setMapStatus('Memuat denah dasar…');
    }
  }

  function setMapStatus(message, isError, hide) {
    dom.mapStatus.classList.toggle('map-status--error', Boolean(isError));
    dom.mapStatus.classList.toggle('is-hidden', Boolean(hide));

    if (message) {
      dom.mapStatus.textContent = message;
    }
  }

  function applyTransform(animate) {
    const view = state.view;

    dom.mapStage.style.transform = `translate(-50%, -50%) translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`;
    dom.mapStage.style.setProperty('--marker-scale', String(1 / view.scale));

    if (animate) {
      dom.mapStage.classList.add('is-animating');
      window.clearTimeout(view.animateTimer);
      view.animateTimer = window.setTimeout(() => {
        dom.mapStage.classList.remove('is-animating');
      }, 480);
    } else {
      dom.mapStage.classList.remove('is-animating');
    }
  }

  function clampView() {
    const view = state.view;
    view.scale = clamp(view.scale, 1, 5);

    const maxX = Math.max(0, (view.stageW * view.scale - view.viewportW) / 2);
    const maxY = Math.max(0, (view.stageH * view.scale - view.viewportH) / 2);

    view.tx = clamp(view.tx, -maxX, maxX);
    view.ty = clamp(view.ty, -maxY, maxY);
  }

  function zoomAt(px, py, factor, animate) {
    const view = state.view;
    const newScale = clamp(view.scale * factor, 1, 5);

    if (newScale === view.scale) {
      return;
    }

    const ratio = newScale / view.scale;
    view.tx = px - (px - view.tx) * ratio;
    view.ty = py - (py - view.ty) * ratio;
    view.scale = newScale;

    clampView();
    applyTransform(animate);
  }

  function resetMap(animate) {
    state.view.scale = 1;
    state.view.tx = 0;
    state.view.ty = 0;
    applyTransform(animate);
  }

  function focusPoint(id, shouldScroll) {
    const point = state.byId.get(id);
    const marker = state.markers.get(id);

    if (!point || !state.view.ready) {
      return;
    }

    setFilter('all');

    const targetScale = 2.2;
    const view = state.view;
    const pointX = (point.x / 100 - 0.5) * view.stageW;
    const pointY = (point.y / 100 - 0.5) * view.stageH;

    view.scale = targetScale;
    view.tx = -pointX * view.scale;
    view.ty = -pointY * view.scale;

    clampView();
    applyTransform(true);

    if (marker) {
      marker.classList.remove('is-highlighted');
      void marker.offsetWidth;
      marker.classList.add('is-highlighted');
      window.clearTimeout(marker._highlightTimer);
      marker._highlightTimer = window.setTimeout(() => {
        marker.classList.remove('is-highlighted');
      }, 2400);
    }

    if (shouldScroll) {
      const behavior = reducedMotionQuery.matches ? 'auto' : 'smooth';
      dom.mapViewport.scrollIntoView({ behavior, block: 'center' });
    }
  }

  function initMapEvents() {
    dom.mapViewport.addEventListener('pointerdown', onPointerDown);
    dom.mapViewport.addEventListener('pointermove', onPointerMove);
    dom.mapViewport.addEventListener('pointerup', onPointerUp);
    dom.mapViewport.addEventListener('pointercancel', onPointerUp);
    dom.mapViewport.addEventListener('wheel', onWheel, { passive: false });
    dom.mapViewport.addEventListener('dblclick', onDoubleClick);

    dom.mapViewport.querySelector('.map-controls').addEventListener('click', (event) => {
      const button = event.target.closest('button[data-map-action]');
      if (!button) {
        return;
      }

      const action = button.dataset.mapAction;

      if (action === 'zoom-in') {
        zoomAt(0, 0, 1.35, true);
      } else if (action === 'zoom-out') {
        zoomAt(0, 0, 1 / 1.35, true);
      } else if (action === 'reset') {
        resetMap(true);
      }
    });

    dom.mapViewport.addEventListener('keydown', (event) => {
      if (event.target !== dom.mapViewport) {
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomAt(0, 0, 1.35, true);
      } else if (event.key === '-') {
        event.preventDefault();
        zoomAt(0, 0, 1 / 1.35, true);
      } else if (event.key === '0') {
        event.preventDefault();
        resetMap(true);
      }
    });

    window.addEventListener(
      'resize',
      debounce(() => {
        if (state.view.ready) {
          fitMap();
        }
      }, 160)
    );

    window.addEventListener('orientationchange', () => {
      window.setTimeout(() => {
        if (state.view.ready) {
          fitMap();
        }
      }, 220);
    });
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    if (event.target.closest('button, a, input')) {
      return;
    }

    if (!state.view.ready) {
      return;
    }

    event.preventDefault();
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (dom.mapViewport.setPointerCapture) {
      try {
        dom.mapViewport.setPointerCapture(event.pointerId);
      } catch (error) {
        /* Pointer capture tidak selalu tersedia; gestur tetap berjalan. */
      }
    }

    if (state.pointers.size === 1) {
      state.drag = {
        startX: event.clientX,
        startY: event.clientY,
        startTx: state.view.tx,
        startTy: state.view.ty,
        moved: false
      };
      state.pinch = null;
      state.tap = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now()
      };
      dom.mapViewport.classList.add('is-panning');
    } else if (state.pointers.size === 2) {
      const points = Array.from(state.pointers.values());
      const rect = dom.mapViewport.getBoundingClientRect();
      const middle = midpoint(points[0], points[1]);

      state.drag = null;
      state.tap = null;
      state.pinch = {
        startDistance: Math.max(1, distance(points[0], points[1])),
        startScale: state.view.scale,
        startTx: state.view.tx,
        startTy: state.view.ty,
        startMidX: middle.x - rect.left - rect.width / 2,
        startMidY: middle.y - rect.top - rect.height / 2
      };
    }
  }

  function onPointerMove(event) {
    if (!state.pointers.has(event.pointerId)) {
      return;
    }

    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (state.pointers.size >= 2 && state.pinch) {
      const points = Array.from(state.pointers.values()).slice(0, 2);
      const rect = dom.mapViewport.getBoundingClientRect();
      const middle = midpoint(points[0], points[1]);
      const midX = middle.x - rect.left - rect.width / 2;
      const midY = middle.y - rect.top - rect.height / 2;
      const distanceRatio = distance(points[0], points[1]) / state.pinch.startDistance;
      const newScale = clamp(state.pinch.startScale * distanceRatio, 1, 5);
      const scaleRatio = newScale / state.pinch.startScale;

      state.view.scale = newScale;
      state.view.tx = midX - (state.pinch.startMidX - state.pinch.startTx) * scaleRatio;
      state.view.ty = midY - (state.pinch.startMidY - state.pinch.startTy) * scaleRatio;

      clampView();
      applyTransform(false);
      event.preventDefault();
      return;
    }

    if (state.drag && state.pointers.size === 1) {
      const deltaX = event.clientX - state.drag.startX;
      const deltaY = event.clientY - state.drag.startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        state.drag.moved = true;
      }

      state.view.tx = state.drag.startTx + deltaX;
      state.view.ty = state.drag.startTy + deltaY;

      clampView();
      applyTransform(false);
      event.preventDefault();
    }
  }

  function onPointerUp(event) {
    if (!state.pointers.has(event.pointerId)) {
      return;
    }

    const wasSingle = state.pointers.size === 1;
    const dragMoved = state.drag ? state.drag.moved : true;
    const tap = state.tap;

    state.pointers.delete(event.pointerId);

    if (state.pointers.size === 0) {
      state.drag = null;
      state.pinch = null;
      state.tap = null;
      dom.mapViewport.classList.remove('is-panning');

      if (wasSingle && !dragMoved && tap && event.pointerType !== 'mouse') {
        handleTap(tap, event);
      }
      return;
    }

    if (state.pointers.size === 1) {
      const remaining = Array.from(state.pointers.values())[0];
      state.pinch = null;
      state.drag = {
        startX: remaining.x,
        startY: remaining.y,
        startTx: state.view.tx,
        startTy: state.view.ty,
        moved: true
      };
    }
  }

  function handleTap(tap, event) {
    const now = performance.now();

    if (
      state.lastTap &&
      now - state.lastTap.time < 340 &&
      Math.hypot(event.clientX - state.lastTap.x, event.clientY - state.lastTap.y) < 32
    ) {
      state.lastTap = null;
      const rect = dom.mapViewport.getBoundingClientRect();
      const px = event.clientX - rect.left - rect.width / 2;
      const py = event.clientY - rect.top - rect.height / 2;
      const factor = state.view.scale > 1.5 ? 1 / 1.8 : 1.8;
      zoomAt(px, py, factor, true);
      return;
    }

    state.lastTap = tap;
  }

  function onWheel(event) {
    if (!state.view.ready || (!event.ctrlKey && !event.metaKey)) {
      return;
    }

    event.preventDefault();

    const rect = dom.mapViewport.getBoundingClientRect();
    const px = event.clientX - rect.left - rect.width / 2;
    const py = event.clientY - rect.top - rect.height / 2;
    const factor = Math.exp(-event.deltaY * 0.0022);

    zoomAt(px, py, factor, false);
  }

  function onDoubleClick(event) {
    if (event.target.closest('button, a, input')) {
      return;
    }

    event.preventDefault();
    const rect = dom.mapViewport.getBoundingClientRect();
    const px = event.clientX - rect.left - rect.width / 2;
    const py = event.clientY - rect.top - rect.height / 2;
    const factor = state.view.scale > 1.5 ? 1 / 1.8 : 1.8;

    zoomAt(px, py, factor, true);
  }

  /* ---------- Bottom sheet ---------- */

  function openSheet(id, trigger) {
    const point = state.byId.get(id);

    if (!point) {
      return;
    }

    const number = state.points.indexOf(point) + 1;
    const wasOpen = state.sheetOpen;

    if (!wasOpen) {
      state.sheetLastFocus = trigger || document.activeElement;
    }

    state.activeId = id;
    state.sheetOpen = true;

    dom.sheetKicker.textContent = `Lokasi ${number} · ${categoryLabel(point.kategori)}`;
    dom.sheetTitle.textContent = point.nama;
    dom.sheetDesc.textContent = point.deskripsi;

    if (point.tips) {
      dom.sheetTipsWrap.hidden = false;
      dom.sheetTipsWrap.classList.toggle('sheet-detail--warning', Boolean(point.peringatan));
      dom.sheetTipsLabel.textContent = point.peringatan ? 'Catatan foto' : 'Tips';
      dom.sheetTips.textContent = point.tips;

      const iconUse = dom.sheetTipsWrap.querySelector('use');
      if (iconUse) {
        iconUse.setAttribute('href', point.peringatan ? '#icon-warning' : '#icon-compass');
      }
    } else {
      dom.sheetTipsWrap.hidden = true;
    }

    if (point.gerbang) {
      dom.sheetGateWrap.hidden = false;
      dom.sheetGate.textContent = point.gerbang;
    } else {
      dom.sheetGateWrap.hidden = true;
    }

    state.markers.forEach((marker) => marker.classList.remove('is-active'));
    const marker = state.markers.get(id);
    if (marker) {
      marker.classList.add('is-active');
    }

    renderGallery(point);
    syncScrollLock();

    if (!wasOpen) {
      dom.sheetBackdrop.classList.add('is-open');
      dom.sheet.classList.add('is-open');
      dom.sheet.removeAttribute('inert');
      dom.sheet.setAttribute('aria-hidden', 'false');
      dom.sheetScroll.scrollTop = 0;
      dom.sheet.style.transition = '';
      dom.sheet.style.transform = '';

      window.requestAnimationFrame(() => {
        dom.sheetClose.focus({ preventScroll: true });
      });
    }
  }

  function closeSheet() {
    if (!state.sheetOpen) {
      return;
    }

    if (state.lightboxOpen) {
      closeLightbox();
    }

    state.sheetOpen = false;
    state.activeId = null;
    sheetDrag = null;

    dom.sheet.classList.remove('is-open');
    dom.sheet.setAttribute('aria-hidden', 'true');
    dom.sheet.setAttribute('inert', '');
    dom.sheetBackdrop.classList.remove('is-open');
    dom.sheet.style.transition = '';
    dom.sheet.style.transform = '';

    state.markers.forEach((marker) => marker.classList.remove('is-active'));
    syncScrollLock();

    if (state.sheetLastFocus && document.contains(state.sheetLastFocus)) {
      state.sheetLastFocus.focus({ preventScroll: true });
    }
    state.sheetLastFocus = null;
  }

  function renderGallery(point) {
    const photos = point.foto;
    state.gallery = {
      pointId: point.id,
      photos,
      index: 0,
      mainImg: null,
      mainAlt: '',
      thumbs: []
    };

    const main = document.createElement('div');
    main.className = 'gallery-main';

    const openButton = document.createElement('button');
    openButton.type = 'button';
    openButton.className = 'gallery-open';
    openButton.setAttribute('aria-label', `Perbesar foto ${point.nama}`);

    const image = document.createElement('img');
    image.className = 'gallery-img';
    image.src = photoPath(photos[0]);
    image.alt = photoAlt(point, 0);
    image.decoding = 'async';
    image.loading = 'eager';

    const badge = document.createElement('span');
    badge.className = 'gallery-badge';
    badge.append(createIcon('expand'));

    const badgeText = document.createElement('span');
    badgeText.textContent = 'Perbesar';
    badge.append(badgeText);

    openButton.append(image, badge);
    openButton.addEventListener('click', () => openLightbox(state.gallery.index));
    main.append(openButton);

    state.gallery.mainImg = image;
    state.gallery.mainAlt = image.alt;

    dom.sheetGallery.replaceChildren(main);

    if (photos.length > 1) {
      const thumbs = document.createElement('div');
      thumbs.className = 'sheet-thumbs';

      photos.forEach((file, index) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'thumb';
        thumb.setAttribute('aria-label', `Tampilkan foto ${index + 1} dari ${photos.length}`);
        thumb.setAttribute('aria-pressed', String(index === 0));

        if (index === 0) {
          thumb.classList.add('is-active');
        }

        const thumbImage = document.createElement('img');
        thumbImage.src = photoPath(file);
        thumbImage.alt = '';
        thumbImage.loading = 'lazy';
        thumbImage.decoding = 'async';

        thumb.append(thumbImage);
        thumb.addEventListener('click', () => selectGalleryPhoto(index));
        thumbs.append(thumb);
        state.gallery.thumbs.push(thumb);
      });

      dom.sheetGallery.append(thumbs);
    }
  }

  function selectGalleryPhoto(index) {
    const photos = state.gallery.photos;

    if (!photos[index] || !state.gallery.mainImg) {
      return;
    }

    state.gallery.index = index;
    const point = state.byId.get(state.gallery.pointId);
    state.gallery.mainImg.src = photoPath(photos[index]);
    state.gallery.mainImg.alt = photoAlt(point, index);

    state.gallery.thumbs.forEach((thumb, thumbIndex) => {
      const isActive = thumbIndex === index;
      thumb.classList.toggle('is-active', isActive);
      thumb.setAttribute('aria-pressed', String(isActive));
    });
  }

  function initSheetDrag() {
    dom.sheetGrab.addEventListener('pointerdown', (event) => {
      if (!state.sheetOpen || state.lightboxOpen) {
        return;
      }

      event.preventDefault();
      sheetDrag = {
        pointerId: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastTime: performance.now(),
        velocity: 0,
        dy: 0
      };

      if (dom.sheetGrab.setPointerCapture) {
        try {
          dom.sheetGrab.setPointerCapture(event.pointerId);
        } catch (error) {
          /* Abaikan bila pointer capture tidak tersedia. */
        }
      }

      dom.sheet.style.transition = 'none';
    });

    dom.sheetGrab.addEventListener('pointermove', (event) => {
      if (!sheetDrag || event.pointerId !== sheetDrag.pointerId) {
        return;
      }

      const dy = Math.max(0, event.clientY - sheetDrag.startY);
      const now = performance.now();

      if (now - sheetDrag.lastTime > 18) {
        sheetDrag.velocity = (event.clientY - sheetDrag.lastY) / (now - sheetDrag.lastTime);
        sheetDrag.lastY = event.clientY;
        sheetDrag.lastTime = now;
      }

      sheetDrag.dy = dy;
      dom.sheet.style.transform = `translateY(${dy}px)`;
      event.preventDefault();
    });

    dom.sheetGrab.addEventListener('pointerup', finishSheetDrag);
    dom.sheetGrab.addEventListener('pointercancel', finishSheetDrag);
  }

  function finishSheetDrag(event) {
    if (!sheetDrag || event.pointerId !== sheetDrag.pointerId) {
      return;
    }

    const { dy, velocity } = sheetDrag;
    sheetDrag = null;

    dom.sheet.style.transition = 'transform 0.3s cubic-bezier(0.22, 0.85, 0.32, 1)';

    if (dy > 110 || velocity > 0.65) {
      dom.sheet.style.transform = 'translateY(calc(100% + 2rem))';
      window.setTimeout(() => {
        closeSheet();
        dom.sheet.style.transition = '';
        dom.sheet.style.transform = '';
      }, 300);
    } else {
      dom.sheet.style.transform = 'translateY(0)';
      window.setTimeout(() => {
        dom.sheet.style.transition = '';
        dom.sheet.style.transform = '';
      }, 300);
    }
  }

  function syncScrollLock() {
    dom.html.classList.toggle('is-locked', state.sheetOpen || state.lightboxOpen);
  }

  /* ---------- Lightbox ---------- */

  function openLightbox(index) {
    if (!state.gallery.photos.length) {
      return;
    }

    state.lightboxLastFocus = document.activeElement;
    state.lightboxOpen = true;
    state.gallery.index = clamp(index, 0, state.gallery.photos.length - 1);

    updateLightbox();

    dom.lightbox.classList.add('is-open');
    dom.lightbox.removeAttribute('inert');
    dom.lightbox.setAttribute('aria-hidden', 'false');
    dom.sheet.setAttribute('inert', '');
    syncScrollLock();

    window.requestAnimationFrame(() => {
      dom.lightboxClose.focus({ preventScroll: true });
    });
  }

  function updateLightbox() {
    const photos = state.gallery.photos;
    const point = state.byId.get(state.gallery.pointId);
    const index = state.gallery.index;
    const file = photos[index];

    if (!file || !point) {
      return;
    }

    dom.lightboxImg.src = photoPath(file);
    dom.lightboxImg.alt = photoAlt(point, index);

    const hasMultiple = photos.length > 1;
    dom.lightboxPrev.hidden = !hasMultiple;
    dom.lightboxNext.hidden = !hasMultiple;
    dom.lightboxCount.hidden = !hasMultiple;
    dom.lightboxCount.textContent = `${index + 1} / ${photos.length}`;

    if (state.gallery.mainImg && state.gallery.photos.length) {
      state.gallery.mainImg.src = photoPath(file);
      state.gallery.mainImg.alt = photoAlt(point, index);
      state.gallery.index = index;

      state.gallery.thumbs.forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === index;
        thumb.classList.toggle('is-active', isActive);
        thumb.setAttribute('aria-pressed', String(isActive));
      });
    }
  }

  function stepLightbox(direction) {
    const total = state.gallery.photos.length;

    if (total < 2) {
      return;
    }

    state.gallery.index = (state.gallery.index + direction + total) % total;
    updateLightbox();
  }

  function closeLightbox() {
    if (!state.lightboxOpen) {
      return;
    }

    state.lightboxOpen = false;
    dom.lightbox.classList.remove('is-open');
    dom.lightbox.setAttribute('aria-hidden', 'true');
    dom.lightbox.setAttribute('inert', '');

    if (state.sheetOpen) {
      dom.sheet.removeAttribute('inert');
    }

    syncScrollLock();

    if (state.lightboxLastFocus && document.contains(state.lightboxLastFocus)) {
      state.lightboxLastFocus.focus({ preventScroll: true });
    }
    state.lightboxLastFocus = null;
  }

  /* ---------- Keyboard and accessibility ---------- */

  function initKeyboard() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (state.lightboxOpen) {
          closeLightbox();
          return;
        }

        if (state.sheetOpen) {
          closeSheet();
          return;
        }
      }

      if (state.lightboxOpen) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          stepLightbox(-1);
          return;
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          stepLightbox(1);
          return;
        }

        trapFocus(event, dom.lightbox);
        return;
      }

      if (state.sheetOpen) {
        trapFocus(event, dom.sheet);
      }
    });
  }

  function trapFocus(event, container) {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = Array.from(
      container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((element) => !element.hidden && element.getClientRects().length > 0);

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------- Helpers ---------- */

  function createIcon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#icon-${name}`);
    svg.append(use);

    return svg;
  }

  function categoryLabel(categoryId) {
    const category = CATEGORY_BY_ID.get(categoryId);
    return category ? category.label : categoryId;
  }

  function photoPath(file) {
    return `assets/photos/${file}`;
  }

  function photoAlt(point, index) {
    if (!point) {
      return '';
    }

    return index === 0 ? `Foto ${point.nama}` : `Foto lain ${point.nama}`;
  }

  function midpoint(a, b) {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    };
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function debounce(fn, wait) {
    let timer = 0;
    return function debounced() {
      window.clearTimeout(timer);
      timer = window.setTimeout(fn, wait);
    };
  }
})();
