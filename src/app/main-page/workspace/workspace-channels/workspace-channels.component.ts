import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Observable } from 'rxjs';
import { Channel } from './../../../models/channel.class';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { ChannelService } from '../../../services/channel.service';


@Component({
  selector: 'app-workspace-channels',
  standalone: true,
  imports: [ ],
  templateUrl: './workspace-channels.component.html',
  styleUrl: './workspace-channels.component.scss',
  animations: [
    trigger('submenuAnimation', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('125ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('125ms ease-in', style({ height: '0', opacity: 0 })),
      ]),
    ]),
  ]
})
export class WorkspaceChannelsComponent implements OnInit{

  @Output() dialogStateChange = new EventEmitter<boolean>();
  
  constructor(private channelService: ChannelService) {}

  showSubmenu = true;
  addChannelDialogOpened = false;
  channels$!: Observable<Channel[]>;
  allUserChannels: Channel[] = [];
  firestore: Firestore = inject(Firestore);
  private isInitialized = false;

  activeIndex: number | null = null;
  activeChannel:string = '';

  toggleDropdown(){
    this.showSubmenu = !this.showSubmenu;
  }

  displayAddChannelDialog(){
    this.addChannelDialogOpened = true;
    this.dialogStateChange.emit(this.addChannelDialogOpened);
  }


  ngOnInit(){
    this.getUserChannels();
    
  }


  getUserChannels(){
    const userChannelsCollection = collection(this.firestore, 'channels' );
    this.channels$ = collectionData(userChannelsCollection, { idField: 'id'}) as Observable<Channel[]>;
    
    this.channels$.subscribe((changes) => {
      this.allUserChannels = Array.from(new Map(changes.map(channel => [channel.id, channel])).values());
      
      if (!this.isInitialized && this.allUserChannels.length > 0) {
        this.activateChannel(0); 
        this.isInitialized = true;
      }
    })

  }

  activateChannel(index:number) {
    this.activeIndex = index; 
    this.activeChannel = this.allUserChannels[index].id;
    this.channelService.setActiveChannel(this.activeChannel);
  }
}
