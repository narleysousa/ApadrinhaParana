import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

const camposObrigatorios = ['apiKey', 'authDomain', 'projectId', 'appId'] as const

export const firebaseConfigurado = camposObrigatorios.every((campo) =>
  Boolean(firebaseConfig[campo])
)

const firebaseApp = firebaseConfigurado
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

export const db = firebaseApp ? getFirestore(firebaseApp) : null
