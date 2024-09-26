var filesToCache = [
    "/",
    "manifest.json",
];

var staticCacheName = "task_tracker";

self.addEventListener('install', event => {
    console.log('Service worker installing…');    
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            return cache.addAll(filesToCache);
        })
    );

});

self.addEventListener("activate", (event) => {
    console.log(
        "******************   Activating new service worker... *******************************"
    );

    const cacheWhitelist = [staticCacheName];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


self.addEventListener('fetch', event => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => {
                if (response) {
                    console.log("Found " + event.request.url + " in cache!");
                    return response;
                }
                console.log(
                    "----------------->> Network request for ",
                    event.request.url
                );
                return fetch(event.request).then((response) => {
                    console.log("response.status = " + response.status);
                    if (response.status === 404) {
                        return caches.match("404.html");
                    }
                    return caches.open(staticCacheName).then((cache) => {
                        console.log(">>> Caching: " + event.request.url);
                        cache.put(event.request.url, response.clone());
                        return response;
                    });
                });
            })
            .catch((error) => {
                console.log("Error", event.request.url, error);
                return caches.match("/");
            })
    );

});


var localStorageData;

// PRIMAJU SE PODACI IZ LOCAL STORAGE-A
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'localStorageData') {
      const receivedData = event.data.data;
      localStorageData = receivedData;
    }
});


self.addEventListener('sync', function (event) {
    console.log('Background sync!', event);
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
}});

var syncTasks = async function () {
    let formData = new FormData();
    formData.append('syncData', JSON.stringify(localStorageData));

    console.log('saljem podatke na backend...');
    fetch('/saveTask', {
        method: 'POST',
        body: formData
    })
    .then(function (res) {
        if (res.ok) {
            console.log("Sinkronizacija uspjesno napravljena!");
        } else {
            console.log(res);
        }
    })
    .catch(function (error) {
        console.log(error);
    });
}

self.addEventListener("notificationclick", (event) => {
    let notification = event.notification;
    notification.close();
    console.log("notificationclick", notification);
    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(function (clis) {
                if (clis && clis.length > 0) {
                    clis.forEach(async (client) => {
                        await client.navigate(notification.data.redirectUrl);
                        return client.focus();
                    });
                } else if (clients.openWindow) {
                    return clients
                        .openWindow(notification.data.redirectUrl)
                        .then((windowClient) =>
                            windowClient ? windowClient.focus() : null
                        );
                }
            })
    );
});

self.addEventListener("notificationclose", function (event) {
    console.log("notificationclose", event);
});



self.addEventListener("push", function (event) {
    console.log("push event", event);

    var data = { title: "title", body: "body", redirectUrl: "/" };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.body,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        data: {
            redirectUrl: data.redirectUrl,
        },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});
