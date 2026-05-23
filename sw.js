const CACHE_NAME = 'game-v1';
const ASSETS = [
    './index.html',
    './game.js',
    './style.css',
    './icons/192.png' // добавь сюда все свои файлы
];

// Установка: скачиваем файлы в кэш
self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

// Перехват: если запрос есть в кэше — отдаем его, если нет — идем в сеть
self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
