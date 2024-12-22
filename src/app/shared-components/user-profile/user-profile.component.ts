import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../toast/toast.component';
import {
  Avatar,
  AvatarSelectionService,
} from '../../services/avatar-selection.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
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
  avatars: Avatar[] = [];
  selectedAvatar: string = '';
  isAvatarListOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private avatarService: AvatarSelectionService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.userId) {
      this.user = await this.authService.getFullUser();
      let currentUserId = this.authService.getUserId();
      this.isOwnProfile = this.user?.id === currentUserId;
    }
    this.avatars = this.avatarService.getAvatars();
    this.selectedAvatar = this.avatarService.getSelectedAvatar();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.selectedAvatar = this.user?.avatar || '';
  }

  onClose(): void {
    this.closeProfile.emit();
  }

  selectAvatar(avatarImageSource: string): void {
    this.avatarService.setSelectedAvatar(avatarImageSource);
    this.selectedAvatar = avatarImageSource;
  }

  openAvatarList(): void {
    this.isAvatarListOpen = true;
  }

  closeAvatarList(): void {
    this.isAvatarListOpen = false;
  }

  async saveEditingChanges(): Promise<void> {
    
    try {
      let [firstName, lastName] = this.userEditfullName.split(' ');

      const updatedData: Partial<User> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: this.userEditEmail.trim(),
        avatar: this.selectedAvatar,
      };

      await this.authService.updateUserData(this.user!.id, updatedData);
      this.isEditing = false;
      this.toastService.showToast('Änderungen erfolgreich gespeichert!');
    } catch(error) {
      console.error('Fehler bei der Editierung:', error);
    }
  }
}
