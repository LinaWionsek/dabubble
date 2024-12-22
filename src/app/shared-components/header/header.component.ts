import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { User } from '../../models/user.class';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { AuthService } from '../../services/authentication.service';
import { HeaderUserDialogComponent } from './header-user-dialog/header-user-dialog.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    HeaderUserDialogComponent,
    UserProfileComponent,
   FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  showRegistrationLink: boolean = false;
  firestore: Firestore = inject(Firestore);
  allUsers$!: Observable<User[]>;
  users: User[] = [];
  showSearchBar: boolean = false;
  showUserProfile: boolean = false;
  user: User | null = null;
  isUserMenuOpen: boolean = false;
  isUserProfileOpen: boolean = false;
  selectedUserId: string | null = null;
  private authSubscription: Subscription | null = null;
  inputData = '';
  searchedUsers: User[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.showSearchBar = false;
    this.showUserProfile = false;
    this.showRegistrationLink = false;

    this.updateHeaderOnRoute(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateHeaderOnRoute(event.urlAfterRedirects);
      }
    });

    this.authSubscription = this.authService.getUserStatus().subscribe(
      (user) => {
        this.user = user;
      },
      (error) => console.error('Fehler beim Überwachen des Auth-Status:', error)
    );

   
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  searchDevspace() {
    this.searchUser();
  }

  searchUser() {
    console.log(this.inputData);
    const userCollection = collection(this.firestore, 'users');
    this.allUsers$ = collectionData(userCollection, {
      idField: 'id',
    }) as Observable<User[]>;

    this.allUsers$.subscribe((changes) => {
      this.users = changes;
      this.searchedUsers = this.users.filter(
        (filterResult) =>
          filterResult.firstName
            .toLowerCase()
            .includes(this.inputData.toLowerCase()) ||
          filterResult.lastName
            .toLowerCase()
            .includes(this.inputData.toLowerCase())
      );
    });
  }

  updateHeaderOnRoute(url: string) {
    if (url.includes('login')) {
      this.showRegistrationLink = true;
    }
    if (url.includes('registration')) {
      this.showRegistrationLink = false;
    }
    if (url.includes('main')) {
      this.showSearchBar = true;
      this.showUserProfile = true;
    }
    if (url.includes('imprint') || url.includes('privacy-policy')) {
      this.showSearchBar = false;
      this.showUserProfile = false;
      this.showRegistrationLink = false;
    }
  }

  getAvatarBaseName(avatarPath: string | undefined): string {
    if (!avatarPath) {
      return './../../../assets/img/avatar_empty.png';
    }
    return avatarPath.replace('_large', '');
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  openUserProfile(userId: string) {
    this.selectedUserId = userId;
    this.isUserProfileOpen = true;

  }

  closeUserProfile() {
    this.isUserProfileOpen = false;
    this.selectedUserId = null;
  }

  closeDialogs() {
    this.isUserMenuOpen = false;
    this.isUserProfileOpen = false;
  }
}
