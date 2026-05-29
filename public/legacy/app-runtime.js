
    async function resetEntryVote() {
    if (!window.FB) return;
    if (!confirm('¿Seguro que quieres reiniciar el voto especial? Se borrarán todos los votos y podrán votar de nuevo.')) return;
    const DEADLINE = new Date('2026-06-12T22:30:00+02:00').getTime(); // ← cambia la fecha que quieras
    const newEV = {
        id: 'ev_reset_' + Date.now(),
        votes: { franbv: 0, nilojeda: 0 },
        endTime: DEADLINE,
        winner: null
    };
    try {
        await window.FB.set(window.FB.ref(window.FB.db, 'entryVote/current'), newEV);
        // Limpiar votos registrados
        await window.FB.set(window.FB.ref(window.FB.db, 'entryVotes'), null);
        alert('✅ Voto especial reiniciado correctamente.');
    } catch(e) {
        alert('❌ Error al reiniciar: ' + e.message);
    }
}
// ══════════════════════════════════════════════════════════════
//  SECURITY — Block right-click, CTRL+U/S/A/C, F12, DevTools
// ══════════════════════════════════════════════════════════════
(function() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); return false; }, true);

    // Block keyboard shortcuts
    document.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        // CTRL/CMD combos
        if (e.ctrlKey || e.metaKey) {
            if (['u','s','a','p','f'].includes(k)) { e.preventDefault(); return false; }
            if (e.shiftKey && ['i','j','c'].includes(k)) { e.preventDefault(); return false; }
        }
        // F12
        if (k === 'f12') { e.preventDefault(); return false; }
    }, true);

    // Disable text selection (extra layer on top of user-select:none in CSS)
    document.addEventListener('selectstart', e => e.preventDefault(), true);
    document.addEventListener('dragstart',   e => e.preventDefault(), true);
    document.addEventListener('copy',        e => e.preventDefault(), true);
    document.addEventListener('cut',         e => e.preventDefault(), true);
})();

// ══════════════════════════════════════════════════════════════
//  CUSTOM CURSOR
// ══════════════════════════════════════════════════════════════
(function() {
    const outer = document.getElementById('cursor-outer');
    const inner = document.getElementById('cursor-inner');
    let mx = -200, my = -200;
    let ox = -200, oy = -200;
    let rafId;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        inner.style.left = mx + 'px';
        inner.style.top  = my + 'px';
    });

    function animateOuter() {
        ox += (mx - ox) * 0.18;
        oy += (my - oy) * 0.18;
        outer.style.left = ox + 'px';
        outer.style.top  = oy + 'px';
        rafId = requestAnimationFrame(animateOuter);
    }
    animateOuter();

    // Hover state on interactive elements
    const hoverSel = 'button, a, [onclick], .rank-row, .candidate-card, .rvf-card, .mf-side, .nav-tab, .bnav-tab, .noticia-card, .consejo-card, .lexico-card, .qa-btn, .profile-back-btn, .modal-close';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
    });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
    document.addEventListener('mouseleave', () => { outer.style.opacity='0'; inner.style.opacity='0'; });
    document.addEventListener('mouseenter', () => { outer.style.opacity='1'; inner.style.opacity='1'; });
})();

// ══════════════════════════════════════════════════════════════
//  GLOBAL DATA
// ══════════════════════════════════════════════════════════════
function abrirModalUnirse() { document.getElementById('modalUnirse').classList.add('open'); }
function cerrarModal(e) { if (e.target === document.getElementById('modalUnirse')) document.getElementById('modalUnirse').classList.remove('open'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.getElementById('modalUnirse').classList.remove('open'); });

function toggleMoreMenu() {
    const menu = document.getElementById('moreMenu');
    const overlay = document.getElementById('moreOverlay');
    const isOpen = menu.style.display !== 'none';
    menu.style.display = isOpen ? 'none' : 'block';
    overlay.style.display = isOpen ? 'none' : 'block';
}

const FOTOS = {
    Kappah:'/img/kappah.png', RubenMaxxing:'/img/rubenmaxxing.jpg',
    SergiCabrer:'/img/SergiCabrer.jpeg', JoseNogales:'/img/josenogales.jpeg',
    TitoChape:'/img/titochape.jpeg', Aaronjaureguii:'/img/aaronjaureguii.jpg',
    AlejandroAle:'/img/alejandroale.png',
    JordiWild:'/img/jordiwild.jpg', Peldanyos:'/img/peldanyos.jpg',
    IbaiLlanos:'/img/ibaillanos.jpg', ChiquiIbai:'/img/chiquiibai.jpg',
    Peereira7:'/img/peereira7.jpg', Franbeuve:'/img/franbeuve.jpeg',
    Febron:'/img/febron.jpeg',
    Elcalvo:'/img/elcalvo.jpg', Didac:'/img/didac.png',
    Javichu:'/img/javichu.jpeg', Ismael:'/img/ismael.jpeg',
    AlvaroSapo:'/img/alvaro.png', Hectrollprox:'/img/hectroll.png',
    Giva:'/img/giva.jpeg'
};
const FALLBACK = {
    Kappah:'👑', RubenMaxxing:'🔬', SergiCabrer:'🌊', JoseNogales:'🌿',
    TitoChape:'🍪', Aaronjaureguii:'⭐', AlejandroAle:'😄',
    JordiWild:'🎙️', Peldanyos:'🏗️',
    IbaiLlanos:'🎮', ChiquiIbai:'😂', Peereira7:'⚽', Franbeuve:'🎭',
    Febron:'💪',
    Elcalvo:'🧠', Didac:'🎯', Javichu:'⚡',
    Ismael:'🌟', AlvaroSapo:'🐸', Hectrollprox:'👾',
    Giva:'🔥'
};

window.RANKERS = [
    {name:'Kappah',title:'El clavicular español',sub:'España',score:9.4,top:'top1',tags:['ptag-veteran','ptag-chad','ptag-cortisol'],tagNames:['Transformación','Chad','Low Cortisol','Score: 9.4'],bio:'Kappah es la historia de transformación más brutal que ha visto la comunidad looksmaxer española.',movement:'Kappah consolida el #1 con una puntuación histórica de 9.4.',movIcon:'🔥',photoBg:'linear-gradient(135deg,#d4a843,#ffd166)'},
    {name:'RubenMaxxing',title:'El Científico del Looksmaxing',sub:'España',score:9.1,top:'top2',tags:['ptag-chad','ptag-risers','ptag-cortisol'],tagNames:['Chad','En Ascenso','Low Cortisol','Score: 9.1'],bio:'RubenMaxxing es el looksmaxer más metódico de la escena española.',movement:'RubenMaxxing sube consolidándose como el rival más serio de Kappah.',movIcon:'🚀',photoBg:'linear-gradient(135deg,#aaa,#e8e8e8)'},
    {name:'TitoChape',title:'El Jester',sub:'España',score:8.7,top:'top3',tags:['ptag-appeal','ptag-humor','ptag-veteran'],tagNames:['Alta Percepción','Humor','Veterano','Score: 8.7'],bio:'TitoChape es lo más parecido que tiene la comunidad española a un Cookie King con clase.',movement:'TitoChape asciende al #3.',movIcon:'🍪',photoBg:'linear-gradient(135deg,#6b2737,#c0392b)'},
    {name:'Peereira7',title:'El Maestro del Balón',sub:'España',score:8.5,top:'',tags:['ptag-chad','ptag-risers','ptag-new'],tagNames:['Chad','En Ascenso','Nuevo','Score: 8.5'],bio:'Peereira7 entra al ranking con una energía arrolladora.',movement:'Peereira7 debuta directamente en el Top 4.',movIcon:'⚽',photoBg:'linear-gradient(135deg,#1a4a6b,#2196b3)'},
    {name:'Aaronjaureguii',title:'El Fenómeno Español',sub:'España',score:8.6,top:'',tags:['ptag-chad','ptag-risers','ptag-appeal'],tagNames:['Chad','En Ascenso','Alta Percepción','Score: 8.6'],bio:'Aaronjaureguii irrumpe en el ranking con una presencia arrolladora.',movement:'Aaronjaureguii en el Top 5.',movIcon:'⭐',photoBg:'linear-gradient(135deg,#1a3a6b,#2155b3)'},
    {name:'Febron',title:'El Peso Pesado',sub:'España',score:8.3,top:'',tags:['ptag-chad','ptag-new','ptag-cortisol'],tagNames:['Chad','Nuevo','Low Cortisol','Score: 8.3'],bio:'Febron irrumpe en el ranking con una presencia imponente.',movement:'Febron en el Top 6.',movIcon:'💪',photoBg:'linear-gradient(135deg,#2d1b69,#7c3aed)'},
    {name:'SergiCabrer',title:'El elegido',sub:'Islas Baleares · España',score:8.9,top:'',tags:['ptag-chad','ptag-risers','ptag-appeal'],tagNames:['Chad','En Ascenso','Alta Percepción','Score: 8.9'],bio:'SergiCabrer es la bomba que nadie vio venir.',movement:'SergiCabrer en el Top 7.',movIcon:'🌊',photoBg:'linear-gradient(135deg,#1a6b8a,#2196b3)'},
    {name:'Giva',title:'El Fuego del Ranking',sub:'España',score:8.7,top:'',tags:['ptag-new','ptag-chad','ptag-risers'],tagNames:['Nuevo','Chad','En Ascenso','Score: 8.7'],bio:'Giva irrumpe en el Top 8 con una energía arrolladora y presencia que no pasa desapercibida.',movement:'Giva debuta directamente en el Top 8.',movIcon:'🔥',photoBg:'linear-gradient(135deg,#6b1a1a,#c0392b)'},
    {name:'JoseNogales',title:'El Nativo',sub:'España',score:8.8,top:'',tags:['ptag-risers','ptag-chad','ptag-appeal'],tagNames:['Sube','Chad','Alta Percepción','Score: 8.8'],bio:'JoseNogales es el looksmaxer que no necesita explicaciones.',movement:'JoseNogales en el Top 8.',movIcon:'🌿',photoBg:'linear-gradient(135deg,#b46428,#e07840)'},
    {name:'Ismael',title:'El Nuevo Contendiente',sub:'España',score:7.8,top:'',tags:['ptag-new','ptag-appeal','ptag-risers'],tagNames:['Nuevo','Alta Percepción','En Ascenso','Score: 7.8'],bio:'Ismael irrumpe en el ranking con ganas de demostrar lo que vale.',movement:'Ismael debuta en el ranking.',movIcon:'🌟',photoBg:'linear-gradient(135deg,#1a5c6b,#21a3b3)'},
    {name:'Didac',title:'El Competidor',sub:'España',score:7.6,top:'',tags:['ptag-new','ptag-chad','ptag-appeal'],tagNames:['Nuevo','Chad','Alta Percepción','Score: 7.6'],bio:'Didac entra al ranking con una actitud ganadora.',movement:'Didac debuta en el ranking.',movIcon:'🎯',photoBg:'linear-gradient(135deg,#2d4a1e,#4caf50)'},
    {name:'Javichu',title:'El Rayo',sub:'España',score:7.4,top:'',tags:['ptag-new','ptag-risers','ptag-appeal'],tagNames:['Nuevo','En Ascenso','Alta Percepción','Score: 7.4'],bio:'Javichu llega con energía eléctrica dispuesto a escalar posiciones.',movement:'Javichu debuta en el ranking.',movIcon:'⚡',photoBg:'linear-gradient(135deg,#6b4a1e,#c8851e)'},
    {name:'AlvaroSapo',title:'El Anfibio del Looksmax',sub:'España',score:7.3,top:'',tags:['ptag-new','ptag-humor','ptag-appeal'],tagNames:['Nuevo','Humor','Alta Percepción','Score: 7.3'],bio:'AlvaroSapo trae su propio estilo único al ranking.',movement:'AlvaroSapo debuta en el ranking.',movIcon:'🐸',photoBg:'linear-gradient(135deg,#1e6b2d,#2db84c)'},
    {name:'AlejandroAle',title:'El risitas',sub:'España',score:8.3,top:'',tags:['ptag-veteran','ptag-chad'],tagNames:['Veterano','Chad','Score: 8.3'],bio:'AlejandroAle es el looksmaxer con más carisma del ranking.',movement:'AlejandroAle en el ranking.',movIcon:'🌊',photoBg:'linear-gradient(135deg,#2d6a4f,#52b788)'},
    {name:'Elcalvo',title:'El Calvo de Oro',sub:'España',score:7.1,top:'',tags:['ptag-new','ptag-chad','ptag-veteran'],tagNames:['Nuevo','Chad','Veterano','Score: 7.1'],bio:'Elcalvo demuestra que el cabello es opcional cuando tienes el resto.',movement:'Elcalvo debuta en el ranking.',movIcon:'🧠',photoBg:'linear-gradient(135deg,#4a4a4a,#888888)'},
    {name:'Hectrollprox',title:'El Troll del Ranking',sub:'España',score:7.0,top:'',tags:['ptag-new','ptag-humor','ptag-creator'],tagNames:['Nuevo','Humor','Creador','Score: 7.0'],bio:'Hectrollprox llega al ranking para agitar las aguas.',movement:'Hectrollprox debuta en el ranking.',movIcon:'👾',photoBg:'linear-gradient(135deg,#1a1a4e,#3a3a9e)'},
    {name:'JordiWild',title:'El Podcaster Salvaje',sub:'Barcelona · España',score:7.9,top:'',tags:['ptag-creator','ptag-chad','ptag-veteran'],tagNames:['Creador','Chad','Veterano','Score: 7.9'],bio:'Jordi Wild no necesita presentación.',movement:'JordiWild en el ranking.',movIcon:'🎙️',photoBg:'linear-gradient(135deg,#1a1a2e,#16213e)'},
    {name:'Peldanyos',title:'El Constructor de Mundos',sub:'España',score:7.7,top:'',tags:['ptag-creator','ptag-appeal','ptag-new'],tagNames:['Creador','Alta Percepción','Activo','Score: 7.7'],bio:'Peldanyos es uno de los youtubers españoles más queridos.',movement:'Peldanyos en el ranking.',movIcon:'🏗️',photoBg:'linear-gradient(135deg,#2c3e50,#3498db)'},
    {name:'IbaiLlanos',title:'El Rey del Entretenimiento',sub:'País Vasco · España',score:7.5,top:'',tags:['ptag-creator','ptag-humor','ptag-veteran'],tagNames:['Creador','Humor','Veterano','Score: 7.5'],bio:'Ibai Llanos es el rey indiscutible del entretenimiento español.',movement:'IbaiLlanos en el ranking.',movIcon:'🎮',photoBg:'linear-gradient(135deg,#6c3483,#9b59b6)'},
    {name:'ChiquiIbai',title:'El Bromista Elegante',sub:'España',score:6.8,top:'',tags:['ptag-humor','ptag-creator','ptag-appeal'],tagNames:['Humor','Creador','Alta Percepción','Score: 6.8'],bio:'ChiquiIbai ha convertido el humor en su arma de looksmaxing.',movement:'ChiquiIbai en el último puesto del ranking.',movIcon:'😂',photoBg:'linear-gradient(135deg,#e74c3c,#c0392b)'}
];

