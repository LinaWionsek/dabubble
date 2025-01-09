import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-action-handler',
  template: '',
})
export class ActionHandlerComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    const oobCode = this.route.snapshot.queryParamMap.get('oobCode');

    if (!mode || !oobCode) {
      console.error('Ungültige Anfrage: Modus oder Code fehlen');
      this.router.navigate(['/']);
      return;
    }

    this.handleAction(mode, oobCode);
  }

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

  private navigateTo(route: string, oobCode: string): void {
    this.router.navigate([`/${route}`], {
      queryParams: { oobCode },
    });
  }
}
