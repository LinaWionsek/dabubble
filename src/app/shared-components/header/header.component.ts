import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { HeaderUserDialogComponent } from './header-user-dialog/header-user-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderUserDialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  showRegistrationLink: boolean = false;
  showSearchBar: boolean = false;
  showUserProfile: boolean = false;
  showUserMenu: boolean = false;

  constructor(private router: Router) {}

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
  }

  openUserMenu() {
    this.showUserMenu = true;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }
}
