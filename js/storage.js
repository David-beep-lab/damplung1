// Local storage backend - can be swapped for Firebase
const STORAGE_KEYS = {
  users: 'sh_users',
  currentUser: 'sh_currentUser',
  favorites: 'sh_favorites',
  likes: 'sh_likes',
  superLikes: 'sh_superLikes',
  passed: 'sh_passed',
  chats: 'sh_chats',
  profiles: 'sh_profiles',
  notifications: 'sh_notifications',
  invites: 'sh_invites',
  startups: 'sh_startups',
  analytics: 'sh_analytics'
};

function getNotifications(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
    return (all[userId] || []).sort((a, b) => b.ts - a.ts);
  } catch { return []; }
}

function addNotification(userId, msg, type, fromUserId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
  if (!all[userId]) all[userId] = [];
  all[userId].push({ id: Date.now() + Math.random(), msg, type, fromUserId, ts: Date.now(), read: false });
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(all));
}

function markNotificationsRead(userId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
  if (all[userId]) all[userId].forEach(n => n.read = true);
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(all));
}

function getUnreadCount(userId) {
  return getNotifications(userId).filter(n => !n.read).length;
}

function getUsers() {
  try {
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
    if (users.length === 0) {
      users = seedDemoUsers();
      saveUsers(users);
    }
    return users;
  } catch {
    return [];
  }
}

function seedDemoUsers() {
  const demos = [
    { id: 'demo1', email: 'alex@demo.com', password: 'demo', username: 'alex', userType: 'talent', role: ['full-stack-developer'], focus: ['ai'], createdAt: Date.now() - 86400000 },
    { id: 'demo2', email: 'maria@demo.com', password: 'demo', username: 'maria', userType: 'talent', role: ['ui-designer', 'ux-designer'], focus: ['saas'], createdAt: Date.now() - 86400000 },
    { id: 'demo3', email: 'techstart@demo.com', password: 'demo', username: 'techstart', userType: 'startup', role: ['product-manager'], focus: ['ai'], createdAt: Date.now() - 86400000 },
    { id: 'demo4', email: 'ivan@demo.com', password: 'demo', username: 'ivan', userType: 'talent', role: ['digital-marketer'], focus: ['mobile-apps'], createdAt: Date.now() - 86400000 },
    { id: 'demo5', email: 'saasco@demo.com', password: 'demo', username: 'saasco', userType: 'startup', role: ['backend-developer'], focus: ['saas'], createdAt: Date.now() - 86400000 }
  ];
  const profiles = {
    demo1: { bio: 'Full-stack developer, 5+ years. Passionate about AI/ML.', status: 'Looking for startup', tags: ['React', 'Node', 'AI'], location: 'Berlin', timezone: 'Europe/Berlin', github: 'alexdev', linkedin: 'alex', portfolio: 'alex.dev', skills: ['React', 'Node.js', 'Python'], experience: '5 years', projects: ['AI Tool'], startupStage: '', fundingStage: '', teamSize: '', salaryExpectation: '', interests: ['AI', 'SaaS'] },
    demo2: { bio: 'UI/UX designer. Clean, modern interfaces.', status: 'Open to projects', tags: ['Figma', 'SaaS', 'Design'], location: 'Kyiv', timezone: 'Europe/Kyiv', github: 'mariadesign', skills: ['Figma', 'UI', 'UX'], experience: '3 years', interests: ['Design', 'SaaS'] },
    demo3: { bio: 'AI startup at MVP stage. Building smart automation tools.', status: 'MVP', needs: 'Developer, Designer', tags: ['AI', 'Startup'], startupStage: 'MVP', fundingStage: 'Bootstrapped', teamSize: '2', description: 'AI automation platform' },
    demo4: { bio: 'Growth marketer. B2B & B2C experience.', status: 'Available', tags: ['Marketing', 'Mobile'], skills: ['Marketing', 'Growth'], experience: '4 years' },
    demo5: { bio: 'B2B SaaS platform for teams. Seed stage.', status: 'Seed', needs: 'Marketing, Sales', tags: ['SaaS', 'B2B'], startupStage: 'Seed', fundingStage: 'Seed', teamSize: '5' }
  };
  localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(profiles));
  return demos;
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || '{}');
  } catch {
    return {};
  }
}

function saveProfile(userId, profile) {
  const profiles = getProfiles();
  profiles[userId] = { ...profiles[userId], ...profile, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(profiles));
}

function getProfile(userId) {
  return getProfiles()[userId] || {};
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || 'null');
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function getFavorites(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '{}');
    return all[userId] || [];
  } catch {
    return [];
  }
}

function addFavorite(userId, targetId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '{}');
  if (!all[userId]) all[userId] = [];
  if (!all[userId].includes(targetId)) all[userId].push(targetId);
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(all));
}

function removeFavorite(userId, targetId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '{}');
  if (all[userId]) all[userId] = all[userId].filter(id => id !== targetId);
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(all));
}

function getLikes(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.likes) || '{}');
    return all[userId] || [];
  } catch {
    return [];
  }
}

function addLike(userId, targetId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.likes) || '{}');
  if (!all[userId]) all[userId] = [];
  if (!all[userId].includes(targetId)) all[userId].push(targetId);
  localStorage.setItem(STORAGE_KEYS.likes, JSON.stringify(all));
}

