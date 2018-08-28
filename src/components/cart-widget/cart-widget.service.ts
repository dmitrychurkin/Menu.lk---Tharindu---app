import { Injectable } from "@angular/core";
import { Events } from "ionic-angular";
import { Cart } from "../../interfaces";
import { Animator } from "../../pages/animations-base.class";
import { APP_EV } from "../../pages/pages.constants";
import { ShoppingCartService } from "../../services";

@Injectable()
export class CartWidgetService {

  opacity: number;
  STATE: boolean;

  readyPromise: Promise<boolean>;

  private _animator = new Animator;

  constructor(events: Events, readonly shoppingCartService: ShoppingCartService) {

    this.readyPromise = shoppingCartService.cartReady.then(({ TOTAL_ORDERS_IN_CART }: Cart) => this.STATE = TOTAL_ORDERS_IN_CART ? !!(this.opacity = 1) : !!(this.opacity = 0));
    events.subscribe(APP_EV.CART_ACTION, this._actionsListener());

  }

  count(subject: 'price' | 'orders'= 'orders') {
    
    if (this.shoppingCartService.CART_OBJECT_DB) {

      const { TOTAL_COST, CURRENCY, TOTAL_ORDERS_IN_CART } = this.shoppingCartService.CART_OBJECT_DB;
      
      switch (subject) {
        case 'orders':
          return TOTAL_ORDERS_IN_CART;
        case 'price':
          return `${TOTAL_COST} ${CURRENCY || ''}`;
      }

    }
    
    return 0;

  }

  private _actionsListener() {

    const metaAnimProps = {
      elemSelector: 'app-cart-widget',
      transition: 'opacity .5s ease-in-out',
      duration: 500
    };

    return _ => {
      
      const p = Object.assign(this.count() ? 
        ({
          styles: { opacity: 1 },
          onBeforeTransition: () => {

            if (this.opacity && this.STATE) return false;

            return (this.STATE = !!this.count());

          },
          onTransitionDone: () => this.opacity = 1
        }) : 
        ({
          onBeforeTransition: () => this.opacity && this.STATE,
          onTransitionDone: () => this.STATE = !!(this.opacity = +this.count())
        }), metaAnimProps);

      this._animator.animate(p);

    };

  }

}
