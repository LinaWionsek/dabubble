import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router, NavigationStart } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
import { RegistrationDataService } from '../../services/registration-data.service';
import { AuthHeaderComponent } from '../auth-header/auth-header.component';
import { Subscription } from 'rxjs';
import { PasswordVisibilityService } from '../../services/password-visibility.service';
import { AuthService } from '../../services/authentication.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthHeaderComponent],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent implements OnInit {
  showPrivacyPolicyError: boolean = false;
  isCheckboxChecked: boolean = false;
  fullName: string = '';
  email: string = '';
  password: string = '';
  private navigationSubscription: Subscription | null = null;
  @ViewChild('emailInput') emailInput!: NgModel;
  emailErrorMessage: string = 'Diese E-Mail ist leider ungültig';
  isEmailInUse: boolean = false;
  isValidEmail: boolean = false;
  isValidName: boolean = true;

  constructor(
    private router: Router,
    private registrationDataService: RegistrationDataService,
    public passwordVisibilityService: PasswordVisibilityService,
    private authService: AuthService,
    public auth: Auth
  ) {}

  ngOnInit(): void {
    this.passwordVisibilityService.resetPasswordVisibility();
    this.fillRegistrationForm();
    this.checkNavigation();
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
      this.navigationSubscription = null;
    }
  }

/**
   * Loads previously entered registration data from the service
   * and pre-fills the form fields. This is useful in multi-step
   * registration flows where data from earlier steps is reused,
   * such as transitioning to or from the avatar selection step.
   * 
   * Even if no data exists yet, calling this method is safe,
   * as it simply assigns empty strings as fallbacks.
   */
  fillRegistrationForm(): void {
    const userData = this.registrationDataService.getUserData();
    if (userData) {
      this.fullName = `${userData.firstName ?? ''} ${
        userData.lastName ?? ''
      }`.trim();
      this.email = userData.email ?? '';
      this.password = userData.password ?? '';
    }
  }
  
 /**
   * Listens to route changes. If the user navigates to the login page,
   * any temporarily stored registration data is cleared.
   */
  checkNavigation(): void {
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.url === '/login') {
          this.clearRegistrationForm();
        }
      }
    });
  }

  clearRegistrationForm(): void {
    this.registrationDataService.clearUserData();
  }

  togglePassword(): void {
    this.passwordVisibilityService.togglePasswordInputType();
  }

  async saveUserData() {
    const [firstName, ...lastNameParts] = this.fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ');

    this.registrationDataService.setUserData({
      firstName,
      lastName,
      email: this.email,
      password: this.password,
    });

    this.router.navigate(['/avatar-selection']);
  }

   /**
   * Validates the format of the entered email address using a basic regex.
   */
  validateEmail(email: string): void {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    this.isValidEmail = !emailRegex.test(email);
  }

  /**
   * Checks whether the entered full name contains at least a first and last name.
   */
  validateFullName(): void {
    let fullNameParts = this.fullName.trim().split(/\s+/);
    this.isValidName = fullNameParts.length >= 2;
  }
  

  async isEmailAlreadyUsed(): Promise<boolean> {
    if (!this.email || this.email.trim() === '') {
      this.isEmailInUse = false;
      return false;
    }

    try {
      let emailUsed = await this.authService.isEmailAlreadyUsed(this.email);
      this.isEmailInUse = emailUsed;
      let currentUser = this.auth.currentUser;

      if (emailUsed || this.emailInput.value == currentUser?.email) {
        this.emailErrorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
      } else {
        this.emailErrorMessage = 'Diese E-Mail ist leider ungültig.';
      }
      return emailUsed;
    } catch (error) {
      console.error('Fehler bei der E-Mail-Überprüfung:', error);
      this.emailErrorMessage = 'Fehler beim Überprüfen der E-Mail-Adresse.';
      this.isEmailInUse = true;
      return true;
    }
  }
}
