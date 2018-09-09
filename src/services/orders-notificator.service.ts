import { Injectable } from "@angular/core";
import { DocumentChangeAction, DocumentSnapshot } from "angularfire2/firestore";
import { IQuickOrder } from "../interfaces";
import { StateDataStoreEntity } from "../pages/data-state-store.class";
import { OrderStatus, SOUND_MAPPER } from "../pages/pages.constants";
import { ToastMessangerService } from "./toast-messanger.service";
import { AuthService } from "./auth.service";
import { playSound } from ".";
import { MessangingService } from "./messaging-registry.service";

const { MODIFIED_BY_ADMIN } = SOUND_MAPPER;

@Injectable()
export class OrdersNotificatorService {

  constructor(
    private readonly _toastMessanger: ToastMessangerService,
    private readonly _messService: MessangingService,
    private readonly _authService: AuthService ) { }

  onOrderData(data: DocumentChangeAction<IQuickOrder>[], resourceObject: StateDataStoreEntity<IQuickOrder>, isInit: boolean) {
     
    if (data && data.length == 1 && isInit) {

      const { isAnonymous } = this._authService.userInstance;
      const [{ type, payload: { doc } }] = data;
      
      const fn = ({ orderStatus/*, cancelledFromState*/ }: IQuickOrder) => {
        
        let mes: string;
        const { id } = doc;
        const { name } = OrdersNotificatorService;

        if (typeof orderStatus !== 'undefined' && !isAnonymous) {

          if (orderStatus === OrderStatus.DONE) {

            //playSound(MODIFIED_BY_ADMIN);
            //mes = `Order "${id}" has been successfully done`;
            mes = this._messService.getMessage(`${OrderStatus.DONE}_${name}`, id);

          } /*else if (orderStatus === OrderStatus.CANCELLED && !isAnonymous) {

            mes = `Order "${id}" has been cancelled`;

          } */
          else if (type === 'modified') {

            mes = this._messService.getMessage(`${type}_${name}`, id, OrderStatus[orderStatus]);

          }

          if (mes) {

            playSound(MODIFIED_BY_ADMIN);

            this._toastMessanger.showToast({
              message: mes,
              duration: 5000,
              showCloseButton: true,
              closeButtonText: 'OK'
            });

          }

        }
  
        //if (typeof orderStatus !== 'undefined' && 
            //(orderStatus !== OrderStatus.PLACED || orderStatus === OrderStatus.PLACED && typeof cancelledFromState !== 'undefined')) {

          //if (type === 'modified' && /*orderStatus > OrderStatus.PLACED && orderStatus < OrderStatus.DONE*/ !isAnonymous) {

            //playSound(MODIFIED_BY_ADMIN);
  
          //}

          //const message = isAnonymous ? mes : (mes || `Order "${id}" has been successfully ${type} ${type === 'modified' ? `to stage ${OrderStatus[orderStatus]}` : ``}`);

        //   this._toastMessanger.showToast({
        //     message,
        //     duration: 5000,
        //     showCloseButton: true,
        //     closeButtonText: 'OK'
        //   });

        // }

      };


      /*if (type === 'modified' && !isAnonymous) {
        
        return fn(doc.data());

      }*/

      if ((type === 'modified' && !isAnonymous) || resourceObject.identificator === 'current_orders') {

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