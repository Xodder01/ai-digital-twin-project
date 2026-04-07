// CHAT LOGIC
function handleChatEnter(e) {
    if (e.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    // Append user message
    appendMessage(message, 'user-message');
    input.value = '';

    const payload = {
        message: message,
        metrics: {
            sleep_hours: parseFloat(document.getElementById('sleep').value),
            study_hours: parseFloat(document.getElementById('study').value),
            screen_time_hours: parseFloat(document.getElementById('screen').value),
            stress_level: parseFloat(document.getElementById('stress').value)
        }
    };

    // Append thinking...
    const aiBox = document.getElementById('chatBox');
    const thinking = document.createElement('div');
    thinking.className = 'chat-message ai-message';
    thinking.innerText = 'Analyzing patterns...';
    aiBox.appendChild(thinking);
    aiBox.scrollTop = aiBox.scrollHeight;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        aiBox.removeChild(thinking);
        appendMessage(data.reply || data.error, 'ai-message');
        speakText(data.reply || data.error);
    } catch (e) {
        if (thinking.parentNode) aiBox.removeChild(thinking);
        appendMessage('Error reaching Digital Twin.', 'ai-message');
    }
}

async function uploadSyllabus() {
    const fileInput = document.getElementById('syllabusUpload');
    const file = fileInput.files[0];
    if (!file) return;

    appendMessage("Uploading syllabus: " + file.name + "...", 'user-message');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload_syllabus', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            appendMessage("✅ " + data.message, 'ai-message');
            speakText("I have ingested your study material. You can now ask me to test you on it.");
            // Show the PDF Badge Visual UI
            const badge = document.getElementById('pdfBadge');
            const nameEl = document.getElementById('pdfName');
            if (badge && nameEl) {
                badge.style.display = 'flex';
                const shortName = file.name.length > 20 ? file.name.substring(0, 15) + '...pdf' : file.name;
                nameEl.textContent = '📄 ' + shortName;
            }
        } else {
            throw new Error(data.error);
        }
    } catch (e) {
        appendMessage("⚠️ Failed to upload syllabus: " + e.message, 'ai-message');
    }

    fileInput.value = '';
}

function appendMessage(text, className) {
    const box = document.getElementById('chatBox');
    const msg = document.createElement('div');
    msg.className = `chat-message ${className}`;
    msg.innerText = text;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
}

// TODO LOGIC
let todos = JSON.parse(localStorage.getItem('ai_twin_todos')) || [];

function saveTodos() { localStorage.setItem('ai_twin_todos', JSON.stringify(todos)); }

function renderTodos() {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    todos.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = `task-item ${todo.done ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" style="margin-right: 10px; cursor: pointer;" ${todo.done ? 'checked' : ''} onchange="toggleTodo(${idx})">
            <span class="task-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${idx})">×</button>
        `;
        list.appendChild(li);
    });
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    if (text) {
        todos.push({ text, done: false });
        input.value = '';
        saveTodos();
        renderTodos();
    }
}

function toggleTodo(idx) {
    todos[idx].done = !todos[idx].done;
    saveTodos();
    renderTodos();
}

function deleteTodo(idx) {
    todos.splice(idx, 1);
    saveTodos();
    renderTodos();
}

// DATE LOGIC
let dates = JSON.parse(localStorage.getItem('ai_twin_dates')) || [];
function saveDates() { localStorage.setItem('ai_twin_dates', JSON.stringify(dates)); }

function renderDates() {
    const list = document.getElementById('dateList');
    list.innerHTML = '';
    // Sort chronologically
    dates.sort((a, b) => new Date(a.date) - new Date(b.date));

    dates.forEach((d, idx) => {
        const li = document.createElement('li');
        li.className = `task-item`;
        li.innerHTML = `
            <span class="task-text" style="color: var(--primary); font-weight: bold; flex: 0 0 100px;">${d.date}</span>
            <span class="task-text">${d.name}</span>
            <button class="delete-btn" onclick="deleteDate(${idx})">×</button>
        `;
        list.appendChild(li);
    });
}

function addDate() {
    const name = document.getElementById('dateName').value.trim();
    const date = document.getElementById('dateDate').value;
    if (name && date) {
        dates.push({ name, date });
        document.getElementById('dateName').value = '';
        document.getElementById('dateDate').value = '';
        saveDates();
        renderDates();
    }
}

function deleteDate(idx) {
    dates.splice(idx, 1);
    saveDates();
    renderDates();
}

// --- VOICE INTERFACE LOGIC ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

// Global array to cache voices
let availableVoices = [];

