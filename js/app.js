// DAMPLUNG - Main application
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof window.initFirebase === 'function') await window.initFirebase();
  init();
});

let currentUser = null;
const EMOJIS = ['😀','😊','👍','❤️','🔥','🚀','💡','✅','👋','🎉'];

function initTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}


function showLanding() {
  document.getElementById('landing').classList.add('active');
  document.getElementById('landing').style.display = 'block';
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('authButtons').style.display = 'flex';
  const nw = document.getElementById('notifWrap');
  if (nw) nw.style.display = 'none';
  const sw = document.getElementById('headerSearchWrap');
  if (sw) sw.style.display = 'none';
}

function showDashboard() {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('dashboard').classList.add('active');
  document.getElementById('authButtons').style.display = 'none';
  document.getElementById('notifWrap').style.display = 'flex';
  const sw = document.getElementById('headerSearchWrap');
  if (sw) sw.style.display = 'flex';
  loadDashboard();
  updateNotifications();
}

function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  initTheme();
  bindAuth();
  bindDashboard();
  bindProfile();
  bindChat();
  bindNotifications();
  bindHeaderSearch();
  bindOnboarding();
  currentUser = getCurrentUser();
  if (currentUser) {
    if (!localStorage.getItem('onboarding_done')) window.showOnboarding?.();
    else showDashboard();
  } else showLanding();

  window.addEventListener('hashchange', () => {
    const m = location.hash.match(/^#?user\/(.+)/);
    if (m && currentUser) {
      const user = getUsers().find(u => u.username && u.username.toLowerCase() === m[1].toLowerCase());
      if (user) openProfilePreview(user.id);
    }
  });
  if (location.hash.match(/^#?user\//) && currentUser) {
    const m = location.hash.match(/^#?user\/(.+)/);
    const user = getUsers().find(u => u.username && u.username.toLowerCase() === m[1].toLowerCase());
    if (user) setTimeout(() => openProfilePreview(user.id), 500);
  }
}

function bindAuth() {
  const modal = document.getElementById('authModal');
  const form = document.getElementById('authForm');
  let isLogin = true;

  document.getElementById('btnSignIn')?.addEventListener('click', () => {
    isLogin = true;
    document.getElementById('authModalTitle').textContent = t('auth.login');
    document.getElementById('authSubmitBtn').textContent = t('auth.login');
    document.getElementById('usernameGroup').style.display = 'none';
    document.getElementById('userTypeGroup').style.display = 'none';
    document.getElementById('roleGroup').style.display = 'none';
    document.getElementById('focusGroup').style.display = 'none';
    document.getElementById('authToggleText').textContent = t('auth.noAccount') + ' ';
    document.getElementById('authToggleLink').textContent = t('auth.signUp');
    modal.classList.add('active');
  });

  document.getElementById('btnSignUp')?.addEventListener('click', openRegister);
  document.getElementById('btnGetStarted')?.addEventListener('click', openRegister);
  document.getElementById('btnLearnMore')?.addEventListener('click', () => document.getElementById('btnSignIn').click());
  document.getElementById('btnWelcomeGetStarted')?.addEventListener('click', openRegister);
  document.getElementById('btnWelcomeSignIn')?.addEventListener('click', () => document.getElementById('btnSignIn').click());

  let authRoleMs, authFocusMs;
  function openRegister() {
    isLogin = false;
    document.getElementById('authModalTitle').textContent = t('auth.register');
    document.getElementById('authSubmitBtn').textContent = t('auth.register');
    document.getElementById('usernameGroup').style.display = 'block';
    document.getElementById('userTypeGroup').style.display = 'block';
    document.getElementById('roleGroup').style.display = 'block';
    document.getElementById('focusGroup').style.display = 'block';
    document.getElementById('authToggleText').textContent = t('auth.haveAccount') + ' ';
    document.getElementById('authToggleLink').textContent = t('auth.login');
    authRoleMs = createMultiselect('authRoleMultiselect', ROLES, 'roles.', [], 'auth.selectRoles');
    authFocusMs = createMultiselect('authFocusMultiselect', FOCUS, 'focus.', [], 'auth.selectFocus');
    modal.classList.add('active');
  }

  document.getElementById('authToggleLink')?.addEventListener('click', e => { e.preventDefault();
    if (isLogin) openRegister();
    else document.getElementById('btnSignIn').click();
  });

  modal?.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const username = document.getElementById('authUsername').value;
    const userType = document.getElementById('authUserType').value;
    const role = authRoleMs ? authRoleMs.getSelected() : [];
    const focus = authFocusMs ? authFocusMs.getSelected() : [];

    const users = getUsers();
    if (isLogin) {
      const user = users.find(u => u.email === email);
      if (!user || user.password !== password) {
        alert('Invalid email or password');
        return;
      }
      currentUser = user;
    } else {
      if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
      }
      const user = {
        id: 'u' + Date.now(),
        email,
        password,
        username,
        userType: userType === 'founder' ? 'startup' : 'talent',
        role,
        focus,
        createdAt: Date.now()
      };
      users.push(user);
      saveUsers(users);
      saveProfile(user.id, { role, focus });
      currentUser = user;
    }

    setCurrentUser(currentUser);
    modal.classList.remove('active');
    if (!localStorage.getItem('onboarding_done') && !isLogin) showOnboarding();
    else showDashboard();
  });
}

const DISCOVER_STATE_KEY = 'sh_discoverState';

function saveDiscoverState() {
  if (!currentUser || !discoverUsers.length) return;
  try {
    localStorage.setItem(DISCOVER_STATE_KEY, JSON.stringify({
      userId: currentUser.id,
      userIds: discoverUsers.map(u => u.id),
      currentIndex: currentCardIndex
    }));
  } catch (e) {}
}

function loadDiscoverState() {
  if (!currentUser) return null;
  try {
    const raw = localStorage.getItem(DISCOVER_STATE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.userId !== currentUser.id || !Array.isArray(data.userIds) || data.userIds.length === 0) return null;
    const usersById = new Map(getUsers().map(u => [u.id, u]));
    const users = data.userIds.map(id => usersById.get(id)).filter(Boolean);
    if (!users.length) return null;
    const index = Math.min(Math.max(0, data.currentIndex || 0), users.length - 1);
    return { users, currentIndex: index };
  } catch (e) { return null; }
}

