import { Component, OnInit } from '@angular/core';
import {
  Auth,
  updateEmail,
  applyActionCode,
  checkActionCode,
} from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { AuthService } from '../../services/authentication.service';
import { PasswordVisibilityService } from '../../services/password-visibility.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './change-email.component.html',
  styleUrl: './change-email.component.scss',
})
export class ChangeEmailComponent implements OnInit {
  isError: boolean = false;
  errorMessage: string | null = null;
  currentEmail: string | null = '';
  newEmail: string = '';
  isPasswordRequired: boolean = false;
  isPasswordInvalid: boolean = false;
  changeEmailPassword: string = '';
  oobCode: string = '';

  constructor(
    public auth: Auth,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public passwordVisibilityService: PasswordVisibilityService
  ) {}

  ngOnInit(): void {
    let oobCode = this.activatedRoute.snapshot.queryParamMap.get('oobCode');
    
    
    if (oobCode) {
      this.oobCode = oobCode;
      this.isPasswordRequired = true;
    } else {
      this.isError = true;
      this.errorMessage = 'Ungültiger Link: Kein Code gefunden.';
    }
  }

  togglePassword() {
    this.passwordVisibilityService.togglePasswordInputType();
  }

  async confirmPassword() {
    try {
      let actionInfo = await checkActionCode(this.auth, this.oobCode);
      let email = actionInfo.data.email;

      if (!email) {
        throw new Error('Neue E-Mail-Adresse konnte nicht abgerufen werden.');
      }

      this.newEmail = email;

      let user = await this.authService.getUserByPendingEmail(this.newEmail);
      if (!user) {
        throw new Error('Kein Benutzer mit dieser E-Mail gefunden.');
      }

      await this.authService.reauthenticateUser(
        user.email,
        this.changeEmailPassword
      );

      console.log(user.email,this.changeEmailPassword);
      console.log("reauthenticateUser" + "augerufen");
      
      

      await this.confirmEmailChange();
      this.isPasswordRequired = false;
    } catch (error) {
      console.error('Fehler bei der Verifizierung des Passworts:', error);
      this.isPasswordInvalid = true;
      setTimeout(() => {
        this.isPasswordInvalid = false;
      }, 5000);
    }
    return;
  }

  async confirmEmailChange(): Promise<void> {
    try {
      let firebaseUser = this.auth.currentUser;
      console.log(firebaseUser);
      

      if (!firebaseUser) {
        throw new Error('Kein authentifizierter Benutzer gefunden.');
      }

      this.currentEmail = firebaseUser.email;

      await applyActionCode(this.auth, this.oobCode);
      await updateEmail(firebaseUser, this.newEmail);

      const updatedData: Partial<User> = {
        email: this.newEmail,
        pendingEmail: '',
      };
      await this.authService.updateUserData(firebaseUser.uid, updatedData);
      
    } catch (error) {
      console.error('Fehler bei der E-Mail-Änderung:', error);
    } finally {
      this.authService.signOut();
    }
  }
}
