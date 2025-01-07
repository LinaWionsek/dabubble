import { Component } from '@angular/core';
import { Auth, updateEmail, applyActionCode, checkActionCode } from '@angular/fire/auth';
import { ActivatedRoute, Route } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.class';
import { AuthService } from '../../services/authentication.service';

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [],
  templateUrl: './change-email.component.html',
  styleUrl: './change-email.component.scss',
})
export class ChangeEmailComponent {
  constructor(
    public auth: Auth,
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  async confirmEmailChange(oobCode: string): Promise<void> {
    const user = this.auth.currentUser;
  
    if (!user) {
      throw new Error('Kein Benutzer ist aktuell angemeldet.');
    }
  
    try {
      // 1. Prüfe die Gültigkeit des Aktionscodes
      let actionInfo = await checkActionCode(this.auth, oobCode);
  
      // 2. Hole die neue E-Mail-Adresse aus dem Aktionscode
      let newEmail = actionInfo.data.email;
  
      if (!newEmail) {
        throw new Error('Neue E-Mail-Adresse konnte nicht abgerufen werden.');
      }
  
      // 3. Wende den Aktionscode an (E-Mail bestätigen)
      await applyActionCode(this.auth, oobCode);
  
      // 4. Aktualisiere die E-Mail im Firebase Authentication
      await updateEmail(user, newEmail);
  
      // 5. Aktualisiere die Firestore-Datenbank
      const updatedData: Partial<User> = {
        email: newEmail,
        pendingEmail: '',
      };
      await this.authService.updateUserData(user.uid, updatedData);
  
      // 6. Erfolgsmeldung
      console.log('E-Mail erfolgreich geändert und Firestore aktualisiert:', newEmail);
      this.toastService.showToast('E-Mail erfolgreich geändert!');
    } catch (error) {
      // Fehlerbehandlung
      console.error('Fehler bei der Bestätigung der E-Mail-Änderung:', error);
      this.toastService.showToast('Fehler beim Ändern der E-Mail.');
    }
  }
  
}