function navTo(view) {
  if (view !== 'discover') saveDiscoverState();

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.bottom-nav a').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-view="${view}"]`)?.classList.add('active');
  document.querySelector(`.bottom-nav a[data-view="${view}"]`)?.classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const viewEl = document.getElementById('view' + view.charAt(0).toUpperCase() + view.slice(1));
  if (viewEl) viewEl.classList.add('active');

  if (view === 'discover') {
    const saved = loadDiscoverState();
    if (saved) {
      discoverUsers = saved.users;
      currentCardIndex = saved.currentIndex;
      renderSwipeCard();
    } else {
      renderDiscover();
    }
  }
  if (view === 'favorites') renderFavorites();
  if (view === 'matches') renderMatches();
  if (view === 'chat') renderChatList();
  if (view === 'profile') renderProfile();
  if (view === 'search') renderSearch();
}

function bindDashboard() {
  const handleNav = (e, link) => {
    e?.preventDefault();
    const view = link?.getAttribute('data-view');
    if (view) navTo(view);
  };
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => handleNav(e, link));
  });
  document.querySelectorAll('.bottom-nav a').forEach(link => {
    link.addEventListener('click', e => handleNav(e, link));
  });

  document.getElementById('filterType')?.addEventListener('change', renderDiscover);
  document.getElementById('filterSearch')?.addEventListener('input', debounce(renderDiscover, 300));
  document.getElementById('filterSort')?.addEventListener('change', renderDiscover);

  document.getElementById('btnSwipeNope')?.addEventListener('click', () => { if (discoverUsers[currentCardIndex]) doSwipeAction('nope'); });
  document.getElementById('btnSwipeSuper')?.addEventListener('click', () => { if (discoverUsers[currentCardIndex]) doSwipeAction('super'); });
  document.getElementById('btnSwipeLike')?.addEventListener('click', () => { if (discoverUsers[currentCardIndex]) doSwipeAction('like'); });
  document.getElementById('btnSwipeUndo')?.addEventListener('click', doSwipeUndo);

}

function loadDashboard() {
  updateStats();
  renderDiscover();
}

function updateStats() {}

let discoverUsers = [];
let currentCardIndex = 0;
let swipeHistory = [];

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcMatchScore(me, other) {
  const myProfile = getProfile(me.id);
  const otherProfile = getProfile(other.id);
  let score = 50;
  const myRoles = ensureArray(me.role);
  const theirRoles = ensureArray(other.role);
  const myFocus = ensureArray(me.focus);
  const theirFocus = ensureArray(other.focus);
  if (myRoles.length && theirRoles.length && myRoles.some(r => theirRoles.includes(r))) score += 10;
  if (myFocus.length && theirFocus.length && myFocus.some(f => theirFocus.includes(f))) score += 15;
  const myTags = (myProfile.tags || []).concat(myProfile.interests || []).map(t => t.toLowerCase());
  const theirTags = (otherProfile.tags || []).concat(otherProfile.interests || []).map(t => t.toLowerCase());
  const common = myTags.filter(t => theirTags.includes(t));
  score += Math.min(common.length * 5, 20);
  if (myProfile.location && otherProfile.location && myProfile.location === otherProfile.location) score += 5;
  return Math.min(99, Math.max(10, score));
}

function getDiscoverUsers() {
  const liked = getLikes(currentUser.id);
  const superLiked = getSuperLikes(currentUser.id);
  const passed = getPassed(currentUser.id);
  const excluded = [...new Set([...liked, ...superLiked, ...passed])];
  const users = getUsers().filter(u => u.id !== currentUser.id && !excluded.includes(u.id));
  const typeFilter = document.getElementById('filterType')?.value || 'all';
  const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
  const sort = document.getElementById('filterSort')?.value || 'random';

  let list = users;
  if (typeFilter === 'startup') list = list.filter(u => u.userType === 'startup');
  if (typeFilter === 'talent') list = list.filter(u => u.userType === 'talent');
  if (search) {
    const profiles = getProfiles();
    list = list.filter(u => {
      const p = profiles[u.id] || {};
      const rolesStr = ensureArray(u.role).map(r => t('roles.' + r)).join(' ');
      const focusStr = ensureArray(u.focus).map(f => t('focus.' + f)).join(' ');
      const text = [u.username, rolesStr, focusStr, p.bio, p.status, (p.tags || []).join(' ')].join(' ').toLowerCase();
      return text.includes(search);
    });
  }
  if (sort === 'alpha') list.sort((a, b) => a.username.localeCompare(b.username));
  else if (sort === 'relevance') list.sort((a, b) => calcMatchScore(currentUser, b) - calcMatchScore(currentUser, a));
  else list = shuffleArray(list);
  return list;
}

function renderDiscover() {
  discoverUsers = getDiscoverUsers();
  currentCardIndex = 0;
  swipeHistory = [];
  renderSwipeCard();
}

/** When the discover stack is empty, refill from passed users (shuffled) so profiles never really "end". */
function refillDiscoverFromPassed() {
  if (!currentUser) return;
  const passedIds = getPassed(currentUser.id);
  if (!passedIds.length) return;
  const allUsers = getUsers().filter(u => u.id !== currentUser.id);
  const passedUsers = allUsers.filter(u => passedIds.includes(u.id));
  if (!passedUsers.length) return;
  discoverUsers = shuffleArray(passedUsers);
  currentCardIndex = 0;
}

