import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { share } from 'rxjs/operators';
import { ToastMessangerService } from './toast-messanger.service';

export enum ConnectionStatusEnum {
    Offline,
    Online
}


@Injectable()
export class NetworkService {

    networkStatus: ConnectionStatusEnum;
    onDisconnect$ = this._network
                        .onDisconnect()
                        .pipe(share());
    onConnect$ = this._network
                    .onConnect()
                    .pipe(share())

    constructor(
        private readonly _network: Network, 
        private readonly _toastMessanger: ToastMessangerService) {}

    initializeNetworkProvider(): void {

        this.onDisconnect$.subscribe(() => {
            this.networkStatus = ConnectionStatusEnum.Offline;
            this._toastMessanger.showToast({ message: 'You are offline' });
        });
        this.onConnect$.subscribe(() => {
            this.networkStatus = ConnectionStatusEnum.Online;
            this._toastMessanger.showToast({ message: 'You are backed online' });
        });

    }

}