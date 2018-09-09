import { Injectable } from "@angular/core";
import { OrderManagmentActionFlag, OrderStatus, CART_ACTION_FLAGS } from "../pages/pages.constants";

@Injectable()
export class MessangingService {

  private readonly _messagesRegistry = {

    appError: ['Error occured, try again'],


    offline_NetworkService: ['You are offline'],
    online_NetworkService: ['You are backed online'],


    [`${OrderStatus.DONE}_OrdersNotificatorService`]: ['Order "', '" has been successfully done'],
    modified_OrdersNotificatorService: ['Order "', '" has been successfully modified to stage '],

    [`${OrderManagmentActionFlag.CANCEL}_OrdersManagerService`]: ['Order "','" has been cancelled'],
    [`${OrderManagmentActionFlag.RESTORE}_OrdersManagerService`]: ['Order "','" has been successfully added'],
    [`${OrderManagmentActionFlag.DELETE}_OrdersManagerService`]: ['Order "','" has been successfully deleted'],


    tooManyOrders_ShoppingCartService: ['Too many items in cart, first buy this!'],
    [`${CART_ACTION_FLAGS.DELETE}Error_ShoppingCartService`]: ['Error occured while trying to remove from cart'],
    [`${CART_ACTION_FLAGS.ADD}Error_ShoppingCartService`]: ['Error occured while trying to add to cart'],
    [`${CART_ACTION_FLAGS.ADD}_ShoppingCartService`]: ['was added to cart'],
    [`${CART_ACTION_FLAGS.DELETE}_ShoppingCartService`]: ['was removed from cart'],
    [`${CART_ACTION_FLAGS.DELETE}All_ShoppingCartService`]: ['items was removed from cart'],


    restaurants_HomePage: ['restaurants'],
    cateringServices_HomePage: ['catering services'],
    cateringMenus_HomePage: ['catering menus'],


    subject_HistoryOrdersPage: ['orders'],


    emptyTpl_EmptyResponseComponent: ['Seems like no ', ' here yet...'],
    offlineTpl_OfflineTemplateComponent: ['Something happend with your network connection...'],


    wait_PageBaseClass: ['Please wait'],
    nonetwork_PageBaseClass: ['Please check your network connection'],


    open24_7_MenuPage: ['Open ', ' hours'],
    closed_MenuPage: ['Closed opens '],
    open_MenuPage: ['Closes '],
    noContent_MenuPage: ['No menus for this restaurant here yet...']
  };

  getMessage(message, ...args) {
    const init = '';
    return this._messagesRegistry[message].reduce((acc, currentVal, index) => acc + currentVal + (args[index] || init), init);

  }
  
}