function renderSwipeCard() {
  const wrap = document.getElementById('swipeCardWrap');
  const empty = document.getElementById('swipeEmpty');
  const overlayLike = document.getElementById('overlayLike');
  const overlayNope = document.getElementById('overlayNope');
  const overlaySuper = document.getElementById('overlaySuper');

  overlayLike?.classList.remove('visible');
  overlayNope?.classList.remove('visible');
  overlaySuper?.classList.remove('visible');

  const actions = document.getElementById('swipeActions');
  if (actions) {
    actions.style.display = discoverUsers.length ? 'flex' : 'none';
    document.getElementById('btnSwipeUndo')?.classList.toggle('swipe-btn-dim', !swipeHistory.length);
  }

  if (currentCardIndex >= discoverUsers.length) {
    refillDiscoverFromPassed();
    if (discoverUsers.length === 0) {
      wrap.innerHTML = '';
      empty.textContent = t('dashboard.noMoreCards');
      empty.classList.add('visible');
      return;
    }
  }

  empty.classList.remove('visible');
  const user = discoverUsers[currentCardIndex];
  wrap.innerHTML = createSwipeCardHtml(user);
  const card = wrap.querySelector('.swipe-card');
  if (card) initSwipeCard(card, user);
}

function createSwipeCardHtml(user) {
  const profile = getProfile(user.id);
  const roleTags = ensureArray(user.role).map(r => t('roles.' + r)).filter(Boolean);
  const focusTags = ensureArray(user.focus).map(f => t('focus.' + f)).filter(Boolean);
  const tags = [...roleTags, ...focusTags, ...(profile.tags || [])];
  const score = calcMatchScore(currentUser, user);
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const techStack = Array.isArray(profile.techStack) ? profile.techStack : [];
  const exp = profile.experience || '';
  const avatarHtml = profile.avatarUrl
    ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="" class="swipe-avatar-img">`
    : `<div class="swipe-avatar">${(user.username[0] || '?').toUpperCase()}</div>`;
  return `
    <div class="swipe-card" data-user-id="${user.id}">
      <div class="swipe-avatar-wrap">${avatarHtml}</div>
      <div class="swipe-body">
        <span class="swipe-match-score">Match: ${score}%</span>
        <h3>${escapeHtml(user.username)}</h3>
        <span class="type-badge">${user.userType === 'startup' ? t('profile.startup') : t('profile.talent')}</span>
        ${exp ? `<p class="swipe-meta">${escapeHtml(exp)}</p>` : ''}
        <p class="description">${escapeHtml(profile.bio || '-')}</p>
        <p class="description" style="font-size:0.85rem">${escapeHtml(profile.status || '')}</p>
        ${skills.length ? `<p class="swipe-skills">${skills.slice(0, 5).map(s => escapeHtml(s)).join(' · ')}</p>` : ''}
        ${techStack.length ? `<p class="swipe-tech">${techStack.slice(0, 4).map(t => escapeHtml(t)).join(', ')}</p>` : ''}
        <div class="tags">${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      </div>
    </div>
  `;
}

function doSwipeAction(action) {
  const user = discoverUsers[currentCardIndex];
  if (!user) return;
  swipeHistory.push({ userId: user.id, action });
  const card = document.querySelector('.swipe-card[data-user-id="' + user.id + '"]');
  if (card) {
    card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    let tx = 0, ty = 0;
    if (action === 'nope') tx = -500;
    else if (action === 'like') tx = 500;
    else ty = -400;
    card.style.transform = `translate(${tx}px, ${ty}px) rotate(${tx ? tx * 0.05 : -15}deg)`;
    setTimeout(() => {
      if (action === 'super') doSuperLike(user.id);
      else if (action === 'like') doLike(user.id);
      else doDislike(user.id);
      currentCardIndex++;
      renderSwipeCard();
    }, 400);
  }
}

function doSwipeUndo() {
  const last = swipeHistory.pop();
  if (!last || !currentUser) return;
  const { userId, action } = last;
  if (action === 'nope') removePassed(currentUser.id, userId);
  else if (action === 'like') {
    removeLike(currentUser.id, userId);
    removeFavorite(currentUser.id, userId);
  } else if (action === 'super') {
    removeSuperLike(currentUser.id, userId);
    removeLike(currentUser.id, userId);
    removeFavorite(currentUser.id, userId);
  }
  discoverUsers = getDiscoverUsers();
  const user = discoverUsers.find(u => u.id === userId);
  if (user) {
    discoverUsers = [user, ...discoverUsers.filter(u => u.id !== userId)];
    currentCardIndex = 0;
  }
  renderSwipeCard();
}

function initSwipeCard(card, user) {
  const overlayLike = document.getElementById('overlayLike');
  const overlayNope = document.getElementById('overlayNope');
  const overlaySuper = document.getElementById('overlaySuper');
  let startX = 0, startY = 0;

  const onStart = (e) => {
    startX = (e.touches ? e.touches[0] : e).clientX;
    startY = (e.touches ? e.touches[0] : e).clientY;
    card.classList.add('dragging');
  };

  const onMove = (e) => {
    if (!card.classList.contains('dragging')) return;
    const x = (e.touches ? e.touches[0] : e).clientX;
    const y = (e.touches ? e.touches[0] : e).clientY;
    const dx = x - startX;
    const dy = y - startY;
    const rot = dx * 0.03;
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    overlayLike?.classList.toggle('visible', dx > 60 && Math.abs(dy) < 80);
    overlayNope?.classList.toggle('visible', dx < -60 && Math.abs(dy) < 80);
    overlaySuper?.classList.toggle('visible', dy < -80);
  };

  const onEnd = (e) => {
    if (!card.classList.contains('dragging')) return;
    card.classList.remove('dragging');
    const x = (e.changedTouches ? e.changedTouches[0] : e).clientX;
    const dx = x - startX;

    const dy = (e.changedTouches ? e.changedTouches[0] : e).clientY - startY;
    if (dy < -80) {
      swipeHistory.push({ userId: user.id, action: 'super' });
      if (card._cleanup) card._cleanup();
      card.style.transition = 'transform 0.4s ease-out';
      card.style.transform = 'translate(0, -500px) rotate(-15deg)';
      setTimeout(() => { doSuperLike(user.id); currentCardIndex++; renderSwipeCard(); }, 400);
    } else if (Math.abs(dx) > 80) {
      swipeHistory.push({ userId: user.id, action: dx > 0 ? 'like' : 'nope' });
      if (card._cleanup) card._cleanup();
      card.style.transition = 'transform 0.4s ease-out';
      card.style.transform = `translate(${dx > 0 ? 500 : -500}px, 0) rotate(${dx * 0.05}deg)`;
      setTimeout(() => {
        if (dx > 0) doLike(user.id);
        else doDislike(user.id);
        currentCardIndex++;
        renderSwipeCard();
      }, 400);
    } else {
      card.style.transition = '';
      card.style.transform = '';
      overlayLike?.classList.remove('visible');
      overlayNope?.classList.remove('visible');
      overlaySuper?.classList.remove('visible');
    }
  };

  card.addEventListener('mousedown', onStart);
  card.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);

  card._cleanup = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchend', onEnd);
  };
}

function doLike(userId) {
  addFavorite(currentUser.id, userId);
  addLike(currentUser.id, userId);
  incrementLikesReceived(userId);
  const users = getUsers();
  const fromUser = users.find(u => u.id === currentUser.id);
  addNotification(userId, (fromUser?.username || 'Someone') + ' ' + t('notify.wantsToConnect'), 'like', currentUser.id);
  const theirLikes = getLikes(userId);
  if (theirLikes.includes(currentUser.id)) {
    addNotification(currentUser.id, t('notify.newMatch') + ' ' + (users.find(u => u.id === userId)?.username || ''), 'match', userId);
    addNotification(userId, t('notify.newMatch') + ' ' + (fromUser?.username || ''), 'match', currentUser.id);
  }
  updateStats();
  updateNotifications();
}

function doDislike(userId) {
  removeFavorite(currentUser.id, userId);
  removeLike(currentUser.id, userId);
  addPassed(currentUser.id, userId);
  updateStats();
}

function doSuperLike(userId) {
  addFavorite(currentUser.id, userId);
  addLike(currentUser.id, userId);
  addSuperLike(currentUser.id, userId);
  incrementLikesReceived(userId);
  const users = getUsers();
  const fromUser = users.find(u => u.id === currentUser.id);
  addNotification(userId, (fromUser?.username || 'Someone') + ' sent you a Super Like! ⭐', 'super', currentUser.id);
  const theirLikes = getLikes(userId);
  const theirSuper = getSuperLikes(userId);
  if (theirLikes.includes(currentUser.id) || theirSuper.includes(currentUser.id)) {
    addNotification(currentUser.id, t('notify.newMatch') + ' ' + (users.find(u => u.id === userId)?.username || ''), 'match', userId);
    addNotification(userId, t('notify.newMatch') + ' ' + (fromUser?.username || ''), 'match', currentUser.id);
  }
  updateStats();
  updateNotifications();
}

function updateNotifications() {
  if (!currentUser) return;
  const list = getNotifications(currentUser.id);
  const unread = getUnreadCount(currentUser.id);
  const badge = document.getElementById('notifBadge');
  const dropdown = document.getElementById('notifList');
  badge.textContent = unread;
  badge.classList.toggle('hidden', unread === 0);
  dropdown.innerHTML = list.length ? list.slice(0, 20).map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}">${escapeHtml(n.msg)}</div>
  `).join('') : '';
}

