// Firebase init - load only when firebase-config.js has valid config
(function() {
  if (typeof firebaseConfig === 'undefined' || !firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') return;
  try {
    firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();
    window.firebaseStorage = firebase.storage();
  } catch (e) { console.warn('Firebase init failed', e); }
})();
