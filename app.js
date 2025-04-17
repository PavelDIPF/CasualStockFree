// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Состояние приложения
const state = {
    user: null,
    clickerCount: 0,
    lastSaved: null,
    activatedCodes: []
};

// DOM элементы
const elements = {
    screens: {
        auth: document.getElementById('auth-screen'),
        register: document.getElementById('register-screen'),
        main: document.getElementById('main-screen')
    },
    auth: {
        loginBtn: document.getElementById('login-btn'),
        registerBtn: document.getElementById('register-btn'),
        backToLoginBtn: document.getElementById('back-to-login-btn'),
        completeRegisterBtn: document.getElementById('complete-register-btn'),
        loginUsername: document.getElementById('login-username'),
        loginPassword: document.getElementById('login-password'),
        regUsername: document.getElementById('reg-username'),
        regPassword: document.getElementById('reg-password'),
        regConfirm: document.getElementById('reg-confirm')
    },
    main: {
        usernameDisplay: document.getElementById('username-display'),
        logoutBtn: document.getElementById('logout-btn'),
        clickerCounter: document.querySelector('.clicker-counter'),
        clickerBtn: document.querySelector('.clicker-btn'),
        saveScoreBtn: document.getElementById('save-score-btn'),
        lastSaved: document.getElementById('last-saved'),
        codeInput: document.getElementById('code-input'),
        activateCodeBtn: document.getElementById('activate-code-btn'),
        codeStatuses: document.querySelectorAll('.code-status')
    }
};

// Имитация базы данных (в реальном приложении нужно заменить на API)
const mockDB = {
    users: [],
    scores: {},
    userCodes: {}
};

// Инициализация приложения
function initApp() {
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('csf_user');
    if (savedUser) {
        state.user = JSON.parse(savedUser);
        showMainScreen();
    } else {
        showAuthScreen();
    }

    // Восстанавливаем счетчик из localStorage
    const savedCount = localStorage.getItem('csf_clicker_count');
    if (savedCount) {
        state.clickerCount = parseInt(savedCount);
        updateCounter();
    }

    // Восстанавливаем последнее сохранение
    const savedLastSaved = localStorage.getItem('csf_last_saved');
    if (savedLastSaved) {
        state.lastSaved = new Date(savedLastSaved);
        updateLastSaved();
    }

    // Восстанавливаем активированные коды
    const savedCodes = localStorage.getItem('csf_activated_codes');
    if (savedCodes) {
        state.activatedCodes = JSON.parse(savedCodes);
        updateCodeStatuses();
    }

    setupEventListeners();
}

// Показать экран авторизации
function showAuthScreen() {
    hideAllScreens();
    elements.screens.auth.classList.add('active');
}

// Показать экран регистрации
function showRegisterScreen() {
    hideAllScreens();
    elements.screens.register.classList.add('active');
}

// Показать основной экран
function showMainScreen() {
    hideAllScreens();
    elements.screens.main.classList.add('active');
    if (state.user) {
        elements.main.usernameDisplay.textContent = state.user.username;
    }
}

// Скрыть все экраны
function hideAllScreens() {
    Object.values(elements.screens).forEach(screen => {
        screen.classList.remove('active');
    });
}

// Обновить счетчик кликера
function updateCounter() {
    elements.main.clickerCounter.textContent = state.clickerCount;
}

// Обновить информацию о последнем сохранении
function updateLastSaved() {
    if (state.lastSaved) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        elements.main.lastSaved.textContent = `Последнее сохранение: ${state.lastSaved.toLocaleDateString('ru-RU', options)}`;
    }
}

