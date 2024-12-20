import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  @Input() userId: string | null = null;
  isOwnProfile: boolean = false;
  user: User | null = null;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    if (this.userId) {
      this.user = await this.authService.getFullUser();
      let currentUserId = this.authService.getUserId();
      this.isOwnProfile = this.user?.id === currentUserId;
    }
  }
}