function populateVoiceList() {
    if (!window.speechSynthesis) return;
    availableVoices = window.speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect || availableVoices.length === 0) return;

    voiceSelect.innerHTML = '';
    availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        option.style.backgroundColor = '#1e1e1e';
        option.style.color = '#ffffff';

        // Auto-select English hyper-realistic Neural voices (Edge), Google, or Zira as default
        if ((voice.name.includes('Neural') || voice.name.includes('Aria') || voice.name.includes('Google') || voice.name.includes('Microsoft Zira')) && voice.lang.includes('en')) {
            option.selected = true;
        } else if (voice.lang === 'en-US' || voice.lang === 'en-GB') {
            // Fallback to any English voice if no premium ones are found
            if (!voiceSelect.querySelector('option[selected]')) {
                option.selected = true;
            }
        }
        voiceSelect.appendChild(option);
    });
}

// Load voices as soon as they are available
if (window.speechSynthesis) {
    populateVoiceList();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
}

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = function () {
        isRecording = true;
        document.getElementById('micBtn').classList.add('mic-active');
        // Instantly mute the AI if the user starts speaking over it
        window.speechSynthesis.cancel();
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('chatInput');
        input.value = transcript;
        // Auto send what was just transcribed
        setTimeout(() => sendChatMessage(), 500);
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error", event.error);
        stopRecording();
    };

    recognition.onend = function () {
        stopRecording();
    };
}

function stopRecording() {
    isRecording = false;
    document.getElementById('micBtn').classList.remove('mic-active');
    if (recognition) recognition.stop();
}

function toggleVoice() {
    if (!SpeechRecognition) {
        alert("Your browser does not support Web Speech API Voice Recognition.");
        return;
    }
    if (isRecording) {
        stopRecording();
    } else {
        recognition.start();
    }
}

function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Strip markdown formatting (*, #) and emojis to make J.A.R.V.I.S read cleanly
    const regexEmojis = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
    const cleanText = text.replace(/[*_#>`]/g, '').replace(regexEmojis, '');

    // BUGFIX: Chromium browsers cut off audio after 15 seconds automatically.
    // Solution: Split the massive text into smaller sentences and enqueue them seamlessly!
    const sentences = cleanText.split(/(?<=[.!?])\s+/);

    sentences.forEach(sentence => {
        if (!sentence.trim()) return;

        // Reduce TTS pauses by stripping commas and trailing periods/punctuation before speaking
        let textToSpeak = sentence.trim().replace(/[,;\-:]/g, ' ').replace(/[.!?]+$/, '');

        let synthUtterance = new SpeechSynthesisUtterance(textToSpeak);
        synthUtterance.rate = 1.05;
        synthUtterance.pitch = 0.9;

        const voiceSelect = document.getElementById('voiceSelect');
        if (voiceSelect && availableVoices.length > 0) {
            const selectedIndex = voiceSelect.value;
            if (availableVoices[selectedIndex]) {
                synthUtterance.voice = availableVoices[selectedIndex];
            }
        } else {
            const preferredVoice = availableVoices.find(v => (v.name.includes("Neural") || v.name.includes("Aria") || v.name.includes("Google") || v.name.includes("Zira")) && v.lang.includes('en')) || availableVoices.find(v => v.lang.includes('en'));
            if (preferredVoice) synthUtterance.voice = preferredVoice;
        }

        // Store globally to prevent Javascript Garbage Collector from deleting it mid-sentence
        window.speechSynthesis.speak(synthUtterance);
    });
}

// TAB NAVIGATION LOGIC
function switchTab(tabId) {
    // Hide all tabs
    document.getElementById('tab-playground').style.display = 'none';
    document.getElementById('tab-analytics').style.display = 'none';
    document.getElementById('tab-settings').style.display = 'none';

    // Remove active class from nav
    document.getElementById('nav-playground').classList.remove('active');
    document.getElementById('nav-analytics').classList.remove('active');
    document.getElementById('nav-settings').classList.remove('active');

    // Show selected tab and set active
    document.getElementById('nav-' + tabId).classList.add('active');
    document.getElementById('tab-' + tabId).style.display = (tabId === 'playground') ? 'flex' : 'block';

    // Update headers
    const headers = {
        'playground': 'Explore Digital Twin Models',
        'analytics': 'Deep Analytics Engine',
        'settings': 'Twin Configuration'
    };
    document.getElementById('mainHeader').innerText = headers[tabId];
}

// INITIALIZATION
window.onload = () => {
    renderTodos();
    renderDates();
};
