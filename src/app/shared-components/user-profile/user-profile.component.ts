import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  @Input() userId: string | null = null;
  @Output() closeProfile = new EventEmitter<void>();
  isOwnProfile: boolean = false;
  user: User | null = null;
  isEditing: boolean = false;
  userEditfullName: string = '';
  userEditEmail: string = '';

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    if (this.userId) {
      this.user = await this.authService.getFullUser();
      let currentUserId = this.authService.getUserId();
      this.isOwnProfile = this.user?.id === currentUserId;
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveEditingChanges() {
    this.isEditing = false;
  }

  onClose() {
    this.closeProfile.emit();
  }
}
