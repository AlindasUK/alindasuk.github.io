document.addEventListener('keydown', function(event) {
    let columnId = null;
    if (event.key === 'ArrowLeft') columnId = 'gcolumn1';
    else if (event.key === 'ArrowDown') columnId = 'gcolumn2';
    else if (event.key === 'ArrowUp') columnId = 'gcolumn3';
    else if (event.key === 'ArrowRight') columnId = 'gcolumn4';

    if (columnId) {
        const col = document.getElementById(columnId);
        if (col) {
            const arrowImg = col.querySelector('.arrow');
            if (arrowImg) {
                arrowImg.classList.add('arrow-effect');
                setTimeout(() => arrowImg.classList.remove('arrow-effect'), 200);
            }
        }
    }
});

// Add hit/miss counters to the page
let hitCount = 0;
let missCount = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let totalNotes = 0;

// Create and insert counter display if not present
function setupCounters() {
    if (document.getElementById('counterDisplay')) return;
    const display = document.createElement('div');
    display.id = 'counterDisplay';
    display.style.position = 'absolute';
    display.style.top = '10px';
    display.style.right = '10px';
    display.style.background = 'rgba(255,255,255,0.8)';
    display.style.padding = '10px 20px';
    display.style.borderRadius = '8px';
    display.style.fontSize = '1.2em';
    display.style.zIndex = 1000;
    display.innerHTML = `Hits: <span id="hitCount">0</span> | Misses: <span id="missCount">0</span>`;
    document.body.appendChild(display);
}
setupCounters();

function updateCounters() {
    document.getElementById('hitCount').textContent = hitCount;
    document.getElementById('missCount').textContent = missCount;
}

function createNote(columnId) {
    const col = document.getElementById(columnId);
    if (!col) return;

    const refArrow = col.querySelector('.arrow');
    if (!refArrow) return;

    const note = document.createElement('img');
    note.src = refArrow.src;
    note.className = 'note-arrow';
    note.alt = 'Note Arrow';
    note.style.position = 'absolute';
    note.style.left = '10px';
    note.style.right = '10px';
    note.style.top = '0px';
    note.style.width = 'calc(100% - 20px)';
    note.style.height = 'auto';
    note.style.pointerEvents = 'none';
    note.style.rotate = refArrow.style.rotate;

    const iconContainer = col.querySelector('.iconcontainer');
    if (!iconContainer) return;
    iconContainer.appendChild(note);

    // Store reference for hit detection
    if (!iconContainer._notes) iconContainer._notes = [];
    iconContainer._notes.push(note);

    let start = null;
    const duration = 2000;
    const containerHeight = iconContainer.offsetHeight;
    note._active = true;
    note._hit = false;

    function animateNote(ts) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        note.style.top = `${progress * (containerHeight - note.offsetHeight - 10)}px`;

        if (progress < 1 && !note._removeEarly) {
            requestAnimationFrame(animateNote);
        } else {
            // Remove from notes array
            iconContainer._notes = iconContainer._notes.filter(n => n !== note);
            // If not hit, flash red for miss and increment miss counter
            if (!note._hit && !note._removeEarly) {
                refArrow.classList.add('arrow-miss');
                setTimeout(() => refArrow.classList.remove('arrow-miss'), 200);
                missCount++;
                updateCounters();
            }
            note.remove();
        }
    }
    requestAnimationFrame(animateNote);
}

// Helper to check overlap between note and control arrow
function isNoteTouchingArrow(note, arrow) {
    if (!note || !arrow) return false;
    const noteRect = note.getBoundingClientRect();
    const arrowRect = arrow.getBoundingClientRect();
    // Check vertical overlap (bottom of note near top of arrow)
    return (
        noteRect.bottom > arrowRect.top + 5 && // 5px tolerance
        noteRect.top < arrowRect.bottom - 5 &&
        noteRect.left < arrowRect.right &&
        noteRect.right > arrowRect.left
    );
}

document.addEventListener('keydown', function(event) {
    let columnId = null;
    if (event.key === 'ArrowLeft') columnId = 'gcolumn1';
    else if (event.key === 'ArrowDown') columnId = 'gcolumn2';
    else if (event.key === 'ArrowUp') columnId = 'gcolumn3';
    else if (event.key === 'ArrowRight') columnId = 'gcolumn4';

    if (columnId) {
        const col = document.getElementById(columnId);
        if (col) {
            const arrowImg = col.querySelector('.arrow');
            if (arrowImg) {
                // Check for active notes touching the arrow
                const iconContainer = col.querySelector('.iconcontainer');
                let hit = false;
                if (iconContainer && iconContainer._notes) {
                    for (const note of iconContainer._notes) {
                        if (note._active && isNoteTouchingArrow(note, arrowImg)) {
                            note._removeEarly = true;
                            note._hit = true;
                            note.remove();
                            hit = true;
                            hitCount++;
                            updateCounters();
                        }
                    }
                }
                // Flash effect and handle miss if no note was hit
                if (hit) {
                    arrowImg.classList.add('arrow-hit');
                    setTimeout(() => arrowImg.classList.remove('arrow-hit'), 200);
                } else {
                    arrowImg.classList.add('arrow-miss');
                    missCount++;
                    updateCounters();
                    setTimeout(() => arrowImg.classList.remove('arrow-miss'), 200);
                }
            }
        }
    }
});

