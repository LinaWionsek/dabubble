import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../../services/authentication.service';
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../toast/toast.component';
import {
  Avatar,
  AvatarSelectionService,
} from '../../services/avatar-selection.service';
import { Auth, updateEmail, sendEmailVerification } from '@angular/fire/auth';

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
  @ViewChild('userEditEmailInput') userEditEmailInput!: NgModel;
  isEmailVerified: boolean = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private avatarService: AvatarSelectionService,
    public auth: Auth
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.userId) {
      this.user = await this.authService.getFullUser();
      let currentUserId = this.authService.getUserId();
      this.isOwnProfile = this.user?.id === currentUserId;
    }
    this.avatars = this.avatarService.getAvatars();
    this.selectedAvatar = this.avatarService.getSelectedAvatar();
    let currentUser = this.auth.currentUser;
    this.isEmailVerified = currentUser!.emailVerified;
    console.log('User is verified', currentUser?.emailVerified);
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

  isSubmitDisabled(): boolean {
    let isNameValid = this.isValidName(this.userEditfullName);

    let isEmailValid =
      this.userEditEmail.trim() !== '' && this.userEditEmailInput?.valid;

    let isNameEmpty = this.userEditfullName.trim() === '';
    let isEmailEmpty = this.userEditEmail.trim() === '';

    return (
      (isNameValid && !isEmailEmpty && !isEmailValid) ||
      (isEmailValid && !isNameEmpty && !isNameValid) ||
      (!isNameValid && !isEmailValid)
    );
  }

  isValidName(name: string): boolean {
    if (!name || name.trim() === '') return false;

    let parts = name.trim().split(' ');

    if (parts.length < 2) return false;

    return parts.every((part) => /^[a-zA-ZÀ-ÖØ-öø-ÿ\-]+$/.test(part));
  }

  async saveEditingChanges(): Promise<void> {
    try {
      let user = this.auth.currentUser;

      if (!user) {
        throw new Error('Kein Benutzer ist aktuell authentifiziert.');
      }

      console.log('Aktueller Benutzer:', user);
      console.log('E-Mail verifiziert:', user.emailVerified);

      let updatedData: Partial<User> = {};

      if (this.userEditfullName) {
        let [firstName, lastName] = this.userEditfullName.split(' ');
        updatedData.firstName =
          firstName?.trim() || user.displayName?.split(' ')[0] || '';
        updatedData.lastName =
          lastName?.trim() || user.displayName?.split(' ')[1] || '';
      }

      if (this.userEditEmail && this.userEditEmail.trim() !== user.email) {
        console.log('Verifizierungs-E-Mail wird gesendet...');
        await sendEmailVerification(user);
        console.log('Verifizierungs-E-Mail erfolgreich gesendet.');

        updatedData.pendingEmail = this.userEditEmail.trim();

        this.toastService.showToast(
          'Bitte überprüfen Sie Ihre neue E-Mail-Adresse. Die Änderung wird wirksam, sobald Sie die E-Mail bestätigen.'
        );
      }

      if (this.selectedAvatar) {
        updatedData.avatar = this.selectedAvatar;
      }

      if (Object.keys(updatedData).length > 0) {
        await this.authService.updateUserData(user.uid, updatedData);
        console.log('Benutzerdaten erfolgreich aktualisiert:', updatedData);
      } else {
        console.log('Keine Änderungen vorgenommen.');
      }

      this.isEditing = false;
      this.toastService.showToast('Änderungen erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler bei der Editierung:', error);
      this.toastService.showToast(
        'Fehler beim Speichern der Änderungen: ' + error
      );
    }
  }
}
