/* =========================================
   CONFIGURACIÓN Y CONSTANTES
   ========================================= */
   const USER_MOCK = "admin";
   const PASS_MOCK = "1234";
   
   // Horas por defecto (se usan si no hay nada guardado)
   const DEFAULT_TIME_SLOTS = [
       "08:00 - 09:00", 
       "09:00 - 10:00", 
       "10:00 - 11:00", 
       "11:30 - 12:30", 
       "12:30 - 13:30", 
       "15:30 - 16:30", 
       "16:30 - 17:30"
   ];
   
   // Días base
   const BASE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
   let activeDays = [...BASE_DAYS]; // Se actualizará según configuración
   
   /* =========================================
      INICIALIZACIÓN
      ========================================= */
   
   // 1. Verificar Autenticación al cargar
   if (localStorage.getItem('isLoggedIn') === 'true') {
       initApp();
   }
   
   // 2. Cargar Tema (Oscuro/Claro)
   if (localStorage.getItem('theme') === 'dark') {
       document.body.classList.add('dark-mode');
       const btn = document.getElementById('theme-btn');
       if(btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
   }
   
   /* =========================================
      AUTENTICACIÓN (LOGIN / LOGOUT)
      ========================================= */
   
   document.getElementById('login-form').addEventListener('submit', (e) => {
       e.preventDefault();
       const u = document.getElementById('username').value;
       const p = document.getElementById('password').value;
   
       if (u === USER_MOCK && p === PASS_MOCK) {
           localStorage.setItem('isLoggedIn', 'true');
           initApp();
       } else {
           document.getElementById('login-error').textContent = "Credenciales incorrectas";
       }
   });
   
   document.getElementById('logout-btn').addEventListener('click', () => {
       localStorage.removeItem('isLoggedIn');
       location.reload();
   });
   
   function initApp() {
       // Ocultar login, mostrar app
       document.getElementById('login-container').classList.add('hidden');
       document.getElementById('app-container').classList.remove('hidden');
   
       // Cargar configuraciones y datos
       loadWeekendSettings(); // Configurar Sáb/Dom
       renderGrid();          // Dibujar tabla
       loadSavedSubjects();   // Paleta lateral
       loadScheduleState();   // Rellenar horario
       loadTasks();           // Tareas
   }
   
   /* =========================================
      INTERFAZ Y NAVEGACIÓN
      ========================================= */
   
   // Cambiar Tema
   /* Reemplaza la función toggleTheme anterior con esta: */

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-btn');
    
    // Estado actual
    const isDark = body.classList.contains('dark-mode');
    const isCinna = body.classList.contains('cinnamoroll-mode');

    // Lógica de rotación: Claro -> Oscuro -> Cinnamoroll -> Claro
    if (!isDark && !isCinna) {
        // 1. Activar Oscuro
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        btn.innerHTML = '<i class="fas fa-moon"></i>'; // Icono Luna
        btn.style.color = ""; // Reset color
    } 
    else if (isDark) {
        // 2. Activar Cinnamoroll
        body.classList.remove('dark-mode');
        body.classList.add('cinnamoroll-mode');
        localStorage.setItem('theme', 'cinnamoroll');
        
        // Icono especial (Nube)
        btn.innerHTML = '<i class="fas fa-cloud"></i>';
        btn.style.color = "#ffc4d6"; // Color azulito para el icono
    } 
    else if (isCinna) {
        // 3. Volver a Claro (Reset)
        body.classList.remove('cinnamoroll-mode');
        localStorage.setItem('theme', 'light');
        btn.innerHTML = '<i class="fas fa-sun"></i>'; // Icono Sol
        btn.style.color = "#89cff0";
    }
}

/* Y ACTUALIZA TAMBIÉN LA CARGA INICIAL (al principio del archivo script.js) */
/* Busca donde dice "// 2. Cargar Tema" y pon esto: */

const savedTheme = localStorage.getItem('theme');
const themeBtn = document.getElementById('theme-btn');

