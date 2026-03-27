/* ===========================
   AGRITOUR 360 VIEWER — AgriCorner
   =========================== */

(function () {
  'use strict';

  // ——— THEME TOGGLE ———
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let currentTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', currentTheme);

  function updateThemeIcon() {
    if (!themeToggle) return;
    themeToggle.innerHTML = currentTheme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', currentTheme);
      updateThemeIcon();
    });
  }

  // ——— ELEMENTS ———
  const uploadZone = document.getElementById('upload-zone');
  const videoInput = document.getElementById('video-input');
  const viewer = document.getElementById('viewer');
  const viewerCanvas = document.getElementById('viewer-canvas');
  const video = document.getElementById('spin-video');
  const scrubHint = document.getElementById('scrub-hint');
  const timelineBar = document.getElementById('timeline-bar');
  const timelineProgress = document.getElementById('timeline-progress');
  const timelineMarkers = document.getElementById('timeline-markers');
  const hotspotLayer = document.getElementById('hotspot-layer');

  // Popup
  const popupOverlay = document.getElementById('popup-overlay');
  const popupContent = document.getElementById('popup-content');
  const popupClose = document.getElementById('popup-close');
  const popupTitle = document.getElementById('popup-title');
  const popupMediaWrap = document.getElementById('popup-media-wrap');
  const popupDesc = document.getElementById('popup-desc');

  // Admin
  const btnAdmin = document.getElementById('btn-admin');
  const adminPanel = document.getElementById('admin-panel');
  const adminClose = document.getElementById('admin-close');
  const btnAddHotspot = document.getElementById('btn-add-hotspot');
  const hotspotForm = document.getElementById('hotspot-form');
  const hsTitle = document.getElementById('hs-title');
  const hsDesc = document.getElementById('hs-desc');

  // Media type toggle
  const mediaTypeVideo = document.getElementById('media-type-video');
  const mediaTypeImage = document.getElementById('media-type-image');
  const hsMediaVideo = document.getElementById('hs-media-video');
  const hsMediaImage = document.getElementById('hs-media-image');

  // Video fields
  const hsVideoUrl = document.getElementById('hs-video-url');
  const hsVideoFile = document.getElementById('hs-video-file');
  const hsVideoFileLabel = document.getElementById('hs-video-file-label');
  const hsVideoPreview = document.getElementById('hs-video-preview');
  const hsVideoPreviewPlayer = document.getElementById('hs-video-preview-player');
  const hsRemoveVideo = document.getElementById('hs-remove-video');

  // Image fields
  const hsImageFile = document.getElementById('hs-image-file');
  const hsImageFileLabel = document.getElementById('hs-image-file-label');
  const hsImagePreview = document.getElementById('hs-image-preview');
  const hsImagePreviewImg = document.getElementById('hs-image-preview-img');
  const hsRemoveImage = document.getElementById('hs-remove-image');
  const hsImageUrl = document.getElementById('hs-image-url');

  // Position fields
  const hsTime = document.getElementById('hs-time');
  const hsTimeDisplay = document.getElementById('hs-time-display');
  const hsX = document.getElementById('hs-x');
  const hsXDisplay = document.getElementById('hs-x-display');
  const hsY = document.getElementById('hs-y');
  const hsYDisplay = document.getElementById('hs-y-display');
  const btnSaveHotspot = document.getElementById('btn-save-hotspot');
  const btnCancelHotspot = document.getElementById('btn-cancel-hotspot');
  const hotspotListEl = document.getElementById('hotspot-list');
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');
  const importInput = document.getElementById('import-input');

  // Publish elements
  const btnPublish = document.getElementById('btn-publish');
  const publishProgress = document.getElementById('publish-progress');
  const publishProgressBar = document.getElementById('publish-progress-bar');
  const publishProgressText = document.getElementById('publish-progress-text');
  const publishHint = document.getElementById('publish-hint');

  // ——— STATE ———
  let hotspots = [];
  let editingIndex = -1;
  let videoLoaded = false;
  let isDragging = false;
  let startX = 0;
  let startTime = 0;
  let scrubSensitivity = 0.003;
  let hintTimeout = null;
  let adminOpen = false;
  let videoObjectUrl = null;
  let videoFile = null; // keep reference to the original video File
  let currentHotspotVideoBlob = null;
  let currentHotspotVideoUrl = null;
  let currentHotspotImageBlob = null;
  let currentHotspotImageUrl = null;
  let currentMediaType = 'video'; // 'video' or 'image'
  let placingMode = false;
  let placingBanner = null;
  let isViewerMode = false;

  // ——— ZOOM STATE ———
  let zoomLevel = 1;
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 5;
  const ZOOM_STEP = 0.15;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panStartPanX = 0;
  let panStartPanY = 0;
  // Pinch state
  let pinchStartDist = 0;
  let pinchStartZoom = 1;
  let pinchMidX = 0;
  let pinchMidY = 0;

  // ——— MEDIA TYPE TOGGLE ———
  function setMediaType(type) {
    currentMediaType = type;
    if (mediaTypeVideo) mediaTypeVideo.classList.toggle('active', type === 'video');
    if (mediaTypeImage) mediaTypeImage.classList.toggle('active', type === 'image');
    if (hsMediaVideo) hsMediaVideo.style.display = type === 'video' ? 'block' : 'none';
    if (hsMediaImage) hsMediaImage.style.display = type === 'image' ? 'block' : 'none';
  }

  if (mediaTypeVideo) mediaTypeVideo.addEventListener('click', () => setMediaType('video'));
  if (mediaTypeImage) mediaTypeImage.addEventListener('click', () => setMediaType('image'));

  // ——— VIDEO UPLOAD ———
  if (uploadZone) {
    uploadZone.addEventListener('click', (e) => {
      if (e.target.closest('.btn-upload') || e.target.closest('label')) return;
      videoInput.click();
    });

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        loadVideo(file);
      }
    });
  }

  if (videoInput) {
    videoInput.addEventListener('change', (e) => {
      if (e.target.files[0]) loadVideo(e.target.files[0]);
    });
  }

  function loadVideo(file) {
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    videoFile = file; // keep reference for publishing
    videoObjectUrl = URL.createObjectURL(file);
    video.src = videoObjectUrl;
    video.load();

    video.addEventListener('loadedmetadata', function onMeta() {
      video.removeEventListener('loadedmetadata', onMeta);

      // On mobile Safari, we need to briefly play+pause to make the video seekable
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          video.pause();
          video.currentTime = 0;
          finishVideoLoad();
        }).catch(() => {
          // Autoplay blocked — video is still seekable on most devices
          video.currentTime = 0;
          finishVideoLoad();
        });
      } else {
        video.pause();
        video.currentTime = 0;
        finishVideoLoad();
      }
    });

    function finishVideoLoad() {
      videoLoaded = true;
      if (uploadZone) uploadZone.style.display = 'none';
      viewer.style.display = 'block';

      if (hsTime) {
        hsTime.max = video.duration;
        hsTime.step = 0.01;
      }

      if (scrubHint) {
        scrubHint.classList.remove('hidden');
        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => scrubHint.classList.add('hidden'), 3000);
      }

      // Restore saved hotspots if available
      loadHotspotsFromStorage();

      updateTimeline();
      renderHotspots();
    }
  }

  // ——— ZOOM FUNCTIONS ———
  function applyZoom() {
    const t = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
    video.style.transform = t;
    hotspotLayer.style.transform = t;
    // Show/hide reset zoom button
    const resetBtn = document.getElementById('btn-reset-zoom');
    if (resetBtn) resetBtn.style.display = zoomLevel > 1.05 ? 'flex' : 'none';
  }

  function clampPan() {
    if (zoomLevel <= 1) { panX = 0; panY = 0; return; }
    // Limit pan so edges stay within viewport
    const maxPanX = (zoomLevel - 1) / (2 * zoomLevel) * viewerCanvas.clientWidth;
    const maxPanY = (zoomLevel - 1) / (2 * zoomLevel) * viewerCanvas.clientHeight;
    panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
    panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
  }

  function resetZoom() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    applyZoom();
  }

  // Mouse wheel zoom (desktop)
  viewerCanvas.addEventListener('wheel', (e) => {
    if (!videoLoaded) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const oldZoom = zoomLevel;
    zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel + delta));

    if (zoomLevel !== oldZoom) {
      // Zoom towards mouse position
      const rect = viewerCanvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const scaleChange = zoomLevel / oldZoom;
      panX = panX * scaleChange - mx * rect.width * (scaleChange - 1) / zoomLevel;
      panY = panY * scaleChange - my * rect.height * (scaleChange - 1) / zoomLevel;
    }

    if (zoomLevel <= 1) { panX = 0; panY = 0; }
    clampPan();
    applyZoom();
  }, { passive: false });

  // Reset zoom button
  const btnResetZoom = document.getElementById('btn-reset-zoom');
  if (btnResetZoom) btnResetZoom.addEventListener('click', resetZoom);

  // ——— SCRUB INTERACTION ———
  function getPointerX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function getTouchDist(e) {
    const t = e.touches;
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getTouchMid(e) {
    const t = e.touches;
    return {
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2
    };
  }

  viewerCanvas.addEventListener('mousedown', startDrag);
  viewerCanvas.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    if (!videoLoaded) return;
    // Allow scrub even when starting on a hotspot pin (click handler opens popup separately)
    // if (e.target.closest('.hotspot-pin')) return;

    if (placingMode) {
      e.preventDefault();
      e.stopPropagation();
      placeHotspotAtClick(e);
      return;
    }

    e.preventDefault();

    // Two-finger touch → pinch-to-zoom
    if (e.touches && e.touches.length >= 2) {
      pinchStartDist = getTouchDist(e);
      pinchStartZoom = zoomLevel;
      const mid = getTouchMid(e);
      pinchMidX = mid.x;
      pinchMidY = mid.y;
      return;
    }

    // If zoomed in, single-finger drag = pan (not scrub)
    if (e.touches && zoomLevel > 1.05) {
      isPanning = true;
      panStartX = e.touches[0].clientX;
      panStartY = e.touches[0].clientY;
      panStartPanX = panX;
      panStartPanY = panY;
      return;
    }

    // Middle-click drag = pan on desktop when zoomed
    if (!e.touches && e.button === 1 && zoomLevel > 1.05) {
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panStartPanX = panX;
      panStartPanY = panY;
      return;
    }

    isDragging = true;
    startX = getPointerX(e);
    startTime = video.currentTime;
    if (scrubHint) scrubHint.classList.add('hidden');
  }

  function placeHotspotAtClick(e) {
    const rect = viewerCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;

    exitPlacingMode();

    if (!adminOpen) {
      adminOpen = true;
      adminPanel.classList.add('open');
    }

    editingIndex = -1;
    hsTitle.value = '';
    hsDesc.value = '';
    hsVideoUrl.value = '';
    hsImageUrl.value = '';
    resetHotspotMediaForm();
    setMediaType('video');

    if (videoLoaded) {
      hsTime.max = video.duration;
      hsTime.value = video.currentTime;
      hsTimeDisplay.textContent = video.currentTime.toFixed(2) + 's';
    }
    hsX.value = xPct.toFixed(1);
    hsXDisplay.textContent = xPct.toFixed(0) + '%';
    hsY.value = yPct.toFixed(1);
    hsYDisplay.textContent = yPct.toFixed(0) + '%';

    hotspotForm.style.display = 'flex';
  }

  function enterPlacingMode() {
    placingMode = true;
    viewerCanvas.classList.add('placing-hotspot');
    placingBanner = document.createElement('div');
    placingBanner.className = 'placing-banner';
    placingBanner.textContent = 'Cliquez sur la vidéo pour placer le hotspot';
    viewerCanvas.appendChild(placingBanner);
  }

  function exitPlacingMode() {
    placingMode = false;
    viewerCanvas.classList.remove('placing-hotspot');
    if (placingBanner) {
      placingBanner.remove();
      placingBanner = null;
    }
  }

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });

  function onDrag(e) {
    // Pinch-to-zoom (two fingers)
    if (e.touches && e.touches.length >= 2) {
      e.preventDefault();
      const dist = getTouchDist(e);
      const scale = dist / pinchStartDist;
      const oldZoom = zoomLevel;
      zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchStartZoom * scale));

      // Zoom towards pinch midpoint
      if (zoomLevel !== oldZoom) {
        const rect = viewerCanvas.getBoundingClientRect();
        const mx = (pinchMidX - rect.left) / rect.width - 0.5;
        const my = (pinchMidY - rect.top) / rect.height - 0.5;
        const scaleChange = zoomLevel / pinchStartZoom;
        panX = panStartPanX * scaleChange - mx * rect.width * (scaleChange - 1) / zoomLevel;
        panY = panStartPanY * scaleChange - my * rect.height * (scaleChange - 1) / zoomLevel;
      }

      if (zoomLevel <= 1) { panX = 0; panY = 0; }
      clampPan();
      applyZoom();
      return;
    }

    // Panning (single finger on mobile when zoomed, or middle-click desktop)
    if (isPanning) {
      e.preventDefault();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      panX = panStartPanX + (cx - panStartX) / zoomLevel;
      panY = panStartPanY + (cy - panStartY) / zoomLevel;
      clampPan();
      applyZoom();
      return;
    }

    if (!isDragging) return;
    e.preventDefault();
    const x = getPointerX(e);
    const dx = x - startX;
    let newTime = startTime + dx * scrubSensitivity * video.duration;

    if (newTime < 0) newTime = video.duration + newTime;
    if (newTime > video.duration) newTime = newTime - video.duration;
    newTime = Math.max(0, Math.min(video.duration - 0.01, newTime));

    video.currentTime = newTime;
    updateTimeline();
    updateHotspotVisibility();
  }

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function endDrag() {
    isDragging = false;
    isPanning = false;
  }

  // ——— TIMELINE ———
  function updateTimeline() {
    if (!videoLoaded) return;
    const pct = (video.currentTime / video.duration) * 100;
    timelineProgress.style.width = pct + '%';
  }

  if (timelineBar) timelineBar.addEventListener('click', (e) => {
    if (!videoLoaded) return;
    const rect = timelineBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
    updateTimeline();
    updateHotspotVisibility();
  });

  // ——— HOTSPOT RENDERING ———
  function renderHotspots() {
    if (hotspotLayer) hotspotLayer.innerHTML = '';
    if (timelineMarkers) timelineMarkers.innerHTML = '';
    if (hotspotListEl) hotspotListEl.innerHTML = '';

    hotspots.forEach((hs, i) => {
      const pin = document.createElement('div');
      pin.className = 'hotspot-pin';
      pin.style.left = hs.x + '%';
      pin.style.top = hs.y + '%';
      pin.dataset.index = i;

      // Determine icon based on media type
      const mediaType = hs.mediaType || (hs.isLocalImage ? 'image' : 'video');
      const icon = mediaType === 'image'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

      pin.innerHTML = `
        <div class="hotspot-ring"></div>
        <div class="hotspot-ring"></div>
        <div class="hotspot-ring"></div>
        <div class="hotspot-core">${icon}</div>
        <div class="hotspot-tooltip">${escapeHtml(hs.title)}</div>
      `;

      // Use pointerup with distance check so scrub-drag doesn't trigger popup
      let pinPointerStart = null;
      pin.addEventListener('pointerdown', (e) => {
        pinPointerStart = { x: e.clientX, y: e.clientY };
      });
      pin.addEventListener('pointerup', (e) => {
        if (!pinPointerStart) return;
        const dx = Math.abs(e.clientX - pinPointerStart.x);
        const dy = Math.abs(e.clientY - pinPointerStart.y);
        pinPointerStart = null;
        // Only open popup if it was a real click (not a drag)
        if (dx < 8 && dy < 8) {
          e.stopPropagation();
          openPopup(i);
        }
      });
      if (hotspotLayer) hotspotLayer.appendChild(pin);

      const marker = document.createElement('div');
      marker.className = 'timeline-marker';
      const pct = (hs.time / video.duration) * 100;
      marker.style.left = pct + '%';
      marker.title = hs.title;
      if (timelineMarkers) timelineMarkers.appendChild(marker);

      // Badge: vidéo or image (admin list only)
      if (hotspotListEl) {
        let badge = '';
        if (hs.mediaType === 'image' || hs.isLocalImage) {
          badge = '<span class="hotspot-item-badge">image</span>';
        } else if (hs.isLocalVideo || hs.videoUrl) {
          badge = '<span class="hotspot-item-badge">vidéo</span>';
        }

        const item = document.createElement('div');
        item.className = 'hotspot-item';
        item.innerHTML = `
          <div class="hotspot-item-info">
            <div class="hotspot-item-dot"></div>
            <span class="hotspot-item-title">${escapeHtml(hs.title)}</span>
            ${badge}
            <span class="hotspot-item-time">${hs.time.toFixed(1)}s</span>
          </div>
          <div class="hotspot-item-actions">
            <button class="edit-btn" title="Modifier" data-index="${i}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="delete-btn" title="Supprimer" data-index="${i}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>`;
        hotspotListEl.appendChild(item);
      }
    });

    if (hotspotListEl) {
      hotspotListEl.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editHotspot(parseInt(btn.dataset.index)));
      });
      hotspotListEl.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteHotspot(parseInt(btn.dataset.index)));
      });
    }

    updateHotspotVisibility();
  }

  // ——— HOTSPOT VISIBILITY ———
  // The hotspot stays at its fixed X/Y position.
  // It is only visible when the current scrub position is near its timestamp.
  // Threshold = 3% of total duration → on a 5s video that's ±0.15s.
  // This keeps the hotspot on the correct part of the tractor.
  function updateHotspotVisibility() {
    if (!hotspotLayer) return;
    const pins = hotspotLayer.querySelectorAll('.hotspot-pin');
    const currentTime = video.currentTime;
    const duration = video.duration;
    if (!duration) return;

    pins.forEach(pin => {
      const i = parseInt(pin.dataset.index);
      const hs = hotspots[i];
      if (!hs) return;

      // Circular distance (handles wrap-around for looping video)
      const threshold = duration * 0.03; // 3% of duration
      let diff = Math.abs(currentTime - hs.time);
      if (diff > duration / 2) diff = duration - diff;

      if (diff <= threshold) {
        // Smooth fade: fully visible at exact time, fading toward edges
        const opacity = 1 - (diff / threshold) * 0.5;
        pin.classList.add('visible');
        pin.style.opacity = opacity;
      } else {
        pin.classList.remove('visible');
        pin.style.opacity = '0';
      }
    });
  }

  // ——— POPUP ———
  function openPopup(index) {
    const hs = hotspots[index];
    if (!hs) return;

    popupTitle.textContent = hs.title;
    popupDesc.textContent = hs.description || '';
    popupMediaWrap.innerHTML = '';

    const mediaType = hs.mediaType || (hs.isLocalImage ? 'image' : 'video');

    if (mediaType === 'image') {
      // Show image
      const imgUrl = hs.imageUrl || '';
      if (imgUrl) {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = hs.title;
        img.style.cssText = 'width:100%;max-height:70vh;object-fit:contain;display:block;border-radius:0.5rem;';
        popupMediaWrap.appendChild(img);
      } else {
        popupMediaWrap.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:2rem;">Aucune image configurée</p>';
      }
    } else {
      // Show video
      const videoUrl = hs.videoUrl || '';
      if (videoUrl) {
        const ytId = extractYouTubeId(videoUrl);
        if (ytId) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
          iframe.setAttribute('allow', 'autoplay; encrypted-media');
          iframe.setAttribute('allowfullscreen', '');
          iframe.style.border = 'none';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          popupMediaWrap.style.aspectRatio = '16/9';
          popupMediaWrap.appendChild(iframe);
        } else {
          const vid = document.createElement('video');
          vid.src = videoUrl;
          vid.controls = true;
          vid.autoplay = true;
          vid.setAttribute('playsinline', '');
          vid.style.width = '100%';
          vid.style.height = '100%';
          popupMediaWrap.appendChild(vid);
        }
      } else {
        popupMediaWrap.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:2rem;">Aucun média configuré</p>';
      }
    }

    popupOverlay.style.display = 'flex';
  }

  function closePopup() {
    popupOverlay.style.display = 'none';
    popupMediaWrap.innerHTML = '';
    popupMediaWrap.style.aspectRatio = '';
  }

  popupClose.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closePopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (placingMode) {
        exitPlacingMode();
      } else {
        closePopup();
      }
    }
  });

  function extractYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  // ——— ADMIN PANEL ———
  if (btnAdmin) btnAdmin.addEventListener('click', () => {
    adminOpen = !adminOpen;
    if (adminPanel) adminPanel.classList.toggle('open', adminOpen);
  });

  if (adminClose) adminClose.addEventListener('click', () => {
    adminOpen = false;
    if (adminPanel) adminPanel.classList.remove('open');
  });

  // ——— RESET MEDIA FORMS ———
  function resetHotspotMediaForm() {
    // Check if current video URL is owned by an existing hotspot (don't revoke those)
    const videoUrlInUse = currentHotspotVideoUrl && hotspots.some(h => h.videoUrl === currentHotspotVideoUrl);

    // Reset video
    if (currentHotspotVideoUrl && !videoUrlInUse && currentHotspotVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentHotspotVideoUrl);
    }
    currentHotspotVideoBlob = null;
    currentHotspotVideoUrl = null;
    if (hsVideoFile) hsVideoFile.value = '';
    if (hsVideoFileLabel) hsVideoFileLabel.textContent = 'Choisir une vidéo depuis mon téléphone';
    if (hsVideoPreview) hsVideoPreview.style.display = 'none';
    if (hsVideoPreviewPlayer) hsVideoPreviewPlayer.src = '';
    if (hsVideoUrl) hsVideoUrl.value = '';

    // Reset image (images use data URLs now, no need to revoke)
    currentHotspotImageBlob = null;
    currentHotspotImageUrl = null;
    if (hsImageFile) hsImageFile.value = '';
    if (hsImageFileLabel) hsImageFileLabel.textContent = 'Choisir une image depuis mon téléphone';
    if (hsImagePreview) hsImagePreview.style.display = 'none';
    if (hsImagePreviewImg) hsImagePreviewImg.src = '';
    if (hsImageUrl) hsImageUrl.value = '';
  }

  // Hotspot video file upload
  if (hsVideoFile) hsVideoFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (currentHotspotVideoUrl) URL.revokeObjectURL(currentHotspotVideoUrl);
    currentHotspotVideoBlob = file;
    currentHotspotVideoUrl = URL.createObjectURL(file);
    hsVideoFileLabel.textContent = file.name;
    hsVideoPreviewPlayer.src = currentHotspotVideoUrl;
    hsVideoPreview.style.display = 'block';
    hsVideoUrl.value = '';
  });

  if (hsRemoveVideo) hsRemoveVideo.addEventListener('click', () => {
    if (currentHotspotVideoUrl) URL.revokeObjectURL(currentHotspotVideoUrl);
    currentHotspotVideoBlob = null;
    currentHotspotVideoUrl = null;
    hsVideoFile.value = '';
    hsVideoFileLabel.textContent = 'Choisir une vidéo depuis mon téléphone';
    hsVideoPreview.style.display = 'none';
    hsVideoPreviewPlayer.src = '';
  });

  // Hotspot image file upload — convert to data URL for reliability on all browsers
  if (hsImageFile) hsImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    currentHotspotImageBlob = file;
    hsImageFileLabel.textContent = file.name;
    // Convert to data URL so the image persists (blob URLs can be unreliable on mobile Safari)
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentHotspotImageUrl = ev.target.result; // data:image/...;base64,...
      hsImagePreviewImg.src = currentHotspotImageUrl;
      hsImagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    hsImageUrl.value = '';
  });

  if (hsRemoveImage) hsRemoveImage.addEventListener('click', () => {
    currentHotspotImageBlob = null;
    currentHotspotImageUrl = null;
    hsImageFile.value = '';
    hsImageFileLabel.textContent = 'Choisir une image depuis mon téléphone';
    hsImagePreview.style.display = 'none';
    hsImagePreviewImg.src = '';
  });

  // ——— ADD / SAVE / EDIT / DELETE HOTSPOT ———
  if (btnAddHotspot) btnAddHotspot.addEventListener('click', () => {
    if (!videoLoaded) return;
    adminOpen = false;
    adminPanel.classList.remove('open');
    hotspotForm.style.display = 'none';
    enterPlacingMode();
  });

  if (btnCancelHotspot) btnCancelHotspot.addEventListener('click', () => {
    hotspotForm.style.display = 'none';
    resetHotspotMediaForm();
    exitPlacingMode();
  });

  if (hsTime) hsTime.addEventListener('input', () => {
    const val = parseFloat(hsTime.value);
    hsTimeDisplay.textContent = val.toFixed(2) + 's';
    if (videoLoaded) {
      video.currentTime = val;
      updateTimeline();
      updateHotspotVisibility();
    }
  });

  if (hsX) hsX.addEventListener('input', () => {
    hsXDisplay.textContent = hsX.value + '%';
  });

  if (hsY) hsY.addEventListener('input', () => {
    hsYDisplay.textContent = hsY.value + '%';
  });

  if (btnSaveHotspot) btnSaveHotspot.addEventListener('click', () => {
    const title = hsTitle.value.trim() || 'Hotspot';
    const desc = hsDesc.value.trim();
    const time = parseFloat(hsTime.value);
    const x = parseFloat(hsX.value);
    const y = parseFloat(hsY.value);

    const data = {
      title,
      description: desc,
      mediaType: currentMediaType,
      // Video data
      videoUrl: '',
      videoBlob: null,
      videoFileName: null,
      isLocalVideo: false,
      // Image data
      imageUrl: '',
      imageBlob: null,
      imageFileName: null,
      isLocalImage: false,
      // Position
      time, x, y
    };

    if (currentMediaType === 'video') {
      if (currentHotspotVideoBlob) {
        // Reuse the existing blob URL from the form preview (don't create a new one)
        data.videoUrl = currentHotspotVideoUrl || URL.createObjectURL(currentHotspotVideoBlob);
        data.videoBlob = currentHotspotVideoBlob;
        data.videoFileName = currentHotspotVideoBlob.name;
        data.isLocalVideo = true;
      } else {
        data.videoUrl = hsVideoUrl.value.trim();
      }
    } else {
      if (currentHotspotImageBlob) {
        // Reuse the existing blob URL from the form preview (don't create a new one)
        data.imageUrl = currentHotspotImageUrl || URL.createObjectURL(currentHotspotImageBlob);
        data.imageBlob = currentHotspotImageBlob;
        data.imageFileName = currentHotspotImageBlob.name;
        data.isLocalImage = true;
      } else {
        data.imageUrl = hsImageUrl.value.trim();
      }
    }

    if (editingIndex >= 0) {
      const old = hotspots[editingIndex];
      // Only revoke old URLs if they differ from the new ones (avoid revoking reused URLs)
      if (old.isLocalVideo && old.videoUrl && old.videoUrl !== data.videoUrl) URL.revokeObjectURL(old.videoUrl);
      if (old.isLocalImage && old.imageUrl && old.imageUrl !== data.imageUrl && old.imageUrl.startsWith('blob:')) URL.revokeObjectURL(old.imageUrl);
      hotspots[editingIndex] = data;
    } else {
      hotspots.push(data);
    }

    hotspotForm.style.display = 'none';
    // Clear references but do NOT revoke — the URLs are now owned by the hotspot data
    currentHotspotVideoBlob = null;
    currentHotspotVideoUrl = null;
    currentHotspotImageBlob = null;
    currentHotspotImageUrl = null;
    renderHotspots();
  });

  function editHotspot(index) {
    const hs = hotspots[index];
    if (!hs) return;
    editingIndex = index;
    hsTitle.value = hs.title;
    hsDesc.value = hs.description || '';

    resetHotspotMediaForm();

    const mediaType = hs.mediaType || (hs.isLocalImage ? 'image' : 'video');
    setMediaType(mediaType);

    if (mediaType === 'image') {
      if (hs.isLocalImage && hs.imageUrl) {
        currentHotspotImageBlob = hs.imageBlob || null;
        currentHotspotImageUrl = hs.imageUrl;
        hsImageFileLabel.textContent = hs.imageFileName || 'Image chargée';
        hsImagePreviewImg.src = hs.imageUrl;
        hsImagePreview.style.display = 'block';
      } else if (hs.imageUrl) {
        hsImageUrl.value = hs.imageUrl;
      }
    } else {
      if (hs.isLocalVideo && hs.videoBlob) {
        currentHotspotVideoBlob = hs.videoBlob;
        currentHotspotVideoUrl = hs.videoUrl;
        hsVideoFileLabel.textContent = hs.videoFileName || 'Vidéo chargée';
        hsVideoPreviewPlayer.src = hs.videoUrl;
        hsVideoPreview.style.display = 'block';
      } else {
        hsVideoUrl.value = hs.videoUrl || '';
      }
    }

    hsTime.value = hs.time;
    hsTimeDisplay.textContent = hs.time.toFixed(2) + 's';
    hsX.value = hs.x;
    hsXDisplay.textContent = hs.x + '%';
    hsY.value = hs.y;
    hsYDisplay.textContent = hs.y + '%';
    hotspotForm.style.display = 'flex';

    if (videoLoaded) {
      video.currentTime = hs.time;
      updateTimeline();
    }
  }

  function deleteHotspot(index) {
    hotspots.splice(index, 1);
    renderHotspots();
  }

  // ——— EXPORT / IMPORT ———
  if (btnExport) btnExport.addEventListener('click', () => {
    const exportData = hotspots.map(hs => ({
      title: hs.title,
      description: hs.description,
      mediaType: hs.mediaType || 'video',
      videoUrl: hs.isLocalVideo ? '' : (hs.videoUrl || ''),
      imageUrl: hs.isLocalImage ? '' : (hs.imageUrl || ''),
      videoFileName: hs.videoFileName || null,
      imageFileName: hs.imageFileName || null,
      time: hs.time,
      x: hs.x,
      y: hs.y
    }));
    const data = JSON.stringify({ hotspots: exportData }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'agritour360-config.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  if (btnImport) btnImport.addEventListener('click', () => importInput.click());

  if (importInput) importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.hotspots && Array.isArray(data.hotspots)) {
          hotspots = data.hotspots;
          renderHotspots();
        }
      } catch (err) {
        alert('Fichier JSON invalide');
      }
    };
    reader.readAsText(file);
    importInput.value = '';
  });

  // ——— HELPERS ———
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ——— PERSISTENT HOTSPOT SAVE ———
  // Use window storage if available (may be blocked in sandboxed iframes)
  const _sto = (function() {
    try { const s = window['local'+'Storage']; const t = '__t__'; s.setItem(t,t); s.removeItem(t); return s; }
    catch(e) { return null; }
  })();
  const SAVE_KEY = 'agritour360-hotspots';

  function saveHotspotsToStorage() {
    if (!_sto) return;
    try {
      const data = hotspots.map(hs => ({
        title: hs.title,
        description: hs.description,
        mediaType: hs.mediaType || 'video',
        videoUrl: hs.isLocalVideo ? '' : (hs.videoUrl || ''),
        imageUrl: hs.imageUrl || '',
        videoFileName: hs.videoFileName || null,
        imageFileName: hs.imageFileName || null,
        isLocalImage: hs.isLocalImage || false,
        time: hs.time,
        x: hs.x,
        y: hs.y
      }));
      _sto.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) { /* silently fail */ }
  }

  function loadHotspotsFromStorage() {
    if (isViewerMode || !_sto) return;
    try {
      const raw = _sto.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0 && hotspots.length === 0) {
        hotspots = data;
      }
    } catch (e) { /* silently fail */ }
  }

  // Auto-save after each render
  const _origRenderHotspots = renderHotspots;
  renderHotspots = function () {
    _origRenderHotspots();
    if (!isViewerMode) saveHotspotsToStorage();
  };

  // ——— VIEWER MODE (published tour) ———
  // When opened from a published ZIP, the page has a <script id="embedded-tour-data"> with JSON.
  // The video is at ./tour-video.mp4 and hotspots are embedded in the JSON.
  //
  // CRITICAL PERFORMANCE FIX:
  // Setting video.currentTime on a remote MP4 causes the browser to seek via network,
  // resulting in 3-5s lag on mobile. Solution: download the ENTIRE video into memory as
  // a Blob, then create a blob: URL. The browser can then seek instantly (local data).
  function checkViewerMode() {
    const embeddedData = document.getElementById('embedded-tour-data');
    if (!embeddedData) return;

    isViewerMode = true;
    document.body.classList.add('viewer-mode');

    try {
      const data = JSON.parse(embeddedData.textContent);
      if (data.hotspots) hotspots = data.hotspots;
    } catch (e) {
      console.error('Failed to parse embedded tour data:', e);
    }

    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingFill = document.getElementById('loading-progress-fill');
    const loadingPct = document.getElementById('loading-pct');
    if (uploadZone) uploadZone.style.display = 'none';
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    // Download the entire video as a Blob for instant local scrubbing
    const tourVideoSrc = './tour-video.mp4';
    const xhr = new XMLHttpRequest();
    xhr.open('GET', tourVideoSrc, true);
    xhr.responseType = 'blob';

    xhr.onprogress = function (e) {
      if (e.lengthComputable && loadingFill && loadingPct) {
        const pct = Math.round((e.loaded / e.total) * 100);
        loadingFill.style.width = pct + '%';
        loadingPct.textContent = pct + '%';
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const blobUrl = URL.createObjectURL(blob);
        loadVideoFromBlobUrl(blobUrl);
      } else {
        // Fallback: load from URL directly (will be laggy but functional)
        console.warn('Blob download failed, falling back to direct URL');
        loadVideoFromDirectUrl(tourVideoSrc);
      }
    };

    xhr.onerror = function () {
      // Fallback for CORS or network issues
      console.warn('Blob download error, falling back to direct URL');
      loadVideoFromDirectUrl(tourVideoSrc);
    };

    xhr.send();

    function loadVideoFromBlobUrl(blobUrl) {
      video.src = blobUrl;
      video.load();

      video.addEventListener('loadedmetadata', function onMeta() {
        video.removeEventListener('loadedmetadata', onMeta);

        // On mobile Safari, briefly play+pause to prime the video
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            video.pause();
            video.currentTime = 0;
            finishViewerLoad();
          }).catch(() => {
            video.currentTime = 0;
            finishViewerLoad();
          });
        } else {
          video.pause();
          video.currentTime = 0;
          finishViewerLoad();
        }
      });
    }

    function loadVideoFromDirectUrl(url) {
      video.src = url;
      video.load();

      video.addEventListener('loadedmetadata', function onMeta() {
        video.removeEventListener('loadedmetadata', onMeta);

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            video.pause();
            video.currentTime = 0;
            finishViewerLoad();
          }).catch(() => {
            video.currentTime = 0;
            finishViewerLoad();
          });
        } else {
          video.pause();
          video.currentTime = 0;
          finishViewerLoad();
        }
      });
    }

    function finishViewerLoad() {
      // Hide loading overlay, show viewer
      if (loadingOverlay) loadingOverlay.style.display = 'none';

      videoLoaded = true;
      if (uploadZone) uploadZone.style.display = 'none';
      viewer.style.display = 'block';

      if (scrubHint) {
        scrubHint.classList.remove('hidden');
        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => scrubHint.classList.add('hidden'), 3000);
      }

      updateTimeline();
      renderHotspots();
    }
  }

  // Check on startup
  checkViewerMode();

  // ——— PUBLISH (Generate self-contained ZIP) ———
  if (btnPublish) {
    btnPublish.addEventListener('click', async () => {
      if (!videoLoaded || !videoFile) {
        alert('Veuillez d\'abord charger une vidéo 360°.');
        return;
      }
      if (hotspots.length === 0) {
        alert('Ajoutez au moins un hotspot avant de publier.');
        return;
      }
      if (typeof JSZip === 'undefined') {
        alert('Erreur: la bibliothèque JSZip n\'est pas chargée.');
        return;
      }

      btnPublish.disabled = true;
      publishHint.style.display = 'none';
      publishProgress.style.display = 'block';

      try {
        const zip = new JSZip();

        // 1. Prepare hotspot data for embedding (strip blobs, keep data URLs for images)
        updateProgress(5, 'Préparation des hotspots...');
        const embeddedHotspots = hotspots.map(hs => {
          const mediaType = hs.mediaType || (hs.isLocalImage ? 'image' : 'video');
          return {
            title: hs.title,
            description: hs.description,
            mediaType: mediaType,
            videoUrl: (mediaType === 'video' && !hs.isLocalVideo) ? (hs.videoUrl || '') : '',
            imageUrl: (mediaType === 'image') ? (hs.imageUrl || '') : '',
            isLocalVideo: false,
            isLocalImage: hs.isLocalImage || false,
            time: hs.time,
            x: hs.x,
            y: hs.y
          };
        });

        // Handle local video hotspots: convert blob URLs to files in ZIP
        for (let i = 0; i < hotspots.length; i++) {
          const hs = hotspots[i];
          if (hs.isLocalVideo && hs.videoBlob) {
            updateProgress(10, `Ajout vidéo hotspot ${i + 1}...`);
            const ext = hs.videoFileName ? hs.videoFileName.split('.').pop() : 'mp4';
            const fname = `hotspot-video-${i}.${ext}`;
            zip.file(`assets/${fname}`, hs.videoBlob);
            embeddedHotspots[i].videoUrl = `./assets/${fname}`;
            embeddedHotspots[i].isLocalVideo = false; // now it's a relative URL
          }
        }

        // 2. Read current CSS files
        updateProgress(15, 'Construction des fichiers...');
        const baseCss = await fetchText('./base.css');
        const styleCss = await fetchText('./style.css');

        // 3. Build the viewer-only HTML
        const tourData = JSON.stringify({ hotspots: embeddedHotspots });
        const viewerHtml = buildViewerHtml(tourData, baseCss, styleCss);
        zip.file('index.html', viewerHtml);

        // 4. Build viewer-only app.js (same code but with embedded data trigger)
        const appJs = await fetchText('./app.js');
        zip.file('app.js', appJs);
        zip.file('base.css', baseCss);
        zip.file('style.css', styleCss);

        // 5. Add logo
        updateProgress(20, 'Ajout du logo...');
        try {
          const logoResponse = await fetch('./assets/logo-agricorner.png');
          if (logoResponse.ok) {
            const logoBlob = await logoResponse.blob();
            zip.file('assets/logo-agricorner.png', logoBlob);
          }
        } catch (e) { /* logo optional */ }

        // 6. Add the main video (biggest step)
        updateProgress(25, 'Ajout de la vidéo 360°...');
        zip.file('tour-video.mp4', videoFile);

        // 7. Generate ZIP
        updateProgress(60, 'Compression du ZIP...');
        const blob = await zip.generateAsync(
          { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 1 } },
          (metadata) => {
            const pct = 60 + Math.round(metadata.percent * 0.35);
            updateProgress(pct, `Compression... ${Math.round(metadata.percent)}%`);
          }
        );

        updateProgress(100, 'Téléchargement...');

        // 8. Download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        const tourName = hotspots[0] ? hotspots[0].title.replace(/[^a-zA-Z0-9à-ü\-_ ]/g, '').trim() : 'tour';
        a.download = `agritour360-${tourName || 'tour'}.zip`;
        a.click();
        URL.revokeObjectURL(a.href);

        setTimeout(() => {
          publishProgress.style.display = 'none';
          publishHint.style.display = 'block';
          publishHint.textContent = '✅ ZIP téléchargé ! Déposez-le sur app.netlify.com/drop pour le partager.';
          btnPublish.disabled = false;
        }, 1000);

      } catch (err) {
        console.error('Publish error:', err);
        alert('Erreur lors de la génération du ZIP: ' + err.message);
        publishProgress.style.display = 'none';
        publishHint.style.display = 'block';
        btnPublish.disabled = false;
      }
    });
  }

  function updateProgress(pct, text) {
    if (publishProgressBar) publishProgressBar.style.width = pct + '%';
    if (publishProgressText) publishProgressText.textContent = text;
  }

  async function fetchText(url) {
    try {
      const r = await fetch(url);
      return r.ok ? await r.text() : '';
    } catch (e) { return ''; }
  }

  function buildViewerHtml(tourDataJson, baseCss, styleCss) {
    return `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
<!--
   ______                            __
  / ____/___  ____ ___  ____  __  __/ /____  _____
 / /   / __ \\/ __ \`__ \\/ __ \\/ / / / __/ _ \\/ ___/
/ /___/ /_/ / / / / / / /_/ / /_/ / /_/  __/ /
\\____/\\____/_/ /_/ /_/ .___/\\__,_/\\__/\\___/_/
                    /_/
        Created with Perplexity Computer
        https://www.perplexity.ai/computer
-->
<meta name="generator" content="Perplexity Computer">
<meta name="author" content="Perplexity Computer">
<meta property="og:see_also" content="https://www.perplexity.ai/computer">
<link rel="author" href="https://www.perplexity.ai/computer">

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>AgriTour 360 — Visite virtuelle</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./base.css">
<link rel="stylesheet" href="./style.css">
</head>
<body>

<!-- EMBEDDED TOUR DATA -->
<script type="application/json" id="embedded-tour-data">${tourDataJson.replace(/<\/script/gi, '<\\/script')}</script>

<!-- HEADER -->
<header class="header">
  <div class="header-inner">
    <div class="logo">
      <img src="./assets/logo-agricorner.png" alt="AgriCorner" class="logo-img">
    </div>
    <div class="header-actions">
      <button data-theme-toggle aria-label="Changer de th\u00e8me" class="btn-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  </div>
</header>

<!-- MAIN VIEWER -->
<main class="viewer-container">
  <div class="upload-zone" id="upload-zone" style="display:none;"></div>

  <div class="loading-overlay" id="loading-overlay" style="display:none;">
    <div class="loading-inner">
      <div class="loading-spinner"></div>
      <p class="loading-title">Chargement de la visite...</p>
      <div class="loading-progress-track">
        <div class="loading-progress-fill" id="loading-progress-fill"></div>
      </div>
      <p class="loading-pct" id="loading-pct">0%</p>
    </div>
  </div>

  <div class="viewer" id="viewer" style="display:none;">
    <div class="viewer-canvas" id="viewer-canvas">
      <video id="spin-video" muted playsinline preload="auto"></video>
      <canvas id="overlay-canvas"></canvas>
      <div class="hotspot-layer" id="hotspot-layer"></div>
      <button class="btn-reset-zoom" id="btn-reset-zoom" style="display:none;" title="R\u00e9initialiser le zoom">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <div class="scrub-hint" id="scrub-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M5 12l3-3M5 12l3 3M19 12l-3-3M19 12l-3 3"/></svg>
        <span>Glissez pour tourner</span>
      </div>
    </div>
    <div class="timeline-bar" id="timeline-bar">
      <div class="timeline-progress" id="timeline-progress"></div>
      <div class="timeline-markers" id="timeline-markers"></div>
    </div>
  </div>

  <div class="popup-overlay" id="popup-overlay" style="display:none;">
    <div class="popup-content" id="popup-content">
      <button class="popup-close" id="popup-close" aria-label="Fermer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 id="popup-title"></h3>
      <div class="popup-media-wrap" id="popup-media-wrap">
        <video id="popup-video" controls playsinline></video>
      </div>
      <p id="popup-desc"></p>
    </div>
  </div>
</main>

<!-- ADMIN PANEL (hidden in viewer mode) -->
<aside class="admin-panel" id="admin-panel"></aside>

<footer class="footer">
  <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer">
    Created with Perplexity Computer
  </a>
</footer>

<script src="./app.js"></script>
</body>
</html>`;
  }

  // ——— CONTINUOUS UPDATE ———
  let raf;
  function tick() {
    if (videoLoaded) {
      updateTimeline();
      updateHotspotVisibility();
    }
    raf = requestAnimationFrame(tick);
  }
  tick();

  // ——— KEYBOARD SCRUB + ZOOM ———
  document.addEventListener('keydown', (e) => {
    if (!videoLoaded) return;
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

    const step = video.duration * 0.02;
    if (e.key === 'ArrowLeft') {
      video.currentTime = Math.max(0, video.currentTime - step);
    } else if (e.key === 'ArrowRight') {
      video.currentTime = Math.min(video.duration - 0.01, video.currentTime + step);
    } else if (e.key === '+' || e.key === '=') {
      zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
      clampPan();
      applyZoom();
    } else if (e.key === '-' || e.key === '_') {
      zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
      if (zoomLevel <= 1) { panX = 0; panY = 0; }
      clampPan();
      applyZoom();
    } else if (e.key === '0') {
      resetZoom();
    }
  });

})();