function bindNotifications() {
  const btn = document.getElementById('btnNotif');
  const dropdown = document.getElementById('notifDropdown');
  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    markNotificationsRead(currentUser?.id);
    updateNotifications();
  });
  document.addEventListener('click', () => dropdown?.classList.remove('open'));
  dropdown?.addEventListener('click', e => e.stopPropagation());
}

function searchAllProfiles(q) {
  if (!currentUser) return [];
  const query = (q || '').trim().toLowerCase();
  const users = getUsers().filter(u => u.id !== currentUser.id);
  const profiles = getProfiles();
  if (!query) return users;
  return users.filter(u => {
    const p = profiles[u.id] || {};
    const rolesStr = ensureArray(u.role).map(r => t('roles.' + r)).join(' ');
    const focusStr = ensureArray(u.focus).map(f => t('focus.' + f)).join(' ');
    const text = [u.username, rolesStr, focusStr, p.bio, p.status, p.goals, p.needs, (p.tags || []).join(' ')].join(' ').toLowerCase();
    return text.includes(query);
  });
}

function bindHeaderSearch() {
  const input = document.getElementById('headerSearch');
  const dropdown = document.getElementById('headerSearchDropdown');
  if (!input || !dropdown) return;

  input.addEventListener('focus', () => {
    const q = input.value.trim();
    const results = searchAllProfiles(q);
    dropdown.innerHTML = renderSearchResults(results);
    dropdown.classList.add('open');
  });

  input.addEventListener('input', debounce(() => {
    const q = input.value.trim();
    const results = searchAllProfiles(q);
    dropdown.innerHTML = renderSearchResults(results);
    dropdown.classList.add('open');
  }, 150));

  input.addEventListener('blur', () => {
    setTimeout(() => dropdown.classList.remove('open'), 200);
  });

  dropdown.addEventListener('click', e => {
    const el = e.target.closest('.header-search-result');
    if (el && el.dataset.userId) {
      const userId = el.dataset.userId;
      input.value = '';
      dropdown.classList.remove('open');
      openProfilePreview(userId);
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.header-search-wrap')) dropdown.classList.remove('open');
  });
}

function renderSearchResults(users) {
  if (!users.length) return '';
  return users.slice(0, 12).map(u => {
    const p = getProfile(u.id);
    const bio = (p.bio || p.status || '').slice(0, 60);
    return `
      <div class="header-search-result" data-user-id="${u.id}">
        <div class="header-search-result-avatar">${(u.username[0] || '?').toUpperCase()}</div>
        <div class="header-search-result-info">
          <h4>${escapeHtml(u.username)}</h4>
          <p>${escapeHtml(bio || (u.userType === 'startup' ? t('profile.startup') : t('profile.talent')))}</p>
        </div>
      </div>
    `;
  }).join('');
}

function openProfilePreview(userId) {
  const user = getUsers().find(u => u.id === userId);
  if (!user) return;
  incrementProfileView(userId);
  const modal = document.getElementById('profilePreviewModal');
  if (!modal) return;
  const p = getProfile(userId);
  const roleTags = ensureArray(user.role).map(r => t('roles.' + r)).filter(Boolean);
  const focusTags = ensureArray(user.focus).map(f => t('focus.' + f)).filter(Boolean);
  const tags = [...roleTags, ...focusTags, ...(p.tags || [])];
  const previewAvatarEl = document.getElementById('previewAvatar');
  if (p.avatarUrl) previewAvatarEl.innerHTML = `<img src="${escapeHtml(p.avatarUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
  else previewAvatarEl.textContent = (user.username[0] || '?').toUpperCase();
  document.getElementById('previewName').textContent = user.username;
  document.getElementById('previewType').textContent = user.userType === 'startup' ? t('profile.startup') : t('profile.talent');
  document.getElementById('previewBio').textContent = p.bio || '-';
  document.getElementById('previewStatus').textContent = p.status || '-';
  document.getElementById('previewTags').innerHTML = tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join(' ');
  modal.dataset.previewUserId = userId;
  modal.classList.add('active');

  const btnSuper = document.getElementById('btnPreviewSuper');
  const btnInvite = document.getElementById('btnPreviewInvite');
  if (btnSuper) btnSuper.style.display = 'inline-flex';
  if (btnInvite) btnInvite.style.display = currentUser.userType === 'startup' && user.userType === 'talent' ? 'inline-flex' : 'none';

  document.getElementById('btnPreviewClose').onclick = () => modal.classList.remove('active');
  document.getElementById('btnPreviewLike').onclick = () => {
    doLike(userId);
    modal.classList.remove('active');
    navTo('favorites');
  };
  document.getElementById('btnPreviewSuper').onclick = () => {
    doSuperLike(userId);
    modal.classList.remove('active');
    navTo('favorites');
  };
  document.getElementById('btnPreviewInvite').onclick = () => {
    addInvite(currentUser.id, userId, currentUser.id);
    addNotification(userId, (currentUser.username || 'Someone') + ' invited you to join their team!', 'invite', currentUser.id);
    updateNotifications();
    modal.classList.remove('active');
  };
  modal.onclick = e => { if (e.target === modal) modal.classList.remove('active'); };
}

function renderFavorites() {
  const favIds = getFavorites(currentUser.id);
  const users = getUsers().filter(u => favIds.includes(u.id));
  const container = document.getElementById('favoritesCards');
  container.innerHTML = users.length ? users.map(u => createUserCard(u, 'favorites')).join('') : '';
  bindCardActions(container);
}

function renderMatches() {
  const matchIds = getMatches(currentUser.id);
  const users = getUsers().filter(u => matchIds.includes(u.id));
  const container = document.getElementById('matchesCards');
  container.innerHTML = users.length ? users.map(u => createUserCard(u, 'matches')).join('') : '';
  bindCardActions(container);
}

function createUserCard(user, context) {
  const profile = getProfile(user.id);
  const roleTags = ensureArray(user.role).map(r => t('roles.' + r)).filter(Boolean);
  const focusTags = ensureArray(user.focus).map(f => t('focus.' + f)).filter(Boolean);
  const tags = [...roleTags, ...focusTags, ...(profile.tags || [])];
  const isMatch = context === 'matches';
  const score = currentUser ? calcMatchScore(currentUser, user) : 0;
  const skills = Array.isArray(profile.skills) ? profile.skills.slice(0, 4) : [];
  const techStack = Array.isArray(profile.techStack) ? profile.techStack.slice(0, 3) : [];
  const exp = profile.experience || '';
  const inviteBtn = (currentUser?.userType === 'startup' && user.userType === 'talent') ? '<button class="btn btn-secondary btn-sm" data-action="invite" style="font-size:0.8rem;padding:0.4rem 0.8rem">Invite to Team</button>' : '';
  const cardAvatar = profile.avatarUrl
    ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="" class="user-card-avatar-img">`
    : (user.username[0] || '?').toUpperCase();
  return `
    <div class="user-card" data-user-id="${user.id}" data-action-card="view" style="cursor:pointer">
      <div class="user-card-avatar">${cardAvatar}</div>
      <div class="user-card-body">
        <span class="card-match-score">${score}% match</span>
        <h3>${escapeHtml(user.username)}</h3>
        <span class="type-badge">${user.userType === 'startup' ? t('profile.startup') : t('profile.talent')}</span>
        ${exp ? `<p class="card-meta">${escapeHtml(exp)}</p>` : ''}
        <p class="description">${escapeHtml(profile.bio || 'No description')}</p>
        <p class="description" style="font-size:0.85rem;">${escapeHtml(profile.status || '')}</p>
        ${skills.length ? `<p class="card-skills">${skills.map(s => escapeHtml(s)).join(' · ')}</p>` : ''}
        ${techStack.length ? `<p class="card-tech">${techStack.map(t => escapeHtml(t)).join(', ')}</p>` : ''}
        <div class="tags">${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        <div class="user-card-actions">
          ${isMatch ? '<button class="btn btn-primary btn-sm" data-action="message" style="font-size:0.8rem;padding:0.4rem 0.8rem">Message</button> ' : ''}
          ${inviteBtn}
          <button class="btn-icon btn-like" data-action="like" title="${t('card.like')}">♥</button>
          <button class="btn-icon btn-dislike" data-action="dislike" title="${t('card.dislike')}">✕</button>
        </div>
      </div>
    </div>
  `;
}

function bindCardActions(container) {
  if (!container) return;
  container.querySelectorAll('.user-card[data-action-card="view"]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      const userId = card.getAttribute('data-user-id');
      if (userId) openProfilePreview(userId);
    });
  });
  container.querySelectorAll('[data-action="message"]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation();
      const userId = btn.closest('.user-card')?.getAttribute('data-user-id');
      if (userId) { navTo('chat'); setTimeout(() => { document.querySelector(`.chat-item[data-user-id="${userId}"]`)?.click(); }, 100); }
    });
  });
  container.querySelectorAll('[data-action="invite"]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation();
      const userId = btn.closest('.user-card')?.getAttribute('data-user-id');
      if (userId) { addInvite(currentUser.id, userId, currentUser.id); addNotification(userId, (currentUser.username || 'Someone') + ' invited you to join their team!', 'invite', currentUser.id); updateNotifications(); }
    });
  });
  container.querySelectorAll('[data-action="like"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      const card = btn.closest('.user-card');
      const userId = card?.getAttribute('data-user-id');
      if (userId && currentUser) {
        addFavorite(currentUser.id, userId);
        addLike(currentUser.id, userId);
        updateStats();
        renderDiscover();
      }
    });
  });
  container.querySelectorAll('[data-action="dislike"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      const card = btn.closest('.user-card');
      const userId = card?.getAttribute('data-user-id');
      if (userId && currentUser) {
        removeFavorite(currentUser.id, userId);
        removeLike(currentUser.id, userId);
        updateStats();
        renderFavorites();
        renderMatches();
      }
    });
  });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s || '';
  return div.innerHTML;
}

