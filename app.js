// app.js — Lectura Bíblica Diaria v2 — MONETIZADA con AdMob
import { PLAN, BOOK_NAMES, BOOK_IDS, MONTH_ES, MONTHS_EN, MONTHS_PT, MONTHS_IT, MONTHS_DE } from './plan-data.js?v=2';
import { JUEGOS_MULTI } from './quiz-data.js?v=2';

// ── AdMob Configuration ─────────────────────────────────────
const ADMOB = {
  APP_ID: 'ca-app-pub-5082966504863645~5203846557',
  BANNER: 'ca-app-pub-5082966504863645/4282684535',
  INTERSTITIAL: 'ca-app-pub-5082966504863645/4254561117',
  APP_OPEN: 'ca-app-pub-5082966504863645/6689152766',
  REWARDED: 'ca-app-pub-5082966504863645/6142561112'
};

const AdManager = (() => {
  // ── Estado interno ───────────────────────────────────────
  let _bannerInitialized = false;
  let _lastInterstitialTime = 0;
  const INTERSTITIAL_COOLDOWN_MS = 60 * 1000; // mínimo 60s entre intersticiales

  // ── Helper: comprueba que AdSense SDK está listo ─────────
  function _adsReady() {
    return typeof window.adsbygoogle !== 'undefined';
  }

  // ── Inicializar banner una sola vez ──────────────────────
  function _initBanner() {
    if (_bannerInitialized) return;
    try {
      if (_adsReady()) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        _bannerInitialized = true;
        console.groupCollapsed('%c[AdSense] Banner inicializado', 'color:#d4af37;font-weight:bold');
        console.log('Slot:', ADMOB.BANNER);
        console.groupEnd();
      }
    } catch (e) {
      console.warn('[AdSense] Error inicializando banner:', e.message);
    }
  }

  return {
    // ── Banner fijo inferior ─────────────────────────────
    setBannerVisible(visible) {
      const el = document.getElementById('ad-banner-container');
      if (!el) return;
      if (visible) {
        el.style.display = 'flex';
        _initBanner(); // push solo cuando el banner es visible por primera vez
      } else {
        el.style.display = 'none';
      }
    },

    // ── App Open: al abrir la app (solo en APK / WebView) ─
    showAppOpen() {
      console.groupCollapsed('%c[AdMob] App Open Ad', 'color:#6af;font-weight:bold');
      console.log('Unit ID:', ADMOB.APP_OPEN);
      console.log('Nota: App Open Ads requieren AdMob SDK nativo (APK). En PWA se omite.');
      console.groupEnd();
      // En APK el SDK nativo manejará esto automáticamente.
    },

    // ── Intersticial: entre fases del quiz ───────────────
    showInterstitial(callback) {
      const now = Date.now();
      const elapsed = now - _lastInterstitialTime;

      // Respetar cooldown para evitar saturar al usuario
      if (elapsed < INTERSTITIAL_COOLDOWN_MS) {
        console.log(`[AdSense] Intersticial saltado (cooldown: ${Math.round((INTERSTITIAL_COOLDOWN_MS - elapsed)/1000)}s restantes)`);
        if (callback) callback();
        return;
      }

      console.groupCollapsed('%c[AdSense] Intersticial', 'color:#f90;font-weight:bold');
      console.log('Unit ID:', ADMOB.INTERSTITIAL);
      console.groupEnd();

      _lastInterstitialTime = now;

      // ── Overlay visual de intersticial ──────────────────
      const overlay = document.createElement('div');
      overlay.className = 'ad-overlay-modal open';
      overlay.style.cssText = 'z-index:9999;background:rgba(10,15,35,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;';
      overlay.innerHTML = `
        <div style="color:#7A8FB5;font-size:0.75rem;letter-spacing:1px;text-transform:uppercase;">Anuncio patrocinado</div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(201,151,58,0.25);border-radius:16px;padding:32px 28px;text-align:center;max-width:320px;">
          <ion-icon name="tv-outline" style="font-size:3rem;color:#d4af37;"></ion-icon>
          <h3 style="color:#fff;margin:12px 0 6px;">Apoya la aplicación</h3>
          <p style="color:#7A8FB5;font-size:0.9rem;">Este anuncio mantiene la app gratuita para todos.</p>
        </div>
        <div style="display:flex;align-items:center;gap:8px;color:#7A8FB5;font-size:0.85rem;">
          <ion-icon name="time-outline"></ion-icon>
          <span id="ad-countdown">Cerrando en 5...</span>
        </div>
      `;
      document.body.appendChild(overlay);

      // Cuenta regresiva
      let secs = 5;
      const ticker = setInterval(() => {
        secs--;
        const el = overlay.querySelector('#ad-countdown');
        if (el) el.textContent = secs > 0 ? `Cerrando en ${secs}...` : '¡Listo!';
        if (secs <= 0) {
          clearInterval(ticker);
          overlay.remove();
          if (callback) callback();
        }
      }, 1000);
    },

    // ── Recompensado: usuario gana vidas ─────────────────
    showRewarded(onReward) {
      console.groupCollapsed('%c[AdSense] Rewarded Ad', 'color:#0f0;font-weight:bold');
      console.log('Unit ID:', ADMOB.REWARDED);
      console.groupEnd();

      const overlay = document.createElement('div');
      overlay.className = 'ad-overlay-modal open';
      overlay.style.cssText = 'z-index:9999;background:rgba(10,15,35,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;';
      overlay.innerHTML = `
        <div style="color:#7A8FB5;font-size:0.75rem;letter-spacing:1px;text-transform:uppercase;">Anuncio recompensado</div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(201,151,58,0.25);border-radius:16px;padding:32px 28px;text-align:center;max-width:320px;">
          <ion-icon name="gift-outline" style="font-size:3rem;color:#d4af37;"></ion-icon>
          <h3 style="color:#fff;margin:12px 0 6px;">¡Mira y recibe tu recompensa!</h3>
          <p style="color:#7A8FB5;font-size:0.9rem;">Termina el anuncio para obtener +2 vidas.</p>
        </div>
        <div style="width:280px;background:rgba(255,255,255,0.07);border-radius:50px;height:8px;overflow:hidden;">
          <div id="ad-rew-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#d4af37,#f0cf65);transition:width 0.25s linear;border-radius:50px;"></div>
        </div>
        <div style="color:#7A8FB5;font-size:0.85rem;" id="ad-rew-label">Cargando anuncio... 0%</div>
      `;
      document.body.appendChild(overlay);

      // Simula progreso del video (30 segundos)
      const DURATION = 30;
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed++;
        const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
        const bar = overlay.querySelector('#ad-rew-bar');
        const lbl = overlay.querySelector('#ad-rew-label');
        if (bar) bar.style.width = pct + '%';
        if (lbl) lbl.textContent = pct < 100 ? `Viendo anuncio... ${pct}%` : '✅ ¡Recompensa desbloqueada!';
        if (elapsed >= DURATION) {
          clearInterval(interval);
          setTimeout(() => {
            overlay.remove();
            if (onReward) onReward();
            showToast('🎁 +2 Vidas obtenidas. ¡Sigue jugando!');
          }, 800);
        }
      }, 1000);
    }
  };
})();