// Обновить статусы кодов
function updateCodeStatuses() {
    elements.main.codeStatuses.forEach(el => {
        const code = el.parentElement.querySelector('h3').textContent;
        if (state.activatedCodes.includes(code)) {
            el.textContent = 'Активирован';
            el.style.color = 'green';
        } else {
            el.textContent = 'Не активирован';
            el.style.color = 'var(--tg-hint-color)';
        }
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Авторизация
    elements.auth.loginBtn.addEventListener('click', handleLogin);
    elements.auth.registerBtn.addEventListener('click', () => showRegisterScreen());
    elements.auth.backToLoginBtn.addEventListener('click', () => showAuthScreen());
    elements.auth.completeRegisterBtn.addEventListener('click', handleRegister);
    
    // Основной экран
    elements.main.logoutBtn.addEventListener('click', handleLogout);
    elements.main.clickerBtn.addEventListener('click', handleClick);
    elements.main.saveScoreBtn.addEventListener('click', saveScore);
    elements.main.activateCodeBtn.addEventListener('click', activateCode);
}

// Обработчик входа
function handleLogin() {
    const username = elements.auth.loginUsername.value.trim();
    const password = elements.auth.loginPassword.value.trim();
    
    if (!username || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Имитация проверки пользователя
    const user = mockDB.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        state.user = user;
        localStorage.setItem('csf_user', JSON.stringify(user));
        showMainScreen();
    } else {
        alert('Неверный логин или пароль');
    }
}

// Обработчик регистрации
function handleRegister() {
    const username = elements.auth.regUsername.value.trim();
    const password = elements.auth.regPassword.value.trim();
    const confirm = elements.auth.regConfirm.value.trim();
    
    if (!username || !password || !confirm) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    if (password !== confirm) {
        alert('Пароли не совпадают');
        return;
    }
    
    if (mockDB.users.some(u => u.username === username)) {
        alert('Пользователь с таким именем уже существует');
        return;
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: Date.now().toString(),
        username,
        password,
        tgUserId: tg.initDataUnsafe.user?.id || null
    };
    
    mockDB.users.push(newUser);
    state.user = newUser;
    localStorage.setItem('csf_user', JSON.stringify(newUser));
    showMainScreen();
}

// Обработчик выхода
function handleLogout() {
    state.user = null;
    localStorage.removeItem('csf_user');
    showAuthScreen();
}

// Обработчик клика
function handleClick() {
    state.clickerCount++;
    updateCounter();
    localStorage.setItem('csf_clicker_count', state.clickerCount.toString());
}

// Сохранение счета
function saveScore() {
    if (!state.user) return;
    
    // Имитация сохранения на сервере
    mockDB.scores[state.user.id] = {
        score: state.clickerCount,
        date: new Date()
    };
    
    state.lastSaved = new Date();
    localStorage.setItem('csf_last_saved', state.lastSaved.toString());
    updateLastSaved();
    
    // В реальном приложении здесь должен быть вызов API
    tg.showAlert(`Счет ${state.clickerCount} сохранен!`);
}

// Активация кода
function activateCode() {
    const code = elements.main.codeInput.value.trim().toUpperCase();
    
    if (!code) {
        tg.showAlert('Введите код');
        return;
    }
    
    // Проверяем, активирован ли уже код
    if (state.activatedCodes.includes(code)) {
        tg.showAlert('Этот код уже активирован');
        return;
    }
    
    // Имитируем проверку кода
    const validCodes = ['CSF2024', 'FREECLIENT'];
    if (validCodes.includes(code)) {
        state.activatedCodes.push(code);
        localStorage.setItem('csf_activated_codes', JSON.stringify(state.activatedCodes));
        updateCodeStatuses();
        tg.showAlert(`Код "${code}" успешно активирован!`);
        elements.main.codeInput.value = '';
        
        // Применяем бонусы кодов
        applyCodeBonus(code);
    } else {
        tg.showAlert('Неверный код');
    }
}

// Применение бонусов кодов
function applyCodeBonus(code) {
    switch(code) {
        case 'CSF2024':
            state.clickerCount += 1000;
            updateCounter();
            break;
        case 'FREECLIENT':
            // Здесь можно добавить логику временного множителя
            tg.showAlert('x2 множитель активирован на 1 час!');
            break;
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
