import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"dabubble-5d76a","appId":"1:1071462683293:web:f9a7470fddf5b54152ba74","storageBucket":"dabubble-5d76a.firebasestorage.app","apiKey":"AIzaSyCJIiLU3fdsW85OktOpe28MMXpdl_BhB4I","authDomain":"dabubble-5d76a.firebaseapp.com","messagingSenderId":"1071462683293"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
