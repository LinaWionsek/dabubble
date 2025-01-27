import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { PasswordVisibilityService } from '../../services/password-visibility.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared-components/toast/toast.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuthHeaderComponent,
    FormsModule,
    CommonModule,
    ToastComponent,
    RouterModule,
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent implements OnInit {
  email: string = '';
  password: string = '';
  loginFailed: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    public passwordVisibilityService: PasswordVisibilityService,
    private toastService: ToastService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.loginFailed = false;
    this.passwordVisibilityService.resetPasswordVisibility();
  }

  navigateToMainPage() {
    this.router.navigate(['/main']);
  }

  togglePassword(): void {
    this.passwordVisibilityService.togglePasswordInputType();
  }

  onEnter(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    event.preventDefault();
    this.signIn();
  }

  signIn(): void {
    this.authService
      .signIn(this.email, this.password)
      .then(() => {
        this.toastService.showToast('Login erfolgreich!');
        this.email = '';
        this.password = '';

        setTimeout(() => {
          this.navigateToMainPage();
          this.authService.setOnlineStatus(true);
        }, 1000);
      })
      .catch((error) => {
        this.showLoginError();
        console.error(error);
      });
  }

  showLoginError(): void {
    this.loginFailed = true;
    setTimeout(() => {
      this.loginFailed = false;
    }, 5000);
  }

  async loginWithGoogle(): Promise<void> {
    let provider = new GoogleAuthProvider();

    try {
      let result = await this.afAuth.signInWithPopup(provider);
      let user = result.user;

      if (!user) {
        throw new Error('Kein Benutzer-Datenobjekt gefunden.');
      }

      const fullName = user.displayName || '';
      const [firstName, ...lastNameParts] = fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ');

      const userData: User = new User({
        id: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
        avatar: 'assets/img/avatar_empty.png',
        isOnline: true,
      });

      this.toastService.showToast('Google Login erfolgreich!');
      await this.authService.saveUserData(user.uid, userData.toPlainObject());
      this.authService.setOnlineStatus(true);

      setTimeout(() => {
        this.navigateToMainPage();
      }, 2250);
    } catch (error) {
      console.error('Fehler beim Verarbeiten der Benutzerdaten:', error);
    }
  }

  async loginAsGuest(): Promise<void> {
    try {
      const result = await this.afAuth.signInAnonymously();
      const user = result.user;

      if (user) {
        const guestData: User = new User({
          id: user.uid,
          firstName: 'Guest',
          lastName: '',
          email: 'guest@example.com',
          avatar: 'assets/img/avatar_empty.png',
          isOnline: true,
        });

        this.toastService.showToast('Gäste Login erfolgreich!');
        await this.authService.saveUserData(
          user.uid,
          guestData.toPlainObject()
        );
        this.authService.setOnlineStatus(true);

        setTimeout(() => {
          this.navigateToMainPage();
        }, 1000);
      }
    } catch (error) {
      console.error('Fehler beim Guest-Login:', error);
    }
  }
}
