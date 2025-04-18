import { Routes } from '@angular/router';
import { LogInComponent } from './auth-layout/log-in/log-in.component';
import { MainPageComponent } from './main-page/main-page.component';
import { RegistrationComponent } from './auth-layout/registration/registration.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { AvatarSelectionComponent } from './auth-layout/avatar-selection/avatar-selection.component';
import { authGuard, reverseAuthGuard } from './guards/auth.guard';
import { PasswordResetComponent } from './auth-layout/password-reset/password-reset.component';
import { NewPasswordComponent } from './auth-layout/new-password/new-password.component';
import { ImprintComponent } from './auth-layout/legal/imprint/imprint.component';
import { PrivacyPolicyComponent } from './auth-layout/legal/privacy-policy/privacy-policy.component';
import { EmailVerificationComponent } from './auth-layout/email-verification/email-verification.component';
import { ActionHandlerComponent } from './action-handler/action-handler.component';
import { ChangeEmailComponent } from './auth-layout/change-email/change-email.component';


export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route redirects to login
      {
        path: 'login',
        component: LogInComponent,
        canActivate: [reverseAuthGuard],
      }, // Only accessible if NOT logged in
      {
        path: 'registration',
        component: RegistrationComponent,
        canActivate: [reverseAuthGuard],
      }, // Only accessible if NOT logged in
      {
        path: 'avatar-selection',
        component: AvatarSelectionComponent,
        canActivate: [reverseAuthGuard],
      }, // Next step after registration
      {
        path: 'password-reset',
        component: PasswordResetComponent,
        canActivate: [reverseAuthGuard],
      }, // Public password reset request page
      {
        path: 'new-password',
        component: NewPasswordComponent,
      }, // Handles setting a new password via oobCode
      {
        path: 'email-verification',
        component: EmailVerificationComponent,
      }, // Shown after email is verified
      {
        path: 'change-email',
        component: ChangeEmailComponent,
      }, // Finalizes email change requests
      {
        path: 'action-handler',
        component: ActionHandlerComponent, 
      }, // Processes Firebase email links and redirects accordingly
      { path: 'imprint', component: ImprintComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
    ],
  },
  { path: 'main', component: MainPageComponent, canActivate: [authGuard] }, 
  // Protected main page, only for authenticated users
];
