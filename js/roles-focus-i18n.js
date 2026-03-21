// Roles and Focus translations - loaded after i18n.js
const ROLES_FOCUS_I18N = {
  en: {
    selectRoles: "Select roles",
    selectFocus: "Select focus / industry",
    roles: {
      developer: "Developer", designer: "Designer", marketer: "Marketer", pm: "Product Manager",
      founder: "Founder", "co-founder": "Co-Founder", "startup-ceo": "Startup CEO", cto: "CTO",
      "product-manager": "Product Manager", "project-manager": "Project Manager",
      "frontend-developer": "Frontend Developer", "backend-developer": "Backend Developer", "full-stack-developer": "Full Stack Developer",
      "mobile-developer": "Mobile Developer", "ios-developer": "iOS Developer", "android-developer": "Android Developer",
      "ai-engineer": "AI Engineer", "ml-engineer": "Machine Learning Engineer", "data-scientist": "Data Scientist", "data-analyst": "Data Analyst",
      "devops-engineer": "DevOps Engineer", "cloud-engineer": "Cloud Engineer", "cybersecurity-specialist": "Cybersecurity Specialist",
      "ui-designer": "UI Designer", "ux-designer": "UX Designer", "product-designer": "Product Designer", "graphic-designer": "Graphic Designer",
      "motion-designer": "Motion Designer", "3d-designer": "3D Designer", "game-developer": "Game Developer", "game-designer": "Game Designer",
      "qa-engineer": "QA Engineer", "test-automation-engineer": "Test Automation Engineer",
      "marketing-specialist": "Marketing Specialist", "growth-hacker": "Growth Hacker", "digital-marketer": "Digital Marketer",
      "performance-marketer": "Performance Marketer", "seo-specialist": "SEO Specialist", "content-marketer": "Content Marketer", "smm-manager": "SMM Manager",
      "sales-manager": "Sales Manager", "bd-manager": "Business Development Manager", "finance-manager": "Finance Manager", "startup-advisor": "Startup Advisor",
      recruiter: "Recruiter", "hr-manager": "HR Manager", "community-manager": "Community Manager",
      "nocode-developer": "No-Code Developer", "webflow-developer": "Webflow Developer", "bubble-developer": "Bubble Developer",
      "blockchain-developer": "Blockchain Developer", "web3-developer": "Web3 Developer"
    },
    focus: {
      AI: "AI", SaaS: "SaaS", Mobile: "Mobile", Other: "Other",
      ai: "AI", "machine-learning": "Machine Learning", saas: "SaaS", fintech: "FinTech", crypto: "Crypto", blockchain: "Blockchain", web3: "Web3",
      healthtech: "HealthTech", biotech: "BioTech", edtech: "EdTech", ecommerce: "E-commerce", marketplace: "Marketplace",
      "mobile-apps": "Mobile Apps", "web-apps": "Web Apps", "social-network": "Social Network", gaming: "Gaming", "ar-vr": "AR / VR", iot: "IoT",
      cybersecurity: "Cybersecurity", "cloud-computing": "Cloud Computing", "big-data": "Big Data", automation: "Automation", robotics: "Robotics",
      "climate-tech": "Climate Tech", "green-energy": "Green Energy", "travel-tech": "Travel Tech", "food-tech": "Food Tech",
      proptech: "PropTech", "legal-tech": "Legal Tech", agritech: "AgriTech", "sports-tech": "Sports Tech", "media-tech": "Media Tech", "creator-economy": "Creator Economy"
    }
  },
  ru: {
    selectRoles: "Выберите роли",
    selectFocus: "Выберите фокус / индустрию",
    roles: {
      developer: "Разработчик", designer: "Дизайнер", marketer: "Маркетолог", pm: "Продакт-менеджер",
      founder: "Фаундер", "co-founder": "Сооснователь", "startup-ceo": "CEO стартапа", cto: "CTO",
      "product-manager": "Продакт-менеджер", "project-manager": "Проджект-менеджер",
      "frontend-developer": "Frontend-разработчик", "backend-developer": "Backend-разработчик", "full-stack-developer": "Full Stack разработчик",
      "mobile-developer": "Mobile-разработчик", "ios-developer": "iOS-разработчик", "android-developer": "Android-разработчик",
      "ai-engineer": "AI-инженер", "ml-engineer": "ML-инженер", "data-scientist": "Data Scientist", "data-analyst": "Data Analyst",
      "devops-engineer": "DevOps-инженер", "cloud-engineer": "Cloud-инженер", "cybersecurity-specialist": "Специалист по кибербезопасности",
      "ui-designer": "UI-дизайнер", "ux-designer": "UX-дизайнер", "product-designer": "Продакт-дизайнер", "graphic-designer": "Графический дизайнер",
      "motion-designer": "Motion-дизайнер", "3d-designer": "3D-дизайнер", "game-developer": "Game-разработчик", "game-designer": "Геймдизайнер",
      "qa-engineer": "QA-инженер", "test-automation-engineer": "Инженер по тест-автоматизации",
      "marketing-specialist": "Маркетолог", "growth-hacker": "Growth Hacker", "digital-marketer": "Digital-маркетолог",
      "performance-marketer": "Performance-маркетолог", "seo-specialist": "SEO-специалист", "content-marketer": "Контент-маркетолог", "smm-manager": "SMM-менеджер",
      "sales-manager": "Менеджер по продажам", "bd-manager": "Бизнес-развитие", "finance-manager": "Финансовый менеджер", "startup-advisor": "Советник стартапов",
      recruiter: "Рекрутер", "hr-manager": "HR-менеджер", "community-manager": "Community Manager",
      "nocode-developer": "No-Code разработчик", "webflow-developer": "Webflow-разработчик", "bubble-developer": "Bubble-разработчик",
      "blockchain-developer": "Blockchain-разработчик", "web3-developer": "Web3-разработчик"
    },
    focus: {
      AI: "AI", SaaS: "SaaS", Mobile: "Mobile", Other: "Другое",
      ai: "AI", "machine-learning": "Machine Learning", saas: "SaaS", fintech: "FinTech", crypto: "Crypto", blockchain: "Blockchain", web3: "Web3",
      healthtech: "HealthTech", biotech: "BioTech", edtech: "EdTech", ecommerce: "E-commerce", marketplace: "Маркетплейс",
      "mobile-apps": "Мобильные приложения", "web-apps": "Веб-приложения", "social-network": "Соцсети", gaming: "Гейминг", "ar-vr": "AR / VR", iot: "IoT",
      cybersecurity: "Кибербезопасность", "cloud-computing": "Облачные технологии", "big-data": "Big Data", automation: "Автоматизация", robotics: "Робототехника",
      "climate-tech": "Climate Tech", "green-energy": "Зелёная энергия", "travel-tech": "Travel Tech", "food-tech": "Food Tech",
      proptech: "PropTech", "legal-tech": "Legal Tech", agritech: "AgriTech", "sports-tech": "Sports Tech", "media-tech": "Media Tech", "creator-economy": "Creator Economy"
    }
  },
  uk: {
    selectRoles: "Оберіть ролі",
    selectFocus: "Оберіть фокус / індустрію",
    roles: {
      developer: "Розробник", designer: "Дизайнер", marketer: "Маркетолог", pm: "Продакт-менеджер",
      founder: "Фаундер", "co-founder": "Співзасновник", "startup-ceo": "CEO стартапу", cto: "CTO",
      "product-manager": "Продакт-менеджер", "project-manager": "Проджект-менеджер",
      "frontend-developer": "Frontend-розробник", "backend-developer": "Backend-розробник", "full-stack-developer": "Full Stack розробник",
      "mobile-developer": "Mobile-розробник", "ios-developer": "iOS-розробник", "android-developer": "Android-розробник",
      "ai-engineer": "AI-інженер", "ml-engineer": "ML-інженер", "data-scientist": "Data Scientist", "data-analyst": "Data Analyst",
      "devops-engineer": "DevOps-інженер", "cloud-engineer": "Cloud-інженер", "cybersecurity-specialist": "Спеціаліст з кібербезпеки",
      "ui-designer": "UI-дизайнер", "ux-designer": "UX-дизайнер", "product-designer": "Продакт-дизайнер", "graphic-designer": "Графічний дизайнер",
      "motion-designer": "Motion-дизайнер", "3d-designer": "3D-дизайнер", "game-developer": "Game-розробник", "game-designer": "Геймдизайнер",
      "qa-engineer": "QA-інженер", "test-automation-engineer": "Інженер з тест-автоматизації",
      "marketing-specialist": "Маркетолог", "growth-hacker": "Growth Hacker", "digital-marketer": "Digital-маркетолог",
      "performance-marketer": "Performance-маркетолог", "seo-specialist": "SEO-спеціаліст", "content-marketer": "Контент-маркетолог", "smm-manager": "SMM-менеджер",
      "sales-manager": "Менеджер з продажів", "bd-manager": "Бізнес-розвиток", "finance-manager": "Фінансовий менеджер", "startup-advisor": "Радник стартапів",
      recruiter: "Рекрутер", "hr-manager": "HR-менеджер", "community-manager": "Community Manager",
      "nocode-developer": "No-Code розробник", "webflow-developer": "Webflow-розробник", "bubble-developer": "Bubble-розробник",
      "blockchain-developer": "Blockchain-розробник", "web3-developer": "Web3-розробник"
    },
    focus: {
      AI: "AI", SaaS: "SaaS", Mobile: "Mobile", Other: "Інше",
      ai: "AI", "machine-learning": "Machine Learning", saas: "SaaS", fintech: "FinTech", crypto: "Crypto", blockchain: "Blockchain", web3: "Web3",
      healthtech: "HealthTech", biotech: "BioTech", edtech: "EdTech", ecommerce: "E-commerce", marketplace: "Маркетплейс",
      "mobile-apps": "Мобільні додатки", "web-apps": "Веб-додатки", "social-network": "Соцмережі", gaming: "Геймінг", "ar-vr": "AR / VR", iot: "IoT",
      cybersecurity: "Кібербезпека", "cloud-computing": "Хмарні технології", "big-data": "Big Data", automation: "Автоматизація", robotics: "Робототехніка",
      "climate-tech": "Climate Tech", "green-energy": "Зелена енергія", "travel-tech": "Travel Tech", "food-tech": "Food Tech",
      proptech: "PropTech", "legal-tech": "Legal Tech", agritech: "AgriTech", "sports-tech": "Sports Tech", "media-tech": "Media Tech", "creator-economy": "Creator Economy"
    }
  }
};

if (typeof translations !== 'undefined') {
  ['en','ru','uk'].forEach(lang => {
    if (translations[lang] && ROLES_FOCUS_I18N[lang]) {
      translations[lang].auth = Object.assign(translations[lang].auth || {}, { selectRoles: ROLES_FOCUS_I18N[lang].selectRoles, selectFocus: ROLES_FOCUS_I18N[lang].selectFocus });
      translations[lang].roles = ROLES_FOCUS_I18N[lang].roles;
      translations[lang].focus = ROLES_FOCUS_I18N[lang].focus;
    }
  });
}
