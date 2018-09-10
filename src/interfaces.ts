import { Timestamp } from "@firebase/firestore-types";
import { OrderStatus } from "./pages/pages.constants";
import { User } from "firebase";


type DataURL = string;
type CollectionType = 'restaurants' | 'catering';
export type CurrencyType = 'US' | 'LAKR';

interface Base {
    name: string;
    imageURL: DataURL;
    id: string;
}

export interface IRestaurants extends Base {
    collection: CollectionType;
    category: string;
    cookingDuration: number;
    rating: number;
    takeaway: boolean;
    type: string;
    workingTime: Array<string> | { open: string; close: string };
}

export interface IMenuType {
    type: string;
    subhead?: string;
    items: Array<IMenuItem>
}

export interface IMenuItem extends Base {
    size?: string;
    description?: string;
    currency: CurrencyType;
    price: number;
    quantity?: number;
    userNotes?: string;
    meta?: {
        itemMarkForDelete: boolean;
    }
}

export interface IEntityInCart {
    id: string;
    entityName: string;
    collection: CollectionType;
    orders: Array<IMenuType>
}

export interface IOrder {
    collection: CollectionType;
    id: string;
    entityName: string;
    resourceLink?: IRestaurants;
    menu: {
      type: string;
      subhead?: string;
      item: IMenuItem;
      quantity: number;
      userNotes?: string;
    }
  }

export type Cart = { 
    TOTAL_ORDERS_IN_CART: number, 
    TOTAL_COST: number, 
    CURRENCY?: CurrencyType,
    CART: Array<IEntityInCart> 
};

export interface IQuickOrder {
    id?: string;
    price: number;
    currency: CurrencyType;
    uid: string;
    timestamp: Timestamp | Date;
    orderStatus: OrderStatus;
    isAnonymous: boolean;
    userData: {
        address: string;
        name: string;
        phone: string;
        email: string;
        notes: string;
    },
    cancelledFromState?: OrderStatus; // -> for redo cancellation
}

export interface IProfileUserData {
    userName: string;
    userPhone?: string;
    userEmail?: string;
    userAddress?: string;
    userPhotoURL?: DataURL;
}

export type FormUserTemplateData = {
    icon: string;
    label: string;
    type: string;
    control: string;
    model: string;
    mappedDbName?: string;
    validators: {
        required?: boolean;
        minlength?: string;
        maxlength?: string;
        pattern?: string;
    };
}[];

export interface IAuthUserPayload {
    readonly userData: User | null;
    readonly userProfileData?: IProfileUserData | undefined;
}

export interface IHistoryModalTransferState {
    readonly mode: 'modal';
    readonly orderInfo: IQuickOrder;
    readonly orderContent: Cart;
}