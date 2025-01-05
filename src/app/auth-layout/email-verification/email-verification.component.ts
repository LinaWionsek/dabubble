import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { applyActionCode, checkActionCode, Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/authentication.service';


@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true,
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  isVerified: boolean | null = null;
  verifiedEmail: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: Auth,
    private AuthService: AuthService,
  ) {}

  ngOnInit(): void {
    let oobCode = this.activatedRoute.snapshot.queryParamMap.get('oobCode');
    if (oobCode) {
      this.completeEmailVerification(oobCode);
      this.AuthService.signOut();
    } else {
      this.isLoading = false;
      this.isVerified = false;
      this.errorMessage = 'Ungültiger Link: Der oobCode fehlt.';
    }
  }

  async completeEmailVerification(oobCode: string): Promise<void> {
    try {
      let actionInfo = await checkActionCode(this.auth, oobCode);

      await applyActionCode(this.auth, oobCode);
      this.isVerified = true;
      this.verifiedEmail = actionInfo.data.email || 'Ihre E-Mail';
    } catch (error: any) {
      console.error('Fehler bei der Verifizierung:', error);
      
      this.isVerified = false;
      if (error.code === 'auth/invalid-action-code') {
        this.errorMessage = 'Der Verifizierungslink ist ungültig oder abgelaufen.';
      } else if (error.code === 'auth/internal-error') {
        this.errorMessage = 'Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      } else {
        this.errorMessage = 'Unbekannter Fehler bei der E-Mail-Verifizierung.';
      }

    } finally {
      this.isLoading = false;
    }
  }




  // async completeEmailVerification(oobCode: string): Promise<void> {
  //   try {
  //     let actionInfo = await checkActionCode(this.auth, oobCode);
  //     console.log('Aktion:', actionInfo);

  //     await applyActionCode(this.auth, oobCode);
  //     this.toastService.showToast('E-Mail erfolgreich verifiziert!');

  //     // let newEmail = actionInfo.data.email;
  //     // if (!newEmail) {
  //     //   this.toastService.showToast(
  //     //     'Keine ausstehende E-Mail-Änderung gefunden.'
  //     //   );
  //     //   return;
  //     // }

  //     // console.log('Neue E-Mail:', newEmail);

  //     // let user = this.auth.currentUser;
  //     // if (user) {
  //       // await updateEmail(user, newEmail);

  //       // let userRef = doc(this.firestore, `users/${user.uid}`);
  //       // let userDoc = await getDoc(userRef);

  //     //   if (userDoc.exists()) {
  //     //     await updateDoc(userRef, {
  //     //       email: newEmail,
  //     //       pendingEmail: '',
  //     //     });
  //     //     this.toastService.showToast(
  //     //       'E-Mail-Adresse wurde erfolgreich geändert!'
  //     //     );
  //     //     console.log('Benutzer-Datenbank aktualisiert.');
  //     //   } else {
  //     //     this.toastService.showToast(
  //     //       'Benutzer nicht in der Datenbank gefunden.'
  //     //     );
  //     //   }
  //     // } else {
  //     //   this.toastService.showToast('Benutzer ist nicht angemeldet.');
  //     }
  //   } catch (error) {
  //     console.error('Fehler bei der Verifizierung:', error);
  //     this.toastService.showToast('Fehler bei der E-Mail-Verifizierung.');
  //   }
  // }
}
