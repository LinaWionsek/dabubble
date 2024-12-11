import { Component } from '@angular/core';
import { AuthService } from '../../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-user-dialog',
  standalone: true,
  imports: [],
  templateUrl: './header-user-dialog.component.html',
  styleUrl: './header-user-dialog.component.scss',
})
export class HeaderUserDialogComponent {

  constructor(private authService: AuthService, private router: Router) {}
  signOut() {
    this.authService.signOut();

    //Timeout because of the AuthGuard, u need to press Logout twice otherwise ?!
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1);
  }
}
