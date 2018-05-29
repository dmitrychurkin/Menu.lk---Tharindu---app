import { QueryFn } from "angularfire2/database";

type DataURL = string;
interface Base {
  name: string;
  imageURL: DataURL;
  _id: string;
}
export interface IRestaurants extends Base {
  category: string;
  cookingDuration: number;
  rating: number;
  takeaway: boolean;
  type: string;
  workingTime: Array<string> | { open: string; close: string };
}

type IMenuCard = Array<IMenuType>;
export interface IMenuType {
  type: string; 
  subhead?: string; 
  items: Array<IMenuItem>
}

export interface IMenuItem extends Base {
  size?: string;
  description?: string;
  currency: 'US' | 'LAKR';
  price: number | string;
  quantity?: number;
  userNotes?: string;
  meta?: {
    itemMarkForDelete: boolean;
  }
}

export type Cart = { TOTAL_ORDERS_IN_CART: number, CART: Array<IEntityInCart> };
export interface IEntityInCart {
  id: string;
  entityName: string;
  orders: Array<IMenuType>
}

export interface IOrder {
  id: string;
  entityName: string;
  // entityImage: DataURL;
  menu: {
    type: string;
    subhead?: string;
    item: IMenuItem;
    quantity: number;
    userNotes?: string;
  }
}

export interface IPageConfig extends IApiConfig {
  job?: (...args: any[]) => any;
  withPreloader?: boolean;
}

export interface IHttpConfig {
  url: string;
  method?: "DELETE" | "GET" | "HEAD" | "JSONP" | "OPTIONS";
  headers?: any;
  reportProgress?: boolean;
  params?: any;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
  withPreloader?: boolean;
  isNeedSuccess?: boolean;
  lastKey?: string;
}

export interface IFireConfig {
  scope: string;
  childRef?: string;
  batchSize?: number;
  lastKey?: string;
  queryFn?: null | ((key: string, batchSize: number, lastKey?: string) => QueryFn);
}

export interface IApiConfig {
  fireConfig?: IFireConfig;
  httpConfig?: IHttpConfig;
}

export interface IPwdAuthUserData {
  userName: string;
}