const CANDIDATES = [
    {id:'franbv', name:'Franbv', sub:'Creador · España', emoji:'🎭', photo:'/img/franbeuve.jpeg'},
    {id:'nilojeda', name:'Nil Ojeda', sub:'Creador · España', emoji:'💎', photo:'/img/nilojeda.png'}
];

const LEXICO = [
    {term:'Looksmaxxing',en:'Looksmaxxing',def:'Proceso de optimizar la apariencia física al máximo.',nivel:'basico'},
    {term:'Mewing',en:'Mewing',def:'Técnica de postura lingual para moldear el paladar y la mandíbula.',nivel:'basico'},
    {term:'Chad',en:'Chad',def:'Individuo con rasgos físicos y actitud dominante percibidos como altamente atractivos.',nivel:'basico'},
    {term:'Mogger',en:'Mogger',def:'Persona cuya presencia física eclipsa visualmente a quienes la rodean.',nivel:'medio'},
    {term:'PSL',en:'PSL Score',def:'Escala de atractivo facial basada en criterios de Looks/Estatus/Dinero.',nivel:'medio'},
    {term:'NT',en:'NormalTward',def:'Individuo con rasgos físicos dentro de la media.',nivel:'basico'},
    {term:'Ascensión',en:'Ascension',def:'Proceso de mejorar significativamente tu puntuación de atractivo.',nivel:'basico'},
    {term:'Cope',en:'Cope',def:'Mecanismo de negación o justificación de la realidad de uno mismo.',nivel:'basico'},
    {term:'Canthal Tilt',en:'Canthal Tilt',def:'Ángulo de los ojos: positivo se considera más atractivo.',nivel:'avanzado'},
    {term:'Framemaxxing',en:'Framemaxxing',def:'Maximizar el desarrollo del armazón óseo y muscular del cuerpo.',nivel:'medio'},
    {term:'Genética',en:'Genetics',def:'Base ósea y rasgos heredados. El techo de tu looksmax natural.',nivel:'medio'},
    {term:'Moggar',en:'To Mog',def:'Superar visualmente a alguien en un espacio compartido sin esfuerzo consciente.',nivel:'medio'}
];

const TICKER_ITEMS = [
    '🌊 SergiCabrer en el Top 4 — una entrada explosiva',
    '🔥 Kappah lidera el ranking con score 9.4',
    '🚀 RubenMaxxing en el #2 con análisis viral',
    '🍪 TitoChape asciende al #3 — el cookie en el podio',
    '⭐ Aaronjaureguii en el Top 7',
    '⚽ Peereira7 debuta directamente en el Top 5',
    '💪 Febron debuta en el Top 6 — el peso pesado ha llegado',
    '🎙️ JordiWild en el ranking',
    '🏗️ Peldanyos debuta en el ranking',
    '🎮 IbaiLlanos — el debate más grande del foro',
    '😂 ChiquiIbai en el Top 13',
    '🗳️ VOTA quién sube en el ranking — ¡decides tú!',
    '⚽ TORNEO EN VIVO — ¡Vota los partidos ahora!',
    '🎭 Franbv vs 💎 Nil Ojeda — ¡Vota quién entra al ranking!'
];

// ══════════════════════════════════════════════════════════════
//  TORNEO DATA
// ══════════════════════════════════════════════════════════════
const TORNEO_PLAYERS = [
    {name:'Aaronjaureguii',photo:'/img/aaronjaureguii.jpg', emoji:'⭐'},
    {name:'Peereira7',     photo:'/img/peereira7.jpg',      emoji:'⚽'},
    {name:'TitoChape',     photo:'/img/titochape.jpeg',     emoji:'🍪'},
    {name:'RubenMaxxing',  photo:'/img/rubenmaxxing.jpg',   emoji:'🔬'},
    {name:'Kappah',        photo:'/img/kappah.png',         emoji:'👑'},
    {name:'Sergi',         photo:'/img/SergiCabrer.jpeg',   emoji:'🌊'},
    {name:'JoseNogales',   photo:'/img/josenogales.jpeg',   emoji:'🌿'},
    {name:'Franbv',        photo:'/img/franbeuve.jpeg',     emoji:'🎭'},
    {name:'Elcalvo',       photo:'/img/elcalvo.jpg',        emoji:'🧠'},
    {name:'Febron',        photo:'/img/febron.jpeg',        emoji:'💪'},
    {name:'Didac',         photo:'/img/didac.png',          emoji:'🎯'},
    {name:'Giva',         photo:'/img/giva.jpeg',         emoji:'🔥'},
    {name:'Javichu',       photo:'/img/javichu.jpeg',       emoji:'⚡'},
    {name:'Ismael',        photo:'/img/ismael.jpeg',        emoji:'🌟'},
    {name:'AlvaroSapo',    photo:'/img/alvaro.png',         emoji:'🐸'},
    {name:'Hectrollprox',  photo:'/img/hectroll.png',       emoji:'👾'}
];

const OCTAVOS_MATCHES = [
    {id:'oct_0',p1:TORNEO_PLAYERS[0], p2:TORNEO_PLAYERS[1]},
    {id:'oct_1',p1:TORNEO_PLAYERS[2], p2:TORNEO_PLAYERS[12]},
    {id:'oct_2',p1:TORNEO_PLAYERS[4], p2:TORNEO_PLAYERS[5]},
    {id:'oct_3',p1:TORNEO_PLAYERS[6], p2:TORNEO_PLAYERS[7]},
    {id:'oct_4',p1:TORNEO_PLAYERS[8], p2:TORNEO_PLAYERS[9]},
    {id:'oct_5',p1:TORNEO_PLAYERS[10],p2:TORNEO_PLAYERS[11]},
    {id:'oct_6',p1:TORNEO_PLAYERS[3], p2:TORNEO_PLAYERS[13]},
    {id:'oct_7',p1:TORNEO_PLAYERS[14],p2:TORNEO_PLAYERS[15]}
];

const WAIT_BEFORE_OCTAVOS  = 10 * 60 * 1000;
const VOTING_DURATION      = 30 * 60 * 1000;
const BREAK_BETWEEN_ROUNDS =  5 * 60 * 1000;

const PHASES = {
    WAITING_OCTAVOS:  'waiting_octavos',
    OCTAVOS_VOTING:   'octavos_voting',
    BREAK_CUARTOS:    'break_cuartos',
    CUARTOS_VOTING:   'cuartos_voting',
    SEMIFINALS_PROMO: 'semifinals_promo',
    SEMIFINALS_VOTING:'semifinals_voting',
    BREAK_FINAL:      'break_final',
    FINAL_VOTING:     'final_voting',
    TORNEO_ENDED:     'torneo_ended'
};

let _torneoState   = null;
let _torneoTimerInt = null;
let _torneoFBListener = null;
let _torneoAdvancing = false;
let _torneoListenerActive = false;  // evita re-entradas en el listener

function getPlayerByName(name) {
    return TORNEO_PLAYERS.find(p => p.name === name) || {name, photo:'', emoji:'❓'};
}

function getInitialTorneoState(now) {
    // Tournament starts directly at Cuartos de Final (no Octavos shown)
    // Build 4 cuartos matches from the first 8 TORNEO_PLAYERS
    const cuartosMatches = {};
    for (let i = 0; i < 4; i++) {
        const id = 'cua_' + i;
        const p1 = TORNEO_PLAYERS[i * 2];
        const p2 = TORNEO_PLAYERS[i * 2 + 1];
        cuartosMatches[id] = {
            id, round: 'cuartos',
            p1: p1.name, p2: p2.name,
            votes: { _placeholder_: 0 },
            winner: null, resolved: false
        };
    }
    return {
        phase: PHASES.CUARTOS_VOTING,
        phaseStart: now,
        phaseEnd: now + VOTING_DURATION,
        cuartosMatches,
        octavosWinners: null,
        cuartosWinners: null,
        createdAt: now
    };
}

async function ensureTorneoState() {
    const existing = await window.FB.getTorneoState();
    if (existing) {
        // Clean up localStorage keys from previous tournaments
        const currentCreatedAt = existing.createdAt || 0;
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('torneoVote_') && !k.startsWith('torneoVote_' + currentCreatedAt + '_')) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch(e) {}
        // Si el admin ha puesto una cuenta atrás (waiting_octavos con phaseEnd futuro), respetarla
        if (existing.phase === PHASES.WAITING_OCTAVOS && existing.phaseEnd > Date.now()) {
            return existing;
        }
        return await advanceTorneoPhaseIfNeeded(existing);
    }
    // No hay estado: crear cuenta atrás hasta las 23:00 de hoy (no iniciar torneo directamente)
    const now2 = new Date();
    const target23 = new Date(now2);
    target23.setHours(23, 0, 0, 0);
    if (now2 >= target23) target23.setDate(target23.getDate() + 1);
    const waitingState = {
        phase: PHASES.WAITING_OCTAVOS,
        phaseEnd: target23.getTime(),
        phaseStart: Date.now(),
        nextPhaseLabel: 'Cuartos de Final',
        createdAt: Date.now()
    };
    await window.FB.initTorneoState(waitingState);
    return waitingState;
}

async function advanceTorneoPhaseIfNeeded(state) {
    if (!state) return state;
    const now = Date.now();
    // Add 2-second buffer to prevent premature advancement due to clock skew
    if (state.phaseEnd > now - 2000) return state;
    if (_torneoAdvancing) {
        // Si ya está avanzando, esperar un poco y devolver el estado fresco de Firebase
        await new Promise(r => setTimeout(r, 1500));
        return (await window.FB.getTorneoState()) || state;
    }
    _torneoAdvancing = true;
    try {
        const result = await _doAdvanceTorneoPhase(state, now);
        return result;
    } catch(e) {
        console.error('advanceTorneoPhaseIfNeeded error:', e);
        return state;
    } finally {
        // Pequeño delay antes de liberar el flag para evitar race condition
        // entre el finally y el onValue de Firebase
        setTimeout(() => { _torneoAdvancing = false; }, 3000);
    }
}

