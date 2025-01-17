import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
}) 
export class WorkspaceService{
    private workspaceActivatedSubject = new BehaviorSubject<boolean>(false);
    workspaceActivated$ = this.workspaceActivatedSubject.asObservable();


    activateWorkspace() {
        this.workspaceActivatedSubject.next(true);
    }


    deactivateWorkspace() {
        this.workspaceActivatedSubject.next(false);
    }

}