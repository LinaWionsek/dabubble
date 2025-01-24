import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { ChannelService } from '../../../services/channel.service';
import { ChatService } from '../../../services/dm-chat.service';

@Component({
  selector: 'app-header-user-dialog',
  standalone: true,
  imports: [],
  templateUrl: './header-user-dialog.component.html',
  styleUrl: './header-user-dialog.component.scss',
})
export class HeaderUserDialogComponent {
  isUserProfileOpen: boolean = false;
  selectedUserId: string | null = null;
  @Output() userProfileOpened = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private channelService: ChannelService,
    private chatService: ChatService
  ) {}
  signOut() {
    this.authService.signOut();
    this.authService.setOnlineStatus(false);
    this.channelService.clearActiveChannel();
    this.chatService.clearActiveChat();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1);
  }

  openUserProfile() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userProfileOpened.emit(userId);
    }
  }
}