async function _doAdvanceTorneoPhase(state, now) {
    if (state.phase === PHASES.WAITING_OCTAVOS) {
        // Al terminar la cuenta atrás, iniciar el torneo completo (cuartos directo)
        const fresh = getInitialTorneoState(now);
        await window.FB.initTorneoState(fresh);
        return fresh;
    }
    if (state.phase === PHASES.CUARTOS_VOTING) {
        const cuartosObj = state.cuartosMatches || {};
        const resolved = resolveCuartosMatches(cuartosObj);
        // Go directly to SEMIFINALS_VOTING
        const semisMatches = buildSemisMatches(resolved.winners);
        const newState = {
            phase:PHASES.SEMIFINALS_VOTING, phaseStart:now, phaseEnd:now+VOTING_DURATION,
            cuartosWinners:resolved.winners, cuartosMatches:resolved.updatedMatches,
            semisMatches
        };
        const ok = await window.FB.atomicAdvanceTorneoPhase(PHASES.CUARTOS_VOTING, newState);
        if (!ok) { return await window.FB.getTorneoState() || state; }
        return { ...state, ...newState };
    }
    // Compat: si Firebase tiene estado SEMIFINALS_PROMO antiguo, avanzarlo
    if (state.phase === PHASES.SEMIFINALS_PROMO) {
        const semisWinners = state.cuartosWinners || [];
        const semisMatches = buildSemisMatches(semisWinners);
        const newState = {
            phase:PHASES.SEMIFINALS_VOTING, phaseStart:now, phaseEnd:now+VOTING_DURATION,
            semisMatches
        };
        const ok = await window.FB.atomicAdvanceTorneoPhase(PHASES.SEMIFINALS_PROMO, newState);
        if (!ok) { return await window.FB.getTorneoState() || state; }
        return { ...state, ...newState };
    }
    if (state.phase === PHASES.SEMIFINALS_VOTING) {
        const semisObj = state.semisMatches || {};
        const resolved = resolveSemisMatches(semisObj);
        const newState = {
            phase:PHASES.BREAK_FINAL, phaseStart:now, phaseEnd:now+BREAK_BETWEEN_ROUNDS,
            semisWinners:resolved.winners, semisMatches:resolved.updatedMatches
        };
        const ok = await window.FB.atomicAdvanceTorneoPhase(PHASES.SEMIFINALS_VOTING, newState);
        if (!ok) { return await window.FB.getTorneoState() || state; }
        return { ...state, ...newState };
    }
    if (state.phase === PHASES.BREAK_FINAL) {
        const semisWinners = state.semisWinners || [];
        const finalMatch = buildFinalMatch(semisWinners);
        const newState = {
            phase:PHASES.FINAL_VOTING, phaseStart:now, phaseEnd:now+VOTING_DURATION,
            finalMatch
        };
        const ok = await window.FB.atomicAdvanceTorneoPhase(PHASES.BREAK_FINAL, newState);
        if (!ok) { return await window.FB.getTorneoState() || state; }
        return { ...state, ...newState };
    }
    if (state.phase === PHASES.FINAL_VOTING) {
        const fm = state.finalMatch || {};
        const v1=(fm.votes?.[fm.p1])||0, v2=(fm.votes?.[fm.p2])||0;
        const champion = v1>=v2 ? fm.p1 : fm.p2;
        const updatedFinal = {...fm, winner:champion, resolved:true};
        const newState = {
            phase:PHASES.TORNEO_ENDED, phaseStart:now, phaseEnd:now+999*24*60*60*1000,
            champion, finalMatch:updatedFinal
        };
        const ok = await window.FB.atomicAdvanceTorneoPhase(PHASES.FINAL_VOTING, newState);
        if (!ok) { return await window.FB.getTorneoState() || state; }
        return { ...state, ...newState };
    }
    return state;
}

function resolveOctavosMatches(matchesObj) {
    const updatedMatches = JSON.parse(JSON.stringify(matchesObj));
    const winners = [];
    ['oct_0','oct_1','oct_2','oct_3','oct_4','oct_5','oct_6','oct_7'].forEach(id => {
        const m = updatedMatches[id];
        if (!m) { winners.push(null); return; }
        const v1 = (m.votes?.[m.p1]) || 0;
        const v2 = (m.votes?.[m.p2]) || 0;
        const winner = v1 >= v2 ? m.p1 : m.p2;
        m.winner = winner; m.resolved = true;
        winners.push(winner);
    });
    return { winners, updatedMatches };
}

function buildCuartosMatches(winners) {
    const cuartos = {};
    for (let i = 0; i < 4; i++) {
        const id = 'cua_' + i;
        const p1name = winners[i*2]   || 'TBD';
        const p2name = winners[i*2+1] || 'TBD';
        // Use _placeholder_ key so Firebase doesn't drop the votes node when values are 0
        const votes = { _placeholder_: 0 };
        cuartos[id] = { id, round:'cuartos', p1:p1name, p2:p2name, votes, winner:null, resolved:false };
    }
    return cuartos;
}

function resolveCuartosMatches(cuartosObj) {
    const updatedMatches = JSON.parse(JSON.stringify(cuartosObj));
    const winners = [];
    ['cua_0','cua_1','cua_2','cua_3'].forEach(id => {
        const m = updatedMatches[id];
        if (!m) { winners.push(null); return; }
        const v1 = (m.votes?.[m.p1]) || 0;
        const v2 = (m.votes?.[m.p2]) || 0;
        // If no real votes, default p1 wins (phase expired without votes)
        const winner = v1 >= v2 ? m.p1 : m.p2;
        m.winner = winner; m.resolved = true;
        winners.push(winner);
    });
    return { winners, updatedMatches };
}

function buildSemisMatches(winners) {
    const semis = {};
    for (let i = 0; i < 2; i++) {
        const id = 'semi_' + i;
        const p1name = winners[i*2]   || 'TBD';
        const p2name = winners[i*2+1] || 'TBD';
        const votes = { _placeholder_: 0 };
        semis[id] = { id, round:'semis', p1:p1name, p2:p2name, votes, winner:null, resolved:false };
    }
    return semis;
}

function resolveSemisMatches(semisObj) {
    const updatedMatches = JSON.parse(JSON.stringify(semisObj));
    const winners = [];
    ['semi_0','semi_1'].forEach(id => {
        const m = updatedMatches[id];
        if (!m) { winners.push(null); return; }
        const v1 = (m.votes?.[m.p1]) || 0;
        const v2 = (m.votes?.[m.p2]) || 0;
        const winner = v1 >= v2 ? m.p1 : m.p2;
        m.winner = winner; m.resolved = true;
        winners.push(winner);
    });
    return { winners, updatedMatches };
}

function buildFinalMatch(winners) {
    const p1name = winners[0] || 'TBD';
    const p2name = winners[1] || 'TBD';
    const votes = { _placeholder_: 0 };
    return { id:'final_0', round:'final', p1:p1name, p2:p2name, votes, winner:null, resolved:false };
}

// ── Torneo UI ──────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2,'0'); }

