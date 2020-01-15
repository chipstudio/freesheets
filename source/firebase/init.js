if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');
firebase.initializeApp({
  "apiKey": "AIzaSyCT8Y3iLtrvykT5sbTycqW_UFwrMisbWc4",
  "authDomain": "animake-app.firebaseapp.com",
  "databaseURL": "https://animake-app.firebaseio.com",
  "messagingSenderId": "195587146758",
  "projectId": "animake-app",
  "storageBucket": "animake-app.appspot.com"
});