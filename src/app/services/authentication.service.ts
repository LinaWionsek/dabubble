import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userStatus = new BehaviorSubject<User | null>(null);

  constructor(public auth: Auth, private firestore: Firestore) {
    this.auth.onAuthStateChanged((user) => {
      this.userStatus.next(user);
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

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  getAuthStatus() {
    return this.userStatus.asObservable();
  }
}
