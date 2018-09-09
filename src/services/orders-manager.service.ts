import { Injectable } from "@angular/core";
import { AngularFirestore } from "angularfire2/firestore";
import { IQuickOrder } from "../interfaces";
import { FIREBASE_DB_TOKENS, SOUND_MAPPER, OrderManagmentActionFlag, OrderStatus } from "../pages/pages.constants";
import { ToastMessangerService } from "./toast-messanger.service";
import { playSound } from ".";
import { MessangingService } from "./messaging-registry.service";


const { ORDERS, ORDER_CONTENT } = FIREBASE_DB_TOKENS;

@Injectable()
export class OrdersManagerService {

  constructor(
    private readonly _angularFirestore: AngularFirestore, 
    private readonly _messService: MessangingService,
    private readonly _toastMessService: ToastMessangerService) {}

  dispatchOrderAction(ACTION_FLAG: OrderManagmentActionFlag, { id, orderStatus, cancelledFromState }: IQuickOrder) {
    
    return (function (this: OrdersManagerService) {
      const angularFirestreDoc = this._angularFirestore.doc(`${ORDERS}/${id}`);
      switch (ACTION_FLAG) {

        case OrderManagmentActionFlag.CANCEL:
          return angularFirestreDoc
            .update({ orderStatus: OrderStatus.CANCELLED, cancelledFromState: orderStatus });

        case OrderManagmentActionFlag.DELETE:
          return Promise.all([
            angularFirestreDoc.delete(),
            angularFirestreDoc.collection(ORDER_CONTENT)
              .doc(id)
              .delete()
          ]).then(_ => undefined);

        case OrderManagmentActionFlag.RESTORE: 
          return angularFirestreDoc
            .update({ orderStatus: cancelledFromState });

      }

    }.call(this))
      .catch((err: Error) => err)
      .then((err?: Error) => {

        //const message = err && `Error occured -${' ' + err.message || ''} try again`;
                            //: `Order "${id}" has been successfully deleted`;
                            
        !err && playSound(SOUND_MAPPER[ACTION_FLAG])

        //if (err || ACTION_FLAG == OrderManagmentActionFlag.DELETE) {
       
        return this._toastMessService.showToast({ 
          message: this._messService.getMessage(err ? 'appError' : `${ACTION_FLAG}_${OrdersManagerService.name}`, id), showCloseButton: true, closeButtonText: 'OK' }) ;
        
        //}
        
      })

  }

}