let songData = [];
let songTicks = 2;
let songInterval = null;
let songIndex = 0;
let audio = null;
let songLoaded = false;
let trackLoaded = false;

// Store selected files
let selectedSongFile = null;
let selectedTrackFile = null;

// Parse the song file
function parseSong(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length && !l.startsWith('//'));
    let ticks = 2;
    let notes = [];
    for (const line of lines) {
        if (line.startsWith('ticks')) {
            ticks = parseInt(line.split(':')[1].trim());
        } else {
            const parts = line.split(',');
            for (const part of parts) {
                const match = part.match(/(\d+)\s*:\s*([01]{4})/);
                if (match) {
                    notes.push(match[2]);
                }
            }
        }
    }
    return { ticks, notes };
}

// Handle song file upload
document.getElementById('songFile').addEventListener('change', function(e) {
    if (e.target.files.length) {
        selectedSongFile = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(ev) {
            const { ticks, notes } = parseSong(ev.target.result);
            songTicks = ticks;
            songData = notes;
            songIndex = 0;
            songLoaded = true;
            alert('Song file loaded! Now upload the track.');
        };
        reader.readAsText(selectedSongFile);
    }
});

// Handle track file upload
document.getElementById('trackFile').addEventListener('change', function(e) {
    if (e.target.files.length) {
        selectedTrackFile = e.target.files[0];
        if (audio) {
            audio.pause();
            audio = null;
        }
        audio = new Audio(URL.createObjectURL(selectedTrackFile));
        trackLoaded = true;
        alert('Track loaded! Now upload the song file if you haven\'t.');
    }
});

// Play both in sync
function playSong() {
    if (!songLoaded || !trackLoaded) {
        alert('Please upload both a song (.txt) and a track (.mp3) file.');
        return;
    }
    // Reset counters
    document.querySelector('.songoverpannel').style.opacity = 0;
    hitCount = 0;
    missCount = 0;
    score = 0;
    combo = 0;
    maxCombo = 0;
    totalNotes = songData.length * 4; // 4 columns per tick
    updateCounters();

    // Stop previous interval if any
    if (songInterval) clearInterval(songInterval);
    songIndex = 0;

    // Play audio and start notes in sync
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }

    songInterval = setInterval(() => {
        if (songIndex >= songData.length) {
            clearInterval(songInterval);
            return;
        }
        const pattern = songData[songIndex];
        if (pattern[0] === '1') createNote('gcolumn1');
        if (pattern[1] === '1') createNote('gcolumn2');
        if (pattern[2] === '1') createNote('gcolumn3');
        if (pattern[3] === '1') createNote('gcolumn4');
        songIndex++;
    }, 1000 / songTicks);
}

document.getElementById('playSong').addEventListener('click', playSong);

// Show/hide song over panel
function hideSongOverPanel() {
    const panel = document.querySelector('.songoverpannel');
    panel.classList.remove('active');
}

// Calculate rank
function getRank() {
    const maxScore = totalNotes + (totalNotes - 1); // Max combo bonus: every note is a combo except first
    const percent = score / maxScore;
    if (percent >= 0.95) return 'S';
    if (percent >= 0.90) return 'A';
    if (percent >= 0.80) return 'B';
    if (percent >= 0.70) return 'C';
    if (percent >= 0.60) return 'D';
    return 'F';
}

// At the end of the song, call showSongOverPanel()
function endSong() {
    if (audio) audio.pause();
    if (songInterval) clearInterval(songInterval);
    document.getElementById('score').textContent = score;
    document.getElementById('rank').textContent = getRank();;
    document.querySelector('.songoverpannel').style.opacity = 1;
}

// Restart game button
document.getElementById('restartGame').addEventListener('click', function() {
    hideSongOverPanel();
    // Optionally, reset and allow replay
    playSong();
    
});

// --- Modify your note hit/miss logic like this ---

// On note hit:
registerHit();

// On note miss:
registerMiss();

// At the end of the song (after last note):
endSong();