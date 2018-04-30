import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
//Constants for getting type references
export const APP_TABS_PAGE = 'AppTabsPage';
export const APP_SEARCH_PAGE = 'SearchPage';
export const APP_PROFILE_PAGE = 'ProfilePage';
export const APP_HOME_PAGE = 'HomePage';
export const APP_SHOP_PAGE = 'ShopPage';
export const APP_ITEM_PAGE = 'ItemPage';
// export const APP_LOGIN_PAGE = 'LoginPage';
export const APP_CART_PAGE = 'CartPage';
export const APP_QUICK_ORDER_PAGE = 'QuickOrder';
export enum Currency { US = "$", LAKR = "RS" };
export const IMG_DATA_FIELD_TOKEN = 'imageURL';
export enum CART_ACTION_FLAGS { ADD, DELETE };
export enum APP_EV { 
  CART_ACTION = 'cart:action => add | delete', 
  DELETE_CART_MODE = 'cart:deleteMode'
};
export enum DATABASE_TOKENS { SHOPPING_CART = 'ShoppingCart' };
export const MAX_CART_ITEMS = 25;
export enum PopoverCartMenuEventFlags { DELETE = 'D', CANCEL = 'X' };
export const ANGULAR_ANIMATION_OPACITY = [
  trigger('animator', [
    state('void', style({ opacity: 0 })),
    state('in', style({ opacity: 1 })),
    transition('void <=> *', animate('1s ease-out'))
  ])
]
/** Tests only */
/*let urlNormalizer = (img: string, isShop: number | boolean = false) => `assets/imgs/${isShop ? 'shops/' : ''}${img}`;
export let mockBackendCall: (...args: Array<any>) => Promise<any> = (job: (...args: Array<any>) => any, needSuccess= true, delay= 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      needSuccess ? resolve( job() ) : reject( job() );
    }, delay)
  });
};

export const mainMenu = [
  {
    "name": "cofee bean",
    "imageUrl": urlNormalizer('04-coffe.jpg'),
    "timing": 25,
    "category": "coffee shop",
    "takeaway": true,
    "star_rate": 4.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "praneetha restaurant",
    "imageUrl": urlNormalizer('health-effects-of-coffee.jpg'),
    "timing": 45,
    "category": "restaurant",
    "takeaway": true,
    "star_rate": 3.5,
    "open_time": "24/7 Open"
  }

  // test only

  ,{
    "name": "cofee bean",
    "imageUrl": urlNormalizer('04-coffee.jpg'),
    "timing": 25,
    "category": "coffee shop",
    "takeaway": true,
    "star_rate": 4.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "praneetha restaurant",
    "imageUrl": urlNormalizer('health-effects-of-coffee.jpg'),
    "timing": 45,
    "category": "restaurant",
    "takeaway": true,
    "star_rate": 3.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "cofee bean",
    "imageUrl": urlNormalizer('04-coffee.jpg'),
    "timing": 25,
    "category": "coffee shop",
    "takeaway": true,
    "star_rate": 4.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "praneetha restaurant",
    "imageUrl": urlNormalizer('health-effects-of-coffee.jpg'),
    "timing": 45,
    "category": "restaurant",
    "takeaway": true,
    "star_rate": 3.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "cofee bean",
    "imageUrl": urlNormalizer('04-coffee.jpg'),
    "timing": 25,
    "category": "coffee shop",
    "takeaway": true,
    "star_rate": 4.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "praneetha restaurant",
    "imageUrl": urlNormalizer('health-effects-of-coffee.jpg'),
    "timing": 45,
    "category": "restaurant",
    "takeaway": true,
    "star_rate": 3.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "cofee bean",
    "imageUrl": urlNormalizer('04-coffee.jpg'),
    "timing": 25,
    "category": "coffee shop",
    "takeaway": true,
    "star_rate": 4.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "praneetha restaurant",
    "imageUrl": urlNormalizer('health-effects-of-coffee.jpg'),
    "timing": 45,
    "category": "restaurant",
    "takeaway": true,
    "star_rate": 3.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "cofee bean",
    "imageUrl": urlNormalizer('04-coffee.jpg'),
    "timing": 25,
    "category": "coffee shop",
    "takeaway": true,
    "star_rate": 4.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "praneetha restaurant",
    "imageUrl": urlNormalizer('health-effects-of-coffee.jpg'),
    "timing": 45,
    "category": "restaurant",
    "takeaway": true,
    "star_rate": 3.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "cofee bean",
    "imageUrl": urlNormalizer('04-coffee.jpg'),
    "timing": 25,
    "category": "coffee shop",
    "takeaway": true,
    "star_rate": 4.5,
    "open_time": "24/7 Open"
  },
  {
    "name": "praneetha restaurant",
    "imageUrl": urlNormalizer('health-effects-of-coffee.jpg'),
    "timing": 45,
    "category": "restaurant",
    "takeaway": true,
    "star_rate": 3.5,
    "open_time": "24/7 Open"
  }
];

export const shopMenus = 
  {
    "cofee bean": [
      {
        "name": "cappuccino",
        "desc": "A cappuccino is an Italian coffee drink that is traditionally prepared with double espresso, and steamed milk foam. Variations of the drink involve the use of cream instead of milk, and flavoring with cinnamon or chocolate powder. It is typically smaller in volume than a caffè latte, with a thicker layer of micro foam.",
        "price": "450",
        "currency": "LAKR",
        "imageUrl": urlNormalizer('cappuchin.jpg', 1)
      },
      {
        "name": "latte",
        "desc": "A latte is a coffee drink made with espresso and steamed milk. The term as used in English is a shortened form of the Italian caffè latte, caffelatte or caffellatte, which means 'milk coffee'.",
        "price": "300",
        "currency": "LAKR",
        "imageUrl": urlNormalizer('latte.jpeg', 1)
      },
      {
        "name": "americano",
        "desc": "Caffè Americano or Americano is a type of coffee drink prepared by diluting an espresso with hot water, giving it a similar strength to, but different flavor from traditionally brewed coffee.",
        "price": "250",
        "currency": "LAKR",
        "imageUrl": urlNormalizer('americano.jpg', 1)
      }
    ]
  };*/
