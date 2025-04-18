import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})

//ToastComponent – displays short popup messages ("toasts") triggered by the ToastService.
export class ToastComponent implements OnInit {
  message: string = '';
  isVisible: boolean = false;
  duration: number = 2000;

  constructor(private toastService: ToastService) {}

   /**
   * Subscribes to the toast service on init.
   * When a new toast message is emitted, shows the toast and hides it after a delay.
   */
  ngOnInit() {
    this.toastService.toast$.subscribe((toast) => {
      this.message = toast.message;
      this.isVisible = true;
      this.duration = 2000;

      setTimeout(() => {
        this.isVisible = false;
      }, this.duration || 2000);
    });
  }
}
