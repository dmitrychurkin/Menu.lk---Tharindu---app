import { Component, Renderer2, Inject } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AngularFirestore } from "angularfire2/firestore";
import { IonicPage, NavController, TextInput } from "ionic-angular";
import { asap } from "rxjs/Scheduler/asap";
import { IQuickOrder, FormUserTemplateData } from "../../interfaces";
import { AuthService, ShoppingCartService, ToastMessangerService } from "../../services";
import { ANGULAR_ANIMATION_OPACITY, CART_ACTION_FLAGS, OrderStatus, FORM_USER_TEMPLATE_DATA_TOKEN, FIREBASE_DB_TOKENS, SOUND_MAPPER } from "../pages.constants";

const { ORDERS, ORDER_CONTENT } = FIREBASE_DB_TOKENS;


@IonicPage()
@Component({
  selector: 'page-quick-order',
  templateUrl: 'quick-order.html',
  animations: [ ANGULAR_ANIMATION_OPACITY() ]
})
export class QuickOrder {

  isQuickOrderSent = false;

  constructor(
    @Inject(FORM_USER_TEMPLATE_DATA_TOKEN) readonly formTemplateData: FormUserTemplateData,
    private readonly _renderer2: Renderer2, 
    private readonly _af: AngularFirestore,
    private readonly _authService: AuthService,
    private readonly _navCtrl: NavController,
    private readonly _toastMessService: ToastMessangerService,
    private readonly _shoppingCartService: ShoppingCartService) {}


  uiCtrl(input: TextInput) {
    
    const getModeHelper = (SHADOW= '') =>  
        !value && valid ? 
        (_isFocus ? `${SHADOW}${VALID}` : '') 
        : (invalid ? `${SHADOW}${DANGER}` : `${SHADOW}${VALID}`);

    const { _isFocus, value, ngControl: { invalid, valid, touched } } = input;

    if (!_isFocus && touched && invalid) {

      return input.setFocus();

    }

    const DANGER = '#f53d3d';
    const VALID = '#32db64';
    const SHADOW = 'inset 0 -1px 0 0 ';

    const elem: HTMLElement = input.getNativeElement();
    const itemInner = elem.closest('.item-inner') as HTMLElement;
    const ionLabel = elem.previousElementSibling as HTMLElement;

    this._renderer2.setStyle(ionLabel, 'color', getModeHelper());
    this._renderer2.setStyle(itemInner, 'border-bottom-color', getModeHelper());
    this._renderer2.setStyle(itemInner, 'box-shadow', getModeHelper(SHADOW));

  }

  

  onQuickOrder({ invalid, value }: NgForm) {

    if (invalid || this.isQuickOrderSent) return;

    this.isQuickOrderSent = true;

    const { isAnonymous, uid } = this._authService.userInstance;
    const { CURRENCY, TOTAL_COST } = this._shoppingCartService.CART_OBJECT_DB;

    
    const quickOrderObj: IQuickOrder = {
      currency: CURRENCY,
      price: TOTAL_COST,
      userData: value,
      timestamp: new Date(),
      uid, isAnonymous,
      orderStatus: OrderStatus.PLACED
    };
    
    const batch = this._af.firestore.batch();
    
    const orderId = this._af.createId();
    const orderRef = this._af.collection(ORDERS).doc(orderId).ref;

    batch.set(orderRef, quickOrderObj);

    const orderContentRef = orderRef.collection(ORDER_CONTENT).doc(orderId);

    batch.set(orderContentRef, this._shoppingCartService.CART_OBJECT_DB);

    this._authService.retryStrategy(() => batch.commit())
                      .catch((err: Error) => err)
                      .then((err?: Error) => {
                        
                        const toastOptions = {
                          message: `Order "${orderId}" been successfully PLACED, our support service will contact you shortly`,
                          showCloseButton: true,
                          closeButtonText: 'Ok'
                        };

                        return err ? 
                                this._toastMessService.showToast({ ...toastOptions, message: `Error occured - ${err.message}, try again later` })
                                                          .then(() => { this.isQuickOrderSent = false; })
                                  :
                                this._shoppingCartService.completer({ 
                                  actionFlag: CART_ACTION_FLAGS.DELETE,
                                  message: toastOptions,
                                  soundPath: SOUND_MAPPER.SEND_ORDER
                                }).then(() => { asap.schedule(() => this._navCtrl.canGoBack() && this._navCtrl.popToRoot(), 1000); });

                      });
    
  }

  onAjustHeight(textInput: TextInput) {

    const elem: HTMLTextAreaElement = textInput.getNativeElement().firstElementChild;
    this._renderer2.setStyle(elem, 'height', 'auto');
    this._renderer2.setStyle(elem, 'overflow', 'hidden');
    this._renderer2.setStyle(elem, 'height', `${elem.scrollHeight}px`);

    this.uiCtrl(textInput);

  }

}
