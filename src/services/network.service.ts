import { Injectable, Inject } from '@angular/core';
import { share } from 'rxjs/operators';
import { ToastMessangerService } from './toast-messanger.service';
import { fromEvent } from 'rxjs';
import { WINDOW_REF_TOKEN } from '../pages/pages.constants';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';
import { MessangingService } from './messaging-registry.service';


@Injectable()
export class NetworkService {

    onDisconnect$ = (this._platform.is('cordova') ? this._network.onDisconnect() : fromEvent(this._windowRef, 'offline'))
                            .pipe(share());
    onConnect$ = (this._platform.is('cordova') ? this._network.onConnect() : fromEvent(this._windowRef, 'online'))
                            .pipe(share());

    constructor( 
        @Inject(WINDOW_REF_TOKEN) private _windowRef: Window,
        private readonly _network: Network,
        private readonly _platform: Platform,
        private readonly _messService: MessangingService,
        private readonly _toastMessanger: ToastMessangerService) {
            
            const fn = this._showMessage.bind(this);

            this.onDisconnect$.subscribe(fn);

            this.onConnect$.subscribe(fn);
    
        }
    
    get isOnline(): boolean {

        return this._platform.is('cordova') ? !this._network.type.includes('none') : this._windowRef.navigator.onLine;

    } 

    checkNetwork(): boolean {
        
        if (!this.isOnline) this._showMessage();

        return this.isOnline;

    }

    private _showMessage() {

        const { name } = NetworkService;

        this._toastMessanger.showToast({ message: this._messService.getMessage(!this.isOnline ? `offline_${name}` : `online_${name}`) });

    }

}