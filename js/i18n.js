// Internationalization - EN, RU, UK (embedded for reliable loading)
let currentLang = localStorage.getItem('lang') || 'en';
let translations = {
  en: {
    appName: "DAMPLUNG",
    tagline: "Find your co-founder, team, and talents",
    taglineAlt: "Assemble your startup team",
    langSelect: "Language",
    getStarted: "Get Started",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    features: { title: "Why choose us", search: "Smart search", searchDesc: "Find founders and talents", filters: "Filters", filtersDesc: "By role, stage, tags", tags: "Tag search", tagsDesc: "AI, SaaS, Mobile", chat: "Direct messaging", chatDesc: "Chat in real-time", matches: "Mutual matching", matchesDesc: "Both liked? Collaborate!" },
    auth: { register: "Create Account", login: "Log In", username: "Username", usernamePlaceholder: "Your name", email: "Email", emailPlaceholder: "your@email.com", password: "Password", passwordPlaceholder: "••••••••", userType: "I am a", founder: "Founder (Startup)", talent: "Talent (Specialist)", role: "Role", roleDev: "Developer", roleDesigner: "Designer", roleMarketer: "Marketer", rolePM: "Product Manager", focus: "Focus", focusAI: "AI", focusSaaS: "SaaS", focusMobile: "Mobile", focusOther: "Other", haveAccount: "Already have an account?", noAccount: "Don't have an account?" },
    dashboard: { discover: "Discover", favorites: "Favorites", matches: "Matches", chat: "Chat", profile: "Profile", create: "Create", statsStartups: "Startups", statsTalents: "Talents", statsMatches: "Matches", createProfile: "Create Profile", inFavorites: "In favorites", noResults: "No results", loadMore: "Load more", swipeHint: "Swipe right = Like, left = Pass", noMoreCards: "No more profiles. Change filters or check back later." },
    profile: { edit: "Edit Profile", save: "Save", cancel: "Cancel", bio: "Description", bioPlaceholder: "Tell about yourself", status: "Status", statusPlaceholder: "e.g. MVP", goals: "Goals", goalsPlaceholder: "e.g. Find partners", needs: "Needs", needsPlaceholder: "e.g. Looking for devs", tags: "Tags", addTag: "Add tag", startup: "Startup", talent: "Talent", shareProfile: "Share" },
    card: { like: "Like", dislike: "Pass", rating: "Rating", viewProfile: "Profile" },
    filters: { type: "Type", all: "All", startups: "Startups", talents: "Talents", search: "Search...", sortBy: "Sort", sortAlpha: "A-Z", sortRelevance: "Relevance" },
    chat: { title: "Messages", placeholder: "Type a message...", send: "Send", noChats: "Select a conversation", matchFirst: "Match with someone first" },
    notify: { title: "Notifications", wantsToConnect: "wants to connect with you!", newMatch: "You matched with" },
    search: { profiles: "Search all profiles...", noResults: "No profiles found" },
    settings: { title: "Settings", language: "Language", theme: "Theme", themeDark: "Dark", themeLight: "Light" }
  },
  ru: {
    appName: "DAMPLUNG",
    tagline: "Найди сооснователя, команду и таланты",
    taglineAlt: "Собери команду для стартапа",
    langSelect: "Язык",
    getStarted: "Начать",
    signIn: "Войти",
    signUp: "Регистрация",
    signOut: "Выйти",
    features: { title: "Почему мы", search: "Умный поиск", searchDesc: "Находите фаундеров и таланты", filters: "Фильтры", filtersDesc: "По роли, стадии, тегам", tags: "По тегам", tagsDesc: "AI, SaaS, Mobile", chat: "Чат", chatDesc: "Общение в реальном времени", matches: "Совпадения", matchesDesc: "Оба лайкнули? Сотрудничайте!" },
    auth: { register: "Создать аккаунт", login: "Войти", username: "Имя", usernamePlaceholder: "Введите имя", email: "Email", emailPlaceholder: "your@email.com", password: "Пароль", passwordPlaceholder: "••••••••", userType: "Я", founder: "Фаундер (Стартап)", talent: "Талант (Специалист)", role: "Роль", roleDev: "Разработчик", roleDesigner: "Дизайнер", roleMarketer: "Маркетолог", rolePM: "Продакт-менеджер", focus: "Фокус", focusAI: "AI", focusSaaS: "SaaS", focusMobile: "Mobile", focusOther: "Другое", haveAccount: "Уже есть аккаунт?", noAccount: "Нет аккаунта?" },
    dashboard: { discover: "Обзор", favorites: "Избранное", matches: "Совпадения", chat: "Чаты", profile: "Профиль", create: "Создать", statsStartups: "Стартапы", statsTalents: "Таланты", statsMatches: "Совпадения", createProfile: "Создать профиль", inFavorites: "В избранном", noResults: "Ничего не найдено", loadMore: "Загрузить ещё", swipeHint: "Вправо = Лайк, влево = Пропустить", noMoreCards: "Больше нет профилей. Измените фильтры." },
    profile: { edit: "Изменить профиль", save: "Сохранить", cancel: "Отмена", bio: "Описание", bioPlaceholder: "Расскажите о себе", status: "Статус", statusPlaceholder: "Напр. MVP", goals: "Цели", goalsPlaceholder: "Напр. партнёры", needs: "Потребности", needsPlaceholder: "Напр. ищу разработчиков", tags: "Теги", addTag: "Добавить тег", startup: "Стартап", talent: "Талант", shareProfile: "Поделиться" },
    card: { like: "Лайк", dislike: "Пропустить", rating: "Рейтинг", viewProfile: "Профиль" },
    filters: { type: "Тип", all: "Все", startups: "Стартапы", talents: "Таланты", search: "Поиск...", sortBy: "Сортировка", sortAlpha: "А-Я", sortRelevance: "Релевантность" },
    chat: { title: "Сообщения", placeholder: "Введите сообщение...", send: "Отправить", noChats: "Выберите диалог", matchFirst: "Сначала найдите совпадение" },
    notify: { title: "Уведомления", wantsToConnect: "хочет связаться с вами!", newMatch: "Вы совпали с" },
    search: { profiles: "Поиск по всем профилям...", noResults: "Профили не найдены" },
    settings: { title: "Настройки", language: "Язык", theme: "Тема", themeDark: "Тёмная", themeLight: "Светлая" }
  },
  uk: {
    appName: "DAMPLUNG",
    tagline: "Знайди співзасновника, команду та таланти",
    taglineAlt: "Збери команду для стартапу",
    langSelect: "Мова",
    getStarted: "Почати",
    signIn: "Увійти",
    signUp: "Реєстрація",
    signOut: "Вийти",
    features: { title: "Чому ми", search: "Розумний пошук", searchDesc: "Знаходите фаундерів і таланти", filters: "Фільтри", filtersDesc: "За роллю, стадією, тегами", tags: "По тегах", tagsDesc: "AI, SaaS, Mobile", chat: "Чат", chatDesc: "Спілкування в реальному часі", matches: "Збіги", matchesDesc: "Обидва лайкнули? Співпрацюйте!" },
    auth: { register: "Створити акаунт", login: "Увійти", username: "Ім'я", usernamePlaceholder: "Введіть ім'я", email: "Email", emailPlaceholder: "your@email.com", password: "Пароль", passwordPlaceholder: "••••••••", userType: "Я", founder: "Фаундер (Стартап)", talent: "Талант (Спеціаліст)", role: "Роль", roleDev: "Розробник", roleDesigner: "Дизайнер", roleMarketer: "Маркетолог", rolePM: "Продакт-менеджер", focus: "Фокус", focusAI: "AI", focusSaaS: "SaaS", focusMobile: "Mobile", focusOther: "Інше", haveAccount: "Вже є акаунт?", noAccount: "Немає акаунта?" },
    dashboard: { discover: "Огляд", favorites: "Обране", matches: "Збіги", chat: "Чати", profile: "Профіль", create: "Створити", statsStartups: "Стартапи", statsTalents: "Таланти", statsMatches: "Збіги", createProfile: "Створити профіль", inFavorites: "В обраному", noResults: "Нічого не знайдено", loadMore: "Завантажити ще", swipeHint: "Вправо = Лайк, вліво = Пропустити", noMoreCards: "Більше немає профілів. Змініть фільтри." },
    profile: { edit: "Редагувати профіль", save: "Зберегти", cancel: "Скасувати", bio: "Опис", bioPlaceholder: "Розкажіть про себе", status: "Статус", statusPlaceholder: "Напр. MVP", goals: "Цілі", goalsPlaceholder: "Напр. партнери", needs: "Потреби", needsPlaceholder: "Напр. шукаю розробників", tags: "Теги", addTag: "Додати тег", startup: "Стартап", talent: "Талант", shareProfile: "Поділитися" },
    card: { like: "Лайк", dislike: "Пропустити", rating: "Рейтинг", viewProfile: "Профіль" },
    filters: { type: "Тип", all: "Усі", startups: "Стартапи", talents: "Таланти", search: "Пошук...", sortBy: "Сортування", sortAlpha: "А-Я", sortRelevance: "Релевантність" },
    chat: { title: "Повідомлення", placeholder: "Введіть повідомлення...", send: "Надіслати", noChats: "Оберіть діалог", matchFirst: "Спочатку знайдіть збіг" },
    notify: { title: "Сповіщення", wantsToConnect: "хоче зв'язатися з вами!", newMatch: "Ви збіглися з" },
    search: { profiles: "Пошук по всіх профілях...", noResults: "Профілі не знайдені" },
    settings: { title: "Налаштування", language: "Мова", theme: "Тема", themeDark: "Темна", themeLight: "Світла" }
  }
};

function getNested(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function applyTranslations(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const t = translations[lang] || translations.en;
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = getNested(t, key);
    if (val != null && typeof val === 'string') el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = getNested(t, key);
    if (val != null && typeof val === 'string') el.placeholder = val;
  });

  document.querySelectorAll('.multiselect-container').forEach(container => {
    if (container._multiselectRefresh) container._multiselectRefresh();
  });
  if (typeof onLangChange === 'function') onLangChange(lang);
}

function t(key) {
  return getNested(translations[currentLang] || translations.en, key) || key;
}

function setLang(lang) {
  currentLang = lang;
  applyTranslations(lang);
}

document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('langSelector');
  if (sel) {
    sel.value = currentLang;
    sel.addEventListener('change', () => setLang(sel.value));
  }
  applyTranslations(currentLang);
});
