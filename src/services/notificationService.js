import api from './api';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }
  if (Notification.permission === 'granted') {
    await subscribeUser();
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribeUser();
    }
  }
};

const subscribeUser = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    });
    await api.post('/api/users/subscribe', subscription.toJSON()); // ✅ added /api
    console.log('Push subscription sent to server');
  } catch (error) {
    console.error('Failed to subscribe:', error);
  }
};

function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    console.error('VAPID Public Key is missing!');
    return new Uint8Array(0);
  }
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}