import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBzZtrFwdCiWX3VrUBN0vgNYV-0k3ghQO0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'apadrinha-parana.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'apadrinha-parana',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'apadrinha-parana.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '682179178976',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:682179178976:web:48b6186a4a2b2decf5bb85',
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