function calcProfileProgress(profile, user) {
  const fields = ['bio','status','location','timezone','github','linkedin','portfolio','skills','experience','interests'];
  const startupFields = ['startupStage','fundingStage','teamSize'];
  let filled = 0;
  const total = user?.userType === 'startup' ? fields.length + startupFields.length : fields.length;
  fields.forEach(f => { if (profile[f]) filled++; });
  if (user?.userType === 'startup') startupFields.forEach(f => { if (profile[f]) filled++; });
  return Math.round((filled / total) * 100);
}

function bindProfile() {
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.getAttribute('data-profile-tab');
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.profile-tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pane = document.querySelector('.profile-tab-pane[data-tab="' + name + '"]');
      if (pane) pane.classList.add('active');
      if (name === 'settings') {
        const langSel = document.getElementById('profileSettingsLang');
        const themeSel = document.getElementById('profileSettingsTheme');
        if (langSel) langSel.value = localStorage.getItem('lang') || 'en';
        if (themeSel) themeSel.value = localStorage.getItem('theme') || 'dark';
      }
    });
  });

  document.getElementById('profileSettingsLang')?.addEventListener('change', function() {
    if (typeof setLang === 'function') setLang(this.value);
  });
  document.getElementById('profileSettingsTheme')?.addEventListener('change', function() {
    const theme = this.value;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
  document.getElementById('profileSettingsSignOut')?.addEventListener('click', () => {
    setCurrentUser(null);
    currentUser = null;
    showLanding();
  });

  document.getElementById('btnShareProfile')?.addEventListener('click', () => {
    const url = location.origin + location.pathname + '#user/' + (currentUser.username || currentUser.id);
    navigator.clipboard?.writeText(url).then(() => alert('Profile link copied!')).catch(() => prompt('Copy this link:', url));
  });
  let editRoleMs, editFocusMs;
  let editAvatarDataUrl = '';
  document.getElementById('editAvatarInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      editAvatarDataUrl = reader.result;
      const preview = document.getElementById('editAvatarPreview');
      preview.innerHTML = `<img src="${editAvatarDataUrl}" alt="Avatar" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('btnEditProfile')?.addEventListener('click', () => {
    const p = getProfile(currentUser.id);
    editAvatarDataUrl = p.avatarUrl || '';
    const preview = document.getElementById('editAvatarPreview');
    preview.innerHTML = editAvatarDataUrl ? `<img src="${editAvatarDataUrl}" alt="Avatar" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">` : '<span style="color:var(--text-secondary)">No photo</span>';
    document.getElementById('editAvatarInput').value = '';
    editRoleMs = createMultiselect('editRoleMultiselect', ROLES, 'roles.', ensureArray(currentUser.role || p.role), 'auth.selectRoles');
    editFocusMs = createMultiselect('editFocusMultiselect', FOCUS, 'focus.', ensureArray(currentUser.focus || p.focus), 'auth.selectFocus');
    document.getElementById('editBio').value = p.bio || '';
    document.getElementById('editStatus').value = p.status || '';
    document.getElementById('editGoals').value = p.goals || '';
    document.getElementById('editNeeds').value = p.needs || '';
    document.getElementById('editLocation').value = p.location || '';
    document.getElementById('editTimezone').value = p.timezone || '';
    document.getElementById('editGithub').value = p.github || '';
    document.getElementById('editLinkedin').value = p.linkedin || '';
    document.getElementById('editPortfolio').value = p.portfolio || '';
    document.getElementById('editSkills').value = Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || '');
    document.getElementById('editExperience').value = p.experience || '';
    document.getElementById('editTechStack').value = Array.isArray(p.techStack) ? p.techStack.join(', ') : (p.techStack || '');
    document.getElementById('editAvailability').value = p.availability || '';
    document.getElementById('editInterests').value = Array.isArray(p.interests) ? p.interests.join(', ') : (p.interests || '');
    document.getElementById('editStartupStage').value = p.startupStage || '';
    document.getElementById('startupFields').style.display = currentUser.userType === 'startup' ? 'block' : 'none';
    const tags = p.tags || [];
    document.getElementById('editTagsList').innerHTML = tags.map(tag => `<span class="tag" style="cursor:pointer" data-remove>${escapeHtml(tag)} ×</span>`).join('');
    document.getElementById('editTagInput').value = '';
    document.getElementById('profileEditModal').classList.add('active');
  });

  document.getElementById('editTagInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (val) {
        const container = document.getElementById('editTagsList');
        const span = document.createElement('span');
        span.className = 'tag';
        span.style.cursor = 'pointer';
        span.setAttribute('data-remove', '');
        span.textContent = val + ' ×';
        container.appendChild(span);
        e.target.value = '';
      }
    }
  });

  document.getElementById('editTagsList')?.addEventListener('click', e => {
    if (e.target.hasAttribute('data-remove')) e.target.remove();
  });

  document.getElementById('btnCancelEdit')?.addEventListener('click', () => document.getElementById('profileEditModal').classList.remove('active'));

  document.getElementById('profileEditModal')?.addEventListener('click', e => {
    if (e.target.id === 'profileEditModal') e.target.classList.remove('active');
  });

  document.getElementById('profileEditForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const tags = [...document.getElementById('editTagsList').querySelectorAll('.tag')].map(el => el.textContent.replace(' ×', ''));
    const skills = (document.getElementById('editSkills').value || '').split(',').map(s => s.trim()).filter(Boolean);
    const interests = (document.getElementById('editInterests').value || '').split(',').map(s => s.trim()).filter(Boolean);
    const role = editRoleMs ? editRoleMs.getSelected() : ensureArray(currentUser.role);
    const focus = editFocusMs ? editFocusMs.getSelected() : ensureArray(currentUser.focus);
    saveProfile(currentUser.id, {
      bio: document.getElementById('editBio').value,
      status: document.getElementById('editStatus').value,
      goals: document.getElementById('editGoals').value,
      needs: document.getElementById('editNeeds').value,
      location: document.getElementById('editLocation').value,
      timezone: document.getElementById('editTimezone').value,
      github: document.getElementById('editGithub').value,
      linkedin: document.getElementById('editLinkedin').value,
      portfolio: document.getElementById('editPortfolio').value,
      skills,
      experience: document.getElementById('editExperience').value,
      techStack: (document.getElementById('editTechStack')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
      availability: document.getElementById('editAvailability')?.value || '',
      interests,
      startupStage: document.getElementById('editStartupStage')?.value || '',
      tags,
      role,
      focus,
      avatarUrl: editAvatarDataUrl || undefined
    });
    currentUser.role = role;
    currentUser.focus = focus;
    saveUsers(getUsers().map(u => u.id === currentUser.id ? { ...u, role, focus } : u));
    document.getElementById('profileEditModal').classList.remove('active');
    renderProfile();
  });
}