function renderTorneoPhase(state) {
    if (!state) return;
    _torneoState = state;



    const phaseCard = document.getElementById('torneoPhaseCard');
    const matchesSection = document.getElementById('torneoMatchesSection');
    const semisPromo = document.getElementById('torneoSemisPromo');
    if (semisPromo) semisPromo.style.display = 'none';
    const now = Date.now();
    const remaining = Math.max(0, state.phaseEnd - now);

    if (state.phase === PHASES.WAITING_OCTAVOS) {
        if (phaseCard) {
            // Determinar el texto de la fase que arranca
            const nextLabel = state.nextPhaseLabel || 'Cuartos de Final';
            // Hora objetivo en texto legible
            const phaseEndDate = new Date(state.phaseEnd);
            const horaStr = phaseEndDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const diasES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
            const mesesES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            const diaStr = diasES[phaseEndDate.getDay()] + ' ' + phaseEndDate.getDate() + ' de ' + mesesES[phaseEndDate.getMonth()];

            phaseCard.className = 'phase-card waiting';
            phaseCard.innerHTML = `
                <div class="phase-label orange"><span class="phase-dot orange"></span>PRÓXIMAMENTE<span class="phase-dot orange"></span></div>
                <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(.9rem,2.5vw,1.3rem);letter-spacing:3px;color:var(--text2);margin:.3rem 0 .1rem;">Torneo de LooksMaxing</div>
                <div class="phase-title orange" style="font-size:clamp(2rem,6vw,4.5rem);margin:.1rem 0 .3rem;">${nextLabel}</div>
                <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,8vw,6rem);letter-spacing:6px;background:linear-gradient(135deg,var(--orange),var(--gold2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;margin:.2rem 0 .6rem;filter:drop-shadow(0 0 20px rgba(249,115,22,.4));">EMPIEZA A LAS ${horaStr}</div>
                <div style="font-size:.65rem;color:var(--text2);font-weight:700;letter-spacing:1px;margin-bottom:.9rem;">📅 ${diaStr}</div>
                <div class="phase-timer">
                    <div class="ptd-u"><div class="ptd-n orange" id="ptd-h">00</div><div class="ptd-l">Horas</div></div>
                    <div class="ptd-sep orange">:</div>
                    <div class="ptd-u"><div class="ptd-n orange" id="ptd-m">00</div><div class="ptd-l">Min</div></div>
                    <div class="ptd-sep orange">:</div>
                    <div class="ptd-u"><div class="ptd-n orange" id="ptd-s">00</div><div class="ptd-l">Seg</div></div>
                </div>
                <div style="margin-top:.8rem;font-size:.7rem;color:var(--text2);font-weight:600;">⚡ El torneo arrancará automáticamente a las ${horaStr}</div>`;
        }
        if (matchesSection) matchesSection.style.display = 'none';
        startTorneoPhaseTimer(state, remaining);
    } else if (state.phase === PHASES.OCTAVOS_VOTING) {
        if (phaseCard) {
            phaseCard.className = 'phase-card voting';
            phaseCard.innerHTML = `
                <div class="phase-label green"><span class="phase-dot green"></span>OCTAVOS EN VIVO · VOTA AHORA<span class="phase-dot green"></span></div>
                <div class="phase-title green">⚽ OCTAVOS DE FINAL</div>
                <div class="phase-sub">30 minutos de votación · El que más votos tenga pasa a Cuartos</div>
                <div class="phase-timer">
                    <div class="ptd-u"><div class="ptd-n green" id="ptd-h">00</div><div class="ptd-l">Horas</div></div>
                    <div class="ptd-sep green">:</div>
                    <div class="ptd-u"><div class="ptd-n green" id="ptd-m">30</div><div class="ptd-l">Min</div></div>
                    <div class="ptd-sep green">:</div>
                    <div class="ptd-u"><div class="ptd-n green" id="ptd-s">00</div><div class="ptd-l">Seg</div></div>
                </div>`;
        }
        if (matchesSection) {
            matchesSection.style.display = 'block';
            document.getElementById('torneoMatchesTitle').innerHTML = '⚽ Octavos de Final — ¡Vota Ahora!';
            renderMatches(state.matches, OCTAVOS_MATCHES.map(m=>m.id), 'octavos');
        }
        startTorneoPhaseTimer(state, remaining);
    } else if (state.phase === PHASES.BREAK_CUARTOS) {
        if (phaseCard) {
            phaseCard.className = 'phase-card break';
            phaseCard.innerHTML = `
                <div class="phase-label purple"><span class="phase-dot purple"></span>DESCANSO ENTRE RONDAS<span class="phase-dot purple"></span></div>
                <div class="phase-title purple">⏸ SEMIFINALES EN</div>
                <div class="phase-sub">Los Cuartos han terminado · Semifinales comienzan en breve</div>
                <div class="phase-timer">
                    <div class="ptd-u"><div class="ptd-n purple" id="ptd-h">00</div><div class="ptd-l">Horas</div></div>
                    <div class="ptd-sep purple">:</div>
                    <div class="ptd-u"><div class="ptd-n purple" id="ptd-m">05</div><div class="ptd-l">Min</div></div>
                    <div class="ptd-sep purple">:</div>
                    <div class="ptd-u"><div class="ptd-n purple" id="ptd-s">00</div><div class="ptd-l">Seg</div></div>
                </div>
                <div style="margin-top:1rem;font-size:.7rem;color:var(--text2);font-weight:600;">🏆 Las Semifinales empezarán automáticamente</div>`;
        }
        if (matchesSection) {
            matchesSection.style.display = 'block';
            document.getElementById('torneoMatchesTitle').innerHTML = '✅ Cuartos — Semifinales en ' + formatDuration(remaining);
            if (state.cuartosMatches) {
                renderMatches(state.cuartosMatches, ['cua_0','cua_1','cua_2','cua_3'], 'cuartos');
            }
        }
        startTorneoPhaseTimer(state, remaining);
    } else if (state.phase === PHASES.CUARTOS_VOTING) {
        if (phaseCard) {
            phaseCard.className = 'phase-card voting';
            phaseCard.innerHTML = `
                <div class="phase-label green"><span class="phase-dot green"></span>CUARTOS EN VIVO · VOTA AHORA<span class="phase-dot green"></span></div>
                <div class="phase-title green">🏟️ CUARTOS DE FINAL</div>
                <div class="phase-sub">30 minutos de votación · El que más votos tenga pasa a Semifinales</div>
                <div class="phase-timer">
                    <div class="ptd-u"><div class="ptd-n green" id="ptd-h">00</div><div class="ptd-l">Horas</div></div>
                    <div class="ptd-sep green">:</div>
                    <div class="ptd-u"><div class="ptd-n green" id="ptd-m">30</div><div class="ptd-l">Min</div></div>
                    <div class="ptd-sep green">:</div>
                    <div class="ptd-u"><div class="ptd-n green" id="ptd-s">00</div><div class="ptd-l">Seg</div></div>
                </div>`;
        }
        if (matchesSection && state.cuartosMatches) {
            matchesSection.style.display = 'block';
            document.getElementById('torneoMatchesTitle').innerHTML = '🏟️ Cuartos de Final — ¡Vota Ahora!';
            renderMatches(state.cuartosMatches, ['cua_0','cua_1','cua_2','cua_3'], 'cuartos');
        }
        startTorneoPhaseTimer(state, remaining);
    } else if (state.phase === PHASES.SEMIFINALS_VOTING) {
        if (phaseCard) {
            phaseCard.className = 'phase-card voting';
            phaseCard.innerHTML = `
                <div class="phase-label gold"><span class="phase-dot" style="background:var(--gold);"></span>⚡ SEMIFINALES EN VIVO · VOTA AHORA ⚡<span class="phase-dot" style="background:var(--gold);"></span></div>
                <div class="phase-title gold">🏆 SEMIFINALES</div>
                <div class="phase-sub">30 minutos de votación · Los ganadores van a la Gran Final</div>
                <div class="phase-timer">
                    <div class="ptd-u"><div class="ptd-n gold" id="ptd-h">00</div><div class="ptd-l">Horas</div></div>
                    <div class="ptd-sep gold">:</div>
                    <div class="ptd-u"><div class="ptd-n gold" id="ptd-m">30</div><div class="ptd-l">Min</div></div>
                    <div class="ptd-sep gold">:</div>
                    <div class="ptd-u"><div class="ptd-n gold" id="ptd-s">00</div><div class="ptd-l">Seg</div></div>
                </div>
                <div style="margin-top:1rem;display:inline-flex;align-items:center;gap:.5rem;background:rgba(232,184,75,.12);border:1px solid rgba(232,184,75,.4);border-radius:99px;padding:.45rem 1.2rem;font-size:.7rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);">🔥 2 PARTIDOS · PASAN 2 A LA FINAL</div>`;
        }
        if (matchesSection && state.semisMatches) {
            matchesSection.style.display = 'block';
            document.getElementById('torneoMatchesTitle').innerHTML = '🏆 Semifinales — ¡Vota Ahora!';
            renderMatches(state.semisMatches, ['semi_0','semi_1'], 'semis');
        }
        startTorneoPhaseTimer(state, remaining);
    } else if (state.phase === PHASES.BREAK_FINAL) {
        if (phaseCard) {
            phaseCard.className = 'phase-card break';
            phaseCard.innerHTML = `
                <div class="phase-label purple"><span class="phase-dot purple"></span>DESCANSO ANTES DE LA GRAN FINAL<span class="phase-dot purple"></span></div>
                <div class="phase-title purple">👑 FINAL EN</div>
                <div class="phase-sub">Las Semifinales han concluido · La Gran Final comienza en breve</div>
                <div class="phase-timer">
                    <div class="ptd-u"><div class="ptd-n purple" id="ptd-h">00</div><div class="ptd-l">Horas</div></div>
                    <div class="ptd-sep purple">:</div>
                    <div class="ptd-u"><div class="ptd-n purple" id="ptd-m">05</div><div class="ptd-l">Min</div></div>
                    <div class="ptd-sep purple">:</div>
                    <div class="ptd-u"><div class="ptd-n purple" id="ptd-s">00</div><div class="ptd-l">Seg</div></div>
                </div>
                <div style="margin-top:1rem;font-size:.7rem;color:var(--text2);font-weight:600;">👑 La Gran Final arrancará automáticamente</div>`;
        }
        if (matchesSection && state.semisMatches) {
            matchesSection.style.display = 'block';
            document.getElementById('torneoMatchesTitle').innerHTML = '✅ Resultados Semifinales — Final en ' + formatDuration(remaining);
            renderMatches(state.semisMatches, ['semi_0','semi_1'], 'semis');
        }
        startTorneoPhaseTimer(state, remaining);
    } else if (state.phase === PHASES.FINAL_VOTING) {
        if (phaseCard) {
            phaseCard.className = 'phase-card semifinals';
            phaseCard.innerHTML = `
                <div class="phase-label gold"><span class="phase-dot" style="background:var(--gold);animation:pulse 0.8s infinite;"></span>👑 GRAN FINAL EN VIVO 👑<span class="phase-dot" style="background:var(--gold);animation:pulse 0.8s infinite;"></span></div>
                <div class="phase-title gold">GRAN FINAL</div>
                <div class="phase-sub">El último enfrentamiento · Solo uno puede ser el Campeón</div>
                <div class="phase-timer">
                    <div class="ptd-u"><div class="ptd-n gold" id="ptd-h">00</div><div class="ptd-l">Horas</div></div>
                    <div class="ptd-sep gold">:</div>
                    <div class="ptd-u"><div class="ptd-n gold" id="ptd-m">30</div><div class="ptd-l">Min</div></div>
                    <div class="ptd-sep gold">:</div>
                    <div class="ptd-u"><div class="ptd-n gold" id="ptd-s">00</div><div class="ptd-l">Seg</div></div>
                </div>
                <div style="margin-top:1rem;display:inline-flex;align-items:center;gap:.5rem;background:rgba(232,184,75,.18);border:1px solid rgba(232,184,75,.6);border-radius:99px;padding:.45rem 1.2rem;font-size:.7rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);box-shadow:0 0 16px rgba(232,184,75,.3);">🏆 UN SOLO GANADOR · EL CAMPEÓN DE ESPAÑA</div>`;
        }
        if (matchesSection && state.finalMatch) {
            matchesSection.style.display = 'block';
            document.getElementById('torneoMatchesTitle').innerHTML = '👑 Gran Final — ¡Vota al Campeón!';
            const finalMatchObj = { final_0: state.finalMatch };
            renderMatches(finalMatchObj, ['final_0'], 'final');
        }
        startTorneoPhaseTimer(state, remaining);
    } else if (state.phase === PHASES.TORNEO_ENDED) {
        const champ = state.champion || '?';
        const champInfo = getPlayerByName(champ);
        if (phaseCard) {
            // Calcular la próxima 23:00 del día actual
            const now2 = new Date();
            const target23 = new Date(now2);
            target23.setHours(23, 0, 0, 0);
            if (now2 >= target23) target23.setDate(target23.getDate() + 1);
            const target23Ms = target23.getTime();
            // Formatear el día actual en español
            const diasES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
            const mesesES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            const diaStr = diasES[now2.getDay()] + ' ' + now2.getDate() + ' de ' + mesesES[now2.getMonth()];
            phaseCard.className = 'phase-card semifinals';
            phaseCard.innerHTML = `
                <div class="phase-label gold"><span>🏆</span>TORNEO FINALIZADO<span>🏆</span></div>
                <div class="phase-title gold">👑 CAMPEÓN</div>
                <div class="phase-sub">El mejor looksmaxer de España ha sido coronado</div>
                <div style="display:flex;flex-direction:column;align-items:center;gap:.7rem;margin:1rem 0;">
                    <div style="width:90px;height:90px;border-radius:50%;border:3px solid var(--gold);background:var(--card2);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:2rem;box-shadow:0 0 30px rgba(232,184,75,.5);">
                        <img src="${champInfo.photo}" alt="${champ}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;">${champInfo.emoji}</span>
                    </div>
                    <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,7vw,4rem);letter-spacing:4px;background:linear-gradient(135deg,#fff,var(--gold2),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${champ}</div>
                </div>
                <div style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(232,184,75,.12);border:1px solid rgba(232,184,75,.4);border-radius:99px;padding:.45rem 1.2rem;font-size:.7rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);">🏆 CAMPEÓN DEL TORNEO · ESPAÑA 2025</div>
                <div style="margin-top:1.8rem;border-top:1px solid rgba(232,184,75,.2);padding-top:1.4rem;width:100%;text-align:center;">
                    <div style="font-size:.6rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--text2);margin-bottom:.3rem;">📅 HOY · ${diaStr}</div>
                    <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(1rem,3vw,1.6rem);letter-spacing:3px;color:var(--orange);margin-bottom:.7rem;">🔄 NUEVO TORNEO EMPIEZA A LAS 23:00</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.6rem;">
                        <div style="display:flex;flex-direction:column;align-items:center;gap:.15rem;">
                            <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,5vw,3.5rem);line-height:1;color:var(--orange);background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3);border-radius:10px;padding:.1rem .5rem;min-width:60px;text-align:center;" id="restart-h">--</div>
                            <div style="font-size:.55rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2);">Horas</div>
                        </div>
                        <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--orange);opacity:.5;margin-bottom:.8rem;animation:blink 1s step-end infinite;">:</div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:.15rem;">
                            <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,5vw,3.5rem);line-height:1;color:var(--orange);background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3);border-radius:10px;padding:.1rem .5rem;min-width:60px;text-align:center;" id="restart-m">--</div>
                            <div style="font-size:.55rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2);">Min</div>
                        </div>
                        <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--orange);opacity:.5;margin-bottom:.8rem;animation:blink 1s step-end infinite;">:</div>
                        <div style="display:flex;flex-direction:column;align-items:center;gap:.15rem;">
                            <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(1.8rem,5vw,3.5rem);line-height:1;color:var(--orange);background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3);border-radius:10px;padding:.1rem .5rem;min-width:60px;text-align:center;" id="restart-s">--</div>
                            <div style="font-size:.55rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2);">Seg</div>
                        </div>
                    </div>
                    <div style="font-size:.65rem;color:var(--text2);font-weight:600;">⚡ El torneo se reiniciará automáticamente a las 23:00</div>
                </div>`;
            startTorneoRestartCountdown(target23Ms);
        }
        if (matchesSection && state.finalMatch) {
            matchesSection.style.display = 'block';
            document.getElementById('torneoMatchesTitle').innerHTML = '👑 Gran Final — Resultado Final';
            const finalMatchObj = { final_0: state.finalMatch };
            renderMatches(finalMatchObj, ['final_0'], 'final');
        }
    }
}

