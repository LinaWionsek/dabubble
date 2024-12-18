import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.class';
import { userData } from '../types/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userStatus = new BehaviorSubject<User | null>(null);

  constructor(public auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getFullUser();
        this.userStatus.next(user || this.getGuestUser());
      } else {
        this.userStatus.next(this.getGuestUser());
      }
    });
  }

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signOut() {
    return signOut(this.auth);
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async saveUserData(uid: string, userData: any) {
    const userRef = doc(this.firestore, `users/${uid}`);
    return setDoc(userRef, userData, { merge: true });
  }

  getUserStatus() {
    return this.userStatus.asObservable();
  }

  async getFullUser(): Promise<User | null> {
    const currentUser: FirebaseUser | null = this.auth.currentUser;

    if (!currentUser) {
      return null;
    }

    try {
      const userRef = doc(this.firestore, `users/${currentUser.uid}`);
      const userSnap = await getDoc(userRef);
      const userFirestoreData = userSnap.data() as userData | undefined;

      const userData: userData = {
        id: currentUser.uid,
        email: currentUser.email ?? '',
        firstName: userFirestoreData?.firstName ?? '',
        lastName: userFirestoreData?.lastName ?? '',
        avatar: userFirestoreData?.avatar ?? '',
        isOnline: userFirestoreData?.isOnline ?? false,
      };

      return new User(userData);
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzerprofils:', error);
      return this.getGuestUser();
    }
  }

  private getGuestUser(): User {
    return new User({
      id: 'guest',
      firstName: 'Guest',
      lastName: '',
      email: '',
      avatar: './../../../assets/img/avatar_empty.png',
      isOnline: false,
    });
  }

  async setOnlineStatus(isOnline: boolean): Promise<void> {
    const currentUser: FirebaseUser | null = this.auth.currentUser;

    if (!currentUser) {
      console.warn(
        'Kein Benutzer eingeloggt. Onlinestatus kann nicht gesetzt werden.'
      );
      return;
    }

    try {
      const userRef = doc(this.firestore, `users/${currentUser.uid}`);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await setDoc(
          userRef,
          {
            isOnline: isOnline,
          },
          { merge: true }
        );
        console.log(
          `Onlinestatus für Benutzer ${currentUser.uid} auf ${isOnline} gesetzt.`
        );
      }
    } catch (error) {
      console.error('Fehler beim Setzen des Onlinestatus:', error);
    }
  }
}
