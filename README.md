{
"version": "1.2",
"appName": "DeckArcade",
"route": "/",
"\_neverRemoveComments": \[
"=== DO NOT REMOVE: GAME MODULES INJECTION POINT ===",
"=== DO NOT REMOVE: API EXTENSION POINT ===",
"=== DO NOT REMOVE: PLACEHOLDER FOR FUTURE GAMES ON HOMEPAGE ==="
],
"projectNotes": {
"scopeNow": "Home page and Blackjack (singleplayer + multiplayer skeleton).",
"scopeLater": "All other games are registered via Game API as separate files/modules (no monolith).",
"devPrompts": {
"stepwise": \[
"STEP 1 — HOME: Build responsive Home UI using design tokens in `ui.theme` and `homePageWireframe`. Render dummy cards from `catalogPreview`.",
"STEP 2 — BLACKJACK: Implement rules per `gameSettingsSchema.blackjack.rules`. Use `gameAPI.animations` presets for dealing, chip moves, wins.",
"STEP 3 — MULTIPLAYER CORE: Implement lobby, PIN join, WebRTC signaling (`net.signaling`), shared money pool (`economy.sharedPool`). Text chat + push-to-talk per `comms`.",
"STEP 4 — HOST PANEL: Render host controls using `hostControls.defaults` and per-game overrides in `gameSettingsSchema.*`. Explainers can be toggled off.",
"STEP 5 — QA + ACCESSIBILITY: Verify focus rings, touch targets, reduced motion, and mobile breakpoints.",
"STEP 6 — NEW GAMES: For each new title, create a separate module file under `src/games/<slug>/index.ts` and register via `gameAPI.contract.registerGame`."
],
"commands": {
"next": "Type NEXT to proceed to the next build step.",
"makeGame": "Type MAKE <game-slug> to scaffold a new game module file.",
"export": "Type EXPORT <component> to output a code artifact."
},
"fileStructureHints": \[
"src/app/App.tsx",
"src/gameAPI/index.ts",
"src/gameAPI/rulesEngine.ts",
"src/gameAPI/animations.ts",
"src/animations/tokens.ts",
"src/animations/presets.ts",
"src/net/webrtc.ts",
"src/net/signalingServer.mjs",
"src/store/session.ts",
"src/store/moneyPool.ts",
"src/comms/TextChat.tsx",
"src/comms/VoicePTT.ts",
"src/ui/Button.tsx",
"src/ui/Modal.tsx",
"src/ui/Toaster.tsx",
"src/games/blackjack/index.ts",
"src/games/blackjack/ui.tsx",
"src/games/blackjack/rules.ts",
"src/games/hearts/index.ts (to be added later)",
"src/games/spades/index.ts (to be added later)"
]
}
},
"seo": {
"title": "DeckArcade — Fast, Fun Multiplayer Card Games",
"description": "Play blackjack, poker, war, and dozens of classics with instant multiplayer. Join by PIN or host locally with WebRTC.",
"keywords": \["card games", "blackjack", "poker", "war", "multiplayer", "join by pin", "local host", "webrtc", "minigames"]
},
"branding": {
"logoText": "DeckArcade",
"favicon": "/assets/favicon.png",
"tone": "playful, modern, minimal",
"tagline": "Shuffle in. Play fast."
},
"ui": {
"theme": {
"mode": "auto",
"colors": {
"bg": "#0a0e10",
"surface": "#121719",
"surfaceAlt": "#0f1416",
"accentPrimary": "#17bebb",
"accentSecondary": "#e94e77",
"accentTertiary": "#ffc145",
"text": "#eef2f5",
"muted": "#90a4ae",
"success": "#3ddc84",
"warning": "#ffb300",
"danger": "#ff5a5a",
"cardFelt": "#0e3b2e"
},
"radius": { "sm": "0.5rem", "md": "1rem", "lg": "1.5rem", "xl": "2rem" },
"shadows": { "card": "0 0.75rem 1.75rem rgba(0,0,0,0.35)" },
"typography": {
"display": "Plus Jakarta Sans",
"body": "Inter",
"mono": "JetBrains Mono",
"fallbacks": \["system-ui", "-apple-system", "Segoe UI", "Arial"]
},
"spaceScale": \["0", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "3rem"]
},
"layout": {
"maxWidth": "82.5rem",
"gutter": "1rem",
"breakpoints": { "xs": "22.5em", "sm": "40em", "md": "48em", "lg": "64em", "xl": "80em" },
"responsive": {
"enable": true,
"touchTargetsMinRem": 2.75,
"safeAreas": true
}
},
"focus": "game-first (large play buttons, compact chrome)",
"uiFixes": {
"buttons": {
"minTapRem": 2.75,
"hitSlopRem": 0.5,
"debounceMs": 200,
"ariaLabels": true,
"disabledStateConsistency": true,
"loadingState": "spinner-inline"
},
"inputs": { "labelAbove": true, "errorBelow": true }
}
},
"animations": {
"respectReducedMotion": true,
"tokens": {
"durationMs": { "xFast": 90, "fast": 150, "base": 220, "slow": 320, "xSlow": 500 },
"delayMs": { "none": 0, "tiny": 40, "small": 80, "medium": 120 },
"easings": {
"standard": "cubic-bezier(0.2, 0.0, 0.0, 1)",
"emphasized": "cubic-bezier(0.2, 0.0, 0, 1)",
"decelerate": "cubic-bezier(0, 0, 0.2, 1)",
"accelerate": "cubic-bezier(0.4, 0.0, 1, 1)",
"springy": "cubic-bezier(0.2, 0.8, 0.2, 1)"
}
},
"presets": {
"dealCard": { "keyframes": "card-deal", "durationMs": 220, "easing": "decelerate", "distance": "18vw" },
"flipCard": { "keyframes": "card-flip-3d", "durationMs": 320, "easing": "emphasized" },
"chipSlide": { "keyframes": "chip-slide", "durationMs": 220, "easing": "standard", "distance": "12vw" },
"chipStackBounce": { "keyframes": "stack-bounce", "durationMs": 150, "easing": "springy" },
"winConfetti": { "keyframes": "confetti-pop", "durationMs": 500, "easing": "decelerate" },
"highlightPulse": { "keyframes": "pulse", "durationMs": 320, "easing": "emphasized" },
"shakeInvalid": { "keyframes": "shake", "durationMs": 150, "easing": "accelerate" },
"clockTick": { "keyframes": "tick", "durationMs": 220, "easing": "standard" },
"modalIn": { "keyframes": "fade-scale-in", "durationMs": 220, "easing": "decelerate" },
"modalOut": { "keyframes": "fade-scale-out", "durationMs": 150, "easing": "accelerate" },
"toastIn": { "keyframes": "slide-in-up", "durationMs": 220, "easing": "decelerate" },
"toastOut": { "keyframes": "slide-out-down", "durationMs": 150, "easing": "accelerate" },
"pttIndicator": { "keyframes": "glow", "durationMs": 320, "easing": "emphasized" }
},
"api": {
"play": "Animations.play(presetName, targetElement, options)",
"stop": "Animations.stop(targetElement, presetName)",
"register": "Animations.register(presetName, presetDef)",
"useReducedMotion": "Animations.useReducedMotion()"
}
},
"header": {
"nav": \[
{ "label": "Home", "href": "/", "active": true },
{ "label": "Games", "href": "/games" },
{ "label": "Quick Play", "href": "/quick" },
{ "label": "Host", "href": "/host" },
{ "label": "How It Works", "href": "/how" }
],
"auth": {
"show": true,
"buttons": \[{ "label": "Sign In" }, { "label": "Create Account", "variant": "primary" }]
}
},
"hero": {
"headline": "Jump into fast, beautiful card games.",
"subheadline": "Blackjack now. Poker, War & more next. Join by PIN or host locally.",
"primaryCTA": { "label": "Host a Table", "href": "/host" },
"secondaryCTA": { "label": "Join with PIN", "href": "/join" },
"background": {
"style": "animated-felt-with-floating-cards",
"assets": \["/assets/hero/cards.png", "/assets/hero/chips.png"]
},
"stats": \[
{ "label": "Games", "value": 24 },
{ "label": "Quick Minigames", "value": 50 },
{ "label": "Avg Match Setup", "value": "8s" }
]
},
"sectionsOrder": \[
"FeaturedGames",
"QuickStart",
"Multiplayer",
"LiveNow",
"GameCatalog",
"HowItWorks",
"FAQ",
"Footer"
],
"homePageWireframe": {
"FeaturedGames": { "skeletonCards": 6, "showStatusBadges": false },
"QuickStart": { "showButtons": true, "compact": true },
"Multiplayer": { "showModes": true, "showLobbyPreview": true },
"LiveNow": { "placeholder": true },
"GameCatalog": { "filters": \["playerCount", "difficulty", "tags"], "sortDefault": "popularity" }
},
"quickStart": {
"title": "Quick start",
"steps": \[
{ "label": "Pick a game", "detail": "Choose from featured or the full catalog." },
{ "label": "Host or join", "detail": "Host locally or enter a PIN to join friends." },
{ "label": "Deal & play", "detail": "Fast animations, minimal UI, zero friction." }
],
"buttons": \[
{ "label": "Host a Local Table", "href": "/host", "variant": "primary" },
{ "label": "Enter PIN", "href": "/join", "variant": "outline" }
]
},
"multiplayer": {
"headline": "Multiplayer your way",
"modes": \[
{
"id": "pin",
"name": "Join by PIN",
"description": "Create a table and share a 6-digit PIN. Friends join instantly.",
"pinLength": 6,
"charset": "0123456789",
"rateLimit": { "attempts": 5, "perSeconds": 30 }
},
{
"id": "local",
"name": "Locally Hosted (WebRTC)",
"description": "Peer-to-peer with minimal latency. Uses local signaling by default.",
"requirements": \["Same network or direct link", "Open NAT or relay fallback"]
}
],
"signaling": {
"url": "ws\://localhost:8787",
"fallback": "wss\://local-signal.invalid",
"roomTTLSeconds": 3600
},
"webrtc": {
"iceServers": \[{ "urls": \["stun\:stun.l.google.com:19302"] }],
"bundlePolicy": "max-bundle",
"codecPreference": \["opus", "PCMU"]
},
"lobby": {
"features": \["Seat selection", "Ready check", "Kick/mute controls", "Invite link", "Spectators (toggle)"],
"privacy": \["Public", "Friends-only", "Private (PIN)"],
"avatars": { "type": "emoji", "emojiSet": "twemoji", "skinTone": "auto", "allowCustomUpload": false },
"usernames": { "maxLength": 18, "filterProfanity": true, "uniqueInRoom": true }
},
"hints": { "enabledSingleplayer": true, "enabledMultiplayer": false },
"explainers": {
"enabledDefaultSingleplayer": true,
"enabledDefaultMultiplayer": false,
"hostOverride": true,
"contentType": \["tooltip", "overlay", "rule-callout"],
"perGameExplainers": true
},
"netcode": {
"sync": "lockstep-with-rollback",
"antiCheat": \["server-seeded RNG", "concealed hands until reveal", "input delay mitigation"]
}
},
"comms": {
"textChat": {
"enabled": true,
"emotes": true,
"moderation": { "badWords": "filter", "spam": "rate-limit", "maxMsgPer10s": 8 }
},
"voiceChat": {
"enabled": true,
"mode": "push-to-talk",
"pushToTalkKey": "Space",
"vadFallback": true,
"echoCancellation": true,
"noiseSuppression": true,
"autoGainControl": true,
"permissionsPrompt": "on-join",
"visualIndicatorAnimation": "pttIndicator"
}
},
"economy": {
"sharedPool": {
"currency": "chips",
"poolPerSession": true,
"initialChipsPerPlayer": 1000,
"buyIn": { "min": 100, "max": 10000, "increments": 50 },
"rakePercent": 0,
"loansAllowed": false,
"settlement": {
"perHand": true,
"carryAcrossGames": true,
"ledger": true
},
"ui": {
"animateChipTransfers": "chipSlide",
"animateStack": "chipStackBounce"
}
}
},
"liveNow": {
"title": "Live now",
"placeholder": true,
"items": \[
{ "game": "Blackjack", "players": 3, "privacy": "Friends-only", "cta": { "label": "Join", "href": "/join?pin=——" } }
]
},
"featuredGames": \[
{
"slug": "blackjack",
"title": "Blackjack",
"thumbnail": "/img/games/blackjack/thumb.jpg",
"short": "Hit, stand, split—clean animations and crisp odds hints.",
"cta": { "label": "Play", "href": "/play/blackjack" },
"minPlayers": 1,
"maxPlayers": 7,
"tags": \["casino", "quick", "table"],
"status": "available"
},
{
"slug": "poker-holdem",
"title": "Texas Hold’em",
"thumbnail": "/img/games/poker/thumb.jpg",
"short": "Cash, sit & go, and home tables with shared chips.",
"cta": { "label": "Open", "href": "/games/poker-holdem" },
"minPlayers": 2,
"maxPlayers": 9,
"tags": \["strategy", "multiplayer", "table"],
"status": "available"
},
{
"slug": "war",
"title": "War",
"thumbnail": "/img/games/war/thumb.jpg",
"short": "The simplest showdown—now with speed rounds.",
"cta": { "label": "Open", "href": "/games/war" },
"minPlayers": 2,
"maxPlayers": 4,
"tags": \["party", "speed", "family"],
"status": "external-module"
}
],
"gameCatalog": {
"title": "Game catalog",
"sortDefault": "popularity",
"filters": \["playerCount", "difficulty", "tags"],
"items": \[
{
"slug": "blackjack",
"title": "Blackjack",
"route": "/games/blackjack",
"players": "1–7",
"difficulty": "Easy",
"minigames": \[
{ "id": "21-rush", "name": "21 Rush (Timed)", "duration": "90s" },
{ "id": "count-coach", "name": "Counting Trainer (No stakes)", "duration": "3–5m" },
{ "id": "perfect-pairs-lite", "name": "Perfect Pairs (Lite side bet)", "duration": "3–10m" }
],
"rulesSummary": "Closest to 21 without busting; dealer hits to 17; split & double per table rules.",
"assets": { "table": "/img/games/blackjack/table.jpg" },
"cta": { "label": "Play", "href": "/play/blackjack" },
"status": "available"
},
{
"slug": "poker-holdem",
"title": "Texas Hold’em",
"route": "/games/poker-holdem",
"players": "2–9",
"difficulty": "Medium",
"variants": \["Cash", "Sit & Go", "Tournament"],
"minigames": \[
{ "id": "hand-rank-quiz", "name": "Hand Rank Quiz", "duration": "2m" },
{ "id": "all-in-simulator", "name": "All-In Equity Simulator", "duration": "3–5m" }
],
"rulesSummary": "Two hole cards, five community cards; best 5-card hand wins.",
"cta": { "label": "Open", "href": "/games/poker-holdem" },
"status": "available"
},
{
"slug": "war",
"title": "War",
"route": "/games/war",
"players": "2–4",
"difficulty": "Very Easy",
"minigames": \[
{ "id": "speed-war", "name": "Speed War", "duration": "60–120s" },
{ "id": "triple-war", "name": "Triple War (Best-of-3)", "duration": "3–6m" }
],
"rulesSummary": "High card takes the pile; ties trigger 'war' with burn-and-battle.",
"cta": { "label": "Open", "href": "/games/war" },
"status": "external-module"
},
{ "slug": "hearts", "title": "Hearts", "route": "/games/hearts", "players": "4", "difficulty": "Medium", "tags": \["trick-taking"], "cta": { "label": "Open", "href": "/games/hearts" }, "status": "external-module" },
{ "slug": "spades", "title": "Spades", "route": "/games/spades", "players": "4", "difficulty": "Medium", "tags": \["trick-taking", "team"], "cta": { "label": "Open", "href": "/games/spades" }, "status": "external-module" },
{ "slug": "gin-rummy", "title": "Gin Rummy", "route": "/games/gin-rummy", "players": "2", "difficulty": "Medium", "cta": { "label": "Open", "href": "/games/gin-rummy" }, "status": "external-module" },
{ "slug": "crazy-eights", "title": "Crazy Eights", "route": "/games/crazy-eights", "players": "2–6", "difficulty": "Easy", "tags": \["shedding", "family"], "cta": { "label": "Open", "href": "/games/crazy-eights" }, "status": "external-module" },
{ "slug": "solitaire-klondike", "title": "Solitaire (Klondike)", "route": "/games/solitaire-klondike", "players": "1", "difficulty": "Easy", "cta": { "label": "Open", "href": "/games/solitaire-klondike" }, "status": "external-module" },
{ "slug": "euchre", "title": "Euchre", "route": "/games/euchre", "players": "4", "difficulty": "Medium", "tags": \["trick-taking", "team"], "cta": { "label": "Open", "href": "/games/euchre" }, "status": "external-module" },
{ "slug": "baccarat", "title": "Baccarat", "route": "/games/baccarat", "players": "1–7", "difficulty": "Easy", "cta": { "label": "Open", "href": "/games/baccarat" }, "status": "external-module" },
{ "slug": "cribbage", "title": "Cribbage", "route": "/games/cribbage", "players": "2", "difficulty": "Medium", "cta": { "label": "Open", "href": "/games/cribbage" }, "status": "external-module" },
{ "slug": "canasta", "title": "Canasta", "route": "/games/canasta", "players": "2–4", "difficulty": "Medium", "cta": { "label": "Open", "href": "/games/canasta" }, "status": "external-module" },
{ "slug": "rummy-500", "title": "Rummy 500", "route": "/games/rummy-500", "players": "2–4", "difficulty": "Medium", "cta": { "label": "Open", "href": "/games/rummy-500" }, "status": "external-module" },
{ "slug": "durak", "title": "Durak", "route": "/games/durak", "players": "2–6", "difficulty": "Medium", "cta": { "label": "Open", "href": "/games/durak" }, "status": "external-module" },
{ "slug": "scopa", "title": "Scopa", "route": "/games/scopa", "players": "2–4", "difficulty": "Medium", "cta": { "label": "Open", "href": "/games/scopa" }, "status": "external-module" },
{ "slug": "go-fish", "title": "Go Fish", "route": "/games/go-fish", "players": "2–6", "difficulty": "Very Easy", "tags": \["family"], "cta": { "label": "Open", "href": "/games/go-fish" }, "status": "external-module" },
{ "slug": "old-maid", "title": "Old Maid", "route": "/games/old-maid", "players": "2–8", "difficulty": "Very Easy", "tags": \["family"], "cta": { "label": "Open", "href": "/games/old-maid" }, "status": "external-module" },
{ "slug": "president", "title": "President", "route": "/games/president", "players": "3–8", "difficulty": "Easy", "tags": \["shedding", "party"], "cta": { "label": "Open", "href": "/games/president" }, "status": "external-module" },
{ "slug": "speed", "title": "Speed", "route": "/games/speed", "players": "2", "difficulty": "Easy", "tags": \["speed"], "cta": { "label": "Open", "href": "/games/speed" }, "status": "external-module" }
],
"\_injectionPoint": "=== DO NOT REMOVE: GAME MODULES INJECTION POINT ==="
},
"hostControls": {
"defaults": {
"allowSpectators": true,
"spectatorChat": true,
"voiceChat": true,
"textChat": true,
"explainers": true,
"timers": { "turnSeconds": 25, "autoFoldOnTimeout": false },
"privacy": "Private (PIN)"
},
"overridePerGame": true
},
"gameSettingsSchema": {
"blackjack": {
"hostEditable": true,
"rules": {
"decks": { "type": "number", "default": 6, "min": 1, "max": 8 },
"dealerHitsSoft17": { "type": "boolean", "default": true },
"doubleAfterSplit": { "type": "boolean", "default": true },
"resplitAces": { "type": "boolean", "default": false },
"surrender": { "type": "enum", "values": \["none", "late", "early"], "default": "late" },
"blackjackPayout": { "type": "enum", "values": \["3:2", "6:5"], "default": "3:2" },
"minBet": { "type": "number", "default": 10 },
"maxBet": { "type": "number", "default": 1000 },
"sideBets": { "perfectPairs": { "type": "boolean", "default": false }, "21+3": { "type": "boolean", "default": false } }
},
"explainers": {
"enabled": true,
"modes": \["tooltip", "overlay"],
"topics": \["When to Hit/Stand", "Soft 17", "Splits", "Doubling", "Surrender"],
"canBeDisabledByHost": true
},
"multiplayer": { "maxSeats": 7, "spectators": true, "sharedShoe": true },
"animations": \["dealCard", "flipCard", "chipSlide", "chipStackBounce", "highlightPulse"]
},
"\_comment_for_future_games": "Add each game's schema here (rules + explainers + animations). Host Panel auto-renders controls per schema."
},
"gameAPI": {
"contract": {
"registerGame": "DeckArcade.register({ slug, meta, createInitialState(seed), applyAction(state, action), getPlayerView(state, playerId), getNextActions(state, playerId), rules: { validate(state, action) }, explainers: { getTips(state, playerId) }, animations: { hooks }, payouts: { settle(economyState, tableState) } })",
"events": \["onJoin", "onLeave", "onStart", "onPause", "onResume", "onEnd"],
"networkModel": "deterministic actions + server-seeded RNG",
"uiHooks": \["renderTable(stateView)", "renderHand(stateView)", "renderActions(nextActions)", "renderExplainers(tips)"],
"persistence": \["serialize(state)", "deserialize(blob)"]
},
"animations": {
"hooks": {
"onDeal": "Animations.play('dealCard', seatEl, { distance: '18vw' })",
"onReveal": "Animations.play('flipCard', cardEl)",
"onBet": "Animations.play('chipSlide', toPotEl)",
"onWin": "Animations.play('winConfetti', tableEl)",
"onInvalid": "Animations.play('shakeInvalid', controlEl)"
}
},
"\_extensionPoint": "=== DO NOT REMOVE: API EXTENSION POINT ==="
},
"rulesEngine": {
"enforcement": "strict",
"explainers": { "enabled": true, "hostToggle": true },
"blacklistIllegalMoves": true,
"autoResolveDealer": true,
"auditTrail": true
},
"uxStates": {
"blackjack": {
"screens": \["Table", "Betting", "Dealing", "PlayerTurn", "DealerTurn", "Results"],
"emptySeatCTA": "Tap to sit",
"actions": \["Hit", "Stand", "Double", "Split", "Surrender"],
"mobileGestures": { "swipeUp": "Hit", "swipeRight": "Stand" }
}
},
"howItWorks": {
"title": "How it works",
"cards": \[
{ "title": "Pick a table", "body": "Choose a game and set options like speed, seats, and privacy.", "icon": "table-cards" },
{ "title": "Invite or join", "body": "Share your PIN or host locally. Friends join in seconds—no downloads.", "icon": "pin" },
{ "title": "Play beautifully", "body": "Crisp animations and clear rules keep the focus on the cards.", "icon": "sparkles" }
]
},
"faq": \[
{ "q": "Is this real-money gambling?", "a": "No. All games are for entertainment only with virtual chips—no real-money wagering." },
{ "q": "Do I need an account?", "a": "You can join by PIN without an account. Host and save stats by creating one." },
{ "q": "Does local hosting work offline?", "a": "Local hosting uses LAN/WebRTC. Some singleplayer modes work offline with device-to-device options." }
],
"footer": {
"columns": \[
{ "heading": "DeckArcade", "links": \[{ "label": "About", "href": "/about" }, { "label": "Changelog", "href": "/changelog" }, { "label": "Contact", "href": "/contact" }] },
{ "heading": "Support", "links": \[{ "label": "Rules & Guides", "href": "/rules" }, { "label": "Report a Bug", "href": "/bugs" }, { "label": "Community Guidelines", "href": "/guidelines" }] },
{ "heading": "Legal", "links": \[{ "label": "Terms", "href": "/terms" }, { "label": "Privacy", "href": "/privacy" }] }
],
"note": "© DeckArcade. All rights reserved."
},
"accessibility": {
"keyboard": true,
"screenReaderLabels": true,
"colorContrastAA": true,
"reducedMotion": true,
"focusRing": { "style": "outline", "width": "0.125rem", "offset": "0.125rem" }
},
"performance": {
"lazyLoadImages": true,
"codeSplitByGame": true,
"prefetchOnHover": true,
"serverSeededRNG": true
},
"security": {
"csp": "default-src 'self'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self' ws\://localhost:8787;",
"antiAbuse": { "joinFlood": "rate-limit", "duplicateUsernames": "reject" }
},
"apiRoutes": {
"session": { "create": "POST /api/session", "join": "POST /api/join", "leave": "POST /api/leave" },
"signal": { "ws": "WS /api/signal" },
"profile": { "me": "GET /api/me", "avatar": "POST /api/me/avatar" },
"bugs": { "report": "POST /api/bugs" }
},
"analytics": { "enabled": false },
"catalogPreview": {
"items": \[
"blackjack",
"poker-holdem",
"war",
"hearts",
"spades",
"gin-rummy",
"crazy-eights",
"solitaire-klondike",
"euchre",
"baccarat",
"cribbage",
"rummy-500"
]
},
"gameRegistry": {
"available": ["blackjack", "poker-holdem"],
"externalModules": \[
"war",
"hearts",
"spades",
"gin-rummy",
"crazy-eights",
"solitaire-klondike",
"euchre",
"baccarat",
"cribbage",
"canasta",
"rummy-500",
"durak",
"scopa",
"go-fish",
"old-maid",
"president",
"speed"
],
"\_injectionPoint": "=== DO NOT REMOVE: GAME MODULES INJECTION POINT ==="
},
"integrationNotes": {
"modulesAsSeparateFiles": true,
"importStrategy": "dynamic-import",
"example": "const Game = lazy(() => import(`./games/${slug}/index.ts`));",
"build": "Each game lives in its own folder and exports the Game API contract object. The final React app lazy-loads these files."
}
}
