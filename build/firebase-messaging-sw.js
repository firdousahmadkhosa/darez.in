importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyB3mDzUQ8yWzICx0RTC846o3guLCd4B_cQ",
  authDomain: "new-pushit-ded20.firebaseapp.com",
  projectId: "new-pushit-ded20",
  storageBucket: "new-pushit-ded20.appspot.com",
  messagingSenderId: "1051083950670",
  appId: "1:1051083950670:web:b62807040160cd5740111f",
  measurementId: "G-7YKNQC8RYR",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = { body: payload.notification.body };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
