import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { RegistrationDataService } from '../../services/registration-data.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared-components/toast/toast.component';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import {
  Avatar,
  AvatarSelectionService,
} from '../../services/avatar-selection.service';
import { sendEmailVerification } from '@angular/fire/auth';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-avatar-selection',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ToastComponent,
    AuthHeaderComponent,
  ],
  templateUrl: './avatar-selection.component.html',
  styleUrl: './avatar-selection.component.scss',
})
export class AvatarSelectionComponent implements OnInit {
  avatars: Avatar[] = [];
  selectedAvatar: string = 'assets/img/avatar_empty.png';
  userName: string = '';
  isRegistering: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private registrationDataService: RegistrationDataService,
    private toastService: ToastService,
    private avatarService: AvatarSelectionService,
    private stateService: StateService,
  ) {}

  ngOnInit(): void {
    this.avatars = this.avatarService.getAvatars();
  }

  get isAvatarEmpty(): boolean {
    return this.selectedAvatar === 'assets/img/avatar_empty.png';
  }

  selectAvatar(avatarImageSource: string): void {
    this.avatarService.setSelectedAvatar(avatarImageSource);
    this.selectedAvatar = avatarImageSource;
  }

  getUserName() {
    this.userName = this.registrationDataService.getUserName();
    return this.userName;
  }

  async registerUser() {
    if (!this.selectedAvatar) {
      return;
    }

    try {
      this.registrationDataService.setAvatar(this.selectedAvatar);
      const registrationData = this.registrationDataService.getUserData();

      if (
        !registrationData.email ||
        !registrationData.password ||
        !registrationData.firstName ||
        !registrationData.lastName
      ) {
        return;
      }
      const result = await this.authService.signUp(
        registrationData.email,
        registrationData.password
      );

      const userData: User = new User({
        id: result.user.uid,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        avatar: this.selectedAvatar,
        isOnline: true,
      });

      this.toastService.showToast('Konto erfolgreich erstellt!');
      await this.authService.saveUserData(
        result.user.uid,
        userData.toPlainObject()
      );
      await sendEmailVerification(result.user);
      this.isRegistering = true;
      
      setTimeout(() => {
        this.stateService.setState('message', 'Verifizierungs-E-Mail wurde gesendet');
        this.router.navigate(['/main']);
        this.registrationDataService.clearUserData();
      }, 2250);
    } catch (error) {
      console.error('Fehler bei der Registrierung:', error);
    } finally {
      this.isRegistering = false;
    }
  }
}
