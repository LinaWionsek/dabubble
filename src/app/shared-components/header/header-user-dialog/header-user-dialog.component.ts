import { Component } from '@angular/core';
import { AuthService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { ChannelService } from '../../../services/channel.service';


@Component({
  selector: 'app-header-user-dialog',
  standalone: true,
  imports: [],
  templateUrl: './header-user-dialog.component.html',
  styleUrl: './header-user-dialog.component.scss',
})
export class HeaderUserDialogComponent {

  constructor(private authService: AuthService, private router: Router, private channelService: ChannelService) {
    
  }
  signOut() {
    this.authService.signOut();
    this.authService.setOnlineStatus(false);
    this.channelService.clearActiveChannel();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1);
  }
}
