import { Component } from '@angular/core';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared-components/toast/toast.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [AuthHeaderComponent, CommonModule, FormsModule, ToastComponent],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss',
})
export class PasswordResetComponent {
  email: string = '';

  constructor(
    private toastService: ToastService,
    private afAuth: AngularFireAuth
  ) {}

  sendPasswordResetMail() {
    this.afAuth
      .sendPasswordResetEmail(this.email, {
        url: 'https://dabubble-5d76a.firebaseapp.com/new-password',
      })
      .then(() => {
        this.toastService.showToast('Email gesendet!');
        this.email = '';
      })
      .catch((error) => {
        console.error('Fehler beim senden der Passwort-Reset-E-Mail!', error);
      });
  }
}