function renderProfile() {
  const p = getProfile(currentUser.id);
  const progress = calcProfileProgress(p, currentUser);
  document.getElementById('profileProgressFill').style.width = progress + '%';
  document.getElementById('profileProgressText').textContent = progress + '% complete';
  const profileAvatarEl = document.getElementById('profileAvatar');
  if (p.avatarUrl) profileAvatarEl.innerHTML = `<img src="${escapeHtml(p.avatarUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
  else profileAvatarEl.textContent = (currentUser.username[0] || '?').toUpperCase();
  document.getElementById('profileName').textContent = currentUser.username;
  document.getElementById('profileType').textContent = currentUser.userType === 'startup' ? t('profile.startup') : t('profile.talent');
  document.getElementById('profileBio').textContent = p.bio || '';

  const links = [];
  if (p.github) links.push(`<a class="profile-link" href="https://github.com/${escapeHtml(p.github)}" target="_blank" rel="noopener">GitHub</a>`);
  if (p.linkedin) links.push(`<a class="profile-link" href="https://linkedin.com/in/${escapeHtml(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`);
  if (p.portfolio) links.push(`<a class="profile-link" href="${p.portfolio.startsWith('http') ? p.portfolio : 'https://'+p.portfolio}" target="_blank" rel="noopener">Portfolio</a>`);

  const availLabels = { fulltime: 'Full-time', parttime: 'Part-time', remote: 'Remote only', hybrid: 'Hybrid', open: 'Open' };
  const details = document.getElementById('profileDetails');
  details.innerHTML = `
    <div class="field"><label>${t('profile.status')}</label><div>${escapeHtml(p.status || '-')}</div></div>
    <div class="field"><label>Location</label><div>${escapeHtml(p.location || '-')}</div></div>
    <div class="field"><label>Availability</label><div>${p.availability ? (availLabels[p.availability] || p.availability) : '-'}</div></div>
    <div class="field"><label>Skills</label><div>${Array.isArray(p.skills) ? p.skills.map(s => `<span class="tag">${escapeHtml(s)}</span>`).join(' ') : escapeHtml(p.skills || '-')}</div></div>
    <div class="field"><label>Tech stack</label><div>${Array.isArray(p.techStack) ? p.techStack.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ') : escapeHtml(p.techStack || '-')}</div></div>
    <div class="field"><label>Experience</label><div>${escapeHtml(p.experience || '-')}</div></div>
    <div class="field"><label>${t('profile.goals')}</label><div>${escapeHtml(p.goals || '-')}</div></div>
    <div class="field"><label>${t('profile.needs')}</label><div>${escapeHtml(p.needs || '-')}</div></div>
    <div class="field"><label>Links</label><div>${links.length ? links.join(' ') : '-'}</div></div>
    <div class="field"><label>${t('profile.tags')}</label><div>${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}</div></div>
  `;
}

