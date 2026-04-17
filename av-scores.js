/**
 * Averthan Games — Score Reporter
 * Include this in any game to auto-report high scores to Firebase.
 * 
 * Usage: <script src="../av-scores.js"></script>
 * Then call: avReportScore('snake', 1250)
 */
(function() {
    // Firebase config (same as chat)
    const FB_CONFIG = {
        apiKey: 'AIzaSyDJqjLmNfW5olBXEVzfXD-XT5_MICePjbQ',
        authDomain: 'averthan-games.firebaseapp.com',
        databaseURL: 'https://averthan-games-default-rtdb.firebaseio.com',
        projectId: 'averthan-games'
    };

    let db = null;
    let fbReady = false;

    function initFirebase() {
        if (fbReady) return Promise.resolve();
        return new Promise((resolve) => {
            // Load Firebase scripts if not already loaded
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                db = firebase.database();
                fbReady = true;
                resolve();
                return;
            }

            const s1 = document.createElement('script');
            s1.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js';
            s1.onload = () => {
                const sAuth = document.createElement('script');
                sAuth.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js';
                sAuth.onload = () => {
                    const s2 = document.createElement('script');
                    s2.src = 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js';
                    s2.onload = () => {
                        if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
                        db = firebase.database();
                        // Best-effort anonymous sign-in; ignore if not enabled.
                        const finish = () => { fbReady = true; resolve(); };
                        try {
                            firebase.auth().signInAnonymously()
                                .then(() => new Promise(res => {
                                    const unsub = firebase.auth().onAuthStateChanged(u => { if (u) { unsub(); res(); } });
                                    setTimeout(res, 2000); // don't block score writes on auth
                                }))
                                .then(finish)
                                .catch(err => { console.warn('avScores auth unavailable:', err && err.code); finish(); });
                        } catch (e) { finish(); }
                    };
                    document.head.appendChild(s2);
                };
                document.head.appendChild(sAuth);
            };
            document.head.appendChild(s1);
        });
    }

    function getPlayerName() {
        return localStorage.getItem('av_username') || 'Anonymous';
    }

    /**
     * Report a score for a game.
     * Only updates if the new score is higher than the player's existing score for that game.
     * @param {string} gameId - e.g. 'snake', '2048', 'dash-runner'
     * @param {number} score - the score to report
     * @param {object} meta - optional extra data {mode: 'hard', level: 5}
     */
    window.avReportScore = async function(gameId, score, meta) {
        if (!score || score <= 0) return;
        
        try {
            await initFirebase();
            const name = getPlayerName();
            // Prefer Firebase auth.uid if anonymous sign-in succeeded;
            // otherwise fall back to the sanitized player name (legacy key).
            const user = firebase.auth && firebase.auth().currentUser;
            const key = (user && user.uid) || name.replace(/[.#$\/\[\]]/g, '_');
            const ref = db.ref(`hallOfFame/${gameId}/${key}`);
            
            const snap = await ref.once('value');
            const existing = snap.val();
            
            // Only update if new score is higher
            if (!existing || score > existing.score) {
                await ref.set({
                    name: name,
                    score: score,
                    meta: meta || null,
                    updatedAt: firebase.database.ServerValue.TIMESTAMP
                });
                console.log(`🏆 Hall of Fame: ${name} scored ${score} in ${gameId}`);
            }
        } catch(e) {
            console.error('Score report failed:', e);
        }
    };

    /**
     * Get top scores for a game.
     * @param {string} gameId 
     * @param {number} limit - default 10
     * @returns {Promise<Array>} sorted by score descending
     */
    window.avGetScores = async function(gameId, limit) {
        try {
            await initFirebase();
            const snap = await db.ref(`hallOfFame/${gameId}`).once('value');
            const data = snap.val() || {};
            const scores = Object.values(data)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit || 10);
            return scores;
        } catch(e) {
            console.error('Get scores failed:', e);
            return [];
        }
    };

    /**
     * Get all games a player has played with their best scores.
     * @param {string} playerName - optional, defaults to current player
     * @returns {Promise<Object>} { gameId: {score, updatedAt, meta} }
     */
    window.avGetPlayerStats = async function(playerName) {
        try {
            await initFirebase();
            // Prefer matching by auth.uid for the current player; otherwise
            // fall back to a name match across all records.
            const user = firebase.auth().currentUser;
            const wantName = playerName || getPlayerName();
            const snap = await db.ref('hallOfFame').once('value');
            const allGames = snap.val() || {};
            const stats = {};
            for (const [gameId, players] of Object.entries(allGames)) {
                if (!players) continue;
                if (!playerName && user && players[user.uid]) {
                    stats[gameId] = players[user.uid];
                    continue;
                }
                for (const rec of Object.values(players)) {
                    if (rec && rec.name === wantName) {
                        stats[gameId] = rec;
                        break;
                    }
                }
            }
            return stats;
        } catch(e) {
            console.error('Get player stats failed:', e);
            return {};
        }
    };
})();
