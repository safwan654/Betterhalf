self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const title = data.title || 'BetterHalf Alert';
    const options = {
      body: data.body || 'You have a new update in BetterHalf',
      icon: data.icon || '/icon-192.png',
      badge: '/badge-72.png',
      data: { url: data.url || '/' },
      vibrate: [100, 50, 100],
      tag: 'betterhalf-notification'
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error handling push event', err);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