function bindChat() {
  document.getElementById('btnSendMessage')?.addEventListener('click', sendMessage);
  document.getElementById('chatInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
  document.getElementById('emojiBtn')?.addEventListener('click', () => {
    const input = document.getElementById('chatInput');
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    input.value += emoji;
    input.focus();
  });

  function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input?.value?.trim();
    const activeChatUserId = window._activeChatUserId;
    if (!text || !activeChatUserId) return;
    addChatMessage(currentUser.id, activeChatUserId, { from: currentUser.id, text, ts: Date.now() });
    input.value = '';
    renderChatMessages(activeChatUserId);
  }
}

function renderChatList() {
  const matches = getMatches(currentUser.id);
  const list = document.getElementById('chatList');
  if (!matches.length) {
    list.innerHTML = `<div class="chat-empty" data-i18n="chat.matchFirst">${t('chat.matchFirst')}</div>`;
    document.getElementById('chatInputArea').style.display = 'none';
    document.getElementById('chatMessages').innerHTML = `<div class="chat-empty">${t('chat.matchFirst')}</div>`;
    return;
  }
  const users = getUsers();
  list.innerHTML = matches.map(id => {
    const u = users.find(us => us.id === id);
    return u ? `<div class="chat-item" data-user-id="${u.id}">${escapeHtml(u.username)}</div>` : '';
  }).join('');

  list.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', () => {
      const userId = item.getAttribute('data-user-id');
      list.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('chatInputArea').style.display = 'flex';
      window._activeChatUserId = userId;
      renderChatMessages(userId);
    });
  });
}

