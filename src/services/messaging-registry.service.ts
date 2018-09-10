import { Injectable } from "@angular/core";
import { OrderManagmentActionFlag, OrderStatus, CART_ACTION_FLAGS, MAX_CART_ITEMS, TemplateViewStates } from "../pages/pages.constants";

@Injectable()
export class MessangingService {

  private readonly _messagesRegistry = {

    appError: ['Error occured, try again'],


    offline_NetworkService: ['You are offline'],
    online_NetworkService: ['You are backed online'],


    FORM_USER_DATA_FIELDS_userName: ['your name'],
    FORM_USER_DATA_FIELDS_userPhone: ['telephone no (example: +31636363634)'],
    FORM_USER_DATA_FIELDS_userEmail: ['email'],
    FORM_USER_DATA_FIELDS_userAddress: ['address'],
    FORM_USER_DATA_FIELDS_AI:  ['additional information'],


    [`${OrderStatus.DONE}_OrdersNotificatorService`]: ['Order "', '" has been successfully done'],
    modified_OrdersNotificatorService: ['Order "', '" has been successfully modified to stage '],

    [`${OrderManagmentActionFlag.CANCEL}_OrdersManagerService`]: ['Order "','" has been cancelled'],
    [`${OrderManagmentActionFlag.RESTORE}_OrdersManagerService`]: ['Order "','" has been successfully added'],
    [`${OrderManagmentActionFlag.DELETE}_OrdersManagerService`]: ['Order "','" has been successfully deleted'],


    tooManyOrders_ShoppingCartService: [`Per order allowed maximum ${MAX_CART_ITEMS} items, first buy this!`],
    [`${CART_ACTION_FLAGS.DELETE}Error_ShoppingCartService`]: ['Error occured while trying to remove from cart'],
    [`${CART_ACTION_FLAGS.ADD}Error_ShoppingCartService`]: ['Error occured while trying to add to cart'],
    [`${CART_ACTION_FLAGS.ADD}_ShoppingCartService`]: ['was added to cart'],
    [`${CART_ACTION_FLAGS.DELETE}_ShoppingCartService`]: ['was removed from cart'],
    [`${CART_ACTION_FLAGS.DELETE}All_ShoppingCartService`]: ['items was removed from cart'],


    [`${TemplateViewStates.ResponseEmpty}_SearchPage`]: ['No items found ):'],


    [`${OrderStatus.PLACED}_QuickOrder`]: ['Order "', '" been successfully PLACED, our support service will contact you shortly'],


    restaurants_HomePage: ['restaurants'],
    cateringServices_HomePage: ['catering services'],
    cateringMenus_HomePage: ['catering menus'],


    subject_HistoryOrdersPage: ['orders'],
    title_HistoryOrdersPage: ['order dashboard'],
    currentOrders_HistoryOrdersPage: ['current orders'],
    historyOrders_HistoryOrdersPage: ['history orders'],
    actionSheetHint_HistoryOrdersPage: ['PRO TIP! Tap on order card to view an order content'],


    emptyTpl_EmptyResponseComponent: ['Seems like no ', ' here yet...'],
    offlineTpl_OfflineTemplateComponent: ['Something happend with your network connection...'],


    wait_PageBaseClass: ['Please wait'],
    nonetwork_PageBaseClass: ['Please check your network connection'],


    open24_7_MenuPage: ['Open ', ' hours'],
    closed_MenuPage: ['Closed opens '],
    open_MenuPage: ['Closes '],
    noContent_MenuPage: ['No menus for this restaurant here yet...'],


    equalityError_ProfilePage: ['New ', ' must be differ from old one'],
    emptyUserProfileData_ProfilePage: ['In order to update profile You must specify new name or include avatar photo'],
    userProfileUpdated_ProfilePage: ['Your ', ' has been successfully updated'],
    fileExeedError_ProfilePage: ['File size must be less than ', ' Kb. Current size is ', ' Kb'],
    wrongMime_ProfilePage: ['Incorrect file type, must to be JPG or PNG!'],
    userProfileDataUpdated_ProfilePage: ['Your ', ' has been updated']
  };

  getMessage(message, ...args) {
    const init = '';
    return this._messagesRegistry[message].reduce((acc, currentVal, index) => acc + currentVal + (args[index] || init), init);

  }
  
}