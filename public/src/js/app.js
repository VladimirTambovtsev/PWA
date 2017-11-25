
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});


function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
     var options = {
      body: 'Body text',
      icon: '/src/images/icons/app-icon-96x96.png', // icon on the right side
      image: '/src/images/sf-boat.jpg', // show image on Android
      dir: 'rtl', // right to left || left to right
      lang: 'en-US', // check BCP 47 to change language
      vibrate: [100, 50, 200], // vibration on some Android devices
      badge: '/src/images/icons/app-icon-96x96.png', // small icon on the right top corner for Android 
      tag: 'confirm-notification', // like id for notification (for unique notif.)
      renotify: true, // vibrate again or not (on some Android devices)
      actions: [ // additional questions
        { action: 'confirm', title: 'ok', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };
    navigator.serviceWorker.ready
      .then(function(swreg) {
        swreg.showNotification('Successfully subscribed', options);
      });
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function(sub) {
      if (sub === null) {
        // Create a new subscription
        var vapidPublicKey = 'BDih4VytgrcI0p4xtqFQMpHeFQeNHK-DAvksvletcONyzrpxfRvnEaU0aOoso4wgID9HF1_ZfoW2g_rU_x1zmX0';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
        // We have a subscription
      }
    })
    .then(function(newSub) {
      return fetch('https://pwapplication-95a6f.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function(res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      configurePushSub();
      // displayConfirmNotification();
    }
  });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}