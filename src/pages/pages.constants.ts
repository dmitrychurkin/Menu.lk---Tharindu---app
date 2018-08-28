import { trigger, state, style, transition, animate } from "@angular/animations";
import { InjectionToken } from "../../node_modules/@angular/core";
import { FormUserTemplateData } from "../interfaces";

export const APP_TABS_PAGE = 'AppTabsPage';
export const APP_SEARCH_PAGE = 'SearchPage';
export const APP_PROFILE_PAGE = 'ProfilePage';
export const APP_HOME_PAGE = 'HomePage';
export const APP_MENU_PAGE = 'MenuPage';
export const APP_SHOP_ITEM_PAGE = 'ShopItemPage';
export const APP_HISTORY_ORDERS_PAGE = 'HistoryOrdersPage';
export const APP_CART_PAGE = 'CartPage';
export const APP_QUICK_ORDER_PAGE = 'QuickOrder';
export const BATCH_SIZE = 3;
export enum Currency { US = "$", LAKR = "RS" };
export const IMG_DATA_FIELD_TOKEN = 'imageURL';
export enum CART_ACTION_FLAGS { ADD, DELETE };
export enum APP_EV { 
  CART_ACTION = 'cart:action => add | delete', 
  DELETE_CART_MODE = 'cart:deleteMode',
  TABS_SIGN_IN_ANIMATION_DONE = 'tabs:animation => done'
};
export enum OrderManagmentActionFlag { CANCEL, RESTORE, DELETE, CLOSE_MODAL, VIEW };
export enum DATABASE_TOKENS { SHOPPING_CART = 'ShoppingCart' };
export const MAX_CART_ITEMS = 25;
export enum PopoverCartMenuEventFlags { DELETE = 'D', CANCEL = 'X' };
export enum OrderStatus { PLACED, PROCESSED, DELIVERY, DONE, CANCELLED };
export const ANGULAR_ANIMATION_OPACITY = ($out= 'void', $triggerName= 'opacity') => 
  trigger($triggerName, [
    state($out, style({ opacity: 0 })),
    state('true', style({ opacity: 1 })),
    transition(`${$out} <=> true`, animate('.5s ease-in-out'))
  ]);

export const FORM_USER_TEMPLATE_DATA_TOKEN = new InjectionToken('FORM_USER_DATA_FIELDS');
export const FORM_USER_TEMPLATE_DATA: FormUserTemplateData = [
  {
    icon: 'person',
    label: 'your name',
    type: 'text',
    control: 'name',
    model: '',
    mappedDbName: 'userName',
    validators: {
      required: true,
      minlength: '3',
      maxlength: '20'
    }
  },
  {
    icon: 'call',
    label: 'telephone no (example: +31636363634)',
    type: 'tel',
    control: 'phone',
    model: '',
    mappedDbName: 'userPhone',
    validators: {
      required: true,
      pattern: '^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$'
    }
  },
  {
    icon: 'mail',
    label: 'email',
    type: 'email',
    control: 'email',
    model: '',
    mappedDbName: 'userEmail',
    validators: {
      required: true,
      pattern: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$',
      maxlength: '50'
    }
  },
  {
    icon: 'pin',
    label: 'address',
    type: 'text',
    control: 'address',
    model: '',
    mappedDbName: 'userAddress',
    validators: {
      required: true,
      minlength: '3',
      maxlength: '50'
    }
  },
  {
    icon: 'alert',
    label: 'additional information',
    control: 'notes',
    type: null,
    model: '',
    validators: {
      maxlength: '100'
    }
  }
];

export const ERROR_CLASS_NAME = 'error';

export namespace FIREBASE_DB_TOKENS {

  export const ORDERS = 'orders';
  export const ORDER_CONTENT = 'orderContent';

  export const USERS = 'users';

  export const MENUS = 'menus';

  export const RESTAURANTS = 'restaurants';
  export const CATERING = 'catering';

};

export namespace FILE_UPLOAD_MAX_REQ {
  export const SIZE = 100000;
  export const MIME_TYPE_ARR = ['image/jpeg', 'image/jpg', 'image/png'];
}

namespace APP_SOUNDS {
  export const ADD_TO_CART = 'addToCart.mp3';
  export const REMOVE_FROM_CART = 'removeFromCart.mp3';
  export const SEND_ORDER = 'sendOrder.mp3';
  export const CANCEL_ORDER = 'cancelOrder.mp3';
  export const RESTORE_ORDER = 'restoreOrder.mp3';
  export const DELETE_ORDER = 'deleteOrder.mp3';
  export const MODIFIED_BY_ADMIN = 'modifiedByAdminOrder.mp3';
}

export const SOUND_MAPPER = {
  [OrderManagmentActionFlag.CANCEL]: APP_SOUNDS.CANCEL_ORDER,
  [OrderManagmentActionFlag.RESTORE]: APP_SOUNDS.RESTORE_ORDER,
  [OrderManagmentActionFlag.DELETE]: APP_SOUNDS.DELETE_ORDER,
  SEND_ORDER: APP_SOUNDS.SEND_ORDER,
  ADD_TO_CART: APP_SOUNDS.ADD_TO_CART,
  REMOVE_FROM_CART: APP_SOUNDS.REMOVE_FROM_CART,
  MODIFIED_BY_ADMIN: APP_SOUNDS.MODIFIED_BY_ADMIN
};