// ── Countdown until 23:00 restart — auto-resets tournament ───────
let _torneoRestartTimer = null;
function startTorneoRestartCountdown(targetMs) {
    if (_torneoRestartTimer) { clearInterval(_torneoRestartTimer); _torneoRestartTimer = null; }
    let _resetTriggered = false;
    function tick() {
        const diff = Math.max(0, targetMs - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const hEl = document.getElementById('restart-h');
        const mEl = document.getElementById('restart-m');
        const sEl = document.getElementById('restart-s');
        if (hEl) hEl.textContent = pad(h);
        if (mEl) mEl.textContent = pad(m);
        if (sEl) sEl.textContent = pad(s);
        if (diff <= 0 && !_resetTriggered) {
            _resetTriggered = true;
            clearInterval(_torneoRestartTimer);
            _torneoRestartTimer = null;
            // Reiniciar torneo automáticamente
            autoResetTorneo();
        }
    }
    tick();
    _torneoRestartTimer = setInterval(tick, 1000);
}

async function autoResetTorneo() {
    if (!window.FB) return;
    try {
        const phaseCard = document.getElementById('torneoPhaseCard');
        if (phaseCard) {
            phaseCard.innerHTML = `
                <div class="phase-label orange"><span class="phase-dot orange"></span>REINICIANDO<span class="phase-dot orange"></span></div>
                <div class="phase-title orange">🔄 Iniciando Nuevo Torneo…</div>
                <div class="phase-sub">Por favor espera unos segundos</div>`;
        }
        const fresh = getInitialTorneoState(Date.now());
        await window.FB.initTorneoState(fresh);
        _torneoState = fresh;
        renderTorneoPhase(fresh);
    } catch(e) {
        console.error('autoResetTorneo error:', e);
    }
}

function formatDuration(ms) {
    const m = Math.floor(ms/60000), s = Math.floor((ms%60000)/1000);
    return m > 0 ? m + ' min ' + s + 's' : s + ' seg';
}

function startTorneoPhaseTimer(state, initialRemaining) {
    if (_torneoTimerInt) { clearInterval(_torneoTimerInt); _torneoTimerInt = null; }
    let expiredHandled = false;
    // Capturar el phaseEnd del state actual para que si el state cambia
    // este timer no avance una fase distinta
    const capturedPhase = state.phase;
    const capturedPhaseEnd = state.phaseEnd;
    function tick() {
        const diff = Math.max(0, capturedPhaseEnd - Date.now());
        const h = Math.floor(diff/3600000), rem1 = diff - h*3600000;
        const m = Math.floor(rem1/60000), rem2 = rem1 - m*60000;
        const s = Math.floor(rem2/1000);
        const hEl = document.getElementById('ptd-h'), mEl = document.getElementById('ptd-m'), sEl = document.getElementById('ptd-s');
        if (hEl) hEl.textContent = pad(h);
        if (mEl) mEl.textContent = pad(m);
        if (sEl) sEl.textContent = pad(s);
        if (diff <= 0 && !expiredHandled) {
            expiredHandled = true;
            clearInterval(_torneoTimerInt); _torneoTimerInt = null;
            // Solo avanzar si el estado actual sigue siendo el mismo
            if (_torneoState && _torneoState.phase === capturedPhase) {
                handleTorneoPhaseExpired(state);
            }
        }
    }
    tick();
    _torneoTimerInt = setInterval(tick, 1000);
}

async function handleTorneoPhaseExpired(state) {
    if (!window.FB) return;
    if (_torneoAdvancing) return;  // ya hay un avance en curso, no hacer nada
    try {
        const fresh = await window.FB.getTorneoState();
        if (!fresh) return;
        if (fresh.phase !== state.phase) { _torneoState = fresh; renderTorneoPhase(fresh); return; }
        const advanced = await advanceTorneoPhaseIfNeeded(fresh);
        _torneoState = advanced;
        renderTorneoPhase(advanced);
    } catch(e) { console.error('Torneo advance error:', e); }
}

function renderMatches(matchesObj, matchIds, round) {
    const grid = document.getElementById('torneoMatchesGrid');
    if (!grid || !matchesObj) return;
    grid.innerHTML = '';
    matchIds.forEach((id, idx) => {
        const m = matchesObj[id];
        if (!m) return;
        const p1 = getPlayerByName(m.p1), p2 = getPlayerByName(m.p2);
        const v1 = (m.votes?.[m.p1]) || 0;
        const v2 = (m.votes?.[m.p2]) || 0;
        const total = Math.max(1, v1+v2);
        const pct1 = Math.round((v1/total)*100), pct2 = 100-pct1;
        const isResolved = m.resolved && m.winner;
        const torneoCreatedAt = _torneoState ? (_torneoState.createdAt || 0) : 0;
        const myVoteKey = 'torneoVote_' + torneoCreatedAt + '_' + id;
        let myVote = null;
        try { myVote = localStorage.getItem(myVoteKey); } catch(e) {}
        const isVotingPhase = _torneoState && (
            (_torneoState.phase === PHASES.OCTAVOS_VOTING  && round === 'octavos') ||
            (_torneoState.phase === PHASES.CUARTOS_VOTING && round === 'cuartos') ||
            (_torneoState.phase === PHASES.SEMIFINALS_VOTING && round === 'semis') ||
            (_torneoState.phase === PHASES.FINAL_VOTING && round === 'final')
        );
        const canVote = isVotingPhase && !isResolved && !myVote;
        const showBars = isResolved || !!myVote;
        let statusBadge = isResolved ? `<span class="match-status-badge done">✅ Terminado</span>`
            : isVotingPhase ? `<span class="match-status-badge live">🔴 EN VIVO</span>`
            : `<span class="match-status-badge pending">⏳ Pendiente</span>`;
        const roundLabel = round === 'octavos' ? 'Octavos' : round === 'cuartos' ? 'Cuartos' : round === 'semis' ? '🏆 Semifinal' : '👑 Gran Final';
        const card = document.createElement('div');
        card.className = `match-card ${isVotingPhase&&!isResolved?'active-match':''} ${isResolved?'resolved-match':''}`;
        card.setAttribute('data-matchid', id);
        card.innerHTML = `
            <div class="match-header"><span class="match-num">${roundLabel} · Partido ${idx+1}</span>${statusBadge}</div>
            <div class="match-fighters">
                <div class="mf-side ${isResolved&&m.winner===m.p1?'winner-side':''} ${isResolved&&m.winner!==m.p1?'loser-side':''} ${myVote===m.p1?'voted-for':''} ${canVote?'can-vote':''}" data-player="${m.p1}">
                    ${isResolved&&m.winner===m.p1?'<div class="mf-winner-crown">👑</div>':''}
                    <div class="mf-photo"><img src="${p1.photo}" alt="${m.p1}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.3rem;">${p1.emoji}</span></div>
                    <div class="mf-name">${m.p1}</div>
                    ${showBars?`<div class="mf-bar-wrap"><div class="mf-bar" style="width:${pct1}%"></div></div><div class="mf-pct">${pct1}%</div><div class="mf-votes">${v1} voto${v1!==1?'s':''}</div>`:canVote?`<div style="font-size:.6rem;color:var(--green2);font-weight:800;margin-top:.3rem;">👆 Votar</div>`:''}
                </div>
                <div class="match-vs">VS</div>
                <div class="mf-side ${isResolved&&m.winner===m.p2?'winner-side':''} ${isResolved&&m.winner!==m.p2?'loser-side':''} ${myVote===m.p2?'voted-for':''} ${canVote?'can-vote':''}" data-player="${m.p2}">
                    ${isResolved&&m.winner===m.p2?'<div class="mf-winner-crown">👑</div>':''}
                    <div class="mf-photo"><img src="${p2.photo}" alt="${m.p2}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.3rem;">${p2.emoji}</span></div>
                    <div class="mf-name">${m.p2}</div>
                    ${showBars?`<div class="mf-bar-wrap"><div class="mf-bar" style="width:${pct2}%"></div></div><div class="mf-pct">${pct2}%</div><div class="mf-votes">${v2} voto${v2!==1?'s':''}</div>`:canVote?`<div style="font-size:.6rem;color:var(--green2);font-weight:800;margin-top:.3rem;">👆 Votar</div>`:''}
                </div>
            </div>
            ${myVote&&!isResolved?`<div class="match-voted-msg">✅ Votaste por <strong>${myVote}</strong></div>`:''}
            ${isResolved?`<div class="match-winner-banner">🏆 GANADOR · <span class="match-winner-name">${m.winner}</span></div>`:''}`;
        if (canVote) {
            card.querySelectorAll('.mf-side[data-player]').forEach(side => {
                side.addEventListener('click', () => handleTorneoVote(id, side.getAttribute('data-player'), round));
            });
        }
        grid.appendChild(card);
    });
}

async function handleTorneoVote(matchId, playerName, round) {
    if (!window.FB) return;
    const torneoCreatedAt = _torneoState ? (_torneoState.createdAt || 0) : 0;
    let myVote = null;
    try { myVote = localStorage.getItem('torneoVote_'+torneoCreatedAt+'_'+matchId); } catch(e) {}
    if (myVote) return;
    const card = document.querySelector(`.match-card[data-matchid="${matchId}"]`);
    if (card) card.querySelectorAll('.mf-side').forEach(s => { s.style.pointerEvents='none'; s.style.opacity='.6'; });
    const result = await window.FB.castTorneoVote(matchId, playerName);
    if (result.ok) {
        const fresh = await window.FB.getTorneoState();
        if (fresh) {
            _torneoState = fresh;
            const matchesObj = round==='cuartos' ? fresh.cuartosMatches : round==='semis' ? fresh.semisMatches : round==='final' ? { final_0: fresh.finalMatch } : fresh.matches;
            const matchIds = round==='cuartos' ? ['cua_0','cua_1','cua_2','cua_3'] : round==='semis' ? ['semi_0','semi_1'] : round==='final' ? ['final_0'] : OCTAVOS_MATCHES.map(m=>m.id);
            renderMatches(matchesObj, matchIds, round);
        }
    } else {
        if (card) card.querySelectorAll('.mf-side').forEach(s => { s.style.pointerEvents=''; s.style.opacity=''; });
        if (result.reason === 'already_voted') {
            const msg = document.createElement('div');
            msg.className = 'match-voted-msg';
            msg.style.color = 'var(--red2)';
            msg.textContent = '⚠️ Ya has votado en este partido';
            if (card) card.appendChild(msg);
        }
    }
}

function renderTorneoBracket(state) {
    const grid = document.getElementById('torneoBracketGrid');
    if (!grid) return;
    grid.innerHTML = '';
    // Col Cuartos (primera ronda visible)
    const colCua = document.createElement('div');
    colCua.className = 'bracket-col';
    colCua.innerHTML = '<div class="bracket-col-title">Cuartos de Final</div>';
    // Show the 8 players in cuartos (p1 and p2 of each match)
    ['cua_0','cua_1','cua_2','cua_3'].forEach(matchId => {
        const cMatch = state.cuartosMatches?.[matchId];
        if (!cMatch) { colCua.innerHTML += `<div class="bracket-mini-slot tbd"><div class="bracket-mini-name tbd-name">— TBD</div></div><div class="bracket-mini-slot tbd"><div class="bracket-mini-name tbd-name">— TBD</div></div>`; return; }
        [cMatch.p1, cMatch.p2].forEach(pname => {
            const p = getPlayerByName(pname);
            const isWinner = cMatch?.resolved && cMatch.winner === pname;
            colCua.innerHTML += `
                <div class="bracket-mini-slot ${isWinner?'winner-slot':''}">
                    <div class="bracket-mini-photo"><img src="${p.photo}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><span style="display:none">${p.emoji}</span></div>
                    <div class="bracket-mini-name">${p.name}</div>
                </div>`;
        });
    });
    grid.appendChild(colCua);
    const colSemi = document.createElement('div');
    colSemi.className = 'bracket-col';
    colSemi.innerHTML = '<div class="bracket-col-title">Semifinales</div>';
    const semisWinners = state.cuartosWinners || [];
    for (let i = 0; i < 4; i++) {
        const w = semisWinners[i] || null;
        const semiMatchId = 'semi_' + Math.floor(i/2);
        const semiMatch = state.semisMatches?.[semiMatchId];
        if (!w) {
            colSemi.innerHTML += `<div class="bracket-mini-slot tbd"><div class="bracket-mini-name tbd-name">— TBD</div></div>`;
        } else {
            const p = getPlayerByName(w);
            const isWinner = semiMatch?.resolved && semiMatch.winner === w;
            colSemi.innerHTML += `
                <div class="bracket-mini-slot ${isWinner?'winner-slot':''}">
                    <div class="bracket-mini-photo"><img src="${p.photo}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><span style="display:none">${p.emoji}</span></div>
                    <div class="bracket-mini-name">${p.name}</div>
                </div>`;
        }
    }
    // fecha bracket eliminada
    grid.appendChild(colSemi);
    // Col Final
    const colFinal = document.createElement('div');
    colFinal.className = 'bracket-col';
    const semisWinnersArr = state.semisWinners || [];
    const champion = state.champion || null;
    const fm = state.finalMatch;
    colFinal.innerHTML = `<div class="bracket-col-title" style="color:var(--gold);">Final</div>`;
    if (champion) {
        const champP = getPlayerByName(champion);
        colFinal.innerHTML += `
            <div class="bracket-mini-slot winner-slot" style="border-color:var(--gold2);background:rgba(232,184,75,.12);">
                <div class="bracket-mini-photo"><img src="${champP.photo}" alt="${champP.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><span style="display:none">${champP.emoji}</span></div>
                <div class="bracket-mini-name" style="color:var(--gold2);">👑 ${champP.name}</div>
            </div>`;
    } else if (semisWinnersArr.length >= 2 && semisWinnersArr[0] && semisWinnersArr[1]) {
        [semisWinnersArr[0], semisWinnersArr[1]].forEach(w => {
            const p = getPlayerByName(w);
            const isWinner = fm?.resolved && fm.winner === w;
            colFinal.innerHTML += `
                <div class="bracket-mini-slot ${isWinner?'winner-slot':''}">
                    <div class="bracket-mini-photo"><img src="${p.photo}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"><span style="display:none">${p.emoji}</span></div>
                    <div class="bracket-mini-name">${p.name}</div>
                </div>`;
        });
    } else {
        colFinal.innerHTML += `
            <div class="bracket-mini-slot tbd" style="border-color:rgba(232,184,75,.4);background:rgba(232,184,75,.06);">
                <span style="font-size:.9rem;">👑</span>
                <div class="bracket-mini-name" style="color:var(--gold);">Por decidir</div>
            </div>`;
    }
    // fecha eliminada
    grid.appendChild(colFinal);
}

async function loadTorneoPage() {
    if (!window.FB) return;
    if (_torneoTimerInt) { clearInterval(_torneoTimerInt); _torneoTimerInt = null; }
    if (_torneoFBListener) { _torneoFBListener(); _torneoFBListener = null; }
    _torneoListenerActive = false;
    const phaseCard = document.getElementById('torneoPhaseCard');
    if (phaseCard) {
        phaseCard.className = 'phase-card waiting';
        phaseCard.innerHTML = `<div class="phase-label orange"><span class="phase-dot orange"></span>CONECTANDO<span class="phase-dot orange"></span></div><div class="phase-title orange">⏳ Cargando…</div>`;
    }
    try {
        const state = await ensureTorneoState();
        _torneoState = state;
        renderTorneoPhase(state);
    } catch(e) { console.error('Torneo load error:', e); }

    // Debounce para el listener: ignorar disparos mientras avanzamos fase
    let _listenerDebounce = null;
    _torneoFBListener = window.FB.onValue(window.FB.ref(window.FB.db,'torneo/state'), async snap => {
        if (!snap.exists()) return;
        const state = snap.val();
        const now = Date.now();

        // Si estamos avanzando fase, ignorar este disparo (es consecuencia del write)
        if (_torneoAdvancing) return;

        // Debounce: si llegan varios disparos seguidos, procesar sólo el último
        if (_listenerDebounce) clearTimeout(_listenerDebounce);
        _listenerDebounce = setTimeout(async () => {
            _listenerDebounce = null;
            if (_torneoAdvancing) return; // doble check tras el delay
            if (state.phaseEnd <= now - 2000) {
                const advanced = await advanceTorneoPhaseIfNeeded(state);
                _torneoState = advanced;
                renderTorneoPhase(advanced);
                checkCeremonySync(advanced);
            } else {
                _torneoState = state;
                renderTorneoPhase(state);
                checkCeremonySync(state);
            }
        }, 400);
    });
}

// ══════════════════════════════════════════════════════════════
//  RANK VOTE SYSTEM
// ══════════════════════════════════════════════════════════════
let rvTimerInt = null, evTimerInt = null, cdTimerInt = null;
window._currentRVId = null;
window._currentRV = null;
window._rvResolvingLocally = false;

function avatarIMG(name, size) {
    const s = size||40, src = FOTOS[name]||'', fb = FALLBACK[name]||'👤';
    if (!src) return `<span style="font-size:${s*.55}px">${fb}</span>`;
    return `<img src="${src}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:${s*.55}px;">${fb}</span>`;
}
function avatarIMGRect(name) {
    const src = FOTOS[name]||'', fb = FALLBACK[name]||'👤';
    if (!src) return `<div class="profile-photo-fallback">${fb}</div>`;
    return `<img src="${src}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=\\'profile-photo-fallback\\'>${fb}</div>');">`;
}

function startRankCountdown(endTime) {
    if (cdTimerInt) clearInterval(cdTimerInt);
    function upd() {
        let diff = Math.max(0, endTime - Date.now());
        const h=Math.floor(diff/3600000); diff-=h*3600000;
        const m=Math.floor(diff/60000);   diff-=m*60000;
        const s=Math.floor(diff/1000);
        const hEl=document.getElementById('cd-hora'), mEl=document.getElementById('cd-min'), sEl=document.getElementById('cd-seg');
        if(hEl) hEl.textContent=pad(h);
        if(mEl) mEl.textContent=pad(m);
        if(sEl) sEl.textContent=pad(s);
        if(diff<=0) clearInterval(cdTimerInt);
    }
    upd(); cdTimerInt = setInterval(upd, 1000);
}

function buildRanking(overrides, movements) {
    const rankedNames = window.FB ? window.FB.getRankedNamesFromOverrides(overrides) : window.RANKERS.map(r=>r.name);
    const list = document.getElementById('rankList');
    if (!list) return;
    list.innerHTML = '';
    const twoH = Date.now() - 2*60*60*1000;
    const upMovers=[], downMovers=[];
    rankedNames.forEach((name,i) => {
        const mov = movements&&movements[name];
        if(mov&&mov.ts>twoH) {
            if(mov.dir==='up'  &&mov.delta>0) upMovers.push({name,rank:i+1,delta:mov.delta});
            if(mov.dir==='down'&&mov.delta>0) downMovers.push({name,rank:i+1,delta:mov.delta});
        }
    });
    const upEl=document.getElementById('moversUp'), downEl=document.getElementById('moversDown');
    if(upEl) upEl.innerHTML = upMovers.length===0
        ? '<div style="color:var(--text2);font-size:.75rem;padding:.4rem 0;">Sin movimientos recientes</div>'
        : upMovers.slice(0,3).map(m=>`<div class="mover-row"><div class="mover-name"><span class="mover-rank">#${m.rank}</span> ${m.name}</div><div class="change-badge up">▲ +${m.delta}</div></div>`).join('');
    if(downEl) downEl.innerHTML = downMovers.length===0
        ? '<div style="color:var(--text2);font-size:.75rem;padding:.4rem 0;">Sin movimientos recientes</div>'
        : downMovers.slice(0,3).map(m=>`<div class="mover-row"><div class="mover-name"><span class="mover-rank">#${m.rank}</span> ${m.name}</div><div class="change-badge down">▼ -${m.delta}</div></div>`).join('');
    rankedNames.forEach((name,i) => {
        const r = window.RANKERS.find(x=>x.name===name);
        if (!r) return;
        const origIdx = window.RANKERS.findIndex(x=>x.name===name);
        const nc = i===0?'n1':i===1?'n2':i===2?'n3':'rest';
        const topClass = i===0?'top1':i===1?'top2':i===2?'top3':'';
        let movBadge='';
        const mov = movements&&movements[name];
        if(mov&&mov.ts>twoH) {
            if(mov.dir==='up'  &&mov.delta>0) movBadge=`<span class="mov-up">▲ +${mov.delta}</span>`;
            else if(mov.dir==='down'&&mov.delta>0) movBadge=`<span class="mov-down">▼ -${mov.delta}</span>`;
        }
        list.innerHTML += `
            <div class="rank-row ${topClass}" onclick="abrirPerfil(${origIdx},${i})" style="animation-delay:${i*.05}s">
                <div class="rank-num ${nc}">${i+1}</div>
                <div class="rank-avatar">${avatarIMG(name,40)}</div>
                <div class="rank-info">
                    <div class="rank-username">${name}${movBadge}</div>
                    <div class="rank-subtitle">${r.title} · ${r.sub}</div>
                </div>
                <div class="rank-right">
                    <div style="text-align:right;"><div class="rank-score-num">${r.score}</div><div class="rank-score-label">Score</div></div>
                    <div class="chevron">›</div>
                </div>
            </div>`;
    });
}

function renderRankvoteArena(rv, myVote, overrides) {
    const arena = document.getElementById('rankvoteArena');
    if (!arena) return;
    window._currentRVId = rv.id;
    window._currentRV = rv;
    const v1 = (rv.votes?.[rv.p1])||0, v2 = (rv.votes?.[rv.p2])||0;
    const total = Math.max(1,v1+v2);
    const pct1 = Math.round((v1/total)*100), pct2 = 100-pct1;
    const r1 = window.RANKERS.find(r=>r.name===rv.p1)||{name:rv.p1,score:'?',sub:'España'};
    const r2 = window.RANKERS.find(r=>r.name===rv.p2)||{name:rv.p2,score:'?',sub:'España'};
    const ranked = window.FB ? window.FB.getRankedNamesFromOverrides(overrides) : window.RANKERS.map(r=>r.name);
    const idx1 = ranked.indexOf(rv.p1)+1, idx2 = ranked.indexOf(rv.p2)+1;
    const voted = myVote && myVote.rvId === rv.id;
    const myCandidate = voted ? myVote.candidate : null;
    const canVote = !voted;
    startRankCountdown(rv.endTime);
    startRVTimer(rv.endTime);
    arena.innerHTML = `
        <div class="rv-live-badge"><div class="rv-live-dot"></div>VOTACIÓN EN DIRECTO · 6 HORAS</div>
        <div class="rv-round-title">¿Quién merece subir en el ranking?</div>
        <div class="rv-round-sub">Vota cada 6 horas · El ganador sube 1 puesto · El perdedor baja 1 puesto</div>
        <div class="rv-timer">
            <div class="rvtd-u"><div class="rvtd-n" id="rvtd-h">06</div><div class="rvtd-l">Horas</div></div>
            <div class="rvtd-sep">:</div>
            <div class="rvtd-u"><div class="rvtd-n" id="rvtd-m">00</div><div class="rvtd-l">Min</div></div>
            <div class="rvtd-sep">:</div>
            <div class="rvtd-u"><div class="rvtd-n" id="rvtd-s">00</div><div class="rvtd-l">Seg</div></div>
        </div>
        <div class="rv-fighters">
            <div class="rvf-card rvf-up ${canVote?'can-vote':''} ${myCandidate===rv.p1?'rvf-selected':''}" id="rvfc1" ${canVote?'style="cursor:none"':''}>
                <div class="rvf-avatar">${avatarIMG(rv.p1,80)}</div>
                <div class="rvf-name rvf-name-up">${rv.p1}</div>
                <div class="rvf-sub">${r1.sub||'España'}</div>
                <div class="rvf-pos">Puesto #${idx1} · Score ${r1.score}</div>
                <div class="rvf-outcome rvf-outcome-up">▲ Gana → #${Math.max(1,idx1-1)}</div>
                <div class="rvf-bar-wrap"><div class="rvf-bar-up" id="rvbar1" style="width:0%"></div></div>
                <div class="rvf-pct-up" id="rvpct1">${voted?pct1+'%':canVote?'👆 Votar':'—'}</div>
                <div class="rvf-votes" id="rvvotes1">${voted?v1+' voto'+(v1!==1?'s':''):''}</div>
            </div>
            <div class="rv-vs">VS</div>
            <div class="rvf-card rvf-down ${canVote?'can-vote':''} ${myCandidate===rv.p2?'rvf-selected':''}" id="rvfc2" ${canVote?'style="cursor:none"':''}>
                <div class="rvf-avatar">${avatarIMG(rv.p2,80)}</div>
                <div class="rvf-name rvf-name-down">${rv.p2}</div>
                <div class="rvf-sub">${r2.sub||'España'}</div>
                <div class="rvf-pos">Puesto #${idx2} · Score ${r2.score}</div>
                <div class="rvf-outcome rvf-outcome-down">▼ Pierde → #${Math.min(window.RANKERS.length,idx2+1)}</div>
                <div class="rvf-bar-wrap"><div class="rvf-bar-down" id="rvbar2" style="width:0%"></div></div>
                <div class="rvf-pct-down" id="rvpct2">${voted?pct2+'%':canVote?'👆 Votar':'—'}</div>
                <div class="rvf-votes" id="rvvotes2">${voted?v2+' voto'+(v2!==1?'s':''):''}</div>
            </div>
        </div>
        <div class="rv-action" id="rvAction">
            ${voted
                ? `<div class="rv-voted-msg">✅ Votaste por <strong>${myCandidate}</strong> · El ranking se actualiza al terminar</div>`
                : `<div class="rv-hint">👆 Toca el nombre para votar · 1 voto por dispositivo/IP</div>`
            }
        </div>
        <div class="rv-note">🗳️ 1 voto por dispositivo e IP · Ranking actualizado automáticamente · Nueva ronda cada 6 horas</div>`;
    if (canVote) {
        const fc1=document.getElementById('rvfc1'), fc2=document.getElementById('rvfc2');
        if(fc1) fc1.addEventListener('click', ()=>emitRVVote(rv.p1));
        if(fc2) fc2.addEventListener('click', ()=>emitRVVote(rv.p2));
    }
    if (voted) {
        setTimeout(()=>{
            const b1=document.getElementById('rvbar1'), b2=document.getElementById('rvbar2');
            if(b1) b1.style.width=pct1+'%';
            if(b2) b2.style.width=pct2+'%';
        },80);
    }
}

function updateRVVoteDisplay(rv, myVote) {
    const v1=(rv.votes?.[rv.p1])||0, v2=(rv.votes?.[rv.p2])||0;
    const total=Math.max(1,v1+v2);
    const pct1=Math.round((v1/total)*100), pct2=100-pct1;
    const voted = myVote && myVote.rvId === rv.id;
    if (!voted) return;
    const b1=document.getElementById('rvbar1'),b2=document.getElementById('rvbar2');
    const p1=document.getElementById('rvpct1'),p2=document.getElementById('rvpct2');
    const v1el=document.getElementById('rvvotes1'),v2el=document.getElementById('rvvotes2');
    if(b1) b1.style.width=pct1+'%';
    if(b2) b2.style.width=pct2+'%';
    if(p1) p1.textContent=pct1+'%';
    if(p2) p2.textContent=pct2+'%';
    if(v1el) v1el.textContent=v1+' voto'+(v1!==1?'s':'');
    if(v2el) v2el.textContent=v2+' voto'+(v2!==1?'s':'');
}

async function emitRVVote(name) {
    if (!name || !window.FB) return;
    const c1=document.getElementById('rvfc1'),c2=document.getElementById('rvfc2');
    const actionEl=document.getElementById('rvAction');
    if(c1){c1.style.pointerEvents='none';c1.style.opacity='.6';}
    if(c2){c2.style.pointerEvents='none';c2.style.opacity='.6';}
    if(actionEl) actionEl.innerHTML='<div style="color:var(--text2);font-size:.8rem;">⏳ Enviando voto…</div>';
    const result = await window.FB.castRVVoteDB(name);
    if (result.ok) {
        const freshSnap = await window.FB.get(window.FB.ref(window.FB.db,'rankvote/current'));
        const rv = freshSnap.exists() ? freshSnap.val() : window._currentRV;
        const v1=(rv.votes?.[rv.p1])||0, v2=(rv.votes?.[rv.p2])||0;
        const total=Math.max(1,v1+v2);
        const pct1=Math.round((v1/total)*100), pct2=100-pct1;
        if(c1){c1.style.pointerEvents='none';c1.style.opacity='';if(name===rv.p1)c1.classList.add('rvf-selected');}
        if(c2){c2.style.pointerEvents='none';c2.style.opacity='';if(name===rv.p2)c2.classList.add('rvf-selected');}
        const b1=document.getElementById('rvbar1'),b2=document.getElementById('rvbar2');
        const p1=document.getElementById('rvpct1'),p2=document.getElementById('rvpct2');
        const v1el=document.getElementById('rvvotes1'),v2el=document.getElementById('rvvotes2');
        if(b1) b1.style.width=pct1+'%';
        if(b2) b2.style.width=pct2+'%';
        if(p1) p1.textContent=pct1+'%';
        if(p2) p2.textContent=pct2+'%';
        if(v1el) v1el.textContent=v1+' voto'+(v1!==1?'s':'');
        if(v2el) v2el.textContent=v2+' voto'+(v2!==1?'s':'');
        if(actionEl) actionEl.innerHTML=`<div class="rv-voted-msg">✅ Votaste por <strong>${name}</strong> · El ranking se actualiza al terminar</div>`;
    } else {
        if(c1){c1.style.pointerEvents='';c1.style.opacity='';}
        if(c2){c2.style.pointerEvents='';c2.style.opacity='';}
        const msg = result.reason==='already_voted'?'⚠️ Ya has votado en esta ronda (verificado por IP y dispositivo)'
            :result.reason==='expired'?'⚠️ La votación ya ha terminado'
            :'❌ Error al votar. Inténtalo de nuevo.';
        if(actionEl) actionEl.innerHTML=`<div style="color:var(--red2);font-size:.8rem;font-weight:700;">${msg}</div>`;
    }
}

function startRVTimer(endTime) {
    if (rvTimerInt) clearInterval(rvTimerInt);
    let expiredHandled = false;
    function upd() {
        let diff = Math.max(0, endTime-Date.now());
        const h=Math.floor(diff/3600000); diff-=h*3600000;
        const m=Math.floor(diff/60000);   diff-=m*60000;
        const s=Math.floor(diff/1000);
        const hEl=document.getElementById('rvtd-h'),mEl=document.getElementById('rvtd-m'),sEl=document.getElementById('rvtd-s');
        if(hEl) hEl.textContent=pad(h);
        if(mEl) mEl.textContent=pad(m);
        if(sEl) sEl.textContent=pad(s);
        if(diff<=0&&!expiredHandled) {
            expiredHandled=true;
            clearInterval(rvTimerInt); rvTimerInt=null;
            if(!window._rvResolvingLocally&&window.FB&&window._currentRV) {
                window._rvResolvingLocally=true;
                const arena=document.getElementById('rankvoteArena');
                if(arena) arena.innerHTML=`<div class="rv-transitioning"><div class="rv-transitioning-spin"></div>⚙️ Calculando resultado y actualizando ranking…</div>`;
                window.FB.resolveRVIfNeeded(window._currentRV).catch(console.error).finally(()=>{window._rvResolvingLocally=false;});
            }
        }
    }
    upd(); rvTimerInt = setInterval(upd,1000);
}

async function handleRVSnapshot(snap) {
    const arena=document.getElementById('rankvoteArena');
    if(!snap.exists()) {
        if(!window._rvResolvingLocally) {
            window._rvResolvingLocally=true;
            await window.FB.ensureRVExists().catch(console.error);
            window._rvResolvingLocally=false;
        }
        return;
    }
    const rv=snap.val();
    const now=Date.now();
    if(rv.resolved===true) {
        if(rvTimerInt){clearInterval(rvTimerInt);rvTimerInt=null;}
        if(arena&&window._currentRVId===rv.id) arena.innerHTML=`<div class="rv-transitioning"><div class="rv-transitioning-spin"></div>✅ Ronda resuelta · Cargando nueva votación…</div>`;
        window._currentRVId=null;
        if(!window._rvResolvingLocally) {
            window._rvResolvingLocally=true;
            await window.FB.ensureRVExists().catch(console.error);
            window._rvResolvingLocally=false;
        }
        return;
    }
    if(rv.endTime<=now) {
        if(rvTimerInt){clearInterval(rvTimerInt);rvTimerInt=null;}
        if(!window._rvResolvingLocally) {
            window._rvResolvingLocally=true;
            await window.FB.resolveRVIfNeeded(rv).catch(console.error);
            window._rvResolvingLocally=false;
        }
        return;
    }
    const [ovSnap,myVoteSnap]=await Promise.all([
        window.FB.get(window.FB.ref(window.FB.db,'rankOverrides')),
        window.FB.get(window.FB.ref(window.FB.db,`rankvoteVotes/dev_${window.FB.DEVICE_ID}_${rv.id}`))
    ]);
    const overrides=ovSnap.exists()?ovSnap.val():{};
    const myVote=myVoteSnap.exists()?{ rvId:rv.id, candidate:myVoteSnap.val().candidate }:null;
    if(window._currentRVId===rv.id) updateRVVoteDisplay(rv,myVote);
    else renderRankvoteArena(rv,myVote,overrides);
}

function renderRVHistory(hist) {
    const list=document.getElementById('rankvoteHistoryList');
    if(!list) return;
    if(!hist||!hist.length){list.innerHTML='<div style="color:var(--text2);font-size:.75rem;text-align:center;padding:1.5rem;">No hay votaciones resueltas aún · ¡Participa en la primera!</div>';return;}
    list.innerHTML=hist.map(h=>{
        const d=h.ts?new Date(h.ts):new Date();
        const fmt=d.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
        if(h.winner==='empate') return `<div class="rv-hist-row">🗳️ <span style="color:var(--text2);font-weight:700">Sin votos · Empate</span><span class="rv-hist-result">0–0</span><span class="rv-hist-date">${fmt}</span></div>`;
        const posW=h.winnerPos&&h.winnerNewPos?` (#${h.winnerPos}→#${h.winnerNewPos})`:'';
        const posL=h.loserPos&&h.loserNewPos?` (#${h.loserPos}→#${h.loserNewPos})`:'';
        return `<div class="rv-hist-row">🗳️ <span class="rv-hist-winner">▲ ${h.winner}${posW}</span><span style="color:var(--text2);font-size:.75rem">vs</span><span class="rv-hist-loser">▼ ${h.loser}${posL}</span><span class="rv-hist-result">${h.wVotes}–${h.lVotes}</span><span class="rv-hist-date">${fmt}</span></div>`;
    }).join('');
}

window._currentEV = null;
window._currentEVMyVote = null;

function updateEntryVoteDisplay(ev, myVote) {
    const total=Math.max(1,CANDIDATES.reduce((s,c)=>s+(ev.votes?.[c.id]||0),0));
    const voted=myVote&&myVote.evId===ev.id;
    CANDIDATES.forEach(c=>{
        const votes=ev.votes?.[c.id]||0;
        const pct=Math.round((votes/total)*100);
        const bar=document.getElementById('evbar-'+c.id);
        const pctEl=document.getElementById('evpct-'+c.id);
        const cnt=document.getElementById('evcount-'+c.id);
        if(bar) bar.style.width=pct+'%';
        if(voted){if(pctEl) pctEl.textContent=pct+'%';if(cnt) cnt.textContent=votes+' voto'+(votes!==1?'s':'');}
    });
}

function renderEntryVotingCard(ev, myVote) {
    const card=document.getElementById('entryVotingCard');
    if(!card||!ev) return;
    window._currentEV=ev;
    window._currentEVMyVote=myVote;
    if(ev.winner){
        const winnerC=CANDIDATES.find(c=>c.id===ev.winner);
        card.innerHTML=`<div class="winner-reveal"><div class="confetti-line">🎉 🏆 🎊 ✨ 🎉</div><div class="winner-reveal-eyebrow"><span style="color:var(--gold)">★</span> VOTACIÓN CERRADA <span style="color:var(--gold)">★</span></div><div class="winner-reveal-title">GANADOR</div><div class="winner-reveal-name">${winnerC?.name||ev.winner}</div><div class="winner-reveal-avatar"><img src="${winnerC?.photo||''}" alt="${winnerC?.name||''}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:3rem;">${winnerC?.emoji||'🏆'}</span></div><div style="margin-top:1rem;font-size:.75rem;color:var(--text2);font-weight:600;">🏆 Esta persona será añadida al ranking en la próxima actualización</div></div>`;
        return;
    }
    const total=Math.max(1,CANDIDATES.reduce((s,c)=>s+(ev.votes?.[c.id]||0),0));
    const voted=myVote&&myVote.evId===ev.id;
    const candidatesHTML=CANDIDATES.map(c=>{
        const votes=ev.votes?.[c.id]||0;
        const pct=Math.round((votes/total)*100);
        const isSel=voted&&myVote.candidate===c.id;
        return `<div class="candidate-card${isSel?' selected':''}" data-id="${c.id}" ${!voted?'style="cursor:none"':''}>
            <div class="candidate-avatar"><img src="${c.photo}" alt="${c.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.8rem;">${c.emoji}</span></div>
            <div class="candidate-name">${c.name}</div>
            <div class="candidate-sub">${c.sub}</div>
            <div class="vote-bar-wrap"><div class="vote-bar" id="evbar-${c.id}" style="width:0%"></div></div>
            <div class="vote-pct" id="evpct-${c.id}">${voted?pct+'%':'👆 Clic para votar'}</div>
            <div class="vote-count" id="evcount-${c.id}">${voted?votes+' voto'+(votes!==1?'s':''):''}</div>
        </div>`;
    }).join('');
    card.innerHTML=`
        <div class="voting-eyebrow"><div class="voting-dot"></div>VOTACIÓN ABIERTA · CIERRA VIERNES 29 MAYO 22:30<div class="voting-dot"></div></div>
        <div class="voting-title">¿Quién entra al Ranking?</div>
        <div class="voting-subtitle">Haz clic directamente en el candidato para votar · Un voto por dispositivo e IP</div>
        <div class="voting-countdown">
            <div class="vcd-unit"><div class="vcd-num" id="vcd-h">00</div><div class="vcd-label">Horas</div></div>
            <div class="vcd-sep">:</div>
            <div class="vcd-unit"><div class="vcd-num" id="vcd-m">00</div><div class="vcd-label">Min</div></div>
            <div class="vcd-sep">:</div>
            <div class="vcd-unit"><div class="vcd-num" id="vcd-s">00</div><div class="vcd-label">Seg</div></div>
        </div>
        <div class="candidates-grid" id="evCandidatesGrid">${candidatesHTML}</div>
        <div id="evAction">${voted?`<div class="already-voted-msg">✅ Has votado por <strong>${CANDIDATES.find(c=>c.id===myVote.candidate)?.name||'—'}</strong></div>`:`<div style="font-size:.65rem;color:var(--text2);font-weight:600;">👆 Solo puedes votar una vez · El ganador entra al ranking</div>`}</div>`;
    if(!voted) {
        CANDIDATES.forEach(c=>{
            const el=card.querySelector(`[data-id="${c.id}"]`);
            if(el) el.addEventListener('click',()=>evVoteClick(c.id));
        });
    }
    if(voted) {
        setTimeout(()=>{
            CANDIDATES.forEach(c=>{
                const bar=document.getElementById('evbar-'+c.id);
                if(bar) bar.style.width=Math.round(((ev.votes?.[c.id]||0)/total)*100)+'%';
            });
        },80);
    }
    startEntryVoteTimer(ev);
}

async function evVoteClick(id) {
    if(!id||!window.FB) return;
    const grid=document.getElementById('evCandidatesGrid');
    if(grid) grid.querySelectorAll('.candidate-card').forEach(c=>{c.style.pointerEvents='none';c.style.opacity='.6';});
    const actionEl=document.getElementById('evAction');
    if(actionEl) actionEl.innerHTML='<div style="color:var(--text2);font-size:.75rem;">⏳ Enviando voto…</div>';
    try{
        const ok=await window.FB.castEntryVoteDB(id);
        if(ok){
            const evSnap=await window.FB.get(window.FB.ref(window.FB.db,'entryVote/current'));
            const ev=evSnap.exists()?evSnap.val():window._currentEV;
            const ipHash = await window.FB.getIPHash();
            const myVoteSnap=await window.FB.get(window.FB.ref(window.FB.db,`entryVotes/dev_${window.FB.DEVICE_ID}_${ev?.id}`));
            const myVote=myVoteSnap.exists()?{evId:ev?.id,candidate:myVoteSnap.val().candidate}:{evId:ev?.id,candidate:id};
            renderEntryVotingCard(ev,myVote);
        } else {
            if(grid) grid.querySelectorAll('.candidate-card').forEach(c=>{c.style.pointerEvents='';c.style.opacity='';});
            if(actionEl) actionEl.innerHTML=`<div class="already-voted-msg">⚠️ Ya has votado (verificado por dispositivo e IP)</div>`;
        }
    } catch(e){
        if(grid) grid.querySelectorAll('.candidate-card').forEach(c=>{c.style.pointerEvents='';c.style.opacity='';});
        if(actionEl) actionEl.innerHTML=`<div style="color:var(--red2);font-size:.75rem;">❌ Error al votar</div>`;
    }
}

function startEntryVoteTimer(ev) {
    if(evTimerInt) clearInterval(evTimerInt);
    function upd(){
        let diff=Math.max(0,ev.endTime-Date.now());
        const h=Math.floor(diff/3600000);diff-=h*3600000;
        const m=Math.floor(diff/60000);diff-=m*60000;
        const s=Math.floor(diff/1000);
        ['vcd-h','vcd-m','vcd-s'].forEach((elId,i)=>{
            const el=document.getElementById(elId);
            if(el) el.textContent=pad([h,m,s][i]);
        });
        if(diff<=0) clearInterval(evTimerInt);
    }
    upd(); evTimerInt=setInterval(upd,1000);
}

async function loadAllData() {
    const {db,ref,onValue,get,DEVICE_ID} = window.FB;
    let cachedOverrides={}, cachedMovements={};
    function rebuildUI() { buildRanking(cachedOverrides,cachedMovements); }
    onValue(ref(db,'rankOverrides'), snap=>{ cachedOverrides=snap.exists()?snap.val():{};rebuildUI(); });
    onValue(ref(db,'rankMovements'), snap=>{ cachedMovements=snap.exists()?snap.val():{};rebuildUI(); });
    onValue(ref(db,'rankvote/current'), async snap=>{
        if(snap.exists()){
            const rv=snap.val();
            if(!rv.resolved&&rv.endTime>Date.now()) startRankCountdown(rv.endTime);
        } else {
            await window.FB.ensureRVExists();
        }
    });
    onValue(ref(db,'entryVote/current'), async snap=>{
        let ev;
        if(snap.exists()){
            ev=snap.val();
            if(!ev.winner&&ev.endTime<=Date.now()){
                await window.FB.resolveEntryVoteInDB(ev);
                return;
            }
        } else {
            ev=await window.FB.getOrCreateEntryVote();
        }
        const myVoteSnap=await get(ref(db,`entryVotes/dev_${DEVICE_ID}_${ev?.id}`));
        const myVote=myVoteSnap.exists()?{evId:ev?.id,candidate:myVoteSnap.val().candidate}:null;
        if(window._currentEV&&window._currentEV.id===ev?.id&&myVote&&myVote.evId===ev?.id){
            window._currentEV=ev;
            updateEntryVoteDisplay(ev,myVote);
        } else {
            renderEntryVotingCard(ev,myVote);
        }
    });
}

async function loadRVPage() {
    if(!window.FB) return;
    const {db,ref,onValue,ensureRVExists} = window.FB;
    if(window._rvListener){window._rvListener();window._rvListener=null;}
    if(window._rvHistListener){window._rvHistListener();window._rvHistListener=null;}
    window._currentRVId=null;
    window._rvResolvingLocally=false;
    const arena=document.getElementById('rankvoteArena');
    if(arena) arena.innerHTML='<div style="text-align:center;padding:3rem;color:var(--text2);">⏳ Cargando…</div>';
    await ensureRVExists();
    window._rvListener=onValue(ref(db,'rankvote/current'),handleRVSnapshot);
    window._rvHistListener=onValue(ref(db,'rankvoteHistory'),snap=>{
        if(!snap.exists()){renderRVHistory([]);return;}
        const raw=snap.val();
        const hist=Object.values(raw).filter(h=>h.ts&&typeof h.ts==='number').sort((a,b)=>b.ts-a.ts).slice(0,20);
        renderRVHistory(hist);
    });
}

// ══════════════════════════════════════════════════════════════
//  PAGE NAVIGATION
// ══════════════════════════════════════════════════════════════
const PAGE_TO_BNAV = {rankings:'bnav-rankings',rankvote:'bnav-rankvote',torneo:'bnav-torneo',noticias:'bnav-noticias',consejo:'bnav-more',lexico:'bnav-more'};

function showPage(id, tab) {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
    const pageEl=document.getElementById('page-'+id);
    if(pageEl) pageEl.classList.add('active');
    if(tab) tab.classList.add('active');
    document.querySelectorAll('.bnav-tab').forEach(t=>t.classList.remove('active'));
    const bnavId=PAGE_TO_BNAV[id];
    if(bnavId){const bTab=document.getElementById(bnavId);if(bTab)bTab.classList.add('active');}
    window.scrollTo({top:0,behavior:'smooth'});
    if(id==='rankvote') loadRVPage();
    if(id==='torneo')   loadTorneoPage();
}

function showPageMobile(id, tabIdx) {
    document.getElementById('moreMenu').style.display='none';
    document.getElementById('moreOverlay').style.display='none';
    const desktopTab=document.querySelectorAll('.nav-tab')[tabIdx]||null;
    showPage(id,desktopTab);
}

function abrirPerfil(origIdx, rankPos) {
    const r=window.RANKERS[origIdx];
    const rank=rankPos+1;
    const photoEl=document.getElementById('pPhoto');
    photoEl.style.background=r.photoBg;
    photoEl.innerHTML=avatarIMGRect(r.name);
    document.getElementById('pRankBadge').textContent='#'+rank;
    document.getElementById('pName').textContent=r.name;
    document.getElementById('pSubtitle').textContent=r.title+' · '+r.sub;
    const chgEl=document.getElementById('pChange');
    chgEl.textContent='— Ranking dinámico';chgEl.className='profile-change neutral';
    const tagsEl=document.getElementById('pTags');
    tagsEl.innerHTML='';
    r.tagNames.forEach((t,idx)=>{
        const cls=idx===r.tagNames.length-1?'ptag-score':(r.tags[idx]||'ptag-appeal');
        tagsEl.innerHTML+=`<span class="profile-tag ${cls}">${t}</span>`;
    });
    const pqs=document.getElementById('pQuickStats');
    pqs.innerHTML=`<div class="pqs"><div class="pqs-num">${r.score}</div><div class="pqs-label">Score</div></div>`;
    document.getElementById('pBio').textContent=r.bio;
    document.getElementById('pMovIcon').textContent=r.movIcon;
    document.getElementById('pMovText').textContent=r.movement;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.bnav-tab').forEach(t=>t.classList.remove('active'));
    document.getElementById('page-profile').classList.add('active');
    document.getElementById('bnav-rankings').classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
}

function volverAlRanking() {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.bnav-tab').forEach(t=>t.classList.remove('active'));
    document.getElementById('page-rankings').classList.add('active');
    document.querySelectorAll('.nav-tab')[0].classList.add('active');
    document.getElementById('bnav-rankings').classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
}

// ══════════════════════════════════════════════════════════════
//  MISC INIT
// ══════════════════════════════════════════════════════════════
function buildTicker() {
    const inner=document.getElementById('tickerInner');
    const items=[...TICKER_ITEMS,...TICKER_ITEMS];
    inner.innerHTML=items.map(t=>`<span class="ticker-item">📢 ${t}</span>`).join('');
}

function buildLexico() {
    const grid=document.getElementById('lexicoGrid');
    grid.innerHTML='';
    LEXICO.forEach(l=>{
        const el=document.createElement('div');
        el.className='lexico-card';
        el.setAttribute('data-term',l.term.toLowerCase());
        el.innerHTML=`<div class="lexico-term">${l.term}</div><div class="lexico-en">${l.en}</div><div class="lexico-def">${l.def}</div><div class="lexico-nivel nivel-${l.nivel}">${l.nivel.charAt(0).toUpperCase()+l.nivel.slice(1)}</div>`;
        grid.appendChild(el);
    });
}

function filtrarLexico() {
    const q=document.getElementById('lexicoInput').value.toLowerCase();
    document.querySelectorAll('.lexico-card').forEach(c=>{
        c.style.display=(c.dataset.term.includes(q)||c.textContent.toLowerCase().includes(q))?'':'none';
    });
}

function createParticles() {
    const wrap=document.getElementById('particles');
    const colors=['rgba(232,184,75','rgba(168,85,247','rgba(59,130,246','rgba(46,204,113'];
    for(let i=0;i<22;i++){
        const p=document.createElement('div');
        p.className='particle';
        const sz=1+Math.random()*3;
        p.style.cssText=`left:${Math.random()*100}%;--drift:${(Math.random()-.5)*200}px;animation-duration:${7+Math.random()*13}s;animation-delay:${Math.random()*18}s;opacity:0;width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random()*colors.length)]},${.4+Math.random()*.4})`;
        wrap.appendChild(p);
    }
}

buildTicker();
buildLexico();
createParticles();
buildRanking({},{});

// ── Firebase ready ────────────────────────────────────────────
window.addEventListener('firebase-ready', async () => {
    const loader=document.getElementById('fb-loader');
    if(loader){loader.classList.add('hide');setTimeout(()=>loader.remove(),600);}
    await loadAllData();
});

setTimeout(()=>{
    const loader=document.getElementById('fb-loader');
    if(loader&&!loader.classList.contains('hide')){
        loader.innerHTML='<div style="color:var(--red2);font-size:.8rem;font-weight:700;text-align:center;padding:1rem;">⚠️ No se pudo conectar a Firebase.<br>Comprueba tu configuración.</div>';
    }
},8000);

// ══════════════════════════════════════════════════════════════
//  CEREMONY SYSTEM
// ══════════════════════════════════════════════════════════════
let _ceremonyActive = false;
let _ceremonyTimer = null;
let _cerTimeoutIds = [];
let _ceremonyStage = null;

function _cerClearTimeouts() {
    _cerTimeoutIds.forEach(t => clearTimeout(t));
    _cerTimeoutIds = [];
    if (_ceremonyTimer) { clearInterval(_ceremonyTimer); _ceremonyTimer = null; }
}
function _cerTimeout(fn, ms) {
    const id = setTimeout(fn, ms);
    _cerTimeoutIds.push(id);
    return id;
}
function _cerShowHint(text) { const el=document.getElementById('cerHint'); if(el) el.textContent=text; }
function _cerUpdateProgress(pct) { const el=document.getElementById('cerProgress'); if(el) el.style.width=pct+'%'; }
function _cerSetContent(html) { const el=document.getElementById('cerContent'); if(el) el.innerHTML=html; }
function _cerShowOverlay() { const o=document.getElementById('ceremony-overlay'); if(o){o.classList.add('active');_ceremonyActive=true;} }
function _cerHideOverlay() {
    _cerClearTimeouts();
    const o=document.getElementById('ceremony-overlay'), a=document.getElementById('cerAudio');
    if(o) o.classList.remove('active');
    if(a){a.pause();a.currentTime=0;}
    _ceremonyActive=false; _ceremonyStage=null;
    _cerSetContent(''); _cerShowHint('Finalizando...'); _cerUpdateProgress(0);
}
function _cerCheckPhaseChange() {
    if(!_ceremonyActive) return false;
    try {
        const cur=_torneoState?_torneoState.phase:null;
        if(!cur) return false;
        if(cur===PHASES.SEMIFINALS_VOTING||cur===PHASES.SEMIFINALS_PROMO||cur===PHASES.FINAL_VOTING) return false;
        _cerHideOverlay();
        const bg=document.getElementById('cerBg'); if(bg) bg.innerHTML='';
        if(typeof loadTorneoPage==='function') loadTorneoPage();
        return true;
    } catch(e){return false;}
}
function _cerPlayMusic() { try{const a=document.getElementById('cerAudio');if(a){a.volume=0.25;a.currentTime=0;a.play().catch(e=>console.warn('Audio:',e));}}catch(e){} }
function _cerStopMusic() { const a=document.getElementById('cerAudio');if(a){a.pause();a.currentTime=0;} }
function _cerCreateConfetti(count) {
    const wrap=document.getElementById('cerConfetti'); if(!wrap) return; wrap.innerHTML='';
    const colors=['#ffd700','#ff6b35','#a855f7','#3b82f6','#2ecc71','#ff4757','#ff00aa','#00ff00'];
    for(let i=0;i<count;i++){
        const p=document.createElement('div'); p.className='cer-confetti-piece';
        const sz=5+Math.random()*10, color=colors[Math.floor(Math.random()*colors.length)];
        const left=Math.random()*100, dur=2+Math.random()*3, delay=Math.random()*2, radius=Math.random()>.5?'50%':'2px';
        p.style.cssText='left:'+left+'%;width:'+sz+'px;height:'+sz+'px;background:'+color+';border-radius:'+radius+';animation-duration:'+dur+'s;animation-delay:'+delay+'s;';
        wrap.appendChild(p);
    }
}
function _cerGetPlayerInfo(name) {
    const p=TORNEO_PLAYERS.find(x=>x.name===name), r=window.RANKERS.find(x=>x.name===name);
    return {emoji:p?p.emoji:'?', photo:p?p.photo:'', bio:r?r.bio:'', score:r?r.score:'?', title:r?r.title:'', sub:r?r.sub:''};
}

// ── Ceremony disabled — voting is inline like cuartos ──────────
function startSemifinalsCeremony(state) { /* no-op */ }
function startFinalsCeremony(state)     { /* no-op */ }

// ── Latecomer sync ──────────────────────────────────────
function checkCeremonySync(state) {
    // Ceremony removed — voting happens inline like cuartos
}
