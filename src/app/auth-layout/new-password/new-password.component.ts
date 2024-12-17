import { Component, OnInit } from '@angular/core';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared-components/toast/toast.component';
import { PasswordVisibilityService } from '../../services/password-visibility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [AuthHeaderComponent, CommonModule, FormsModule, ToastComponent],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss',
})
export class NewPasswordComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  oobCode: string = '';

  constructor(
    private toastService: ToastService,
    public passwordVisibilityService: PasswordVisibilityService,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.oobCode = params['oobCode'];
    });
  }

  togglePassword(): void {
    this.passwordVisibilityService.togglePasswordInputType();
  }

  getPasswordError(field: 'password' | 'confirmPassword'): string {
    const value = field === 'password' ? this.password : this.confirmPassword;

    if (!value || value.length < 8) {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    }

    if (
      this.password &&
      this.confirmPassword &&
      this.password.length >= 8 &&
      this.confirmPassword.length >= 8 &&
      this.password !== this.confirmPassword
    ) {
      return 'Die Passwörter müssen übereinstimmen.';
    }
    return '';
  }

  isResetFormValid() {
    return (
      !this.getPasswordError('password') &&
      !this.getPasswordError('confirmPassword')
    );
    // return (
    //   this.password &&
    //   this.confirmPassword &&
    //   this.password.length >= 8 &&
    //   this.confirmPassword.length >= 8 &&
    //   this.password === this.confirmPassword
    // );
  }

  setNewPassword(): void {
    if (this.oobCode && this.password) {
      this.afAuth
        .confirmPasswordReset(this.oobCode, this.password)
        .then(() => {
          this.toastService.showToast('Passwort erfoglreich geändert!');
          this.password = '';
          this.confirmPassword = '';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2250);
        })
        .catch((error) => {
          console.error('Fehler beim Zurücksetzen des Passworts: ' + error);
        });
    }
  }
}
