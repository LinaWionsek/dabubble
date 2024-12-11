import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { PasswordVisibilityService } from '../../services/password-visibility.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../shared-components/toast/toast.component';


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
    private toastService: ToastService
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

  signIn(): void {
    this.authService
      .signIn(this.email, this.password)
      .then(() => {
        console.log('Successful login');
        this.toastService.showToast('Login erfolgreich!');

        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 2250);
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
    }, 5000)
  }
}
