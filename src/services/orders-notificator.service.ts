import { Injectable } from "@angular/core";
import { DocumentChangeAction, DocumentSnapshot } from "angularfire2/firestore";
import { IQuickOrder } from "../interfaces";
import { StateDataStoreEntity } from "../pages/data-state-store.class";
import { OrderStatus, SOUND_MAPPER } from "../pages/pages.constants";
import { ToastMessangerService } from "./toast-messanger.service";
import { AuthService } from "./auth.service";
import { playSound } from ".";

const { MODIFIED_BY_ADMIN } = SOUND_MAPPER;

@Injectable()
export class OrdersNotificatorService {

  constructor(
    private readonly _toastMessanger: ToastMessangerService,
    private readonly _authService: AuthService ) { }

  onOrderData(data: DocumentChangeAction<IQuickOrder>[], resourceObject: StateDataStoreEntity<IQuickOrder>, isInit: boolean) {
     
    if (data && data.length == 1 && isInit) {

      const { isAnonymous } = this._authService.userInstance;
      const [{ type, payload: { doc } }] = data;
      
      const fn = ({ orderStatus, cancelledFromState }: IQuickOrder) => {
        
        let mes: string;
        const { id } = doc;

        if (orderStatus === OrderStatus.DONE && !isAnonymous) {

          playSound(MODIFIED_BY_ADMIN);
          mes = `Order "${id}" has been successfully done`;

        } else if (orderStatus === OrderStatus.CANCELLED && !isAnonymous) {

          mes = `Order "${id}" has been cancelled`;

        } 

  
        if (typeof orderStatus !== 'undefined' && 
            (orderStatus !== OrderStatus.PLACED || orderStatus === OrderStatus.PLACED && typeof cancelledFromState !== 'undefined')) {

          if (type === 'modified' && /*orderStatus > OrderStatus.PLACED && orderStatus < OrderStatus.DONE*/ !isAnonymous) {

            playSound(MODIFIED_BY_ADMIN);
  
          }

          const message = isAnonymous ? mes : (mes || `Order "${id}" has been successfully ${type} ${type === 'modified' ? `to stage ${OrderStatus[orderStatus]}` : ``}`);

          this._toastMessanger.showToast({
            message,
            duration: 5000,
            showCloseButton: true,
            closeButtonText: 'OK'
          });

        }

      };


      if (type === 'modified' && !isAnonymous) {
        
        return fn(doc.data());

      }

      if (resourceObject.identificator === 'current_orders') {

        if (type === 'removed' && !isAnonymous) {

          return data[0].payload.doc.ref.get()
            .then((documentSnapshot: DocumentSnapshot<IQuickOrder>) => {

              if (documentSnapshot.exists) {

                fn(documentSnapshot.data() as IQuickOrder);

              }

            });

        }

        return fn(doc.data());

      }

    }

  }
}