import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { ChannelService } from '../../../services/channel.service';
import { ChatService } from '../../../services/dm-chat.service';
import { ThreadService } from '../../../services/thread.service';

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
  @Output() dialogClosed = new EventEmitter<void>();


  constructor(
    private authService: AuthService,
    private router: Router,
    private channelService: ChannelService,
    private chatService: ChatService,
    private threadService: ThreadService
  ) {}
  signOut() {
    this.authService.signOut();
    this.authService.setOnlineStatus(false);
    this.threadService.deactivateThread();
    this.channelService.clearActiveChannel();
    this.chatService.clearActiveChat();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 200);
  }

  openUserProfile() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userProfileOpened.emit(userId);
    }
  }

  closeDialog(){
    this.dialogClosed.emit();
  }
}