function renderChatMessages(otherUserId) {
  const messages = getChatBetween(currentUser.id, otherUserId);
  markChatRead(currentUser.id, otherUserId);
  const container = document.getElementById('chatMessages');
  container.innerHTML = messages.map(m => {
    const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
    <div class="chat-message ${m.from === currentUser.id ? 'sent' : ''}">
      ${escapeHtml(m.text)}
      <div class="msg-time">${time}${m.read && m.from === currentUser.id ? ' ✓✓' : ''}</div>
    </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function renderSearch() {
  const filters = document.getElementById('advancedFilters');
  if (filters && !filters.innerHTML) {
    filters.innerHTML = `
      <select id="searchRole"><option value="">Role</option><option value="developer">Developer</option><option value="designer">Designer</option><option value="marketer">Marketer</option><option value="product-manager">Product Manager</option><option value="founder">Founder</option><option value="engineer">Engineer</option></select>
      <select id="searchType"><option value="">Type</option><option value="startup">Startup</option><option value="talent">Talent</option></select>
      <select id="searchAvailability"><option value="">Availability</option><option value="fulltime">Full-time</option><option value="parttime">Part-time</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="open">Open</option></select>
      <input type="text" id="searchSkills" placeholder="Skills...">
      <input type="text" id="searchTechStack" placeholder="Tech stack...">
      <input type="text" id="searchExperience" placeholder="Experience (e.g. 5 years)">
      <input type="text" id="searchQuery" placeholder="Search...">
      <button class="btn btn-primary" id="btnSearch">Search</button>
    `;
    document.getElementById('btnSearch')?.addEventListener('click', doAdvancedSearch);
  }
  doAdvancedSearch();
}

function doAdvancedSearch() {
  const role = document.getElementById('searchRole')?.value || '';
  const type = document.getElementById('searchType')?.value || '';
  const availability = document.getElementById('searchAvailability')?.value || '';
  const skills = (document.getElementById('searchSkills')?.value || '').toLowerCase();
  const techStack = (document.getElementById('searchTechStack')?.value || '').toLowerCase();
  const experience = (document.getElementById('searchExperience')?.value || '').toLowerCase();
  const query = (document.getElementById('searchQuery')?.value || '').toLowerCase();
  let users = getUsers().filter(u => u.id !== currentUser.id);
  if (role) users = users.filter(u => ensureArray(u.role).some(r => r === role || r.includes(role)));
  if (type) users = users.filter(u => u.userType === type);
  const profiles = getProfiles();
  if (availability) users = users.filter(u => (profiles[u.id] || {}).availability === availability);
  if (skills) users = users.filter(u => { const p = profiles[u.id] || {}; const s = (Array.isArray(p.skills) ? p.skills : []).join(' ').toLowerCase(); return s.includes(skills); });
  if (techStack) users = users.filter(u => { const p = profiles[u.id] || {}; const t = (Array.isArray(p.techStack) ? p.techStack : []).join(' ').toLowerCase(); return t.includes(techStack); });
  if (experience) users = users.filter(u => ((profiles[u.id] || {}).experience || '').toLowerCase().includes(experience));
  if (query) users = users.filter(u => {
    const p = profiles[u.id] || {};
    const text = [u.username, p.bio, p.status, p.experience].join(' ').toLowerCase();
    return text.includes(query);
  });
  users = shuffleArray(users);
  const container = document.getElementById('searchResults');
  if (container) container.innerHTML = users.length ? users.map(u => createUserCard(u, 'search')).join('') : '';
  bindCardActions(container);
}

function bindOnboarding() {
  const modal = document.getElementById('onboardingModal');
  const steps = [
    { title: 'Choose your role', content: () => `<div class="onboarding-step"><p>Are you a Founder or Talent?</p><select id="onboardRole"><option value="talent">Talent</option><option value="founder">Founder</option></select></div>` },
    { title: 'Add your skills', content: () => `<div class="onboarding-step"><p>What are your top skills? (comma-separated)</p><input type="text" id="onboardSkills" placeholder="React, Node, Design..."></div>` },
    { title: 'Add interests', content: () => `<div class="onboarding-step"><p>What interests you?</p><input type="text" id="onboardInterests" placeholder="AI, SaaS, Mobile..."></div>` },
    { title: 'Almost done!', content: () => `<div class="onboarding-step"><p>Start matching and find your team!</p></div>` }
  ];
  let step = 0;
  function showStep() {
    document.getElementById('onboardingTitle').textContent = steps[step].title;
    document.getElementById('onboardingContent').innerHTML = steps[step].content();
    document.getElementById('onboardingProgress').innerHTML = steps.map((_, i) => `<div class="onboarding-dot ${i === step ? 'active' : ''}"></div>`).join('');
    document.getElementById('btnOnboardBack').style.display = step > 0 ? 'block' : 'none';
    document.getElementById('btnOnboardNext').textContent = step === steps.length - 1 ? 'Start' : 'Next';
  }
  window.showOnboarding = function() {
    showDashboard();
    step = 0;
    showStep();
    modal?.classList.add('active');
  };
  document.getElementById('btnOnboardNext')?.addEventListener('click', () => {
    if (step === 0) { currentUser.userType = document.getElementById('onboardRole')?.value === 'founder' ? 'startup' : 'talent'; saveUsers(getUsers().map(u => u.id === currentUser.id ? currentUser : u)); }
    if (step === 1) { const s = (document.getElementById('onboardSkills')?.value || '').split(',').map(x => x.trim()).filter(Boolean); saveProfile(currentUser.id, { skills: s }); }
    if (step === 2) { const i = (document.getElementById('onboardInterests')?.value || '').split(',').map(x => x.trim()).filter(Boolean); saveProfile(currentUser.id, { interests: i }); }
    if (step < steps.length - 1) { step++; showStep(); }
    else { localStorage.setItem('onboarding_done', '1'); modal?.classList.remove('active'); showDashboard(); loadDashboard(); }
  });
  document.getElementById('btnOnboardBack')?.addEventListener('click', () => { if (step > 0) { step--; showStep(); } });
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
