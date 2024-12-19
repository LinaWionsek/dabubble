import { Component } from '@angular/core';
import { AuthHeaderComponent } from '../../auth-header/auth-header.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [AuthHeaderComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent {}
