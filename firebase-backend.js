// Firebase backend - uses Firestore + Auth + Storage when configured. Falls back to local if not.
(function() {
  if (!window.firebaseDb || !window.firebaseAuth) return;

  const db = window.firebaseDb;
  const auth = window.firebaseAuth;
  const storage = window.firebaseStorage;
  const cache = { users: [], profiles: {}, likes: {}, superLikes: {}, passed: {}, favorites: {}, chats: {}, notifications: {}, currentUser: null };

  window.initFirebase = function() {
    return new Promise((resolve) => {
      let resolved = false;
      function done() {
        if (!resolved) { resolved = true; resolve(); }
      }

      auth.onAuthStateChanged(async (firebaseUser) => {
        try {
          const [usersSnap, profilesSnap, likesSnap, favSnap, passedSnap, superSnap, notifSnap] = await Promise.all([
            db.collection('users').get(),
            db.collection('profiles').get(),
            db.collection('likes').get(),
            db.collection('favorites').get(),
            db.collection('passed').get(),
            db.collection('superLikes').get(),
            db.collection('notifications').get()
          ]);
          cache.users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          profilesSnap.docs.forEach(d => { cache.profiles[d.id] = d.data(); });
          likesSnap.docs.forEach(d => { cache.likes[d.id] = (d.data().ids || []); });
          favSnap.docs.forEach(d => { cache.favorites[d.id] = (d.data().ids || []); });
          passedSnap.docs.forEach(d => { cache.passed[d.id] = (d.data().ids || []); });
          superSnap.docs.forEach(d => { cache.superLikes[d.id] = (d.data().ids || []); });
          notifSnap.docs.forEach(d => { cache.notifications[d.id] = (d.data().items || []).sort((a,b) => (b.ts||0) - (a.ts||0)); });
          const chatsSnap = await db.collection('chats').get();
          chatsSnap.docs.forEach(d => { cache.chats[d.id] = (d.data().messages || []); });

          if (firebaseUser) {
            const uid = firebaseUser.uid;
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
              const u = { id: uid, ...userDoc.data() };
              cache.currentUser = u;
              setCurrentUser(u);
              if (!cache.users.some(x => x.id === uid)) cache.users.push(u);
            }
          } else {
            cache.currentUser = null;
            setCurrentUser(null);
          }
        } catch (e) { console.warn('Firebase init load failed', e); }
        done();
      });
    });
  };

  async function register(email, password, profileData) {
    const uc = await auth.createUserWithEmailAndPassword(email, password);
    const uid = uc.user.uid;
    const user = {
      id: uid,
      email,
      username: profileData.username || (email.split('@')[0]),
      userType: profileData.userType || 'talent',
      role: profileData.role || [],
      focus: profileData.focus || [],
      createdAt: Date.now()
    };
    await db.collection('users').doc(uid).set(user);
    await db.collection('profiles').doc(uid).set({
      ...(profileData.bio && { bio: profileData.bio }),
      ...(profileData.status && { status: profileData.status }),
      role: profileData.role || [],
      focus: profileData.focus || [],
      updatedAt: Date.now()
    }, { merge: true });
    cache.users = cache.users.filter(u => u.id !== uid).concat([user]);
    cache.profiles[uid] = { ...cache.profiles[uid], role: user.role, focus: user.focus };
    setCurrentUser(user);
    cache.currentUser = user;
    return user;
  }

  async function login(email, password) {
    await auth.signInWithEmailAndPassword(email, password);
    const uid = auth.currentUser.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) throw new Error('User document not found');
    const user = { id: uid, ...userDoc.data() };
    setCurrentUser(user);
    cache.currentUser = user;
    if (!cache.users.some(x => x.id === uid)) cache.users.push(user);
    return user;
  }

  function logout() {
    return auth.signOut().then(() => {
      setCurrentUser(null);
      cache.currentUser = null;
    });
  }

  function getUsers() {
    if (cache.users.length) return cache.users;
    return window.localStorageBackend ? window.localStorageBackend.getUsers() : [];
  }

  function saveUsers(users) {
    cache.users = users || [];
    users.forEach(u => { db.collection('users').doc(u.id).set(u, { merge: true }).catch(() => {}); });
  }

  function getProfile(userId) {
    return cache.profiles[userId] || (window.localStorageBackend ? window.localStorageBackend.getProfile(userId) : {});
  }

  function saveProfile(userId, data) {
    if (!cache.profiles[userId]) cache.profiles[userId] = {};
    Object.assign(cache.profiles[userId], data, { updatedAt: Date.now() });
    db.collection('profiles').doc(userId).set(cache.profiles[userId], { merge: true }).catch(() => {});
  }

  function getCurrentUser() {
    return cache.currentUser || (window.localStorageBackend ? window.localStorageBackend.getCurrentUser() : null);
  }

  function setCurrentUser(user) {
    cache.currentUser = user;
    if (user) localStorage.setItem('sh_currentUser', JSON.stringify(user));
    else localStorage.removeItem('sh_currentUser');
  }

  function getLikes(userId) {
    if (cache.likes[userId]) return cache.likes[userId];
    return window.localStorageBackend ? window.localStorageBackend.getLikes(userId) : [];
  }

  function addLike(userId, targetId) {
    if (!cache.likes[userId]) cache.likes[userId] = [];
    if (!cache.likes[userId].includes(targetId)) cache.likes[userId].push(targetId);
    db.collection('likes').doc(userId).set({ ids: cache.likes[userId] }, { merge: true }).catch(() => {});
  }

  function removeLike(userId, targetId) {
    if (cache.likes[userId]) cache.likes[userId] = cache.likes[userId].filter(id => id !== targetId);
    db.collection('likes').doc(userId).set({ ids: cache.likes[userId] || [] }, { merge: true }).catch(() => {});
  }

  function getSuperLikes(userId) {
    return cache.superLikes[userId] || [];
  }

  function addSuperLike(userId, targetId) {
    if (!cache.superLikes[userId]) cache.superLikes[userId] = [];
    if (!cache.superLikes[userId].includes(targetId)) cache.superLikes[userId].push(targetId);
    db.collection('superLikes').doc(userId).set({ ids: cache.superLikes[userId] }, { merge: true }).catch(() => {});
  }

  function removeSuperLike(userId, targetId) {
    if (cache.superLikes[userId]) cache.superLikes[userId] = cache.superLikes[userId].filter(id => id !== targetId);
    db.collection('superLikes').doc(userId).set({ ids: cache.superLikes[userId] || [] }, { merge: true }).catch(() => {});
  }

  function getPassed(userId) {
    return cache.passed[userId] || [];
  }

  function addPassed(userId, targetId) {
    if (!cache.passed[userId]) cache.passed[userId] = [];
    if (!cache.passed[userId].includes(targetId)) cache.passed[userId].push(targetId);
    db.collection('passed').doc(userId).set({ ids: cache.passed[userId] }, { merge: true }).catch(() => {});
  }

  function removePassed(userId, targetId) {
    if (cache.passed[userId]) cache.passed[userId] = cache.passed[userId].filter(id => id !== targetId);
    db.collection('passed').doc(userId).set({ ids: cache.passed[userId] || [] }, { merge: true }).catch(() => {});
  }

  function getFavorites(userId) {
    return cache.favorites[userId] || (window.localStorageBackend ? window.localStorageBackend.getFavorites(userId) : []);
  }

  function addFavorite(userId, targetId) {
    if (!cache.favorites[userId]) cache.favorites[userId] = [];
    if (!cache.favorites[userId].includes(targetId)) cache.favorites[userId].push(targetId);
    db.collection('favorites').doc(userId).set({ ids: cache.favorites[userId] }, { merge: true }).catch(() => {});
  }

  function removeFavorite(userId, targetId) {
    if (cache.favorites[userId]) cache.favorites[userId] = cache.favorites[userId].filter(id => id !== targetId);
    db.collection('favorites').doc(userId).set({ ids: cache.favorites[userId] || [] }, { merge: true }).catch(() => {});
  }

  function getChatBetween(uid1, uid2) {
    const key = [uid1, uid2].sort().join('_');
    return (cache.chats[key] || (window.localStorageBackend ? window.localStorageBackend.getChatBetween(uid1, uid2) : []));
  }

  function addChatMessage(uid1, uid2, msg) {
    const key = [uid1, uid2].sort().join('_');
    if (!cache.chats[key]) cache.chats[key] = [];
    cache.chats[key].push({ ...msg, id: Date.now() + Math.random() });
    db.collection('chats').doc(key).set({ messages: cache.chats[key] }, { merge: true }).catch(() => {});
  }

  function getNotifications(userId) {
    if (cache.notifications[userId]) return cache.notifications[userId];
    return window.localStorageBackend ? window.localStorageBackend.getNotifications(userId) : [];
  }

  function addNotification(userId, msg, type, fromUserId) {
    const item = { id: Date.now(), msg, type, fromUserId, ts: Date.now(), read: false };
    if (!cache.notifications[userId]) cache.notifications[userId] = [];
    cache.notifications[userId].unshift(item);
    db.collection('notifications').doc(userId).get().then(doc => {
      const items = (doc.exists ? doc.data().items || [] : []).slice(0, 99);
      items.unshift(item);
      db.collection('notifications').doc(userId).set({ items }).catch(() => {});
    }).catch(() => {});
  }

  function getMatches(userId) {
    const likes = getLikes(userId);
    const superLikes = getSuperLikes(userId);
    const all = [...new Set([...likes, ...superLikes])];
    return all.filter(likedId => getLikes(likedId).includes(userId));
  }

  window.firebaseBackend = {
    init: window.initFirebase,
    register, login, logout,
    getUsers, saveUsers, getProfile, saveProfile, getCurrentUser, setCurrentUser,
    getLikes, addLike, removeLike, getSuperLikes, addSuperLike, removeSuperLike, getPassed, addPassed, removePassed,
    getFavorites, addFavorite, removeFavorite, getChatBetween, addChatMessage,
    getNotifications, addNotification, getMatches,
    getProfiles: () => cache.profiles
  };
  var f = window.firebaseBackend;
  window.getUsers = f.getUsers; window.saveUsers = f.saveUsers; window.getProfile = f.getProfile; window.saveProfile = f.saveProfile;
  window.getCurrentUser = f.getCurrentUser; window.setCurrentUser = f.setCurrentUser;
  window.firebaseRegister = f.register; window.firebaseLogin = f.login; window.firebaseLogout = f.logout;
  window.getLikes = f.getLikes; window.addLike = f.addLike; window.removeLike = f.removeLike;
  window.getSuperLikes = f.getSuperLikes; window.addSuperLike = f.addSuperLike; window.removeSuperLike = f.removeSuperLike;
  window.getPassed = f.getPassed; window.addPassed = f.addPassed; window.removePassed = f.removePassed;
  window.getFavorites = f.getFavorites; window.addFavorite = f.addFavorite; window.removeFavorite = f.removeFavorite;
  window.getChatBetween = f.getChatBetween; window.addChatMessage = f.addChatMessage;
  window.getNotifications = f.getNotifications; window.addNotification = f.addNotification;
  window.getMatches = f.getMatches; window.getProfiles = f.getProfiles;
})();