if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if(themeBtn) themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
} else if (savedTheme === 'cinnamoroll') {
    document.body.classList.add('cinnamoroll-mode');
    if(themeBtn) {
        themeBtn.innerHTML = '<i class="fas fa-cloud"></i>';
        themeBtn.style.color = "#89cff0";
    }
}
   
   // Cambiar Pestañas (Horario vs Tareas)
   function switchView(viewName) {
       // Ocultar todas las vistas
       document.querySelectorAll('.view-section').forEach(el => {
           el.classList.add('hidden-view');
           el.classList.remove('active-view');
       });
       // Mostrar la elegida
       document.getElementById(`view-${viewName}`).classList.remove('hidden-view');
       document.getElementById(`view-${viewName}`).classList.add('active-view');
   
       // Actualizar botones del menú
       document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
       // Busca el botón que llamó a la función (si fue click) o búscalo manualmente
       const clickedBtn = document.querySelector(`.nav-btn[onclick="switchView('${viewName}')"]`);
       if(clickedBtn) clickedBtn.classList.add('active');
   }
   
   /* =========================================
      LÓGICA DE DÍAS (SÁBADO / DOMINGO)
      ========================================= */
   
   function loadWeekendSettings() {
       const settings = JSON.parse(localStorage.getItem('weekendSettings')) || { sat: false, sun: false };
       
       const checkSat = document.getElementById('check-sat');
       const checkSun = document.getElementById('check-sun');
   
       if(checkSat) checkSat.checked = settings.sat;
       if(checkSun) checkSun.checked = settings.sun;
       
       updateActiveDaysArray(settings.sat, settings.sun);
   }
   
   function toggleWeekend() {
       const showSat = document.getElementById('check-sat').checked;
       const showSun = document.getElementById('check-sun').checked;
       
       localStorage.setItem('weekendSettings', JSON.stringify({ sat: showSat, sun: showSun }));
       
       updateActiveDaysArray(showSat, showSun);
       renderGrid();       // Reconstruir columnas
       loadScheduleState(); // Volver a poner las materias
   }
   
   function updateActiveDaysArray(sat, sun) {
       activeDays = [...BASE_DAYS];
       if (sat) activeDays.push('Sábado');
       if (sun) activeDays.push('Domingo');
   }
   
   /* =========================================
      RENDERIZADO DEL GRID (TABLA)
      ========================================= */
   
   function renderGrid() {
       const grid = document.getElementById('main-grid');
       const headerRow = document.querySelector('.grid-header-row');
       
       grid.innerHTML = '';
       headerRow.innerHTML = ''; 
   
       // 1. Definir columnas CSS dinámicamente según días activos
       const columnsStyle = `90px repeat(${activeDays.length}, 1fr)`;
       grid.style.gridTemplateColumns = columnsStyle;
       headerRow.style.gridTemplateColumns = columnsStyle;
   
       // 2. Crear Headers
       // A) Esquina
       const corner = document.createElement('div');
       corner.className = 'time-header-corner';
       corner.innerHTML = 'Horas <i class="fas fa-pen" style="font-size:0.7em; opacity:0.5;"></i>';
       headerRow.appendChild(corner);
   
       // B) Días
       activeDays.forEach(dayName => {
           const dh = document.createElement('div');
           dh.className = 'day-header';
           dh.textContent = dayName;
           headerRow.appendChild(dh);
       });
   
       // 3. Crear Filas (Horas + Celdas)
       const savedSlots = JSON.parse(localStorage.getItem('timeSlots')) || DEFAULT_TIME_SLOTS;
   
       savedSlots.forEach((timeText, timeIndex) => {
           // A) Columna de Hora (Editable)
           const timeDiv = document.createElement('div');
           timeDiv.className = 'time-slot-label';
           timeDiv.textContent = timeText;
           timeDiv.contentEditable = true; // Habilitar edición
   
           // Guardar al salir del foco
           timeDiv.addEventListener('blur', () => {
               savedSlots[timeIndex] = timeDiv.textContent;
               localStorage.setItem('timeSlots', JSON.stringify(savedSlots));
           });
           // Prevenir Enter
           timeDiv.addEventListener('keydown', (e) => { 
               if (e.key === 'Enter') { e.preventDefault(); timeDiv.blur(); }
           });
   
           grid.appendChild(timeDiv);
   
           // B) Celdas vacías para cada día activo
           for (let dayIndex = 0; dayIndex < activeDays.length; dayIndex++) {
               const cell = document.createElement('div');
               cell.className = 'schedule-cell';
               // ID ÚNICO: Fila-Columna (ej: cell-0-5 es la primera hora del 6to día)
               cell.id = `cell-${timeIndex}-${dayIndex}`; 
               
               // Eventos Drag & Drop
               cell.ondragover = (e) => allowDrop(e);
               cell.ondrop = (e) => drop(e);
               cell.ondragleave = (e) => e.target.classList.remove('drag-over');
               cell.ondblclick = () => clearCell(cell.id);
   
               grid.appendChild(cell);
           }
       });
   }
   
   /* =========================================
      DRAG & DROP LOGIC
      ========================================= */
   
   // Crear materia en la barra lateral
   function createDraggableSubject(name = null, color = null) {
       const inputName = document.getElementById('new-subject-name');
       const inputColor = document.getElementById('subject-color');
       
       const txt = name || inputName.value;
       const bg = color || inputColor.value;
   
       if (!txt) return; 
   
       const chip = document.createElement('div');
       chip.className = 'subject-chip';
       chip.draggable = true;
       chip.textContent = txt;
       chip.style.backgroundColor = bg;
       chip.id = `subj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`; 
       
       // Configurar Drag Start
       chip.ondragstart = (e) => {
           e.dataTransfer.setData("text/plain", JSON.stringify({
               text: txt, 
               color: bg, 
               sourceId: chip.id, 
               origin: 'palette' // Viene de la paleta
           }));
       };
   
       if (!name) { // Es nuevo input
           saveSubjectPalette({ text: txt, color: bg });
           document.getElementById('draggable-container').appendChild(chip);
           inputName.value = '';
       } else {
           return chip; // Solo retornamos el elemento para cargarlo
       }
   }
   
   // Soltar en la rejilla
   function drop(e) {
       e.preventDefault();
       cleanVisualArtifacts();
       // Encontrar la celda correcta (padre)
       let targetCell = e.target.closest('.schedule-cell');
       
       if (targetCell) {
           targetCell.classList.remove('drag-over');
           
           const rawData = e.dataTransfer.getData("text/plain");
           if (!rawData) return;
           const data = JSON.parse(rawData);
   
           // Si movemos dentro del grid, borrar el origen anterior
           if (data.origin === 'grid' && data.sourceId !== targetCell.id) {
               clearCell(data.sourceId);
           }
   
           // Renderizar el chip DENTRO de la celda
           targetCell.innerHTML = '';
           const newChip = document.createElement('div');
           newChip.className = 'subject-chip';
           newChip.style.backgroundColor = data.color;
           newChip.textContent = data.text;
           newChip.draggable = true;
           
           // Al arrastrar DESDE el grid
           newChip.ondragstart = (ev) => {
                ev.dataTransfer.setData("text/plain", JSON.stringify({
                   text: data.text, 
                   color: data.color, 
                   sourceId: targetCell.id, // El ID de origen es la celda
                   origin: 'grid' 
               }));
           };
           
           targetCell.appendChild(newChip);
           saveScheduleState(targetCell.id, data);
       }
   }
   
   function removeSubjectFromGrid(subjectName) {
    let schedule = JSON.parse(localStorage.getItem('scheduleGrid')) || {};
    let hasChanges = false;

    // Buscamos en todas las celdas guardadas
    for (const [cellId, data] of Object.entries(schedule)) {
        if (data.text === subjectName) {
            // Si coincide el nombre, borramos la celda visualmente
            const cell = document.getElementById(cellId);
            if (cell) cell.innerHTML = '';
            
            // Y la marcamos para borrar de la memoria
            delete schedule[cellId];
            hasChanges = true;
        }
    }
    if (hasChanges) {
        localStorage.setItem('scheduleGrid', JSON.stringify(schedule));
    }
}
    function cleanVisualArtifacts() {
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        document.querySelector('.trash-zone').classList.remove('drag-over');
    }

   // Soltar en la basura
   function deleteDroppedItem(e) {
    e.preventDefault();
    cleanVisualArtifacts(); // Limpieza visual inmediata

    const rawData = e.dataTransfer.getData("text/plain");
    if (!rawData) return;
    const data = JSON.parse(rawData);

    // CASO 1: Viene del HORARIO (Grid) -> Solo borra esa celda
    if (data.origin === 'grid') {
        clearCell(data.sourceId); 
    } 
    // CASO 2: Viene de la PALETA (Lista) -> Borra de la lista Y del horario
    else if (data.origin === 'palette') {
        // 1. Borrar visualmente de la lista
        const item = document.getElementById(data.sourceId);
        if (item) item.remove(); 
        
        // 2. Borrar de la memoria de la paleta
        removeFromPalette(data.text); 
        
        // 3. NUEVO: Buscar y destruir esa materia en el horario
        removeSubjectFromGrid(data.text);
    }
}
   
   function allowDrop(e) {
       e.preventDefault();
       const cell = e.target.closest('.schedule-cell');
       const trash = e.target.closest('.trash-zone');
       
       if(cell) cell.classList.add('drag-over');
       if(trash) trash.classList.add('drag-over');
   }
   
   /* =========================================
      PERSISTENCIA DE DATOS
      ========================================= */
   
   // Limpiar una celda específica
   function clearCell(cellId) {
       const cell = document.getElementById(cellId);
       if(cell) cell.innerHTML = '';
       removeFromScheduleState(cellId);
   }
   
   // A) Paleta Lateral
   function saveSubjectPalette(obj) {
       let p = JSON.parse(localStorage.getItem('palette')) || [];
       p.push(obj);
       localStorage.setItem('palette', JSON.stringify(p));
   }
   function loadSavedSubjects() {
       let p = JSON.parse(localStorage.getItem('palette')) || [];
       const container = document.getElementById('draggable-container');
       container.innerHTML = '';
       p.forEach(x => container.appendChild(createDraggableSubject(x.text, x.color)));
   }
   function removeFromPalette(txt) {
       let p = JSON.parse(localStorage.getItem('palette')) || [];
       p = p.filter(x => x.text !== txt);
       localStorage.setItem('palette', JSON.stringify(p));
   }
   
   // B) Estado del Horario
   function saveScheduleState(id, data) {
       let s = JSON.parse(localStorage.getItem('scheduleGrid')) || {};
       s[id] = data;
       localStorage.setItem('scheduleGrid', JSON.stringify(s));
   }
   function removeFromScheduleState(id) {
       let s = JSON.parse(localStorage.getItem('scheduleGrid')) || {};
       delete s[id];
       localStorage.setItem('scheduleGrid', JSON.stringify(s));
   }
   function loadScheduleState() {
       let s = JSON.parse(localStorage.getItem('scheduleGrid')) || {};
       for (const [id, data] of Object.entries(s)) {
           const cell = document.getElementById(id);
           // Solo intentamos llenar si la celda existe (por si ocultamos sáb/dom)
           if (cell) {
               const chip = document.createElement('div');
               chip.className = 'subject-chip';
               chip.style.backgroundColor = data.color;
               chip.textContent = data.text;
               chip.draggable = true;
               chip.ondragstart = (ev) => {
                    ev.dataTransfer.setData("text/plain", JSON.stringify({
                       text: data.text, color: data.color, sourceId: id, origin: 'grid'
                   }));
               };
               cell.appendChild(chip);
           }
       }
   }
   
   /* =========================================
      GESTIÓN DE TAREAS
      ========================================= */
   
   function addTask() {
       const desc = document.getElementById('task-desc').value;
       const date = document.getElementById('task-deadline').value;
       if(!desc) return;
       
       let t = JSON.parse(localStorage.getItem('tasks')) || [];
       t.push({ id: Date.now(), desc, date });
       localStorage.setItem('tasks', JSON.stringify(t));
       
       loadTasks();
       document.getElementById('task-desc').value = '';
   }
   
   function loadTasks() {
       const list = document.getElementById('task-list');
       list.innerHTML = '';
       let t = JSON.parse(localStorage.getItem('tasks')) || [];
       
       t.forEach(x => {
           const li = document.createElement('li');
           li.className = 'task-item';
           const d = x.date ? new Date(x.date).toLocaleString() : '';
           
           li.innerHTML = `
               <span>${x.desc} <small style="color:var(--text-muted); margin-left:10px">${d}</small></span> 
               <button onclick="removeTask(${x.id})" style="color:var(--danger);border:none;background:none;cursor:pointer" title="Completar">
                   <i class="fas fa-check"></i>
               </button>
           `;
           list.appendChild(li);
       });
   }
   
   function removeTask(id) {
       let t = JSON.parse(localStorage.getItem('tasks')) || [];
       t = t.filter(x => x.id !== id);
       localStorage.setItem('tasks', JSON.stringify(t));
       loadTasks();
   }