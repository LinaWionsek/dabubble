import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { RegistrationDataService } from '../../services/registration-data.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared-components/toast/toast.component';
import { AuthHeaderComponent } from "../auth-header/auth-header.component";

@Component({
  selector: 'app-avatar-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ToastComponent, AuthHeaderComponent],
  templateUrl: './avatar-selection.component.html',
  styleUrl: './avatar-selection.component.scss',
})
export class AvatarSelectionComponent {
  avatars = [
    {
      name: 'avatar_1',
      thumb: 'assets/img/avatar_1.png',
      image: 'assets/img/avatar_1_large.png',
    },
    {
      name: 'avatar_2',
      thumb: 'assets/img/avatar_2.png',
      image: 'assets/img/avatar_2_large.png',
    },
    {
      name: 'avatar_3',
      thumb: 'assets/img/avatar_3.png',
      image: 'assets/img/avatar_3_large.png',
    },
    {
      name: 'avatar_4',
      thumb: 'assets/img/avatar_4.png',
      image: 'assets/img/avatar_4_large.png',
    },
    {
      name: 'avatar_5',
      thumb: 'assets/img/avatar_5.png',
      image: 'assets/img/avatar_5_large.png',
    },
    {
      name: 'avatar_6',
      thumb: 'assets/img/avatar_6.png',
      image: 'assets/img/avatar_6_large.png',
    },
  ];

  selectedAvatar: string = 'assets/img/avatar_empty.png';

  constructor(
    private authService: AuthService,
    private router: Router,
    private registrationDataService: RegistrationDataService,
    private toastService: ToastService
  ) {}

  get isAvatarEmpty(): boolean {
    return this.selectedAvatar === 'assets/img/avatar_empty.png';
  }

  selectAvatar(avatarImageSource: string): void {
    this.selectedAvatar = avatarImageSource;
  }

  async registerUser() {
    if (!this.selectedAvatar) {
      console.error('Kein Avatar ausgewählt.');
      return;
    }

    try {
      this.registrationDataService.setAvatar(this.selectedAvatar);
      const registrationData = this.registrationDataService.getUserData();

      if (!registrationData.email || !registrationData.password || !registrationData.firstName || !registrationData.lastName) {
        console.error('Registrierungsdaten fehlen.');
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
      await this.authService.saveUserData(result.user.uid, userData.toPlainObject());
      this.registrationDataService.clearUserData();

      setTimeout(() => {
        this.router.navigate(['/main']);
      }, 2250);
      console.log('Benutzer erfolgreich registriert:', userData);
    } catch (error) {
      console.error('Fehler bei der Registrierung:', error);
    }
  }
}
