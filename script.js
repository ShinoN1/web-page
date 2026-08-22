document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejo del Login
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita recargar la página
        // Oculta el login y muestra la app
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Iniciar el reloj al entrar
        updateClock();
        // Generar la cuadrícula del horario
        generateGrid();
    });

    // 2. Evento para el botón de salir
    document.getElementById('logout-btn').addEventListener('click', () => {
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('login-form').reset();
    });
});

// --- NAVEGACIÓN ENTRE PESTAÑAS ---
function switchView(event, viewName) {
    // Ocultar todas las vistas
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
    });

    // Quitar la clase active de todos los botones
    const navButtons = document.querySelectorAll('.main-nav .nav-btn:not(.logout)');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // Mostrar la vista seleccionada
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.remove('hidden-view');
        targetView.classList.add('active-view');
    }

    // Activar el botón presionado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// --- RELOJ DIGITAL ---
function updateClock() {
    const now = new Date();
    
    // Formato de hora HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const clockElement = document.getElementById('digital-clock');
    if (clockElement) {
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Formato de fecha
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateString = now.toLocaleDateString('es-ES', options);
    
    const dateElement = document.getElementById('digital-date');
    if (dateElement) {
        dateElement.textContent = dateString;
    }
}
// Actualizar cada segundo
setInterval(updateClock, 1000);


// --- LÓGICA DEL HORARIO (DRAG & DROP) ---
let draggedItem = null;
const coloresPastel = ['#E6868E', '#AFA975', '#EABFBD', '#847B54', '#D4A5A5', '#9BA4B5'];
let colorIndex = 0;

function createDraggableSubject() {
    const input = document.getElementById('new-subject-name');
    const colorInput = document.getElementById('new-subject-color');
    
    const name = input.value.trim();
    const chosenColor = colorInput ? colorInput.value : '#E6868E'; // Toma el color seleccionado
    
    if (name !== '') {
        const chip = document.createElement('div');
        chip.className = 'subject-chip';
        chip.draggable = true;
        chip.textContent = name;
        
        // Aplica el color exacto que eligió el usuario en la ruleta
        chip.style.backgroundColor = chosenColor;

        // Eventos Drag
        chip.addEventListener('dragstart', handleDragStart);
        chip.addEventListener('dragend', handleDragEnd);

        document.getElementById('draggable-container').appendChild(chip);
        input.value = ''; // Limpia el nombre
    }
}

// Generar celdas de la cuadrícula
function generateGrid() {
    const grid = document.getElementById('main-grid');
    grid.innerHTML = ''; // Limpiar
    
    const horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    const dias = ['lun', 'mar', 'mie', 'jue', 'vie', 'sat', 'sun'];

    horas.forEach(hora => {
        // Etiqueta de hora
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-slot-label';
        timeLabel.textContent = hora;
        grid.appendChild(timeLabel);

        // Crear celdas de los días
        dias.forEach(dia => {
            const cell = document.createElement('div');
            cell.className = `schedule-cell ${dia}-col`;
            
            // Ocultar findes por defecto
            if(dia === 'sat' || dia === 'sun') {
                cell.classList.add('hidden');
            }

            // Eventos Drop
            cell.addEventListener('dragover', allowDrop);
            cell.addEventListener('dragleave', handleDragLeave);
            cell.addEventListener('drop', handleDrop);
            
            grid.appendChild(cell);
        });
    });
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
}

function handleDragEnd() {
    setTimeout(() => this.style.opacity = '1', 0);
    draggedItem = null;
    
    // Limpiar estilos de arrastre
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function allowDrop(e) {
    e.preventDefault();
    if(this.classList.contains('schedule-cell') && !this.hasChildNodes()) {
        this.classList.add('drag-over');
    }
    if(this.id === 'trash') {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    // Si la celda está vacía, permite soltar
    if(this.classList.contains('schedule-cell') && !this.hasChildNodes() && draggedItem) {
        // Clonamos el elemento para dejar una copia en la paleta lateral si viene de ahí
        if(draggedItem.parentNode.id === 'draggable-container') {
            const clone = draggedItem.cloneNode(true);
            clone.addEventListener('dragstart', handleDragStart);
            clone.addEventListener('dragend', handleDragEnd);
            this.appendChild(clone);
        } else {
            // Si viene de otra celda, solo lo movemos
            this.appendChild(draggedItem);
        }
    }
}

function deleteDroppedItem(e) {
    e.preventDefault();
    const trash = document.getElementById('trash');
    if (trash) trash.classList.remove('drag-over');
    
    // Si hay un elemento siendo arrastrado, simplemente lo eliminamos
    // (ya sea desde el panel de materias o desde el grid del horario)
    if (draggedItem) {
        draggedItem.remove();
        draggedItem = null;
    }
}

// --- DÍAS VISIBLES (SÁBADO/DOMINGO) ---
function toggleWeekend() {
    const showSat = document.getElementById('check-sat').checked;
    const showSun = document.getElementById('check-sun').checked;
    
    const gridHeader = document.getElementById('grid-header');
    const mainGrid = document.getElementById('main-grid');
    
    // Clases en los contenedores CSS Grid
    showSat ? gridHeader.classList.add('show-sat') : gridHeader.classList.remove('show-sat');
    showSat ? mainGrid.classList.add('show-sat') : mainGrid.classList.remove('show-sat');
    
    showSun ? gridHeader.classList.add('show-sun') : gridHeader.classList.remove('show-sun');
    showSun ? mainGrid.classList.add('show-sun') : mainGrid.classList.remove('show-sun');

    // Mostrar/Ocultar Celdas específicas
    document.querySelectorAll('.saturday-col, .sat-col').forEach(el => {
        showSat ? el.classList.remove('hidden') : el.classList.add('hidden');
    });
    document.querySelectorAll('.sunday-col, .sun-col').forEach(el => {
        showSun ? el.classList.remove('hidden') : el.classList.add('hidden');
    });
}


// --- LÓGICA DE TAREAS ---
function addTask() {
    const descInput = document.getElementById('task-desc');
    const dateInput = document.getElementById('task-deadline');
    const desc = descInput.value.trim();
    
    if (desc !== '') {
        const li = document.createElement('li');
        li.className = 'task-item';
        
        let dateText = dateInput.value ? ` - 📅 ${dateInput.value}` : '';
        
        li.innerHTML = `
            <span>${desc} ${dateText}</span>
            <button onclick="this.parentElement.remove()" title="Eliminar"><i class="fas fa-check"></i></button>
        `;
        
        document.getElementById('task-list').appendChild(li);
        descInput.value = '';
        dateInput.value = '';
    }
}

// --- LÓGICA DE TIEMPO (POMODORO & CRONÓMETRO) ---
let timerInterval = null;
let currentMode = 'pomodoro'; // 'pomodoro', 'short', 'stopwatch'
let secondsElapsed = 0; // Para el cronómetro
let secondsLeft = 25 * 60; // Para la cuenta regresiva
let isTimerRunning = false;

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    const totalSecs = (currentMode === 'stopwatch') ? secondsElapsed : secondsLeft;
    
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    
    if (display) {
        display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

function setTimerMode(mode, minutes, button) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    currentMode = mode;
    
    const sublabel = document.getElementById('timer-sublabel');
    
    if (mode === 'stopwatch') {
        secondsElapsed = 0;
        if (sublabel) sublabel.textContent = "";
    } else {
        secondsLeft = minutes * 60;
        if (sublabel) sublabel.textContent = mode === 'pomodoro' ? "" : "";
    }
    
    updateTimerDisplay();
    
    // Cambiar estilos de las pestañas
    document.querySelectorAll('.pomo-tab').forEach(tab => tab.classList.remove('active'));
    if (button) button.classList.add('active');
    
    const startBtn = document.getElementById('start-timer-btn');
    if (startBtn) startBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
}

function toggleTimer() {
    const startBtn = document.getElementById('start-timer-btn');
    
    if (isTimerRunning) {
        // Pausar
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (startBtn) startBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
    } else {
        // Iniciar
        isTimerRunning = true;
        if (startBtn) startBtn.innerHTML = '<i class="fas fa-pause"></i> Pausa';
        
        timerInterval = setInterval(() => {
            if (currentMode === 'stopwatch') {
                secondsElapsed++;
                updateTimerDisplay();
            } else {
                if (secondsLeft > 0) {
                    secondsLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    alert("¡Tiempo finalizado! 🎉");
                    if (startBtn) startBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
                }
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    if (currentMode === 'stopwatch') {
        secondsElapsed = 0;
    } else {
        secondsLeft = (currentMode === 'pomodoro' ? 25 : 5) * 60;
    }
    
    updateTimerDisplay();
    const startBtn = document.getElementById('start-timer-btn');
    if (startBtn) startBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
}

// --- ACTUALIZACIÓN DE HORA Y RELOJ ANALÓGICO ---
function updateAnalogClock() {
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours();

    const secHand = document.getElementById('sec-hand');
    const minHand = document.getElementById('min-hand');
    const hourHand = document.getElementById('hour-hand');

    if (secHand && minHand && hourHand) {
        // Rotaciones en grados de las manecillas
        const secDeg = (sec / 60) * 360;
        const minDeg = ((min + sec / 60) / 60) * 360;
        const hrDeg = (((hr % 12) + min / 60) / 12) * 360;

        secHand.style.transform = `rotate(${secDeg}deg)`;
        minHand.style.transform = `rotate(${minDeg}deg)`;
        hourHand.style.transform = `rotate(${hrDeg}deg)`;
    }
}
setInterval(updateAnalogClock, 1000);

// --- REPRODUCTOR DE MÚSICA LOFI REAL ---
function toggleMusic() {
    const audio = document.getElementById('lofi-audio');
    const btn = document.getElementById('play-music-btn');
    
    if (audio.paused) {
        audio.play();
        btn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        btn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Objeto con las canciones/radios disponibles
const playlist = {
    'track-1': {
        title: 'lofi hip hop radio',
        artist: 'Lofi Girl',
        src: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400'
    },
    'track-2': {
        title: 'cozy lofi beats',
        artist: 'ChilledCow',
        src: 'https://stream.zeno.fm/330evyd4008uv',
        cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400'
    },
    'track-3': {
        title: 'rainy day lofi',
        artist: 'Lofi Girl',
        src: 'https://stream.zeno.fm/433evyd4008uv',
        cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400'
    }
};

function changeTrack(trackKey) {
    const track = playlist[trackKey];
    if (!track) return;

    const audio = document.getElementById('lofi-audio');
    const playBtn = document.getElementById('play-music-btn');
    
    // Cambiar datos en la pantalla
    document.querySelector('.player-controls-area h3').textContent = track.title;
    document.querySelector('.player-controls-area small').innerHTML = `${track.artist} <i class="fas fa-check-circle"></i>`;
    document.querySelector('.album-art img').src = track.cover;
    
    // Cambiar fuente de audio y reproducir
    audio.src = track.src;
    audio.play();
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function loadCustomUrl() {
    const input = document.getElementById('song-url-input');
    const url = input.value.trim();
    const audioPlayer = document.getElementById('lofi-audio');
    const titleEl = document.getElementById('player-title');
    const subtitleEl = document.getElementById('player-subtitle');
    const artistEl = document.getElementById('player-artist');
    const statusBadge = document.getElementById('player-status-badge');

    if (!url) {
        alert("Por favor pega una URL válida.");
        return;
    }

    // Detectar si el usuario pegó un enlace de YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        }

        if (videoId) {
            // Reemplazar la vista del reproductor con el embed oficial de YouTube
            const playerMain = document.querySelector('.player-main-content');
            playerMain.innerHTML = `
                <iframe width="100%" height="180" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen 
                    style="border-radius: 12px;">
                </iframe>
            `;
            if (audioPlayer) audioPlayer.pause();
            return;
        }
    }

    // Si es un archivo de audio normal (.mp3, .aac, radio stream)
    if (audioPlayer) {
        audioPlayer.src = url;
        audioPlayer.play();
        if (titleEl) titleEl.textContent = "Música Personalizada";
        if (subtitleEl) subtitleEl.textContent = "Streaming directo";
        if (artistEl) artistEl.innerHTML = 'Usuario <i class="fas fa-check-circle"></i>';
        if (statusBadge) statusBadge.textContent = "En reproducción";
    }
}

// Función auxiliar para seleccionar sugerencias rápidas
function changeTrack(srcUrl, name, artist) {
    const audio = document.getElementById('lofi-audio');
    const title = document.getElementById('player-title');
    const artistElem = document.getElementById('player-artist');
    const playBtn = document.getElementById('play-music-btn');

    audio.src = srcUrl;
    audio.play();
    
    if (title) title.textContent = name;
    if (artistElem) artistElem.innerHTML = `${artist} <i class="fas fa-check-circle"></i>`;
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}
