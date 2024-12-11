import { Routes } from '@angular/router';
import { LogInComponent } from './auth-layout/log-in/log-in.component';
import { MainPageComponent } from './main-page/main-page.component';
import { RegistrationComponent } from './auth-layout/registration/registration.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { AvatarSelectionComponent } from './auth-layout/avatar-selection/avatar-selection.component';
import { authGuard, reverseAuthGuard } from './guards/auth.guard';
import { PasswordResetComponent } from './auth-layout/password-reset/password-reset.component';
import { NewPasswordComponent } from './auth-layout/new-password/new-password.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        component: LogInComponent,
        canActivate: [reverseAuthGuard],
      },
      {
        path: 'registration',
        component: RegistrationComponent,
        canActivate: [reverseAuthGuard],
      },
      {
        path: 'avatar-selection',
        component: AvatarSelectionComponent,
        canActivate: [reverseAuthGuard],
      },
      {
        path: 'password-reset',
        component: PasswordResetComponent,
        canActivate: [reverseAuthGuard],
      },
      {
        path: 'new-password',
        component: NewPasswordComponent,
        // canActivate: [reverseAuthGuard],
      },
    ],
  },
  { path: 'main', component: MainPageComponent, canActivate: [authGuard] },
];
