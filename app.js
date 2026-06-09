const initApp = () => {
  const state = {
    // Sound FX Preference
    soundEnabled: true,

    // Timer State
    timeLeft: 0, // elapsed time in seconds (count up)
    isRunning: false,
    timerInterval: null,
    breaksTakenCount: 0,
    isBreakActive: false,
    breakTimeLeft: 0,
    breakInterval: null,

    // Task State
    tasks: [], // stored tasks
    activeTaskId: null, // ID of ongoing task
    currentTaskTab: 'ongoing', // 'ongoing' or 'done'

    // Session Tracking
    sessionName: 'UNTITLED',
    sessionStartTimestamp: new Date(),
    totalFocusSeconds: 0,
    totalBreakSeconds: 0,
    tasksCompletedCount: 0,
    minuteTimerCounter: 0, // counts down 60 seconds to log a timeline square

    // Timeline History (array of focus events)
    timelineLog: [],

    // Saved Sessions Receipts
    savedReceipts: [],
    historyReceipts: [],
    currentSummaryView: 'summary', // 'summary' or 'all-receipts'

    // Active Sign-Off Captured Media
    capturedSignoffDataURL: null, // stores image of webcam or drawing

    // Canvas Playback State
    isPlayingDoodle: false,
    playbackTime: 0,
    playbackDuration: 0,
    playbackTimerId: null,

    // Webcam Capture State
    webcamStream: null,
    isWebcamDitherActive: false,
    signoffMode: 'photo', // 'photo' or 'draw'

    // Draggable Workspace State
    activeZIndex: 100
  };

  // Cache DOM elements
  const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    loadingProgressGrid: document.getElementById('loading-progress-grid'),
    loadingStatus: document.getElementById('loading-status'),

    appContainer: document.getElementById('app-container'),
    sessionNameInput: document.getElementById('session-name-input'),
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    helpTriggerBtn: document.getElementById('help-trigger-btn'),
    helpModal: document.getElementById('help-modal'),
    closeHelpBtn: document.getElementById('close-help-btn'),

    // Timer
    timerMinutes: document.getElementById('timer-minutes'),
    timerSeconds: document.getElementById('timer-seconds'),
    timerPlayBtn: document.getElementById('timer-play-btn'),
    timerPauseBtn: document.getElementById('timer-pause-btn'),
    timerCompleteBtn: document.getElementById('timer-complete-btn'),
    timerTaskStatus: document.getElementById('timer-task-status'),
    timerBreaksCount: document.getElementById('timer-breaks-count'),

    // Tasks List & Filter Pills
    tabOngoing: document.getElementById('tab-ongoing'),
    tabDone: document.getElementById('tab-done'),
    addTaskToggleBtn: document.getElementById('add-task-toggle-btn'),
    newTaskFormContainer: document.getElementById('new-task-form-container'),
    taskInput: document.getElementById('task-input'),
    submitTaskBtn: document.getElementById('submit-task-btn'),
    cancelTaskBtn: document.getElementById('cancel-task-btn'),
    tasksList: document.getElementById('tasks-list'),

    // Tray & Printed elements
    timelineReceiptStrip: document.getElementById('timeline-receipt-strip'),
    liveTimelineBlocks: document.getElementById('live-timeline-blocks'),
    liveTimelineRangeText: document.getElementById('live-timeline-range-text'),
    activeReceiptPaper: document.getElementById('active-receipt-paper'),
    activeReceiptTaskTitle: document.getElementById('active-receipt-task-title'),
    activeReceiptTimestamp: document.getElementById('active-receipt-timestamp'),
    activeReceiptSignoffPlaceholder: document.getElementById('active-receipt-signoff-placeholder'),
    activeReceiptSignoffPrinted: document.getElementById('active-receipt-signoff-printed'),
    activeReceiptSignoffCanvas: document.getElementById('active-receipt-signoff-canvas'),
    activeReceiptTimelineMini: document.getElementById('active-receipt-timeline-mini'),
    activeReceiptMiniBlocks: document.getElementById('active-receipt-mini-blocks'),
    activeReceiptMiniEndtime: document.getElementById('active-receipt-mini-endtime'),
    activeReceiptMiniStarttime: document.getElementById('active-receipt-mini-starttime'),
    sessionSummaryTriggerBtn: document.getElementById('session-summary-trigger-btn'),

    // Sign-Off Modal
    signOffModal: document.getElementById('sign-off-modal'),
    signoffModalCloseBtn: document.getElementById('signoff-modal-close-btn'),
    webcamVideo: document.getElementById('webcam-video'),
    webcamDitherCanvas: document.getElementById('webcam-dither-canvas'),
    shutterBtn: document.getElementById('shutter-btn'),
    cameraErrorMessage: document.getElementById('camera-error-message'),
    modalSignatureCanvas: document.getElementById('modal-signature-canvas'),
    togglePhotoModeBtn: document.getElementById('toggle-photo-mode'),
    toggleDrawModeBtn: document.getElementById('toggle-draw-mode'),
    signoffActionBtn: document.getElementById('signoff-action-btn'),
    signoffSubmitBtn: document.getElementById('signoff-submit-btn'),
    iconRetake: document.getElementById('icon-retake'),
    iconTrash: document.getElementById('icon-trash'),

    // End Session Modal Dialogue
    endSessionModal: document.getElementById('end-session-modal'),
    endSessionCancel: document.getElementById('end-session-cancel'),
    endSessionConfirm: document.getElementById('end-session-confirm'),

    // Session Summary Overlay Workspace
    summaryScreen: document.getElementById('summary-screen'),
    summaryBackBtn: document.getElementById('summary-back-btn'),
    summaryEndBtn: document.getElementById('summary-end-btn'),
    summaryHistoryBtn: document.getElementById('summary-history-btn'),
    savedReceiptsCount: document.getElementById('saved-receipts-count'),
    summaryWorkspace: document.getElementById('summary-workspace'),

    // History Modal
    historyModal: document.getElementById('history-modal'),
    closeHistoryBtn: document.getElementById('close-history-btn'),
    historyList: document.getElementById('history-list')
  };

  // Shared utility to format date timestamps
  const pad = (n) => String(n).padStart(2, '0');

  const formatReceiptDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hrs = date.getHours();
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} - ${pad(hrs)}:${pad(date.getMinutes())} ${ampm}`;
  };

  const formatAMPM = (dateObj) => {
    const date = new Date(dateObj);
    let hrs = date.getHours();
    const mins = date.getMinutes();
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    return `${hrs}:${pad(mins)} ${ampm}`;
  };

  const formatDurationString = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // ==========================================================================
  // AUDIO CONTROLLER (Web Audio API Synthesizer)
  // ==========================================================================
  let audioCtx = null;

  const initAudio = () => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    } catch (e) {
      console.warn("AudioContext initialization blocked:", e);
      audioCtx = null;
    }
  };

  const playSynthSound = (frequency, duration, type = 'sine', volume = 0.1) => {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { }
  };

  const playClick = () => {
    playSynthSound(1200, 0.015, 'sine', 0.04);
  };

  // satisfying paper rustling / dragging ticks
  const playRustleTick = () => {
    playSynthSound(180 + Math.random() * 80, 0.004, 'triangle', 0.02);
  };

  const playPrinterWhir = (durationMs) => {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const duration = durationMs / 1000;
      const startTime = audioCtx.currentTime;
      const endTime = startTime + duration;

      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, startTime);

      const mod = audioCtx.createOscillator();
      mod.type = 'sine';
      mod.frequency.setValueAtTime(20, startTime);

      const modGain = audioCtx.createGain();
      modGain.gain.setValueAtTime(30, startTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, startTime);
      filter.Q.setValueAtTime(2.5, startTime);

      const mainGain = audioCtx.createGain();
      mainGain.gain.setValueAtTime(0, startTime);
      mainGain.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
      mainGain.gain.setValueAtTime(0.05, endTime - 0.05);
      mainGain.gain.linearRampToValueAtTime(0, endTime);

      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1500, startTime);
      noiseFilter.Q.setValueAtTime(1.2, startTime);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.012, startTime);

      mod.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(filter);
      filter.connect(mainGain);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);

      mainGain.connect(audioCtx.destination);
      noiseGain.connect(audioCtx.destination);

      osc.start(startTime);
      mod.start(startTime);
      noise.start(startTime);

      osc.stop(endTime);
      mod.stop(endTime);
      noise.stop(endTime);
    } catch (e) { }
  };

  const playAlarm = () => {
    if (!state.soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    const time = audioCtx.currentTime;

    const playChime = (startTime, freq, duration) => {
      const osc = audioCtx.createOscillator();
      const oscHarmonic = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 1.25, startTime); // Major third

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      oscHarmonic.start(startTime);
      osc.stop(startTime + duration);
      oscHarmonic.stop(startTime + duration);
    };

    playChime(time, 587.33, 0.2); // D5
    playChime(time + 0.25, 659.25, 0.2); // E5
    playChime(time + 0.5, 783.99, 0.4); // G5
  };

  // ==========================================================================
  // LOADING / BOOT SEQUENCE
  // ==========================================================================
  const triggerLoadingAnimationAndTransition = (onComplete) => {
    // Show loading screen
    elements.loadingScreen.classList.remove('hidden');
    elements.loadingScreen.style.opacity = '1';
    elements.loadingScreen.style.pointerEvents = 'auto';
    elements.loadingStatus.textContent = 'PRINTING...';

    // Clear and build the progress grid
    elements.loadingProgressGrid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'loading-cell';
      elements.loadingProgressGrid.appendChild(cell);
    }

    const cells = elements.loadingProgressGrid.querySelectorAll('.loading-cell');
    let cellIndex = 0;

    playPrinterWhir(2800);

    const fillNextCell = () => {
      if (cellIndex < 25) {
        if (cells[cellIndex]) {
          cells[cellIndex].classList.add('filled');
        }
        playClick();
        cellIndex++;
        setTimeout(fillNextCell, 80 + Math.random() * 60);
      } else {
        setTimeout(() => {
          elements.loadingStatus.textContent = 'READY!';
          playSynthSound(600, 0.12, 'sine', 0.08);
          setTimeout(() => { playSynthSound(800, 0.2, 'sine', 0.08); }, 100);

          setTimeout(() => {
            elements.loadingScreen.style.opacity = '0';
            elements.loadingScreen.style.pointerEvents = 'none';
            setTimeout(() => {
              elements.loadingScreen.classList.add('hidden');
              if (onComplete) onComplete();
              playPrinterWhir(800);
            }, 500);
          }, 800);
        }, 300);
      }
    };

    setTimeout(fillNextCell, 300);
  };

  // Initial Boot
  triggerLoadingAnimationAndTransition(() => {
    elements.appContainer.classList.remove('hidden');
  });

  // ==========================================================================
  // TIMER DISPLAY & UPDATER
  // ==========================================================================
  const updateTimerDisplay = () => {
    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;

    elements.timerMinutes.textContent = pad(mins);
    elements.timerSeconds.textContent = pad(secs);

    // Document Title
    const activeTask = state.tasks.find(t => t.id === state.activeTaskId);
    document.title = 'Task Receipts';

    // Update LCD status lines
    if (activeTask) {
      if (state.isBreakActive) {
        // Break is running, header is updated in breakInterval
      } else {
        elements.timerTaskStatus.textContent = `Working on: ${activeTask.text}`;
      }
    } else {
      elements.timerTaskStatus.textContent = 'Choose next task';
    }

    elements.timerBreaksCount.textContent = `${state.breaksTakenCount} breaks taken`;
  };

  const setTimerDuration = (seconds, resetTotal = true) => {
    state.timeLeft = seconds;
    updateTimerDisplay();
  };

  // Sync Live Timeline Strip protruded printouts
  const renderLiveTimelineStrip = () => {
    // Show strip when play timer starts or if timelineLog has contents
    if (state.timelineLog.length > 0 || state.isRunning) {
      elements.timelineReceiptStrip.classList.remove('hidden');
    } else {
      elements.timelineReceiptStrip.classList.add('hidden');
    }

    elements.liveTimelineBlocks.innerHTML = '';

    // Spawns squares
    state.timelineLog.forEach(type => {
      const block = document.createElement('div');
      block.className = `timeline-block ${type}`;
      elements.liveTimelineBlocks.appendChild(block);
    });

    // Update start range timestamp on strip
    const pad = (n) => String(n).padStart(2, '0');
    const startHrs = state.sessionStartTimestamp.getHours();
    const startMins = state.sessionStartTimestamp.getMinutes();
    const startAmPm = startHrs >= 12 ? 'PM' : 'AM';
    const startH = (startHrs % 12) || 12;
    elements.liveTimelineRangeText.textContent = `${startH}:${pad(startMins)} ${startAmPm} Start --->`;
  };

  const startBreakTimer = () => {
    if (state.isBreakActive) return;
    state.isBreakActive = true;
    state.breakTimeLeft = 0;

    elements.timerTaskStatus.textContent = `Break · 00:00`;
    elements.timerPauseBtn.classList.add('active');
    elements.timerPlayBtn.classList.remove('active');

    state.breakInterval = setInterval(() => {
      state.breakTimeLeft++;
      state.totalBreakSeconds++;

      const mins = Math.floor(state.breakTimeLeft / 60);
      const secs = state.breakTimeLeft % 60;
      elements.timerTaskStatus.textContent = `Break · ${pad(mins)}:${pad(secs)}`;

      state.minuteTimerCounter++;
      if (state.minuteTimerCounter >= 60) {
        state.minuteTimerCounter = 0;
        playPrinterWhir(300);
        state.timelineLog.push('break');
        renderLiveTimelineStrip();
      }
    }, 1000);
  };

  const stopBreakTimer = () => {
    if (!state.isBreakActive) return;
    state.isBreakActive = false;
    clearInterval(state.breakInterval);

    state.breaksTakenCount++;
    elements.timerBreaksCount.textContent = `${state.breaksTakenCount} breaks taken`;
    elements.timerPauseBtn.classList.remove('active');
  };

  const startTimer = () => {
    // User can only start the timer if they have an active task selected!
    if (!state.activeTaskId) {
      playSynthSound(300, 0.15, 'sawtooth', 0.06);
      alert('Please add or select a task first before starting the timer!');
      return;
    }

    if (state.isRunning) return;
    initAudio();

    if (state.isBreakActive) {
      stopBreakTimer();
    }

    state.isRunning = true;
    elements.timerPlayBtn.classList.add('active');
    elements.timerPauseBtn.classList.remove('active');

    // Trigger printing sound and slide timeline strip
    playPrinterWhir(600);
    renderLiveTimelineStrip();

    state.timerInterval = setInterval(() => {
      state.timeLeft++;
      state.totalFocusSeconds++;

      state.minuteTimerCounter++;
      if (state.minuteTimerCounter >= 60) {
        state.minuteTimerCounter = 0;
        playPrinterWhir(300);
        state.timelineLog.push('focus');
        renderLiveTimelineStrip();
      }

      updateTimerDisplay();
    }, 1000);
  };

  const pauseTimer = () => {
    if (!state.isRunning) return;
    state.isRunning = false;
    clearInterval(state.timerInterval);

    elements.timerPlayBtn.classList.remove('active');
    elements.timerPauseBtn.classList.add('active');
    updateTimerDisplay();

    // Automatically trigger break timer
    startBreakTimer();
  };

  // ==========================================================================
  // TASK PLANNER & FILTER category SWITCHER (ONGOING / DONE)
  // ==========================================================================
  const loadTasksFromStorage = () => {
    try {
      const saved = localStorage.getItem('tr_tasks');
      if (saved) {
        state.tasks = JSON.parse(saved);
        // Look for existing ongoing/active task
        const active = state.tasks.find(t => !t.completed);
        if (active) {
          state.activeTaskId = active.id;
        }
      }
    } catch (e) {
      console.warn("Storage read failed:", e);
      state.tasks = [];
    }

    try {
      const savedHistory = localStorage.getItem('tr_history_receipts');
      if (savedHistory) {
        state.historyReceipts = JSON.parse(savedHistory);
      } else {
        state.historyReceipts = [];
      }
    } catch (e) {
      console.warn("History read failed:", e);
      state.historyReceipts = [];
    }

    elements.savedReceiptsCount.textContent = state.historyReceipts.length;
    renderTasks();
  };

  const saveTasksToStorage = () => {
    try {
      localStorage.setItem('tr_tasks', JSON.stringify(state.tasks));
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  };

  const renderTasks = () => {
    elements.tasksList.innerHTML = '';

    // Filter tasks based on selected tab: ongoing vs completed (done)
    const filteredTasks = state.tasks.filter(task => {
      if (state.currentTaskTab === 'ongoing') {
        return !task.completed;
      } else {
        return task.completed;
      }
    });

    if (filteredTasks.length === 0) {
      if (state.currentTaskTab === 'ongoing') {
        elements.tasksList.innerHTML = '<li class="empty-state">No tasks yet. Hit + to add one.</li>';
      } else {
        elements.tasksList.innerHTML = '<li class="empty-state">No completed tasks yet.</li>';
      }
      return;
    }

    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.dataset.id = task.id;
      if (task.completed) li.classList.add('completed');
      if (task.id === state.activeTaskId) li.classList.add('active');

      li.innerHTML = `
        <div class="task-info">
          <div class="task-checkbox" data-action="toggle"></div>
          <span class="task-text">${task.text}</span>
        </div>
        <button class="task-delete-btn" data-action="delete" aria-label="Delete Task">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      elements.tasksList.appendChild(li);
    });

    // Check if ongoing task receipt should be shown
    updateActiveReceiptPaperState();
    updateTimerDisplay();
  };

  const updateActiveReceiptPaperState = () => {
    // Check if there is an active ongoing task
    let taskToDisplay = state.tasks.find(t => t.id === state.activeTaskId && !t.completed);

    // If no active ongoing task, show the last completed task (if any exists in the session)
    if (!taskToDisplay) {
      const completedTasks = state.tasks.filter(t => t.completed);
      if (completedTasks.length > 0) {
        // Sort by completedTime descending to show the most recently completed one
        completedTasks.sort((a, b) => new Date(b.completedTime) - new Date(a.completedTime));
        taskToDisplay = completedTasks[0];
      }
    }

    if (taskToDisplay) {
      elements.activeReceiptPaper.classList.remove('hidden');
      elements.activeReceiptTaskTitle.textContent = taskToDisplay.text;

      const createdDate = new Date(taskToDisplay.createdTime || Date.now());
      // Date string in serif: e.g. 6/8/2026, 7:12:49 PM
      const dateStr = `${createdDate.getMonth() + 1}/${createdDate.getDate()}/${createdDate.getFullYear()}, ${createdDate.getHours() % 12 || 12}:${pad(createdDate.getMinutes())}:${pad(createdDate.getSeconds())} ${createdDate.getHours() >= 12 ? 'PM' : 'AM'}`;
      elements.activeReceiptTimestamp.textContent = dateStr;

      if (taskToDisplay.completed) {
        elements.activeReceiptSignoffPlaceholder.classList.add('hidden');
        elements.activeReceiptSignoffPrinted.classList.remove('hidden');
        elements.activeReceiptTimelineMini.classList.remove('hidden');

        // Draw image onto active receipt canvas
        const activeSignoffCtx = elements.activeReceiptSignoffCanvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          activeSignoffCtx.clearRect(0, 0, 280, 180);
          activeSignoffCtx.drawImage(img, 0, 0, 280, 180);
        };
        img.src = taskToDisplay.signoffImage;

        // Populate mini timeline
        const completedDate = new Date(taskToDisplay.completedTime || Date.now());
        const startTimeStr = formatAMPM(createdDate);
        const endTimeStr = formatAMPM(completedDate);

        const durationMs = completedDate.getTime() - createdDate.getTime();
        const durationMins = Math.max(1, Math.round(durationMs / 60000));

        elements.activeReceiptMiniBlocks.textContent = Array(durationMins).fill('■').join(' ');
        elements.activeReceiptMiniEndtime.textContent = endTimeStr;
        elements.activeReceiptMiniStarttime.textContent = `${startTimeStr} Start --->`;
      } else {
        elements.activeReceiptSignoffPlaceholder.classList.remove('hidden');
        elements.activeReceiptSignoffPrinted.classList.add('hidden');
        elements.activeReceiptTimelineMini.classList.add('hidden');
      }
    } else {
      elements.activeReceiptPaper.classList.add('hidden');
    }

    // Toggle Summary triggers
    const completedTasksExist = state.tasks.some(t => t.completed);
    elements.sessionSummaryTriggerBtn.disabled = !completedTasksExist;
  };

  const addTask = (text) => {
    if (!text.trim()) return;

    // RULE: User can add ONLY ONE task at a time (1 active ongoing task)
    const hasOngoing = state.tasks.some(t => !t.completed);
    if (hasOngoing) {
      playSynthSound(300, 0.2, 'sawtooth', 0.06);
      alert('You already have an ongoing task! Complete it or delete it before adding another.');
      return;
    }

    const newTask = {
      id: 'task_' + Date.now(),
      text: text.trim(),
      completed: false,
      createdTime: new Date(),
      signoffImage: null
    };

    state.tasks.push(newTask);
    state.activeTaskId = newTask.id;
    saveTasksToStorage();

    // Switch filter category to ongoing to display the task
    state.currentTaskTab = 'ongoing';
    elements.tabOngoing.classList.add('active');
    elements.tabDone.classList.remove('active');

    renderTasks();
    playClick();

    // Whir slot for printing task header
    playPrinterWhir(600);
  };

  const deleteTask = (id) => {
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (state.activeTaskId === id) {
      state.activeTaskId = null;
    }
    saveTasksToStorage();
    renderTasks();
    playClick();
  };

  // ==========================================================================
  // SIGN-OFF POP-UP MODAL (Webcam Ordered Dithering / Draw Pad)
  // ==========================================================================
  let modalSignatureCtx = null;
  let isSignatureDrawing = false;
  let lastSigPoint = null;

  const initSignoffCanvases = () => {
    modalSignatureCtx = elements.modalSignatureCanvas.getContext('2d');
    modalSignatureCtx.lineWidth = 6;
    modalSignatureCtx.lineCap = 'round';
    modalSignatureCtx.lineJoin = 'round';
    modalSignatureCtx.strokeStyle = '#3b3b3aff';

    // Set background to solid white
    modalSignatureCtx.fillStyle = '#ffffff';
    modalSignatureCtx.fillRect(0, 0, elements.modalSignatureCanvas.width, elements.modalSignatureCanvas.height);
  };

  const openSignoffModal = () => {
    pauseTimer();
    elements.signOffModal.classList.remove('hidden');
    initSignoffCanvases();

    // Default mode: Photo webcam
    switchSignoffMode('photo');
    playClick();
  };

  const closeSignoffModal = () => {
    elements.signOffModal.classList.add('hidden');
    stopWebcamStream();
    playClick();
  };

  const switchSignoffMode = (modeName) => {
    state.signoffMode = modeName;

    if (modeName === 'photo') {
      elements.togglePhotoModeBtn.classList.add('active');
      elements.toggleDrawModeBtn.classList.remove('active');

      document.getElementById('webcam-view-container').classList.remove('hidden');
      document.getElementById('signature-view-container').classList.add('hidden');

      elements.iconRetake.classList.remove('hidden');
      elements.iconTrash.classList.add('hidden');

      startWebcamStream();
    } else {
      elements.togglePhotoModeBtn.classList.remove('active');
      elements.toggleDrawModeBtn.classList.add('active');

      document.getElementById('webcam-view-container').classList.add('hidden');
      document.getElementById('signature-view-container').classList.remove('hidden');

      elements.iconRetake.classList.add('hidden');
      elements.iconTrash.classList.remove('hidden');

      stopWebcamStream();
      clearSignatureCanvas();
    }
  };

  // Webcam stream handlers
  const startWebcamStream = () => {
    if (state.webcamStream) return;

    elements.cameraErrorMessage.classList.add('hidden');
    elements.webcamVideo.classList.remove('hidden');
    elements.webcamDitherCanvas.classList.add('hidden');
    state.isPhotoCaptured = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Webcam access failed: mediaDevices API not supported or secure context required.');
      elements.cameraErrorMessage.classList.remove('hidden');
      elements.webcamVideo.classList.add('hidden');
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
      audio: false
    })
      .then(stream => {
        state.webcamStream = stream;
        elements.webcamVideo.srcObject = stream;
        elements.webcamVideo.play();
      })
      .catch(err => {
        console.warn('Webcam access failed: ', err);
        elements.cameraErrorMessage.classList.remove('hidden');
        elements.webcamVideo.classList.add('hidden');
      });
  };

  const stopWebcamStream = () => {
    if (state.webcamStream) {
      state.webcamStream.getTracks().forEach(track => track.stop());
      state.webcamStream = null;
    }
  };

  const capturePhoto = () => {
    if (!state.webcamStream || state.isPhotoCaptured) return;

    const v = elements.webcamVideo;
    const canvas = elements.webcamDitherCanvas;
    const ctx = canvas.getContext('2d');

    // Draw current video frame to canvas
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

    // Freeze view: hide video, show canvas
    v.classList.add('hidden');
    canvas.classList.remove('hidden');
    state.isPhotoCaptured = true;

    // Camera click
    playSynthSound(1000, 0.05, 'triangle', 0.05);
  };

  const retakePhoto = () => {
    state.isPhotoCaptured = false;
    elements.webcamVideo.classList.remove('hidden');
    elements.webcamDitherCanvas.classList.add('hidden');

    const canvas = elements.webcamDitherCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const applyDitherFilterToCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const bayerMatrix = [
      [15, 195, 60, 240],
      [135, 75, 180, 120],
      [45, 225, 30, 210],
      [165, 105, 150, 90]
    ];

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Grayscale conversion
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        const mx = x % 4;
        const my = y % 4;
        const threshold = bayerMatrix[my][mx];

        const color = gray < threshold ? 0 : 255;

        data[idx] = color;
        data[idx + 1] = color;
        data[idx + 2] = color;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  // Signature canvas handlers
  const getSigCanvasCoords = (e) => {
    const rect = elements.modalSignatureCanvas.getBoundingClientRect();
    const scaleX = elements.modalSignatureCanvas.width / rect.width;
    const scaleY = elements.modalSignatureCanvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startSigDrawing = (e) => {
    e.preventDefault();
    isSignatureDrawing = true;
    const pt = getSigCanvasCoords(e);
    lastSigPoint = pt;
    modalSignatureCtx.beginPath();
    modalSignatureCtx.moveTo(pt.x, pt.y);
  };

  const sigDrawMove = (e) => {
    if (!isSignatureDrawing) return;
    e.preventDefault();
    const pt = getSigCanvasCoords(e);

    modalSignatureCtx.beginPath();
    modalSignatureCtx.moveTo(lastSigPoint.x, lastSigPoint.y);
    modalSignatureCtx.lineTo(pt.x, pt.y);
    modalSignatureCtx.stroke();

    lastSigPoint = pt;
  };

  const stopSigDrawing = () => {
    isSignatureDrawing = false;
  };

  const clearSignatureCanvas = () => {
    modalSignatureCtx.fillStyle = '#ffffff';
    modalSignatureCtx.fillRect(0, 0, elements.modalSignatureCanvas.width, elements.modalSignatureCanvas.height);
  };

  // Submit sign off
  const submitSignoff = () => {
    let imgDataUrl = null;

    if (state.signoffMode === 'photo') {
      if (!state.isPhotoCaptured) {
        alert('Please capture a photo first!');
        return;
      }

      // Apply dithering to the captured canvas image!
      const canvas = elements.webcamDitherCanvas;
      applyDitherFilterToCanvas(canvas);

      imgDataUrl = canvas.toDataURL('image/png');
    } else {
      // Apply dithering to the signature canvas!
      const canvas = elements.modalSignatureCanvas;
      applyDitherFilterToCanvas(canvas);

      // Copy signature (let's resize it to fit active size)
      imgDataUrl = canvas.toDataURL('image/png');
    }

    // Assign to active task
    let completedTaskObj = null;
    state.tasks = state.tasks.map(task => {
      if (task.id === state.activeTaskId) {
        state.tasksCompletedCount++;
        // Add completion square to timeline log
        state.timelineLog.push('task-complete');
        completedTaskObj = {
          ...task,
          completed: true,
          signoffImage: imgDataUrl,
          completedTime: new Date()
        };
        return completedTaskObj;
      }
      return task;
    });

    if (completedTaskObj) {
      // Add to persistent history
      const historyRecord = {
        id: 'hist_' + Date.now(),
        text: completedTaskObj.text,
        createdTime: completedTaskObj.createdTime,
        completedTime: completedTaskObj.completedTime,
        signoffImage: completedTaskObj.signoffImage,
        sessionName: state.sessionName
      };
      state.historyReceipts.push(historyRecord);
      try {
        localStorage.setItem('tr_history_receipts', JSON.stringify(state.historyReceipts));
      } catch (e) {
        console.warn("History save failed:", e);
      }
      elements.savedReceiptsCount.textContent = state.historyReceipts.length;
    }

    saveTasksToStorage();
    closeSignoffModal();

    // Play printing whirr to represent final signature printed on receipt
    playPrinterWhir(1500);
    renderLiveTimelineStrip();

    // Switch to done tab to show completed task lists
    state.currentTaskTab = 'done';
    elements.tabDone.classList.add('active');
    elements.tabOngoing.classList.remove('active');

    // Reset active tasks ID
    state.activeTaskId = null;
    renderTasks();
  };

  // ==========================================================================
  // SESSION SUMMARY WORKSPACE (Tactile Stacked Draggable receipts)
  // ==========================================================================

  // Custom Drag helper supporting mouse and touch
  const makeReceiptDraggable = (cardElement) => {
    let isDragging = false;
    let startX, startY;
    let cardLeft, cardTop;

    const handleDragStart = (e) => {
      isDragging = true;
      cardElement.style.cursor = 'grabbing';

      // Put dragged item on top
      state.activeZIndex++;
      cardElement.style.zIndex = state.activeZIndex;

      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      startX = clientX;
      startY = clientY;

      cardLeft = parseInt(cardElement.style.left, 10) || 0;
      cardTop = parseInt(cardElement.style.top, 10) || 0;

      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);

      playRustleTick();
    };

    const handleDragMove = (e) => {
      if (!isDragging) return;
      e.preventDefault(); // prevent touch page scrolling

      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      const dx = clientX - startX;
      const dy = clientY - startY;

      cardElement.style.left = (cardLeft + dx) + 'px';
      cardElement.style.top = (cardTop + dy) + 'px';

      // Satisfying periodic friction tick sounds
      if (Math.random() < 0.08) {
        playRustleTick();
      }
    };

    const handleDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      cardElement.style.cursor = 'grab';

      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);

      playRustleTick();
    };

    cardElement.addEventListener('mousedown', handleDragStart);
    cardElement.addEventListener('touchstart', handleDragStart);
  };

  // Build the draggable receipts stack
  const renderSummaryWorkspaceDraggables = () => {
    // Clear previously spawned draggable receipt card elements (keep the summary tray!)
    const oldCards = elements.summaryWorkspace.querySelectorAll('.workspace-receipt-card');
    oldCards.forEach(c => c.remove());

    state.activeZIndex = 100;
    const board = elements.summaryWorkspace;
    const boardWidth = board.clientWidth || window.innerWidth;
    const boardHeight = board.clientHeight || (window.innerHeight - 64);

    if (state.currentSummaryView === 'summary') {
      // 1. Current Session Summary mode: Center the metal tray, and stack current active session's task receipts + overall stats receipt on it
      elements.summaryWorkspace.classList.remove('hide-tray');
      elements.summaryHistoryBtn.innerHTML = `See all receipts (${state.historyReceipts.length}) →`;

      // Spawns completed task receipts of the current active session only
      const completedTasks = state.tasks.filter(t => t.completed && new Date(t.completedTime) >= state.sessionStartTimestamp);

      completedTasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = 'workspace-receipt-card';

        const angle = (Math.random() * 8 - 4).toFixed(1); // -4deg to 4deg
        const scaleFactor = boardWidth < 600 ? 0.4 : 1.0;
        const offsetX = Math.floor((Math.random() * 100 - 50) * scaleFactor);
        const offsetY = Math.floor((Math.random() * 60 - 30) * scaleFactor);

        card.style.transform = `rotate(${angle}deg) scale(0.78)`;

        // Center on top of the centered metallic tray
        const initialLeft = Math.floor(boardWidth / 2 - 160 + offsetX);
        const initialTop = Math.floor(boardHeight / 2 - 275 + offsetY);
        card.style.left = `${initialLeft}px`;
        card.style.top = `${initialTop}px`;
        card.style.zIndex = 100 + index;

        const createdDate = new Date(task.createdTime || Date.now());
        const completedDate = new Date(task.completedTime || Date.now());

        // Format date string: e.g. 6/8/2026, 7:12:49 PM
        const dateStr = `${createdDate.getMonth() + 1}/${createdDate.getDate()}/${createdDate.getFullYear()}, ${createdDate.getHours() % 12 || 12}:${pad(createdDate.getMinutes())}:${pad(createdDate.getSeconds())} ${createdDate.getHours() >= 12 ? 'PM' : 'AM'}`;

        const startTimeStr = formatAMPM(createdDate);
        const endTimeStr = formatAMPM(completedDate);

        const durationMs = completedDate.getTime() - createdDate.getTime();
        const durationMins = Math.max(1, Math.round(durationMs / 60000));
        const miniBlocksHtml = Array(durationMins).fill('■').join(' ');

        card.innerHTML = `
          <div class="receipt-paper task-receipt printed-feed shadow-md">
            <div class="paper-edge-tear top"></div>
            <div class="receipt-header center-align">
              <h2 class="task-receipt-title">TASK RECIPETS</h2>
              <p class="task-receipt-subtitle">${task.text}</p>
              <div class="task-receipt-timestamp">${dateStr}</div>
            </div>
            <div class="divider-dashed"></div>
            <div class="receipt-signoff-section">
              <div class="signoff-printed">
                <img src="${task.signoffImage}" style="width:262px;height:168px;display:block;" draggable="false">
              </div>
            </div>
            <div class="divider-dashed"></div>
            <div class="receipt-timeline-mini">
              <div class="mini-timeline-row">
                <span class="mini-blocks">${miniBlocksHtml}</span>
                <span class="mini-endtime">${endTimeStr}</span>
                <span class="mini-focus-percent">100% on task</span>
              </div>
              <div class="mini-quote">
                "Done is the new tomorrow."
              </div>
              <div class="mini-meta-row">
                <span class="mini-starttime">${startTimeStr} Start ---></span>
                <span class="mini-scale">1 square = 1 minutes</span>
              </div>
            </div>
            <div class="paper-edge-tear bottom"></div>
          </div>
        `;

        board.appendChild(card);
        makeReceiptDraggable(card);
      });

      // Spawns the main Overall Session stats Receipt stacked on top of completed task receipts
      const statsCard = document.createElement('div');
      statsCard.className = 'workspace-receipt-card';

      const angle = (Math.random() * 6 - 3).toFixed(1);
      statsCard.style.transform = `rotate(${angle}deg) scale(0.78)`;

      // Center directly on top of the centered tray
      const statsLeft = Math.floor(boardWidth / 2 - 160);
      const statsTop = Math.floor(boardHeight / 2 - 275);
      statsCard.style.left = `${statsLeft}px`;
      statsCard.style.top = `${statsTop}px`;
      statsCard.style.zIndex = 100 + completedTasks.length;

      const now = new Date();
      const totalWorkingSecs = state.totalFocusSeconds + state.totalBreakSeconds;
      const onTaskPercent = totalWorkingSecs > 0 ? Math.round((state.totalFocusSeconds / totalWorkingSecs) * 100) : 100;
      const sessionLengthSecs = Math.floor((now.getTime() - state.sessionStartTimestamp.getTime()) / 1000);

      let timelineBlocksHtml = '';
      if (state.timelineLog.length === 0) {
        timelineBlocksHtml = '<span class="empty-state">No duration logged.</span>';
      } else {
        state.timelineLog.forEach(type => {
          timelineBlocksHtml += `<div class="timeline-block ${type}"></div>`;
        });
      }

      statsCard.innerHTML = `
        <div id="printable-summary-receipt" class="receipt-paper printed-feed shadow-lg">
          <div class="paper-edge-tear top"></div>

          <div class="receipt-header center-align">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" draggable="false" style="margin: 0 auto 12px auto; display: block; color: var(--receipt-text);">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
            <h1 class="font-receipt font-bold">SESSION SUMMARY</h1>
            <p class="receipt-subtitle">SESSION: ${state.sessionName.toUpperCase()}</p>
            <div class="receipt-timestamp">${formatReceiptDate(now)}</div>
          </div>

          <div class="divider-dashed"></div>

          <div class="receipt-table font-receipt">
            <div class="table-row">
              <span class="label">Tasks done</span>
              <span class="leader"></span>
              <span class="value">${state.tasksCompletedCount}</span>
            </div>
            <div class="table-row">
              <span class="label">Total focus</span>
              <span class="leader"></span>
              <span class="value">${formatDurationString(state.totalFocusSeconds)}</span>
            </div>
            <div class="table-row">
              <span class="label">Total break</span>
              <span class="leader"></span>
              <span class="value">${formatDurationString(state.totalBreakSeconds)}</span>
            </div>
            <div class="table-row">
              <span class="label">Session length</span>
              <span class="leader"></span>
              <span class="value">${formatDurationString(sessionLengthSecs)}</span>
            </div>
            <div class="table-row">
              <span class="label">On task</span>
              <span class="leader"></span>
              <span class="value">${onTaskPercent}%</span>
            </div>
          </div>

          <div class="divider-dashed"></div>

          <div class="receipt-timeline font-receipt">
            <span class="receipt-section-label">FOCUS TIMELINE:</span>
            
            <div class="timeline-visual-grid">
              ${timelineBlocksHtml}
            </div>
            
            <div class="timeline-meta-rows">
              <div class="meta-row">
                <span>${elements.liveTimelineRangeText.textContent} ${pad(now.getHours() % 12 || 12)}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'} End</span>
              </div>
              <div class="meta-row text-secondary">
                <span>Legend: ■ Focused | ⬚ Break | ▨ Task Complete</span>
              </div>
            </div>
          </div>

          <div class="divider-dashed"></div>
          
          <p class="receipt-footer center-align font-receipt">
            THANK YOU FOR FOCUSING!<br>
            MADE WITH ♥
          </p>

          <div class="paper-edge-tear bottom"></div>
        </div>
      `;

      board.appendChild(statsCard);
      makeReceiptDraggable(statsCard);

      playPrinterWhir(1600);

    } else {
      // 2. All History mode: Hide the metal tray, and render previous/history receipts scattered on the board
      elements.summaryWorkspace.classList.add('hide-tray');
      elements.summaryHistoryBtn.innerHTML = `← Back to summary`;

      state.historyReceipts.forEach((receipt, index) => {
        const card = document.createElement('div');
        card.className = 'workspace-receipt-card';

        // Wider random rotation and distribution across the workspace desk
        const angle = (Math.random() * 16 - 8).toFixed(1); // -8deg to 8deg
        const scaleFactor = boardWidth < 600 ? 0.3 : 1.0;
        const offsetX = Math.floor((Math.random() * 260 - 130) * scaleFactor);
        const offsetY = Math.floor((Math.random() * 160 - 80) * scaleFactor);

        card.style.transform = `rotate(${angle}deg) scale(0.78)`;

        // Centered-ish but widely spread across the board
        const initialLeft = Math.floor(boardWidth / 2 - 160 + offsetX);
        const initialTop = Math.floor(boardHeight / 2 - 275 + offsetY);
        card.style.left = `${initialLeft}px`;
        card.style.top = `${initialTop}px`;
        card.style.zIndex = 100 + index;

        const createdDate = new Date(receipt.createdTime || Date.now());
        const completedDate = new Date(receipt.completedTime || Date.now());

        // Format date string: e.g. 6/8/2026, 7:12:49 PM
        const dateStr = `${createdDate.getMonth() + 1}/${createdDate.getDate()}/${createdDate.getFullYear()}, ${createdDate.getHours() % 12 || 12}:${pad(createdDate.getMinutes())}:${pad(createdDate.getSeconds())} ${createdDate.getHours() >= 12 ? 'PM' : 'AM'}`;

        const startTimeStr = formatAMPM(createdDate);
        const endTimeStr = formatAMPM(completedDate);

        const durationMs = completedDate.getTime() - createdDate.getTime();
        const durationMins = Math.max(1, Math.round(durationMs / 60000));
        const miniBlocksHtml = Array(durationMins).fill('■').join(' ');

        card.innerHTML = `
          <div class="receipt-paper task-receipt printed-feed shadow-md">
            <div class="paper-edge-tear top"></div>
            <div class="receipt-header center-align">
              <h2 class="task-receipt-title">TASK RECIPETS</h2>
              <p class="task-receipt-subtitle">${receipt.text}</p>
              <div class="task-receipt-timestamp">${dateStr}</div>
            </div>
            <div class="divider-dashed"></div>
            <div class="receipt-signoff-section">
              <div class="signoff-printed">
                <img src="${receipt.signoffImage}" style="width:262px;height:168px;display:block;" draggable="false">
              </div>
            </div>
            <div class="divider-dashed"></div>
            <div class="receipt-timeline-mini">
              <div class="mini-timeline-row">
                <span class="mini-blocks">${miniBlocksHtml}</span>
                <span class="mini-endtime">${endTimeStr}</span>
                <span class="mini-focus-percent">100% on task</span>
              </div>
              <div class="mini-quote">
                "Done is the new tomorrow."
              </div>
              <div class="mini-meta-row">
                <span class="mini-starttime">${startTimeStr} Start ---></span>
                <span class="mini-scale">1 square = 1 minutes</span>
              </div>
            </div>
            <div class="paper-edge-tear bottom"></div>
          </div>
        `;

        board.appendChild(card);
        makeReceiptDraggable(card);
      });

      playPrinterWhir(1000);
    }
  };

  const triggerSessionSummaryScreen = () => {
    pauseTimer();
    state.currentSummaryView = 'summary'; // Reset to default summary view
    elements.summaryScreen.classList.remove('hidden');
    elements.appContainer.classList.add('hidden');
    renderSummaryWorkspaceDraggables();
  };

  // ==========================================================================
  // END SESSION & RESET POP-UP HANDLERS
  // ==========================================================================
  const showEndSessionConfirmation = () => {
    elements.endSessionModal.classList.remove('hidden');
    playClick();
  };

  const cancelEndSession = () => {
    elements.endSessionModal.classList.add('hidden');
    playClick();
  };

  const endSessionConfirmReset = () => {
    // Clear states
    state.timeLeft = 0;
    state.isRunning = false;
    clearInterval(state.timerInterval);
    state.isBreakActive = false;
    state.breakTimeLeft = 0;
    clearInterval(state.breakInterval);
    state.breaksTakenCount = 0;

    state.sessionName = 'UNTITLED';
    elements.sessionNameInput.value = 'UNTITLED';
    state.sessionStartTimestamp = new Date();
    elements.activeReceiptTimestamp.textContent = formatReceiptDate(state.sessionStartTimestamp);

    state.totalFocusSeconds = 0;
    state.totalBreakSeconds = 0;
    state.tasksCompletedCount = 0;
    state.minuteTimerCounter = 0;
    state.timelineLog = [];

    // Clear active tasks, session history, and local storage
    state.activeTaskId = null;
    state.tasks = [];
    state.historyReceipts = [];
    try {
      localStorage.removeItem('tr_tasks');
      localStorage.removeItem('tr_history_receipts');
    } catch (e) {
      console.warn("Storage clear failed:", e);
    }

    elements.savedReceiptsCount.textContent = '0';

    // Hide modals and return
    elements.endSessionModal.classList.add('hidden');
    elements.summaryScreen.classList.add('hidden');

    // Load app via loading transition
    triggerLoadingAnimationAndTransition(() => {
      elements.appContainer.classList.remove('hidden');
    });

    renderTasks();
    updateTimerDisplay();
    renderLiveTimelineStrip();

    playSynthSound(500, 0.4, 'sine', 0.08);
  };

  // ==========================================================================
  // EVENT LISTENERS CONFIGURATION
  // ==========================================================================
  const initEventListeners = () => {

    // Theme toggle
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('amber-retro');
        playClick();
      });
    }

    // Sound toggle
    if (elements.soundToggleBtn) {
      elements.soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) {
          elements.soundToggleBtn.querySelector('.icon-sound-on').classList.remove('hidden');
          elements.soundToggleBtn.querySelector('.icon-sound-off').classList.add('hidden');
          playClick();
        } else {
          elements.soundToggleBtn.querySelector('.icon-sound-on').classList.add('hidden');
          elements.soundToggleBtn.querySelector('.icon-sound-off').classList.remove('hidden');
        }
      });
    }

    // Help modal toggle
    if (elements.helpTriggerBtn && elements.helpModal) {
      elements.helpTriggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.helpModal.classList.remove('hidden');
        playClick();
      });
    }

    if (elements.closeHelpBtn && elements.helpModal) {
      elements.closeHelpBtn.addEventListener('click', () => {
        elements.helpModal.classList.add('hidden');
        playClick();
      });
    }

    // Session rename
    elements.sessionNameInput.addEventListener('change', (e) => {
      state.sessionName = e.target.value.trim() || 'UNTITLED';
      elements.sessionNameInput.value = state.sessionName;
      playClick();
    });

    // Timer Actions
    elements.timerPlayBtn.addEventListener('click', () => {
      playClick();
      if (!state.isRunning) {
        startTimer();
      }
    });

    elements.timerPauseBtn.addEventListener('click', () => {
      playClick();
      if (state.isRunning) {
        pauseTimer();
      }
    });

    elements.timerCompleteBtn.addEventListener('click', () => {
      playClick();
      if (state.activeTaskId) {
        openSignoffModal();
      }
    });

    // Tasks category tab switchers (Ongoing / Done)
    elements.tabOngoing.addEventListener('click', () => {
      state.currentTaskTab = 'ongoing';
      elements.tabOngoing.classList.add('active');
      elements.tabDone.classList.remove('active');
      renderTasks();
      playClick();
    });

    elements.tabDone.addEventListener('click', () => {
      state.currentTaskTab = 'done';
      elements.tabOngoing.classList.remove('active');
      elements.tabDone.classList.add('active');
      renderTasks();
      playClick();
    });

    // Tasks inputs
    elements.addTaskToggleBtn.addEventListener('click', () => {
      elements.newTaskFormContainer.classList.toggle('hidden');
      elements.taskInput.focus();
      playClick();
    });

    elements.cancelTaskBtn.addEventListener('click', () => {
      elements.newTaskFormContainer.classList.add('hidden');
      elements.taskInput.value = '';
      playClick();
    });

    elements.submitTaskBtn.addEventListener('click', () => {
      const text = elements.taskInput.value.trim();
      if (text) {
        addTask(text);
        elements.taskInput.value = '';
        elements.newTaskFormContainer.classList.add('hidden');
      }
    });

    elements.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = elements.taskInput.value.trim();
        if (text) {
          addTask(text);
          elements.taskInput.value = '';
          elements.newTaskFormContainer.classList.add('hidden');
        }
      }
    });

    // Click inside tasks list (Complete triggers or deletion)
    elements.tasksList.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li || li.classList.contains('empty-state')) return;
      const id = li.dataset.id;

      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'toggle') {
        if (!li.classList.contains('completed')) {
          state.activeTaskId = id;
          openSignoffModal();
        }
      } else if (action === 'delete') {
        deleteTask(id);
      } else {
        // select active ongoing task
        if (!li.classList.contains('completed')) {
          state.activeTaskId = id;
          renderTasks();
          playClick();
        }
      }
    });

    // Sign-off Modal Toggle modes (Webcam vs Hand Drawn)
    elements.togglePhotoModeBtn.addEventListener('click', () => switchSignoffMode('photo'));
    elements.toggleDrawModeBtn.addEventListener('click', () => switchSignoffMode('draw'));

    // Close modal
    elements.signoffModalCloseBtn.addEventListener('click', closeSignoffModal);

    // Camera Shutter Button
    elements.shutterBtn.addEventListener('click', () => {
      playClick();
      if (!state.isPhotoCaptured) {
        capturePhoto();
      } else {
        retakePhoto();
      }
    });

    // Signature pad drawing event listeners
    elements.modalSignatureCanvas.addEventListener('mousedown', startSigDrawing);
    elements.modalSignatureCanvas.addEventListener('mousemove', sigDrawMove);
    elements.modalSignatureCanvas.addEventListener('mouseup', stopSigDrawing);
    elements.modalSignatureCanvas.addEventListener('mouseleave', stopSigDrawing);
    // Touch signature
    elements.modalSignatureCanvas.addEventListener('touchstart', startSigDrawing);
    elements.modalSignatureCanvas.addEventListener('touchmove', sigDrawMove);
    elements.modalSignatureCanvas.addEventListener('touchend', stopSigDrawing);

    // Refresh photo or Clear signature
    elements.signoffActionBtn.addEventListener('click', () => {
      playClick();
      if (state.signoffMode === 'photo') {
        stopWebcamStream();
        startWebcamStream();
      } else {
        clearSignatureCanvas();
      }
    });

    // Submit Sign-off
    elements.signoffSubmitBtn.addEventListener('click', submitSignoff);

    // Main Tray Session summary trigger
    elements.sessionSummaryTriggerBtn.addEventListener('click', triggerSessionSummaryScreen);

    // Toggle between summary tray and history workspace views
    elements.summaryHistoryBtn.addEventListener('click', () => {
      playClick();
      if (state.currentSummaryView === 'summary') {
        state.currentSummaryView = 'all-receipts';
      } else {
        state.currentSummaryView = 'summary';
      }
      renderSummaryWorkspaceDraggables();
    });

    // Summary overlays
    elements.summaryBackBtn.addEventListener('click', () => {
      playClick();
      elements.summaryScreen.classList.add('hidden');
      triggerLoadingAnimationAndTransition(() => {
        elements.appContainer.classList.remove('hidden');
      });
    });

    elements.summaryEndBtn.addEventListener('click', showEndSessionConfirmation);

    // Reset Dialogue confirmation handlers
    elements.endSessionCancel.addEventListener('click', cancelEndSession);
    elements.endSessionConfirm.addEventListener('click', endSessionConfirmReset);
  };

  // Run initializers
  loadTasksFromStorage();
  initEventListeners();
  updateTimerDisplay();

  // Ensure default timer displays 00:00 (Casio Idle Display) if no task selected
  setTimerDuration(0, true);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
