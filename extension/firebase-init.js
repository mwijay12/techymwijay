/**
 * Lightweight Firebase auth helper for Mwijay Tech Extension.
 * Stores auth credentials in chrome.storage.sync for seamless web app integration.
 */

export const EXTENSION_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCMJDUMO1-LJWkNCLJF6i8Di9rG4aZJwFU',
  authDomain: 'mwijaytech-b9c98.firebaseapp.com',
  projectId: 'mwijaytech-b9c98',
}

export async function getExtensionUser() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ['mwijay_user_id', 'mwijay_user_email', 'mwijay_user_name'],
      (result) => {
        if (result.mwijay_user_id) {
          resolve({
            uid: result.mwijay_user_id,
            email: result.mwijay_user_email,
            displayName: result.mwijay_user_name || 'Davie Mwijay',
          })
        } else {
          resolve({
            uid: 'davie-mwijay-extension',
            email: 'davie@mwijaytech.app',
            displayName: 'Davie Mwijay',
          })
        }
      }
    )
  })
}