const ReminderManager = {
  activeTimer: null,
  trumpetURL: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
  
  getSettings: () => getStorage('rem_settings', null),
  
  setSettings: (s) => {
    setStorage('rem_settings', s);
    ReminderManager.schedule();
  },
  
  schedule: () => {
    if (ReminderManager.activeTimer) clearInterval(ReminderManager.activeTimer);
    const s = ReminderManager.getSettings();
    if (!s || s.freq === 0) return;
    ReminderManager.activeTimer = setInterval(() => {
        ReminderManager.checkAndNotify();
    }, 10 * 60000);
  },
  
  checkAndNotify: () => {
    const todayKey = `${month}-${day}`;
    if (getStorage('done_' + todayKey, false)) return;
    const s = ReminderManager.getSettings();
    if (!s || s.freq === 0) return;
    const lastNotif = getStorage('last_rem', 0);
    const nowMs = Date.now();
    if (nowMs - lastNotif >= s.freq * 60 * 60000) {
        ReminderManager.notify();
        setStorage('last_rem', nowMs);
    }
  },
  
  // ── Dispara SIEMPRE notificación de pantalla + trompeta simultáneamente ──
  notify: () => {
    const s = ReminderManager.getSettings() || { sound: true, vib: true };
    const bodyText = t.remBody + (todayRefs() ? todayRefs().join(', ') : '');

    // 1️⃣ Notificación visual de pantalla
    if (Notification.permission === 'granted') {
        new Notification(t.remNow, {
            body: bodyText,
            icon: './icon-192.png',
            badge: './icon-192.png',
            silent: true  // El sonido lo manejamos nosotros con la trompeta
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                new Notification(t.remNow, { body: bodyText, icon: './icon-192.png', silent: true });
            }
        });
    }

    // 2️⃣ Sonido de trompeta (siempre junto con la notificación)
    if (s.sound !== false) {
        const audio = new Audio(ReminderManager.trumpetURL);
        audio.volume = 1.0;
        audio.play().catch(e => console.warn('[Reminder] Audio bloqueado por el navegador:', e.message));
    }

    // 3️⃣ Vibración
    if (s.vib !== false && navigator.vibrate) {
        navigator.vibrate([400, 150, 400, 150, 400]);
    }

    showToast('🎺 ' + t.remNow);
  },

  // ── Probar notificación ahora mismo ──
  testNotify: () => {
    const audio = new Audio(ReminderManager.trumpetURL);
    audio.volume = 1.0;
    audio.play().catch(e => showToast('⚠️ Activa el audio para escuchar la trompeta'));
    if (Notification.permission === 'granted') {
        new Notification('🎺 ' + t.remTitle, {
            body: t.testNotifBody,
            icon: './icon-192.png',
            silent: true
        });
        showToast('✅ ' + t.testNotifOk);
    } else {
        Notification.requestPermission().then(p => {
            p === 'granted' ? showToast('✅ ' + t.testNotifOk) : showToast('⚠️ ' + t.notifDenied);
        });
    }
    if (navigator.vibrate) navigator.vibrate([400, 150, 400]);
  },
  
  // ── Modal de configuración ── isFirstTime=true: no hay botón cerrar ──
  openSettings: (isFirstTime = false) => {
    const s = ReminderManager.getSettings() || { freq: 1, sound: true, vib: true };
    const modal = document.createElement('div');
    modal.className = 'ad-overlay-modal open';
    modal.style.zIndex = '6000';
    // Evitar cerrar tocando fuera en modo primera vez
    if (isFirstTime) modal.onclick = (e) => { if (e.target === modal) return; };

    modal.innerHTML = `
        <div class="reminder-config-card">
            ${isFirstTime ? `
              <div style="background:linear-gradient(135deg,#d4af37,#f0cf65);color:#172444;border-radius:10px;padding:8px 16px;font-size:0.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;display:inline-block;">
                ⚠️ ${t.mandatoryLabel}
              </div>` : ''}
            <h3>🎺 ${t.remTitle}</h3>
            <p>${isFirstTime ? t.mandatorySub : t.remSub}</p>

            <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);border-radius:12px;padding:14px;margin:12px 0;">
              <div style="color:#d4af37;font-weight:600;font-size:0.85rem;margin-bottom:8px;">🔔 ${t.notifTypes}</div>
              <div style="color:#aab8d6;font-size:0.82rem;line-height:1.6;">
                📱 ${t.notifScreen}<br>
                🎺 ${t.notifSound}
              </div>
            </div>

            <div class="rem-field">
                <label>${t.freq}</label>
                <select id="rem-freq">
                    <option value="0" ${s.freq === 0 ? 'selected' : ''}>${t.off}</option>
                    <option value="1" ${s.freq === 1 ? 'selected' : ''}>${t.h1}</option>
                    <option value="2" ${s.freq === 2 ? 'selected' : ''}>${t.h2}</option>
                    <option value="4" ${s.freq === 4 ? 'selected' : ''}>${t.h4}</option>
                </select>
            </div>
            
            <div class="rem-field row">
                <label>${t.sound}</label>
                <input type="checkbox" id="rem-sound" ${s.sound !== false ? 'checked' : ''}>
            </div>
            
            <div class="rem-field row">
                <label>${t.vib}</label>
                <input type="checkbox" id="rem-vib" ${s.vib !== false ? 'checked' : ''}>
            </div>
            
            <button class="btn-ad-reward" id="rem-btn-save" style="margin-top:20px;width:100%;">${isFirstTime ? t.mandatorySaveBtn : t.save}</button>
            ${!isFirstTime ? `<button class="btn-close-reader" id="rem-btn-close" style="color:#7A8FB5;font-size:1rem;margin-top:10px;">✕</button>` : ''}
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('#rem-btn-save').onclick = () => {
        const newS = {
            freq: parseInt(modal.querySelector('#rem-freq').value),
            sound: modal.querySelector('#rem-sound').checked,
            vib: modal.querySelector('#rem-vib').checked
        };
        ReminderManager.setSettings(newS);
        // Pedir permisos de notificación siempre al guardar por primera vez
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(p => {
                if (p === 'granted') showToast('✅ ' + t.notifGranted);
                else showToast('⚠️ ' + t.notifDenied);
            });
        }
        showToast('⏰ ' + t.remSaved);
        modal.remove();
        // Si es primera vez, refrescar la vista de configuración si está abierta
        if ($('settings-view') && $('settings-view').classList.contains('active')) loadSettingsView();
    };
    
    const closeBtn = modal.querySelector('#rem-btn-close');
    if (closeBtn) closeBtn.onclick = () => modal.remove();
  }
};

// ── i18n ──────────────────────────────────────────────────
const I18N = {
  es: { reading:'Lectura Diaria', subtitle:'Biblia en un Año ·', tapped:'Toca para leer',
        trescitas:'📚 Tus Tres Citas', reflection:'✏️ Mi Reflexión', placeholder:'Escribe tu reflexión personal aquí',
        noref:'Aún sin reflexión', diary:'📖 Ver mi Diario Completo', complete:'✓ Completada',
        completed:'¡Reto completado! 🎉', tab1:'Lectura', tab2:'Diario', tab3:'Juegos', tab4:'Config',
        libTitle:'Mi Diario', completed_n:'Días\nCompletados', noEntries:'Aún no tienes reflexiones guardadas.',
        quizTitle:'Trivia Bíblica', quizSub:'Pon a prueba tu conocimiento',
        de:'de', months: MONTHS_ES,
        splashTitle: 'Lectura Bíblica<br>Diaria', splashSub: 'Plan de lectura anual', nextBtn: 'Siguiente →',
        toastRef: '⚠️ Debes escribir tu reflexión primero', toastEmpty: 'Escribe algo antes de guardar',
        toastSaved: '✅ Reflexión guardada', yearOf: 'del año', question: 'Pregunta',
        noReadings: 'No hay lecturas para hoy.', loadText: 'Toca para cargar el texto ✝',
        save: '💾 Guardar', whoami: '¿Quién soy?',
        outOfLives: '¡Te quedaste sin vidas!', watchAd: 'Ver anuncio para +2 vidas 📺',
        batchDone: '¡Fase completada!', batchNext: 'Siguiente Fase →',
        remTitle: 'Recordatorios', remSub: 'Ajusta tus alertas de lectura 🎺',
        freq: 'Frecuencia de recordatorio', sound: 'Trompeta sonora', vib: 'Vibración',
        off: 'Desactivado', h1: 'Cada 1 hora', h2: 'Cada 2 horas', h4: 'Cada 4 horas',
        remSaved: 'Alertas configuradas', remBody: '📖 No olvides tu lectura de hoy: ',
        remNow: '¡Es hora de leer la Biblia! 📖',
        mandatoryLabel: 'Configuración Obligatoria',
        mandatorySub: 'Para continuar, elige cómo quieres recibir tus recordatorios de lectura bíblica.',
        mandatorySaveBtn: '✅ Confirmar y Continuar',
        notifTypes: 'Se activarán 2 tipos de notificación simultáneos:',
        notifScreen: 'Notificación en pantalla del dispositivo',
        notifSound: 'Sonido de trompeta bíblica',
        testNotifBtn: '🎺 Probar Notificación Ahora',
        testNotifBody: '¡Las notificaciones están funcionando correctamente!',
        testNotifOk: '¡Notificación y trompeta enviadas!',
        notifGranted: 'Permisos de notificación activados',
        notifDenied: 'Permite notificaciones en la configuración del dispositivo',
        settingsTitle: '⚙️ Configuración',
        settingsSub: 'Personaliza tu experiencia de lectura',
        notifStatus: 'Estado actual de notificaciones',
        notifOn: '✅ Notificaciones activas', notifOff: '❌ Notificaciones desactivadas',
        editConfig: '✏️ Editar Configuración' },

  en: { reading:'Daily Reading', subtitle:'Bible in a Year ·', tapped:'Tap to read',
        trescitas:'📚 Your Three Readings', reflection:'✏️ My Reflection', placeholder:'Write your personal reflection here',
        noref:'No reflection yet', diary:'📖 View My Full Diary', complete:'✓ Completed',
        completed:'Challenge completed! 🎉', tab1:'Reading', tab2:'Diary', tab3:'Games', tab4:'Config',
        libTitle:'My Diary', completed_n:'Days\nCompleted', noEntries:'No reflections saved yet.',
        quizTitle:'Bible Trivia', quizSub:'Test your knowledge',
        de:'of', months: MONTHS_EN,
        splashTitle: 'Daily Bible<br>Reading', splashSub: 'Annual reading plan', nextBtn: 'Next →',
        toastRef: '⚠️ You must write your reflection first', toastEmpty: 'Write something before saving',
        toastSaved: '✅ Reflection saved', yearOf: 'of the year', question: 'Question',
        noReadings: 'No readings for today.', loadText: 'Tap to load text ✝',
        save: '💾 Save', whoami: 'Who am I?',
        outOfLives: 'Out of lives!', watchAd: 'Watch ad for +2 lives 📺',
        batchDone: 'Phase completed!', batchNext: 'Next Phase →',
        remTitle: 'Reminders', remSub: 'Set your reading alerts 🎺',
        freq: 'Reminder frequency', sound: 'Trumpet sound', vib: 'Vibration',
        off: 'Off', h1: 'Every 1 hour', h2: 'Every 2 hours', h4: 'Every 4 hours',
        remSaved: 'Alerts configured', remBody: '📖 Don\'t forget today\'s reading: ',
        remNow: 'Time to read the Bible! 📖',
        mandatoryLabel: 'Required Setup',
        mandatorySub: 'Choose how you want to receive your daily Bible reading reminders.',
        mandatorySaveBtn: '✅ Confirm & Continue',
        notifTypes: 'You will receive 2 simultaneous notification types:',
        notifScreen: 'On-screen device notification',
        notifSound: 'Biblical trumpet sound',
        testNotifBtn: '🎺 Test Notification Now',
        testNotifBody: 'Notifications are working correctly!',
        testNotifOk: 'Notification and trumpet sent!',
        notifGranted: 'Notification permissions enabled',
        notifDenied: 'Please allow notifications in device settings',
        settingsTitle: '⚙️ Settings',
        settingsSub: 'Personalize your reading experience',
        notifStatus: 'Current notification status',
        notifOn: '✅ Notifications active', notifOff: '❌ Notifications disabled',
        editConfig: '✏️ Edit Configuration' },
  pt: { reading:'Leitura Diária', subtitle:'Bíblia em um Ano ·', tapped:'Toque para ler',
        trescitas:'📚 Suas Três Leituras', reflection:'✏️ Minha Reflexão', placeholder:'Escreva sua reflexão pessoal aqui',
        noref:'Ainda sem reflexão', diary:'📖 Ver Meu Diário Completo', complete:'✓ Concluída',
        completed:'Desafio concluído! 🎉', tab1:'Leitura', tab2:'Diário', tab3:'Jogos', tab4:'Config',
        libTitle:'Meu Diário', completed_n:'Dias\nConcluídos', noEntries:'Nenhuma reflexão salva ainda.',
        quizTitle:'Trivia Bíblica', quizSub:'Teste seu conhecimento',
        de:'de', months: MONTHS_PT,
        splashTitle: 'Leitura Bíblica<br>Diária', splashSub: 'Plano de leitura anual', nextBtn: 'Próximo →',
        toastRef: '⚠️ Você deve escrever sua reflexão primeiro', toastEmpty: 'Escreva algo antes de salvar',
        toastSaved: '✅ Reflexão salva', yearOf: 'do ano', question: 'Pergunta',
        noReadings: 'Não há leituras para hoje.', loadText: 'Toque para carregar o texto ✝',
        save: '💾 Salvar', whoami: 'Quem sou eu?',
        outOfLives: 'Sem vidas!', watchAd: 'Ver anúncio para +2 vidas 📺',
        batchDone: 'Fase concluída!', batchNext: 'Próxima Fase →',
        remTitle: 'Lembretes', remSub: 'Configure seus alertas 🎺',
        freq: 'Frequência de lembrete', sound: 'Som de Trombeta', vib: 'Vibração',
        off: 'Desativado', h1: 'A cada 1 hora', h2: 'A cada 2 horas', h4: 'A cada 4 horas',
        remSaved: 'Alertas configurados', remBody: '📖 Não esqueça a leitura de hoje: ',
        remNow: 'Hora de ler a Bíblia! 📖',
        mandatoryLabel: 'Configuração Obrigatória',
        mandatorySub: 'Escolha como quer receber seus lembretes de leitura bíblica.',
        mandatorySaveBtn: '✅ Confirmar e Continuar',
        notifTypes: 'Você receberá 2 tipos de notificação simultâneos:',
        notifScreen: 'Notificação na tela do dispositivo',
        notifSound: 'Som de trombeta bíblica',
        testNotifBtn: '🎺 Testar Notificação Agora',
        testNotifBody: 'As notificações estão funcionando!',
        testNotifOk: 'Notificação e trombeta enviadas!',
        notifGranted: 'Permissões de notificação ativadas',
        notifDenied: 'Permita notificações nas configurações do dispositivo',
        settingsTitle: '⚙️ Configurações',
        settingsSub: 'Personalize sua experiência',
        notifStatus: 'Status atual das notificações',
        notifOn: '✅ Notificações ativas', notifOff: '❌ Notificações desativadas',
        editConfig: '✏️ Editar Configuração' },
  it: { reading:'Lettura Quotidiana', subtitle:'Bibbia in un Anno ·', tapped:'Tocca per leggere',
        trescitas:'📚 Le Tue Tre Letture', reflection:'✏️ La Mia Riflessione', placeholder:'Scrivi la tua riflessione personale qui',
        noref:'Ancora nessuna riflessione', diary:'📖 Vedi il Mio Diario Completo', complete:'✓ Completato',
        completed:'Sfida completata! 🎉', tab1:'Lettura', tab2:'Diario', tab3:'Giochi', tab4:'Config',
        libTitle:'Il Mio Diario', completed_n:'Giorni\nCompletati', noEntries:'Nessuna riflessione salvata.',
        quizTitle:'Trivia Biblica', quizSub:'Metti alla prova la tua conoscenza',
        de:'di', months: MONTHS_IT,
        splashTitle: 'Lettura Biblica<br>Quotidiana', splashSub: 'Piano di lettura annuale', nextBtn: 'Avanti →',
        toastRef: '⚠️ Devi prima scrivere la tua riflessione', toastEmpty: 'Scrivi qualcosa prima di salvare',
        toastSaved: '✅ Riflessione salvata', yearOf: 'dell\'anno', question: 'Domanda',
        noReadings: 'Nessuna lettura per oggi.', loadText: 'Tocca per caricare il testo ✝',
        save: '💾 Salva', whoami: 'Chi sono?',
        outOfLives: 'Senza vite!', watchAd: 'Guarda l\'annuncio per +2 vite 📺',
        batchDone: 'Fase completata!', batchNext: 'Prossima Fase →',
        remTitle: 'Promemoria', remSub: 'Imposta i tuoi avvisi 🎺',
        freq: 'Frequenza promemoria', sound: 'Suono Tromba', vib: 'Vibrazione',
        off: 'Disattivato', h1: 'Ogni 1 ora', h2: 'Ogni 2 ore', h4: 'Ogni 4 ore',
        remSaved: 'Avvisi configurati', remBody: '📖 Non dimenticare la lettura: ',
        remNow: 'È ora di leggere la Bibbia! 📖',
        mandatoryLabel: 'Configurazione Obbligatoria',
        mandatorySub: 'Scegli come ricevere i promemoria di lettura biblica.',
        mandatorySaveBtn: '✅ Conferma e Continua',
        notifTypes: 'Riceverai 2 tipi di notifica simultanei:',
        notifScreen: 'Notifica sullo schermo del dispositivo',
        notifSound: 'Suono di tromba biblica',
        testNotifBtn: '🎺 Testa la Notifica Ora',
        testNotifBody: 'Le notifiche funzionano correttamente!',
        testNotifOk: 'Notifica e tromba inviate!',
        notifGranted: 'Permessi di notifica attivati',
        notifDenied: 'Consenti le notifiche nelle impostazioni del dispositivo',
        settingsTitle: '⚙️ Impostazioni',
        settingsSub: 'Personalizza la tua esperienza',
        notifStatus: 'Stato notifiche attuale',
        notifOn: '✅ Notifiche attive', notifOff: '❌ Notifiche disattivate',
        editConfig: '✏️ Modifica Configurazione' },
  de: { reading:'Tägliche Lesung', subtitle:'Bibel in einem Jahr ·', tapped:'Tippen zum Lesen',
        trescitas:'📚 Deine Drei Lesungen', reflection:'✏️ Meine Reflexion', placeholder:'Schreibe deine persönliche Reflexion hier',
        noref:'Noch keine Reflexion', diary:'📖 Mein vollständiges Tagebuch', complete:'✓ Abgeschlossen',
        completed:'Herausforderung abgeschlossen! 🎉', tab1:'Lesung', tab2:'Tagebuch', tab3:'Spiele', tab4:'Config',
        libTitle:'Mein Tagebuch', completed_n:'Tage\nAbgeschlossen', noEntries:'Noch keine Reflexionen gespeichert.',
        quizTitle:'Bibel-Quiz', quizSub:'Teste dein Wissen',
        de:'von', months: MONTHS_DE,
        splashTitle: 'Tägliche<br>Bibellese', splashSub: 'Jährlicher Leseplan', nextBtn: 'Weiter →',
        toastRef: '⚠️ Du musst zuerst deine Reflexion schreiben', toastEmpty: 'Schreibe etwas vor dem Speichern',
        toastSaved: '✅ Reflexion gespeichert', yearOf: 'des Jahres', question: 'Frage',
        noReadings: 'Keine Lesungen für heute.', loadText: 'Tippen, um den Text zu laden ✝',
        save: '💾 Speichern', whoami: 'Wer bin ich?',
        outOfLives: 'Keine Leben mehr!', watchAd: 'Anzeige für +2 Leben sehen 📺',
        batchDone: 'Phase abgeschlossen!', batchNext: 'Nächste Phase →',
        remTitle: 'Erinnerungen', remSub: 'Benachrichtigungen einstellen 🎺',
        freq: 'Erinnerungsfrequenz', sound: 'Posaunenschall', vib: 'Vibration',
        off: 'Aus', h1: 'Jede Stunde', h2: 'Alle 2 Stunden', h4: 'Alle 4 Stunden',
        remSaved: 'Benachrichtigungen aktiv', remBody: '📖 Vergiss nicht zu lesen: ',
        remNow: 'Zeit, die Bibel zu lesen! 📖',
        mandatoryLabel: 'Pflichteinrichtung',
        mandatorySub: 'Wähle, wie du deine täglichen Bibelleseerinnerungen erhalten möchtest.',
        mandatorySaveBtn: '✅ Bestätigen & Fortfahren',
        notifTypes: 'Du erhältst 2 gleichzeitige Benachrichtigungstypen:',
        notifScreen: 'Bildschirmbenachrichtigung auf dem Gerät',
        notifSound: 'Biblischer Posaunenschall',
        testNotifBtn: '🎺 Benachrichtigung Jetzt Testen',
        testNotifBody: 'Benachrichtigungen funktionieren korrekt!',
        testNotifOk: 'Benachrichtigung und Posaune gesendet!',
        notifGranted: 'Benachrichtigungsberechtigungen aktiviert',
        notifDenied: 'Bitte Benachrichtigungen in den Geräteeinstellungen erlauben',
        settingsTitle: '⚙️ Einstellungen',
        settingsSub: 'Personalisiere deine Erfahrung',
        notifStatus: 'Aktueller Benachrichtigungsstatus',
        notifOn: '✅ Benachrichtigungen aktiv', notifOff: '❌ Benachrichtigungen deaktiviert',
        editConfig: '✏️ Konfiguration bearbeiten' }
};

let QUIZ_Q = [];
let allPersonajes = [];
let quizIdx = 0;
let userLives = 3;
const batchSize = 10;

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// ── State ─────────────────────────────────────────────────
let lang = 'es';
let apiVersion = 'RVR60';
let t = I18N.es;
let quizAnswered = false;
window.BIBLEData = null;

// ── Helpers ───────────────────────────────────────────────
const $ = id => document.getElementById(id);
const now = new Date();
const day = now.getDate();
const month = now.getMonth() + 1;

function todayRefs() {
  const m = PLAN[month];
  return m && m[day - 1] ? m[day - 1] : null;
}

function expandBookName(ref) {
  for (const [abbr, full] of Object.entries(BOOK_NAMES)) {
    if (ref.startsWith(abbr + ' ') || ref === abbr) {
      return ref.replace(abbr, full);
    }
  }
  return ref;
}

function getStorage(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } }
function setStorage(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function showToast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}

// ── Splash ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const saved = getStorage('app_lang', null);
  if (saved) { lang = saved.lang; apiVersion = saved.api; t = I18N[lang]; launchApp(); return; }

  $('lang-options').addEventListener('click', e => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    lang = btn.dataset.lang;
    apiVersion = btn.dataset.api;
    t = I18N[lang];
    
    // Dynamically update Splash screen text
    const titleEl = document.querySelector('.splash-title h1');
    const subEl = document.querySelector('.splash-title p');
    if (titleEl) titleEl.innerHTML = t.splashTitle;
    if (subEl) subEl.innerHTML = t.splashSub + ` ${apiVersion}`;
    const nextBtn = $('btn-next');
    if (nextBtn) nextBtn.textContent = t.nextBtn;

    // Trigger AdMob App Open (/6689152766)
    console.log("AdMob: App Open Ad triggered (/6689152766)");
  });

  $('btn-next').addEventListener('click', () => {
    setStorage('app_lang', { lang, api: apiVersion });
    AdManager.showAppOpen();
    launchApp();
  });
});

async function launchApp() {
  QUIZ_Q = shuffle([...JUEGOS_MULTI[lang]]);
  allPersonajes = QUIZ_Q.filter(q => q.tipo === 'personaje').map(q => q.respuesta);

  $('splash-screen').classList.add('hidden');
  $('main-app').classList.remove('hidden');
  renderApp();
  setupNav();
  ReminderManager.schedule();
  // Primera vez: modal obligatorio sin botón de cerrar
  const isFirstTime = !getStorage('rem_settings', null);
  if (isFirstTime) ReminderManager.openSettings(true);
  
  try {
    const res = await fetch('./RVR60.json');
    if (res.ok) window.BIBLEData = await res.json();
  } catch(e) { console.warn("Error loading Bible JSON", e); }
  
  loadHomeView();
  AdManager.setBannerVisible(false); // Hide on Home at launch
}

// ── App Shell ─────────────────────────────────────────────
function renderApp() {
  $('view-container').innerHTML = `
    <div id="home-view" class="view active"></div>
    <div id="library-view" class="view"></div>
    <div id="games-view" class="view"></div>
    <div id="settings-view" class="view"></div>
  `;
  $('nav-home-label').textContent = t.tab1;
  $('nav-library-label').textContent = t.tab2;
  $('nav-juegos-label').textContent = t.tab3;
  if ($('nav-settings-label')) $('nav-settings-label').textContent = t.tab4;
  loadLibraryView();
  loadGamesView();
  loadSettingsView();
}

// ── SETTINGS ──────────────────────────────────────────────
function loadSettingsView() {
  const view = $('settings-view');
  if (!view) return;
  const s = ReminderManager.getSettings();
  const freqLabel = !s || s.freq === 0 ? t.off
    : s.freq === 1 ? t.h1
    : s.freq === 2 ? t.h2 : t.h4;
  const notifPerm = Notification.permission;
  const notifStatusText = (s && s.freq > 0 && notifPerm === 'granted') ? t.notifOn : t.notifOff;
  const notifStatusColor = (s && s.freq > 0 && notifPerm === 'granted') ? '#4ade80' : '#f87171';

  view.innerHTML = `
    <div class="library-hero">
      <h1>${t.settingsTitle}</h1>
      <p>${t.settingsSub}</p>
    </div>

    <div style="padding:0 16px 100px;">

      <!-- Tarjeta: estado notificaciones -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(201,151,58,0.2);border-radius:16px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <ion-icon name="notifications-outline" style="font-size:1.5rem;color:#d4af37;"></ion-icon>
          <div>
            <div style="color:#fff;font-weight:600;font-size:0.95rem;">${t.notifStatus}</div>
            <div style="color:${notifStatusColor};font-size:0.82rem;margin-top:2px;">${notifStatusText}</div>
          </div>
        </div>
        <div style="background:rgba(212,175,55,0.07);border-radius:10px;padding:12px;margin-bottom:14px;">
          <div style="color:#aab8d6;font-size:0.82rem;line-height:1.8;">
            <div style="color:#d4af37;font-weight:600;margin-bottom:4px;">🔔 ${t.notifTypes}</div>
            📱 ${t.notifScreen}<br>
            🎺 ${t.notifSound}
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:space-between;font-size:0.82rem;color:#7A8FB5;margin-bottom:14px;">
          <span>⏰ ${t.freq}:</span>
          <span style="color:#d4af37;font-weight:600;">${freqLabel}</span>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn-ad-reward" id="settings-edit-btn" style="flex:1;padding:12px;font-size:0.9rem;">${t.editConfig}</button>
        </div>
      </div>

      <!-- Tarjeta: probar notificación -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(201,151,58,0.2);border-radius:16px;padding:20px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <ion-icon name="musical-notes-outline" style="font-size:1.5rem;color:#d4af37;"></ion-icon>
          <div style="color:#fff;font-weight:600;font-size:0.95rem;">🎺 ${t.testNotifBtn}</div>
        </div>
        <p style="color:#7A8FB5;font-size:0.85rem;margin:0 0 14px;">Toca el botón para recibir una notificación de prueba ahora mismo.</p>
        <button class="btn-ad-reward" id="settings-test-btn" style="width:100%;padding:14px;background:linear-gradient(135deg,#1a3a6e,#2a5298);">🎺 ${t.testNotifBtn}</button>
      </div>

      <!-- Info versión -->
      <div style="text-align:center;padding:20px;color:#3a4e77;font-size:0.78rem;">
        Lectura Bíblica Diaria · v2.1 · ${apiVersion}<br>
        <span style="color:#d4af37;">✝</span> Biblia en Un Año
      </div>
    </div>
  `;

  $('settings-edit-btn').onclick = () => ReminderManager.openSettings(false);
  $('settings-test-btn').onclick = () => ReminderManager.testNotify();
}

// ── HOME ──────────────────────────────────────────────────
async function loadHomeView() {
  const refs = todayRefs();
  const monthName = t.months[month];
  const todayKey = `${month}-${day}`;
  const isDone = getStorage('done_' + todayKey, false);

  const view = $('home-view');
  view.innerHTML = `
    <div class="hero-header">
      <div class="hero-top-bar">
        <div class="hero-brand">
          <span class="hero-brand-icon">📖</span>
          <div class="hero-brand-text">
            <h2>${t.reading}</h2>
            <p>${t.subtitle} ${apiVersion}</p>
          </div>
        </div>
        <div style="display:flex; gap:15px; align-items:center;">
           <button class="btn-icon-top" id="btn-reminders"><ion-icon name="notifications-outline"></ion-icon></button>
           <span class="hero-cross">✝</span>
        </div>
      </div>
      <div class="hero-date-row">
        <div class="hero-date">
          <div class="day-num">${day}</div>
          <div class="day-month">${t.de} ${monthName}</div>
        </div>
        <button class="btn-completed ${isDone ? 'done' : ''}" id="btn-done">
          ${isDone ? '✓' : '○'} ${t.complete}
        </button>
      </div>
    </div>

    <div class="section-label">${t.trescitas}</div>
    <div class="citas-list">
      ${refs ? refs.map((ref, i) => `
        <div class="cita-card" id="cita-${i}">
          <div class="cita-header" onclick="toggleCita(${i})">
            <div class="cita-num">${i + 1}</div>
            <div class="cita-info">
              <h3>${expandBookName(ref)}</h3>
              <p>${t.tapped}</p>
            </div>
            <ion-icon class="cita-chevron" name="chevron-down-outline"></ion-icon>
          </div>
          <div class="cita-body">
            <div class="cita-text" id="cita-text-${i}" data-ref="${ref}"></div>
          </div>
        </div>`).join('') : `<p style="padding:16px">${t.noReadings}</p>`}
    </div>

    <div class="section-label">${t.reflection}</div>
    <div class="reflection-section">
      <textarea class="reflection-textarea" id="reflection-input" placeholder="📝 ${t.placeholder}">${getStorage('ref_' + todayKey, '')}</textarea>
      <button class="btn-diary save" id="btn-save">${t.save}</button>
      <button class="btn-diary" onclick="switchTab('library')">📖 ${t.diary.replace('📖 ','')}</button>
    </div>
  `;

  $('btn-done').addEventListener('click', () => {
    const text = $('reflection-input').value.trim();
    if (!text && !getStorage('done_'+todayKey, false)) { showToast(t.toastRef); $('reflection-input').focus(); return; }
    const newDone = !getStorage('done_' + todayKey, false);
    setStorage('done_' + todayKey, newDone);
    $('btn-done').classList.toggle('done', newDone);
    $('btn-done').textContent = (newDone ? '✓ ' : '○ ') + t.complete;
    if (newDone) showToast(t.completed);
  });

  $('btn-save').addEventListener('click', () => {
    const text = $('reflection-input').value.trim();
    if (!text) { showToast(t.toastEmpty); return; }
    setStorage('ref_' + todayKey, text);
    const entries = getStorage('entries', []);
    const existing = entries.findIndex(e => e.key === todayKey);
    const entry = { key: todayKey, date: `${day} ${t.de} ${monthName}`, refs: refs ? refs.join(' · ') : '', text };
    if (existing >= 0) entries[existing] = entry; else entries.push(entry);
    setStorage('entries', entries);
    showToast(t.toastSaved);
    if (!getStorage('done_' + todayKey, false)) $('btn-done').click();
    loadLibraryView();
  });

  $('btn-reminders').addEventListener('click', () => {
    ReminderManager.openSettings();
  });
}

window.toggleCita = function(i) {
  const textEl = $(`cita-text-${i}`);
  const ref = textEl ? textEl.dataset.ref : null;
  if (!ref) return;
  $('reader-title').textContent = expandBookName(ref);
  $('reader-body').innerHTML = `<div class="loading-pill">${t.loadText}</div>`;
  $('reader-modal').classList.add('open');
  applyReaderFontSize();
  fetchPassage(ref).then(html => $('reader-body').innerHTML = html);
};

async function fetchPassage(ref) {
  const p = parseRef(ref); if (!p || !window.BIBLEData) return `<em>${ref}</em>`;
  const bookIndex = BOOK_IDS[p.book] ? BOOK_IDS[p.book] - 1 : -1;
  const bookData = bookIndex >= 0 ? window.BIBLEData[bookIndex] : null;
  if (!bookData) return `<em>${ref}</em>`;
  let html = '';
  for (let c = p.sc; c <= p.ec; c++) {
    const chArray = bookData.chapters[c - 1]; if (!chArray) continue;
    if (p.ec > p.sc) html += `<strong class="chapter-heading">${p.book} ${c}</strong>`;
    chArray.forEach((txt, vi) => {
      const vn = vi + 1;
      if (c === p.sc && p.sv && vn < p.sv) return;
      if (c === p.ec && p.ev && vn > p.ev) return;
      html += `<span class="verse-num">${vn}</span>${txt} `;
    });
  }
  return html;
}

function parseRef(ref) {
  const m = ref.trim().match(/^([\dA-Za-záéíóúüñÁÉÍÓÚÑ]+(?:\s[\dA-Za-záéíóúüñÁÉÍÓÚÑ]+)?)\s(.+)$/);
  if (!m) return null;
  const book = m[1], range = m[2];
  let sc, sv, ec, ev;
  if (range.includes('.')) {
    const parts = range.split('-');
    [sc, sv] = parts[0].split('.').map(Number);
    if (parts[1]) {
      if (parts[1].includes('.')) [ec, ev] = parts[1].split('.').map(Number);
      else { ec = sc; ev = parseInt(parts[1]); }
    } else ec = sc;
  } else {
    const parts = range.split('-');
    sc = parseInt(parts[0]); ec = parts[1] ? parseInt(parts[1]) : sc;
  }
  return { book, sc, sv, ec, ev };
}

// ── LIBRARY ───────────────────────────────────────────────
function loadLibraryView() {
  const entries = getStorage('entries', []);
  const view = $('library-view');
  if (!view) return;
  view.innerHTML = `
    <div class="library-hero"><h1>📖 ${t.libTitle}</h1><p>${t.subtitle} ${apiVersion}</p></div>
    <div class="stats-row"><div class="stat-card"><div class="stat-num">${entries.length}</div><div class="stat-label">${t.completed_n}</div></div></div>
    <div class="library-entries">
      ${entries.length === 0 ? `<p style="padding:20px">${t.noEntries}</p>` : [...entries].reverse().map(e => `
        <div class="entry-card"><h4>${escapeHTML(e.refs)}</h4><div class="e-date">${e.date}</div><div class="e-text">"${escapeHTML(e.text)}"</div></div>
      `).join('')}
    </div>
  `;
}

// ── GAMES (TRIVIA CON VIDAS Y ADMOB) ──────────────────────
function loadGamesView() {
  const view = $('games-view');
  if (!view) return;
  view.innerHTML = `
    <div class="library-hero"><h1>🏆 ${t.quizTitle}</h1><p>${t.quizSub}</p></div>
    <div class="lives-counter" id="lives-counter">${getHeartsHTML()}</div>
    <div id="quiz-card" class="quiz-card"></div>
    <div id="ad-reward-modal" class="ad-overlay-modal">
        <h3>${t.outOfLives}</h3><p>💔💔💔</p>
        <button class="btn-ad-reward" onclick="showRewardAd()">${t.watchAd}</button>
    </div>
  `;
  renderQuestion();
}

function getHeartsHTML() {
  let h = '';
  for(let i=0; i<3; i++) h += `<ion-icon class="heart-icon ${i >= userLives ? 'lost' : ''}" name="heart"></ion-icon>`;
  return h;
}

function renderQuestion() {
  const q = QUIZ_Q[quizIdx % QUIZ_Q.length];
  const card = $('quiz-card');
  if (!card) return;
  const batchNum = Math.floor(quizIdx / batchSize) + 1;
  const progress = (quizIdx % batchSize) + 1;
  const pct = (progress / batchSize) * 100;

  let questionHTML = q.tipo === 'personaje' 
    ? `<div class="quiz-question" style="text-align:left;"><p style="font-weight:bold;color:#d4af37;">${t.whoami}</p><ul>${q.pistas.map(p=>`<li>${p}</li>`).join('')}</ul></div>`
    : `<div class="quiz-question">${q.pregunta.replace('__','____')}</div>`;

  const options = shuffle([...q.opciones]);
  const letters = ['A','B','C','D'];

  card.innerHTML = `
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    <div class="quiz-inner">
      <div class="quiz-batch-info">Fase ${batchNum} • ${progress}/${batchSize}</div>
      <div class="quiz-counter">${t.question} ${quizIdx + 1}</div>
      ${questionHTML}
      <div class="quiz-options">
        ${options.map((opt, i) => `<button class="quiz-opt" onclick="checkAnswer(this, '${opt}', '${q.respuesta}')"><span class="opt-letter">${letters[i]}</span>${opt}</button>`).join('')}
      </div>
    </div>
  `;
}

window.checkAnswer = function(el, sel, cor) {
  if (quizAnswered) return;
  quizAnswered = true;
  document.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
  const isCorrect = sel === cor;
  el.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) document.querySelectorAll('.quiz-opt').forEach(b => { if(b.textContent.includes(cor)) b.classList.add('correct'); });

  setTimeout(() => {
    quizAnswered = false;
    if (isCorrect) {
      quizIdx++;
      if (quizIdx % batchSize === 0) triggerInterstitial();
      else renderQuestion();
    } else {
      userLives--;
      $('lives-counter').innerHTML = getHeartsHTML();
      if (userLives <= 0) $('ad-reward-modal').classList.add('open');
      else renderQuestion();
    }
  }, 1500);
};

function triggerInterstitial() {
    AdManager.showInterstitial(() => {
        $('quiz-card').innerHTML = `<div class="quiz-inner" style="text-align:center;">
            <ion-icon name="checkmark-circle" style="font-size:4rem;color:#d4af37;"></ion-icon>
            <h2>${t.batchDone}</h2><button class="btn-ad-reward" style="margin-top:20px;" onclick="renderQuestion()">${t.batchNext}</button>
        </div>`;
    });
}

window.showRewardAd = function() {
    AdManager.showRewarded(() => {
        userLives = 2;
        $('ad-reward-modal').classList.remove('open');
        $('lives-counter').innerHTML = getHeartsHTML();
        renderQuestion();
    });
};

// ── NAV & MODAL ───────────────────────────────────────────
function setupNav() { document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab))); }
window.switchTab = function(tab) {
  document.querySelectorAll('.nav-item, .view').forEach(el => el.classList.remove('active'));
  const navBtn = document.querySelector(`[data-tab="${tab}"]`);
  if (navBtn) navBtn.classList.add('active');
  const tabView = $(`${tab}-view`);
  if (tabView) tabView.classList.add('active');

  // Mostrar banner en Diario (library) y Juegos (games), ocultar en Lectura (home) y Config (settings)
  if (tab === 'home' || tab === 'settings') AdManager.setBannerVisible(false);
  else AdManager.setBannerVisible(true);

  if (tab === 'library') loadLibraryView();
  if (tab === 'settings') loadSettingsView();
};

let currentReaderFontSize = parseInt(getStorage('reader_font_size', 18));
function applyReaderFontSize() { if($('reader-body')) $('reader-body').style.fontSize = currentReaderFontSize + 'px'; }
document.addEventListener('DOMContentLoaded', () => {
    $('btn-font-dec').onclick = () => { currentReaderFontSize = Math.max(12, currentReaderFontSize - 2); setStorage('reader_font_size', currentReaderFontSize); applyReaderFontSize(); };
    $('btn-font-inc').onclick = () => { currentReaderFontSize = Math.min(36, currentReaderFontSize + 2); setStorage('reader_font_size', currentReaderFontSize); applyReaderFontSize(); };
    $('btn-close-reader').onclick = () => $('reader-modal').classList.remove('open');
});
