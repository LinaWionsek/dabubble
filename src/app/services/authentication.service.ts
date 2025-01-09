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
  UserCredential,
  sendSignInLinkToEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query, 
  collection, 
  where, 
  getDocs 
} from '@angular/fire/firestore';
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

  signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signOut() {
    return signOut(this.auth);
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  saveUserData(uid: string, userData: any) {
    const userRef = doc(this.firestore, `users/${uid}`);
    return setDoc(userRef, userData, { merge: true });
  }

  updateUserData(uid: string, updatedData: Partial<User>) {
    let userRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userRef, updatedData);
  }

  getUserStatus() {
    return this.userStatus.asObservable();
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  async getPendingEmail(userId: string): Promise<string | null> {
    let userDocRef = doc(this.firestore, `users/${userId}`);
    let userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      let userData = userDoc.data();
      return userData['pendingEmail'] || null;
    } else {
      return null;
    }
  }

  async getUserByPendingEmail(email: string): Promise<User | null> {
    const usersCollection = collection(this.firestore, 'users');
    const emailQuery = query(usersCollection, where('pendingEmail', '==', email));
    const querySnapshot = await getDocs(emailQuery);
  
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as userData;
      return new User({ id: userDoc.id, ...userData });
    }
    return null;
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
        pendingEmail: userFirestoreData?.pendingEmail ?? '',
        lastReactions: userFirestoreData?.lastReactions?? []
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

  async reauthenticateUser(email: string, password: string): Promise<void> {
    let user = this.auth.currentUser;

    if (!user) {
      throw new Error('Kein Benutzer ist aktuell authentifiziert.');
    }

    try {
      let credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      console.error('Fehler bei der Re-Authentifizierung:', error);
      throw error;
    }
  }
}
