import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  showRegistrationLink: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateFooterOnRoute(this.router.url);
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            this.updateFooterOnRoute(event.urlAfterRedirects);
          }
        });
  }

  updateFooterOnRoute(url: string) {
    if (url.includes('login')) {
      this.showRegistrationLink = true;
    }

    if (url.includes('registration')) {
      this.showRegistrationLink = false;
    }
  }
}