function removeLike(userId, targetId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.likes) || '{}');
  if (all[userId]) all[userId] = all[userId].filter(id => id !== targetId);
  localStorage.setItem(STORAGE_KEYS.likes, JSON.stringify(all));
}

function getSuperLikes(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.superLikes) || '{}');
    return all[userId] || [];
  } catch { return []; }
}

function addSuperLike(userId, targetId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.superLikes) || '{}');
  if (!all[userId]) all[userId] = [];
  if (!all[userId].includes(targetId)) all[userId].push(targetId);
  localStorage.setItem(STORAGE_KEYS.superLikes, JSON.stringify(all));
}

function removeSuperLike(userId, targetId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.superLikes) || '{}');
  if (all[userId]) all[userId] = all[userId].filter(id => id !== targetId);
  localStorage.setItem(STORAGE_KEYS.superLikes, JSON.stringify(all));
}

function getPassed(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.passed) || '{}');
    return all[userId] || [];
  } catch { return []; }
}

function addPassed(userId, targetId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.passed) || '{}');
  if (!all[userId]) all[userId] = [];
  if (!all[userId].includes(targetId)) all[userId].push(targetId);
  localStorage.setItem(STORAGE_KEYS.passed, JSON.stringify(all));
}

function removePassed(userId, targetId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.passed) || '{}');
  if (all[userId]) all[userId] = all[userId].filter(id => id !== targetId);
  localStorage.setItem(STORAGE_KEYS.passed, JSON.stringify(all));
}

function getMatches(userId) {
  const likes = getLikes(userId);
  const superLikes = getSuperLikes(userId);
  const allLikes = [...new Set([...likes, ...superLikes])];
  const matches = [];
  allLikes.forEach(likedId => {
    const theirLikes = getLikes(likedId);
    const theirSuper = getSuperLikes(likedId);
    const theirAll = [...new Set([...theirLikes, ...theirSuper])];
    if (theirAll.includes(userId)) matches.push(likedId);
  });
  return matches;
}

function getInvites(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.invites) || '{}');
    return all[userId] || [];
  } catch { return []; }
}

function addInvite(fromUserId, toUserId, startupId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.invites) || '{}');
  if (!all[toUserId]) all[toUserId] = [];
  const exists = all[toUserId].find(i => i.from === fromUserId && i.startupId === startupId);
  if (!exists) {
    all[toUserId].push({ id: Date.now(), from: fromUserId, startupId, status: 'pending', ts: Date.now() });
    localStorage.setItem(STORAGE_KEYS.invites, JSON.stringify(all));
  }
}

function updateInviteStatus(userId, inviteId, status) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.invites) || '{}');
  if (all[userId]) {
    const inv = all[userId].find(i => i.id == inviteId);
    if (inv) inv.status = status;
    localStorage.setItem(STORAGE_KEYS.invites, JSON.stringify(all));
  }
}

function getStartups() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.startups) || '{}');
  } catch { return {}; }
}

function getStartup(startupId) {
  return getStartups()[startupId] || null;
}

function saveStartup(startup) {
  const all = getStartups();
  all[startup.id] = { ...all[startup.id], ...startup, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEYS.startups, JSON.stringify(all));
}

function getAnalytics(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.analytics) || '{}');
    return all[userId] || { profileViews: 0, likesReceived: 0, matches: 0, responseRate: 0 };
  } catch { return { profileViews: 0, likesReceived: 0, matches: 0, responseRate: 0 }; }
}

function incrementProfileView(userId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.analytics) || '{}');
  if (!all[userId]) all[userId] = { profileViews: 0, likesReceived: 0, matches: 0 };
  all[userId].profileViews = (all[userId].profileViews || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(all));
}

function incrementLikesReceived(userId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.analytics) || '{}');
  if (!all[userId]) all[userId] = { profileViews: 0, likesReceived: 0, matches: 0 };
  all[userId].likesReceived = (all[userId].likesReceived || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(all));
}

function getChats(userId) {
  const matches = [];
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.chats) || '{}');
    Object.keys(all).forEach(key => {
      if (key.includes(userId)) matches.push(key);
    });
    return matches;
  } catch {
    return [];
  }
}

function getChatBetween(userId1, userId2) {
  const key = [userId1, userId2].sort().join('_');
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.chats) || '{}');
    return all[key] || [];
  } catch {
    return [];
  }
}

function addChatMessage(userId1, userId2, msg) {
  const key = [userId1, userId2].sort().join('_');
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.chats) || '{}');
  if (!all[key]) all[key] = [];
  all[key].push({ ...msg, id: Date.now() + Math.random(), read: false });
  localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(all));
}

function markChatRead(userId1, userId2) {
  const key = [userId1, userId2].sort().join('_');
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.chats) || '{}');
  if (all[key]) {
    all[key].filter(m => m.from !== userId1).forEach(m => m.read = true);
    localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(all));
  }
}

window.localStorageBackend = {
  getUsers, saveUsers, getProfiles, getProfile, saveProfile, getCurrentUser, setCurrentUser,
  getLikes, addLike, removeLike, getSuperLikes, addSuperLike, removeSuperLike, getPassed, addPassed, removePassed,
  getFavorites, addFavorite, removeFavorite, getChatBetween, addChatMessage,
  getNotifications, addNotification, markNotificationsRead, getUnreadCount,
  getMatches
};
