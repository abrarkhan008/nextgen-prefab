// src/lib/notifications.js
// Handles the "alarm-style" reminders using Capacitor's Local Notifications.
// Install first (see instructions):
//   npm install @capacitor/local-notifications
//   npx cap sync

import { LocalNotifications } from "@capacitor/local-notifications";

// Call this once, e.g. when the app starts (in App.jsx) or from Settings.
export async function setupReminders() {
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return false;

  // 1) Daily 9 AM reminder: "update payment"
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1001,
        title: "Update Payment",
        body: "Don't forget to update today's payment entry.",
        schedule: { on: { hour: 9, minute: 0 }, allowWhileIdle: true },
      },
      // 2) GST reminder — 4th of every month, morning
      {
        id: 1002,
        title: "GST Payment Due",
        body: "Reminder: pay this month's GST payment.",
        schedule: { on: { day: 4, hour: 9, minute: 0 }, allowWhileIdle: true },
      },
      // 3) GST reminder — 4th of every month, evening
      {
        id: 1003,
        title: "GST Payment Due",
        body: "Evening reminder: GST payment still pending for this month.",
        schedule: { on: { day: 4, hour: 18, minute: 0 }, allowWhileIdle: true },
      },
    ],
  });
  return true;
}

// Call this if the user turns reminders off in Settings.
export async function cancelReminders() {
  await LocalNotifications.cancel({ notifications: [{ id: 1001 }, { id: 1002 }, { id: 1003 }] });
}