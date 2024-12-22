import { Component,  OnInit,  inject,  Input,  Output,  EventEmitter,} from '@angular/core';
import { ChannelService } from '../../../../services/channel.service';
import { Observable } from 'rxjs';
import { Channel } from './../../../../models/channel.class';
import {  Firestore,  collection,  collectionData,  doc,  updateDoc,} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss',
})
export class EditChannelDialogComponent {
  @Input() channelData?: Channel | null;
  @Input() position!: { top: string; left: string };
  @Output() dialogClosed = new EventEmitter<void>();

  firestore: Firestore = inject(Firestore);

  editingChannelName = false;
  editingChannelDescription = false;

  constructor() {}

  closeDialog() {
    if (this.channelData?.name && this.channelData.name.length >= 4) {
      this.dialogClosed.emit();
    }
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  async editChannel(form: NgForm) {
    if (form.valid) {
      const channelDocRef = doc(this.firestore, `channels/${this.channelData?.id}`);
      try {
        await updateDoc(channelDocRef, { ...this.channelData });
      } catch (error) {
        console.error(error);
      }
    }
  }

  saveChanges(form: NgForm) {
    if (form.valid) {
      this.editChannel(form);
      this.editingChannelName = false;
      this.editingChannelDescription = false;
    } else {
      this.resetInvalidFields(form);
    }
  }

  getErrorMessage(errors: any): string {
    if (errors.required) {
      return 'Bitte einen Namen mit mindestens 4 Zeichen eingeben.';
    }
    if (errors.minlength) {
      return `Der Name muss mindestens ${errors.minlength.requiredLength} Buchstaben lang sein.`;
    }
    return '';
  }

  resetInvalidFields(form: NgForm): void {
    const controls = form.controls;

    if (controls['channelName']?.invalid) {
      this.channelData!.name = '';
    }
  }

  onEditButtonClick(event: Event, field: 'name' | 'description'): void {
    if (field === 'name' && !this.editingChannelName) {
      this.toggleEditing('name');
      event.preventDefault();
    } else if (field === 'description' && !this.editingChannelDescription) {
      this.toggleEditing('description');
      event.preventDefault();
    }
  }

  toggleEditing(field: 'name' | 'description') {
    if (field === 'name') {
      this.editingChannelName = !this.editingChannelName;
    } else if (field === 'description') {
      this.editingChannelDescription = !this.editingChannelDescription;
    }
  }

  editChannelName(form: NgForm) {
    if (!this.editingChannelName) {
      this.editingChannelName = true;
    } else if (this.editingChannelName && form.controls['channelName']?.valid) {
      this.editingChannelName = false;
      this.editChannel(form);
    }
  }

  editChannelDescription(form: NgForm) {
    if (!this.editingChannelDescription) {
      this.editingChannelDescription = true;
    } else {
      this.editingChannelDescription = false;
      this.editChannel(form);
    }
  }

  leaveChannel() {}
}
