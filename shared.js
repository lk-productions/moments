// Shared helpers for the camera, slideshow and QR card pages. No need to edit.
(function () {
  const params = new URLSearchParams(location.search);
  const eventId = (params.get('e') || '').trim().toLowerCase();
  const apiUrl = (window.SITE && SITE.apiUrl) || '';
  // ?e=demo always shows sample photos — handy for showing the camera to a new client.
  const demo = !apiUrl || eventId === 'demo';
  // ?sample=1 shows sample photos with a real event's branding, to preview the look.
  const useSamples = demo || params.get('sample') === '1';

  const demoMode = params.get('mode') === 'event' ? 'event' : 'wedding';
  const DEMO_EVENT = {
    id: 'demo', mode: demoMode,
    title: demoMode === 'event' ? 'Homecoming 2026' : 'Alex & Jordan',
    headline: demoMode === 'event' ? 'Lewis University' : '',
    date: demoMode === 'event' ? 'October 2026' : 'June 14, 2027',
    shots: demoMode === 'event' ? 10 : 4,
    theme: params.get('theme') || (demoMode === 'event' ? 'crimson' : 'ivory'),
    allowRetake: true, showGuestPhotos: true, approveFirst: false, open: true,
    features: {
      guestbook: true, hearts: true, look: 'choose', stamp: true, video: false, clipSeconds: 10, clips: 1,
      develop: { at: '', screens: true, until: 0 }, developing: false, album: true,
      booth: true, boothStyle: params.get('booth') === 'strip' ? 'strip' : 'grid', frame: 'band', tables: true, voice: true, songs: true, spanish: true,
      rolls: [{ id: 'ceremony', text: 'Ceremony' }, { id: 'reception', text: 'Reception' }],
      challenges: [{ id: 'dance', text: 'Someone on the dance floor' }, { id: 'oldest', text: 'The longest-married couple' },
        { id: 'selfie', text: 'A selfie with the couple' }],
    },
  };
  const demoMessages = [
    { id: 'm1', name: 'Aunt May', text: 'So proud of you two. What a beautiful day!', t: Date.now() - 600000 },
    { id: 'm2', name: 'Chris', text: 'Best wedding food ever. Congrats!!', t: Date.now() - 300000 },
  ];

  // Wording for each mode. {shots} and {title} are filled in per event.
  const COPY = {
    wedding: {
      headline: 'The wedding of',
      intro: "You've got {shots} shots on this camera. Like a real disposable, you can't delete them, so make them count.",
      nameLabel: 'Your name (so we know who took what)',
      startButton: 'Open the camera',
      doneIcon: '♥',
      doneTitle: "That's a wrap!",
      doneText: "Your camera's out of film. Thank you for capturing our day.",
      closed: 'Thanks for celebrating with {title}!',
      cardEyebrow: 'Be our photographer',
      cardTitle: 'Grab a disposable camera',
      cardSub: 'Take {shots} photos for our album. No app needed.',
      joinTitle: 'Add your photos',
      joinSub: 'Scan for your disposable camera',
      emptyText: "Scan to grab your disposable camera. Photos will appear here as they're taken.",
    },
    event: {
      headline: '',
      intro: "You've got {shots} shots to capture the moment. Every photo goes straight to the event album.",
      nameLabel: 'Your name (optional, for photo credit)',
      startButton: 'Open the camera',
      doneIcon: '✦',
      doneTitle: "You're all out of shots",
      doneText: 'Thanks for sharing your view of the event!',
      closed: 'Thanks for being part of {title}!',
      cardEyebrow: 'Share your view',
      cardTitle: 'Snap photos for the event album',
      cardSub: 'Scan to take {shots} photos. No app needed.',
      joinTitle: 'Share your photos',
      joinSub: 'Scan to add yours to the slideshow',
      emptyText: "Scan to share your photos. They'll appear here as they're taken.",
    },
  };

  // Spanish built-in wording (custom wording from the Mac app is shown as written).
  const COPY_ES = {
    wedding: {
      headline: 'La boda de',
      intro: 'Tienes {shots} fotos en esta cámara. Como en una cámara desechable, no se pueden borrar, así que aprovéchalas.',
      nameLabel: 'Tu nombre (para saber quién tomó cada foto)',
      startButton: 'Abrir la cámara',
      doneIcon: '♥',
      doneTitle: '¡Listo!',
      doneText: 'Se acabó el rollo. Gracias por capturar nuestro día.',
      closed: '¡Gracias por celebrar con {title}!',
      cardEyebrow: 'Sé nuestro fotógrafo',
      cardTitle: 'Toma una cámara desechable',
      cardSub: 'Toma {shots} fotos para nuestro álbum. No necesitas ninguna app.',
      joinTitle: 'Agrega tus fotos',
      joinSub: 'Escanea para tu cámara desechable',
      emptyText: 'Escanea para tomar tu cámara desechable. Las fotos aparecerán aquí.',
    },
    event: {
      headline: '',
      intro: 'Tienes {shots} fotos para capturar el momento. Cada foto va directo al álbum del evento.',
      nameLabel: 'Tu nombre (opcional, para el crédito de la foto)',
      startButton: 'Abrir la cámara',
      doneIcon: '✦',
      doneTitle: 'Se te acabaron las fotos',
      doneText: '¡Gracias por compartir tu mirada del evento!',
      closed: '¡Gracias por ser parte de {title}!',
      cardEyebrow: 'Comparte tu mirada',
      cardTitle: 'Toma fotos para el álbum del evento',
      cardSub: 'Escanea para tomar {shots} fotos. No necesitas ninguna app.',
      joinTitle: 'Comparte tus fotos',
      joinSub: 'Escanea para agregar las tuyas a la presentación',
      emptyText: 'Escanea para compartir tus fotos. Aparecerán aquí.',
    },
  };
  let lang = 'en';
  function setLang(l) { lang = l === 'es' ? 'es' : 'en'; document.documentElement.lang = lang; }

  // "{shots} shots" / "{shots} photos" read "1 shot" / "1 photo" for a one-shot camera.
  function fill(text, ev) {
    let t = String(text);
    if (Number(ev.shots) === 1) t = t.replace(/\{shots\} (shot|photo)s\b/g, '1 $1').replace(/\{shots\} fotos\b/g, '1 foto');
    return t.replace(/\{shots\}/g, ev.shots).replace(/\{title\}/g, ev.title);
  }

  function copyFor(ev) {
    const table = lang === 'es' ? COPY_ES : COPY;
    const base = table[ev.mode] || table.wedding;
    const out = {};
    Object.keys(base).forEach((k) => {
      out[k] = fill(base[k], ev);
    });
    if (ev.headline) out.headline = ev.headline;
    // Per-event wording from the Mac app replaces the built-in text.
    const custom = ev.text || {};
    Object.keys(custom).forEach((k) => {
      if (custom[k]) out[k] = fill(custom[k], ev);
    });
    return out;
  }

  // Fills [data-copy="key"] with wording and [data-title] with the event title.
  function applyCopy(ev) {
    const c = copyFor(ev);
    document.querySelectorAll('[data-copy]').forEach((el) => {
      el.textContent = c[el.dataset.copy] || '';
      if (el.dataset.copy === 'headline') el.hidden = !c.headline;
    });
    document.querySelectorAll('[data-title]').forEach((el) => { el.textContent = ev.title; });
    document.querySelectorAll('[data-date]').forEach((el) => { el.textContent = ev.date; });
    fitTitles();
    return c;
  }

  // Shrinks a big title until its longest word fits the screen, so a long word like
  // "Commencement" in a wide face never spills off the edge. Hidden titles are fitted when shown.
  function fitTitles() {
    document.querySelectorAll('h1[data-title], h2[data-title]').forEach((el) => {
      if (!el.offsetParent || el.closest('.qr-card')) return;
      el.style.fontSize = '';
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 1 && size > 18) {
        size -= 1;
        el.style.fontSize = size + 'px';
      }
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitles);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fitTitles);
  window.addEventListener('resize', () => fitTitles());

  // White or near-black text, whichever reads better on the given colour.
  function textOn(hex) {
    const n = parseInt(hex.slice(1), 16);
    const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.62 ? '#1a1612' : '#ffffff';
  }

  // Title and body typefaces per event. Each is loaded from Google Fonts only when used.
  const FONTS = {
    classic: { serif: '"Cormorant Garamond", Georgia, serif', sans: 'Inter', load: null },
    modern: { serif: '"DM Sans", Inter, sans-serif', sans: '"DM Sans"', load: 'DM+Sans:wght@400;500;600;700' },
    elegant: { serif: '"Playfair Display", Georgia, serif', sans: 'Inter', load: 'Playfair+Display:ital,wght@0,500;0,600;1,500' },
    script: { serif: '"Great Vibes", "Snell Roundhand", cursive', sans: 'Inter', load: 'Great+Vibes' },
    // Lewis University: Montserrat, the brand's headline and body face.
    lewis: { serif: 'Montserrat, "Avenir Next", sans-serif', sans: 'Montserrat', load: 'Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,500' },
  };

  function applyFont(name) {
    const f = FONTS[name] || FONTS.classic;
    if (f.load) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=' + f.load + '&display=swap';
      document.head.appendChild(link);
    }
    const root = document.documentElement.style;
    root.setProperty('--serif', f.serif);
    root.setProperty('--sans', f.sans);
    document.documentElement.dataset.font = name || 'classic';
  }

  function applyTheme(name, accent) {
    const t = THEMES[name] || THEMES.ivory;
    const custom = /^#[0-9a-f]{6}$/i.test(accent || '') ? accent : null;
    const root = document.documentElement.style;
    root.setProperty('--bg', t.background);
    root.setProperty('--card', t.card);
    root.setProperty('--ink', t.text);
    root.setProperty('--muted', t.muted);
    root.setProperty('--accent', custom || t.accent);
    root.setProperty('--accent-ink', custom ? textOn(custom) : (t.accentText || '#fff'));
    root.setProperty('--line', t.line);
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.background);
  }

  // Resolves to { event, photos, polls, messages, board }.
  // Rejects with err.code = 'missing' | 'not-found' | 'network'. Screens pass { screen: true }.
  async function loadEvent(opts) {
    if (!eventId && !demo) throw codeError('missing');
    if (demo) return { event: DEMO_EVENT, photos: await demoPhotos(), polls: demoPolls, messages: demoMessages.slice(), board: [],
      live: demoLive, songs: demoSongs.slice() };
    let data;
    try {
      const screen = opts && opts.screen ? '&screen=1' : '';
      const res = await fetch(apiUrl + '?action=event&e=' + encodeURIComponent(eventId) + screen, { cache: 'no-store' });
      data = await res.json();
    } catch (e) {
      throw codeError('network');
    }
    if (!data.ok) throw codeError(data.error === 'not-found' ? 'not-found' : 'network');
    if (data.event && !data.event.features) data.event.features = {}; // older Code.gs
    return { event: data.event, photos: useSamples ? await demoPhotos() : (data.photos || []), polls: data.polls || [],
      messages: data.messages || [], board: data.board || [], live: data.live || {}, songs: data.songs || [] };
  }

  // A guest action (POST). text/plain keeps it a "simple" request, so there's no CORS preflight.
  async function send(body) {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ event: eventId }, body)),
    });
    const data = await readJSON(res);
    if (!data.ok) throw finalError(data.error || 'Failed');
    return data;
  }

  async function sendMessage(name, text, photo, audio) {
    if (demo) {
      const m = { id: 'demo' + Date.now(), name, text: text || '🎤 Voice note', t: Date.now() };
      demoMessages.unshift(m);
      return m;
    }
    return (await send({ action: 'message', name, text, photo, audio })).message;
  }

  // ---- Song requests ----
  const demoSongs = [
    { id: 'demosong1', title: 'September', artist: 'Earth, Wind & Fire', votes: 12 },
    { id: 'demosong2', title: 'Mr. Brightside', artist: 'The Killers', votes: 8 },
  ];
  async function requestSong(title, artist, name) {
    if (demo) { const s = { id: 'demosong' + Date.now(), title, artist, votes: 1 }; demoSongs.push(s); return s; }
    return (await send({ action: 'song', title, artist, name })).song;
  }
  async function voteSong(id) {
    if (demo) { const s = demoSongs.find((x) => x.id === id); if (s) s.votes += 1; return; }
    await send({ action: 'songVote', song: id });
  }
  async function markSongs(key, ids, status) {
    if (demo) { demoSongs.forEach((x) => { if (ids.includes(x.id)) x.s = status; }); return demoSongs.map((x) => ({ ...x, s: x.s || 'new' })); }
    return (await send({ action: 'songs.mark', key, ids, status })).songs || [];
  }

  // What the screens poll every few seconds (announcements, spotlight, raffle, screen focus).
  async function getLive() {
    if (demo) return demoLive;
    const res = await fetch(apiUrl + '?action=live&e=' + encodeURIComponent(eventId), { cache: 'no-store' });
    const data = await readJSON(res);
    return data.ok ? data.live || {} : {};
  }

  // ---- Run-of-show (admin key) ----
  let demoLive = {};
  async function control(key, op, args) {
    if (demo) {
      if (op === 'announce') demoLive.announce = args.text ? { id: 'a' + Date.now(), text: args.text, until: Date.now() + 600000 } : undefined;
      if (op === 'countdown') demoLive.countdown = args.label ? { label: args.label, at: args.at } : undefined;
      if (op === 'screen') demoLive.screen = args.mode === 'auto' ? undefined : args.mode;
      if (op === 'spotlight') { const p = (await demoPhotos()).find((x) => x.id === args.photo); demoLive.spotlight = p ? { id: 's' + Date.now(), photo: p.id, name: p.name, at: Date.now() } : undefined; }
      if (op === 'raffle') {
        const names = [...new Set((await demoPhotos()).map((p) => p.name).filter(Boolean))];
        const winner = names[Math.floor(Math.random() * names.length)];
        demoLive.raffle = { id: 'r' + Date.now(), name: winner, entries: names.length, at: Date.now() };
        return { live: demoLive, winner, entries: names.length };
      }
      if (op === 'open') DEMO_EVENT.open = args.open;
      return { live: demoLive };
    }
    return send(Object.assign({ action: 'control', key, op }, args || {}));
  }

  async function heart(photoId) {
    if (demo) return;
    await send({ action: 'heart', photo: photoId });
  }

  async function star(key, ids, on) {
    if (demo) return;
    await send({ action: 'star', key, ids, on });
  }

  async function moderateMessages(key, ids, status) {
    if (demo) { demoMessages.forEach((m) => { if (ids.includes(m.id)) m.s = status; }); return; }
    await send({ action: 'messages.moderate', key, ids, status });
  }

  async function uploadClip(dataUrl, name, shot) {
    if (demo) { await new Promise((r) => setTimeout(r, 900)); return; }
    await send({ video: dataUrl, name, shot });
  }

  // Video clips play straight from Drive.
  function videoUrl(photo) {
    return 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(photo.id);
  }

  function codeError(code) {
    const e = new Error(code);
    e.code = code;
    return e;
  }

  // ---- Dashboard (needs the event's admin key) ----
  async function adminPhotos(key) {
    if (demo) {
      const photos = await demoPhotos();
      return { event: DEMO_EVENT, photos: photos.map((p) => ({ ...p, s: demoStatus[p.id] || 'new' })),
        messages: demoMessages.map((m) => ({ ...m, s: m.s || 'new' })), role: 'admin',
        songs: demoSongs.map((x) => ({ ...x, s: x.s || 'new' })), live: demoLive };
    }
    const res = await fetch(apiUrl + '?action=admin&e=' + encodeURIComponent(eventId) + '&key=' + encodeURIComponent(key), { cache: 'no-store' });
    const data = await res.json();
    if (!data.ok) throw codeError(data.error === 'bad-key' || data.error === 'not-found' ? 'bad-key' : 'network');
    return data;
  }

  async function moderate(key, ids, status) {
    if (demo) { ids.forEach((id) => { demoStatus[id] = status; }); return; }
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'moderate', event: eventId, key, ids, status }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Update failed');
  }
  const demoStatus = {};

  // ---- Polls ----
  const demoPolls = [{
    id: 'demo1', question: 'What should the DJ play next?', options: ['Throwbacks', 'Country', 'Top 40', 'Slow dance'],
    open: true, show: true, counts: [12, 5, 9, 4], total: 30,
  }, {
    id: 'demo2', question: 'What year was Lewis University founded?', options: ['1932', '1952', '1972'],
    open: false, show: true, quiz: true, reveal: true, correct: 0, counts: [14, 9, 4], total: 27,
  }, {
    id: 'demo3', type: 'words', question: 'Describe the couple in one word', options: [], open: true, show: true,
    counts: [], total: 31, words: [['adorable', 9], ['fun', 7], ['inseparable', 5], ['goofy', 4], ['kind', 3], ['adventurous', 3]],
  }];

  async function listPolls() {
    if (demo) return demoPolls;
    const res = await fetch(apiUrl + '?action=polls&e=' + encodeURIComponent(eventId), { cache: 'no-store' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Polls failed');
    return data.polls || [];
  }

  async function vote(pollId, option, guest, name) {
    if (demo) {
      const p = demoPolls.find((x) => x.id === pollId);
      if (p.type === 'words') {
        const w = String(option).toLowerCase().trim();
        const hit = p.words.find((x) => x[0] === w);
        if (hit) hit[1] += 1; else p.words.push([w, 1]);
        p.words.sort((a, b) => b[1] - a[1]);
      } else p.counts[option] += 1;
      p.total += 1;
      return demoPolls;
    }
    return (await send({ action: 'vote', poll: pollId, option, guest, name })).polls || [];
  }

  async function listPhotos() {
    if (useSamples) return demoPhotos();
    const res = await fetch(apiUrl + '?action=list&e=' + encodeURIComponent(eventId), { cache: 'no-store' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'List failed');
    return data.photos;
  }

  async function uploadPhoto(image, name, shot, challenge, extra) {
    if (demo) {
      await new Promise((r) => setTimeout(r, 900));
      demoUploads.unshift({ id: 'demo' + Date.now(), name, t: Date.now(), src: image });
      return;
    }
    // text/plain keeps this a "simple" request, so Apps Script doesn't need CORS preflight.
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ event: eventId, image, name, shot, challenge }, extra || {})),
    });
    const data = await readJSON(res);
    if (!data.ok) throw finalError(data.error || 'Upload failed');
  }

  // Under heavy load Google sometimes answers with an HTML error page instead of JSON. That
  // (like a network failure) is worth retrying; an answer from the camera's code is not.
  async function readJSON(res) {
    try { return await res.json(); } catch (e) { throw new Error('Server busy'); }
  }
  function finalError(message) {
    const e = new Error(message);
    // A Google "service invoked too many times" / timeout error is worth another try.
    e.final = !/too many|timed? ?out|try again|Service|Exceeded/i.test(message);
    return e;
  }

  function photoUrl(photo, width) {
    if (photo.src) return photo.src;
    return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(photo.id) + '&sz=w' + width;
  }
  function photoFallbackUrl(photo, width) {
    return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(photo.id) + '=w' + width;
  }

  // A branding image (logo or background) uploaded from the Mac app.
  function assetUrl(id, width) {
    return id ? 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + width : '';
  }

  // Theme + logo + background in one go. Pages mark logo spots with <img data-logo hidden>.
  function applyBranding(ev, opts) {
    applyTheme(ev.theme, ev.accent);
    applyFont(ev.font);
    document.querySelectorAll('img[data-logo]').forEach((img) => {
      if (!ev.logo) { img.hidden = true; return; }
      img.onload = () => { img.hidden = false; };
      img.onerror = () => {
        if (!img.dataset.fb) { img.dataset.fb = 1; img.src = 'https://drive.google.com/thumbnail?id=' + ev.logo + '&sz=w800'; }
      };
      img.src = assetUrl(ev.logo, 800);
    });
    const bg = opts && opts.background === 'slide' ? ev.slideBg : (opts && opts.background === 'phone' ? ev.phoneBg : '');
    if (bg) {
      document.documentElement.style.setProperty('--bg-image', 'url("' + assetUrl(bg, opts.background === 'slide' ? 1920 : 1200) + '")');
      document.body.classList.add('has-bg');
    }
  }

  // Link to another page of this site for the same event, e.g. pageUrl('slideshow.html').
  function pageUrl(page) {
    const u = new URL(page || './', location.href);
    if (eventId) u.searchParams.set('e', eventId);
    return u.href;
  }

  // ---- Sample photos for demo mode and ?sample=1 ----
  // Free-to-use photos from Lorem Picsum (picsum.photos). A new one "arrives" every 20 seconds
  // after the first ten, so you can watch new photos jump the queue.
  const SAMPLES = [
    [1011, 'Aunt May'], [129, 'Chris & Dana'], [65, 'Priya', true], [342, ''], [453, 'Ben'],
    [1027, 'Grace', true], [1062, 'Grandpa Joe'], [91, 'Hugo', true], [399, 'Elena'], [431, ''],
    [64, 'Sam & Leo', true], [1040, 'Maria'], [237, 'Dev'], [203, 'Jordan'], [338, 'Taylor', true],
    [1036, 'Ava'], [429, ''], [1012, 'Frank'],
  ];
  const sampleStart = Date.now();
  const demoUploads = [];
  function demoPhotos() {
    const count = Math.min(SAMPLES.length, 10 + Math.floor((Date.now() - sampleStart) / 20000));
    const photos = SAMPLES.slice(0, count).map(([id, name, tall], i) => ({
      id: 'sample-' + id,
      name,
      t: sampleStart - (SAMPLES.length - i) * 60000,
      src: 'https://picsum.photos/id/' + id + (tall ? '/1067/1600' : '/1600/1067'),
      h: i % 3 === 0 ? ((i * 7) % 23) + 2 : 0,
      c: demo ? ['dance', 'oldest', 'selfie', ''][i % 4] || undefined : undefined,
    })).reverse(); // newest first, like the real list
    return Promise.resolve(demoUploads.concat(photos));
  }

  window.Camera = {
    eventId: demo && !eventId ? 'demo' : eventId, demo,
    loadEvent, applyTheme, applyFont, applyBranding, assetUrl, applyCopy, copyFor, listPhotos, uploadPhoto, photoUrl, photoFallbackUrl, pageUrl,
    fitTitles, getLive, setLang, get lang() { return lang; }, requestSong, voteSong, markSongs, control, adminPhotos, moderate, listPolls, vote, sendMessage, heart, star, moderateMessages, uploadClip, videoUrl,
  };
})();
