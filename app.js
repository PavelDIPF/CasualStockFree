// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Состояние
const state = {
    score: 0,
    lastSaved: null,
    activatedCodes: []
};

// DOM
const elements = {
    clickerCounter: document.querySelector('.clicker-counter'),
    clickerBtn: document.querySelector('.clicker-btn'),
    saveBtn: document.getElementById('save-score-btn'),
    lastSaved: document.getElementById('last-saved'),
    rouletteWheel: document.getElementById('roulette-wheel'),
    spinBtn: document.getElementById('spin-btn'),
    rouletteResult: document.getElementById('roulette-result'),
    codeInput: document.getElementById('code-input'),
    activateCodeBtn: document.getElementById('activate-code-btn'),
    themeToggle: document.getElementById('theme-toggle')
};

// Инициализация
function init() {
    loadState();
    setupEventListeners();
    render();
}

// Загрузка состояния
function loadState() {
    const saved = localStorage.getItem('csf_state');
    if (saved) {
        Object.assign(state, JSON.parse(saved));
    }
}

// Сохранение состояния
function saveState() {
    localStorage.setItem('csf_state', JSON.stringify(state));
}

// Рендер
function render() {
    elements.clickerCounter.textContent = state.score;
    elements.lastSaved.textContent = state.lastSaved 
        ? `Сохранено: ${new Date(state.lastSaved).toLocaleString()}` 
        : 'Не сохранено';
}

// Обработчики
function setupEventListeners() {
    // Кликер
    elements.clickerBtn.addEventListener('click', () => {
        state.score++;
        render();
        saveState();
    });

    // Сохранение
    elements.saveBtn.addEventListener('click', () => {
        state.lastSaved = new Date().toISOString();
        render();
        saveState();
        tg.showAlert(`Счет ${state.score} сохранен!`);
    });

    // Рулетка
    elements.spinBtn.addEventListener('click', spinRoulette);

    // Активация кода
    elements.activateCodeBtn.addEventListener('click', activateCode);

    // Переключение темы
    elements.themeToggle.addEventListener('click', toggleTheme);
}

// Рулетка
function spinRoulette() {
    if (state.score < 100) {
        tg.showAlert('Нужно минимум 100 очков!');
        return;
    }

    state.score -= 100;
    render();

    const prizes = [
        { text: 'x2 множитель!', effect: () => state.score *= 2 },
        { text: '+500 очков!', effect: () => state.score += 500 },
        { text: 'x0.5 множитель :(', effect: () => state.score = Math.floor(state.score * 0.5) },
        { text: '+1000 очков!', effect: () => state.score += 1000 },
        { text: 'JACKPOT! +5000', effect: () => state.score += 5000 }
    ];

    elements.spinBtn.disabled = true;
    let spins = 0;
    const maxSpins = 20 + Math.floor(Math.random() * 10);
    const spinInterval = setInterval(() => {
        spins++;
        const offset = spins % 5;
        elements.rouletteWheel.style.transform = `translateX(-${offset * 70}px)`;

        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            elements.spinBtn.disabled = false;
            const prizeIndex = Math.floor(Math.random() * prizes.length);
            const prize = prizes[prizeIndex];
            prize.effect();
            elements.rouletteResult.textContent = prize.text;
            render();
            saveState();
        }
    }, 100);
}

// Активация кода
function activateCode() {
    const code = elements.codeInput.value.trim().toUpperCase();
    if (!code) return;

    const validCodes = {
        'CSF2024': () => { state.score += 1000; },
        'FREECLIENT': () => { tg.showAlert('x2 множитель на 1 час!'); }
    };

    if (validCodes[code]) {
        validCodes[code]();
        elements.codeInput.value = '';
        render();
        saveState();
        tg.showAlert(`Код "${code}" активирован!`);
    } else {
        tg.showAlert('Неверный код');
    }
}

// Переключение темы
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = elements.themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

// Запуск
document.addEventListener('DOMContentLoaded', init);
