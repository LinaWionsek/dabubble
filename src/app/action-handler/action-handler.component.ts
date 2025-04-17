import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-action-handler',
  template: '',
})
export class ActionHandlerComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
     // Extracts query parameters from the URL
    const mode = this.route.snapshot.queryParamMap.get('mode');
    const oobCode = this.route.snapshot.queryParamMap.get('oobCode');

    // If parameters are missing, redirect to home
    if (!mode || !oobCode) {
      console.error('Ungültige Anfrage: Modus oder Code fehlen');
      this.router.navigate(['/']);
      return;
    }
    // Handle the incoming action based on the mode
    this.handleAction(mode, oobCode);
  }

   /**
   * Determines what kind of action should be taken based on the "mode" parameter.
   * Redirects to the appropriate route for email verification, password reset, etc.
   * 
   * @param mode - The type of Firebase action (verifyEmail, resetPassword, etc.)
   * @param oobCode - One-time code from Firebase to validate the request
   */
  private handleAction(mode: string, oobCode: string): void {
    switch (mode) {
      case 'verifyEmail':
        this.navigateTo('email-verification', oobCode);
        break;

      case 'resetPassword':
        this.navigateTo('new-password', oobCode);
        break;

      case 'verifyAndChangeEmail':
        this.navigateTo('change-email', oobCode);
        break;

      default:
        console.error('Unbekannter Modus:', mode);
        this.router.navigate(['/']);
    }
  }

   /**
   * Navigates to the specified route and passes the oobCode as a query parameter.
   *
   * @param route - The internal route to navigate to
   * @param oobCode - The one-time code to be passed along
   */
  private navigateTo(route: string, oobCode: string): void {
    this.router.navigate([`/${route}`], {
      queryParams: { oobCode },
    });
  }
}
