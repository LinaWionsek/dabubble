import { Component } from '@angular/core';
import { AuthHeaderComponent } from '../../auth-header/auth-header.component';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [AuthHeaderComponent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

}
