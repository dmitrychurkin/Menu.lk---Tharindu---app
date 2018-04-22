import { Injectable } from "@angular/core";
import { Events, Platform } from "ionic-angular";
import { Cart, IEntityInCart, IMenuItem, IMenuType, IOrder } from "../interfaces";
import { APP_EV, CART_ACTION_FLAGS, DATABASE_TOKENS, MAX_CART_ITEMS } from "../pages/pages.constants";
import { StorageProvider } from "./storage-provider";

@Injectable()
export class ShoppingCart {

  private _removedCount = 0;

  constructor(
    private _events: Events,
    private _plt: Platform,
    private _storageProvider: StorageProvider) { }

  get CartEntity() {
    return this._storageProvider.getItem(DATABASE_TOKENS.SHOPPING_CART)
      .then((CartEntity: Cart) => {
        if (!CartEntity || !Array.isArray(CartEntity.CART) || typeof CartEntity.TOTAL_ORDERS_IN_CART !== 'number') {
          CartEntity = { TOTAL_ORDERS_IN_CART: 0, CART: [] }
        }
        return CartEntity;
      });
  }

  async addToCart(Order: IOrder) {

    try {
      const CartEntity: Cart = await this.CartEntity; 
      
      if (CartEntity.TOTAL_ORDERS_IN_CART + Order.menu.quantity > MAX_CART_ITEMS) {
        throw new Error('Too many items in cart, first buy this!');
      }
      const EntireDataSet = CartEntity.CART;
      
      let EntityInCart = EntireDataSet.find(({ id }: IEntityInCart) => id === Order.id);
      const MenuItemTemplate = { ...Order.menu.item, quantity: Order.menu.quantity, userNotes: Order.menu.userNotes };
      const MenuTypeTemplate = { type: Order.menu.type, subhead: Order.menu.subhead, items: [MenuItemTemplate] };
      if (!EntityInCart) {
        EntityInCart = {
          id: Order.id,
          entityName: Order.entityName,
          orders: [
            MenuTypeTemplate
          ]
        };
        EntireDataSet.push(EntityInCart);
      } else {

        let MenuType: IMenuType = EntityInCart.orders.find(({ type, subhead }) => {
          if (subhead) {
            if (type === Order.menu.type && subhead === Order.menu.subhead) {
              return true;
            }
          } else {
            if (type === Order.menu.type) {
              return true;
            }
          }
        });
        if (!MenuType) {
          EntityInCart.orders.push(MenuTypeTemplate);
        } else {
          let MenuItem = MenuType.items.find(({ _id, userNotes }: IMenuItem) => {
            const parsedId = _id.split('_')[0];
            return parsedId === Order.menu.item._id && userNotes === Order.menu.userNotes;
          });
          if (!MenuItem) {
            MenuType.items.push(MenuItemTemplate);
          } else {
            if (!Order.menu.userNotes || MenuItem.userNotes === Order.menu.userNotes) {
              MenuItem.quantity += Order.menu.quantity;
            }else {
              MenuItemTemplate._id += ('_' + Date.now());
              MenuType.items.push(MenuItemTemplate);
            }
            
          }
        }
      }
      this._completer({
        actionFlag: CART_ACTION_FLAGS.ADD,
        message: `${Order.menu.quantity} ${Order.menu.item.name.toUpperCase()} was added to cart`,
        soundPath: 'addToCart.mp3',
        cartDbEntity: CartEntity,
        itemCount: Order.menu.quantity
      });
      
    } catch (err) {
      // Handling all errors here :)
      this._toastMessageHandler(`${(err && err.message) || 'Error occured while trying to add to cart'}`);
    }

  }

  datasetIterator(lambda: (InfoObject: IDatasetIteratorLambdaObjectInfo, $event?: any) => void, Dataset: IEntityInCart[], $event?: any) {

    for (let i = 0; i < Dataset.length; i++) {
      const EntityInCart = Dataset[i];
      if (typeof EntityInCart === 'object' && Array.isArray(EntityInCart.orders)) {
        if (EntityInCart.orders.length == 0) {
          Dataset.splice(i, 1);
          this.datasetIterator(lambda, Dataset, $event);
        } else {

          for (let j = 0; j < EntityInCart.orders.length; j++) {
            const MenuType = EntityInCart.orders[j];
            if (typeof MenuType === 'object' && Array.isArray(MenuType.items)) {
              if (MenuType.items.length == 0) {
                EntityInCart.orders.splice(j, 1);
                this.datasetIterator(lambda, Dataset, $event);
              } else {

                for (let k = 0; k < MenuType.items.length; k++) {
                  const MenuItem = MenuType.items[k];
                  if (typeof MenuItem === 'object') {
                    lambda({ menuItemArray: MenuType.items, menuItem: MenuItem, index: k }, $event);
                  }
                }
              }
            }
          }
        }
      }
    }

  }

  deleteItemHandlerFn(MenuItemToDelete: IMenuItem, EntireDataSet: IEntityInCart[]) {
    const Fn = ({ menuItemArray, menuItem, index }: IDatasetIteratorLambdaObjectInfo) => {
      if (menuItem._id === MenuItemToDelete._id) {
        if (MenuItemToDelete.quantity < menuItem.quantity) {
          menuItem.quantity = MenuItemToDelete.quantity;
        } else if (MenuItemToDelete.quantity == menuItem.quantity) {
          menuItemArray.splice(index, 1);
          this.datasetIterator(Fn, EntireDataSet);
        }
      }
    };
    return Fn;
  }

  deleteItemsetHandletFn(DatasetAngular: IEntityInCart[], DatasetDb: IEntityInCart[]) {
    
    const Fn = ({ menuItemArray, menuItem, index }: IDatasetIteratorLambdaObjectInfo) => {
      if (menuItem.meta && menuItem.meta.itemMarkForDelete) {
        this.deleteItemHandlerFn(menuItem, DatasetAngular)({ menuItemArray, menuItem, index });
        this.datasetIterator(this.deleteItemHandlerFn(menuItem, DatasetDb), DatasetDb);
        this._removedCount += menuItem.quantity;
        this.deleteItemsetHandletFn(DatasetAngular, DatasetDb);
      }
    };
    this.datasetIterator(Fn, DatasetAngular);
    
  }
  async removeFromCart(ItemToDeleteOrDatasetAngular: IMenuItem | IEntityInCart[], DatasetAngular?: IEntityInCart[]) {
    try {
      const CartEntity: Cart = await this.CartEntity;
      const EntireDataSet = CartEntity.CART;
      let itemCount: number, message: string, soundPath = 'removeFromCart.mp3';

      if (Array.isArray(ItemToDeleteOrDatasetAngular)) {
        this.deleteItemsetHandletFn(ItemToDeleteOrDatasetAngular, EntireDataSet);
        itemCount = this._removedCount;
        this._removedCount = 0;
        message = `${itemCount} items was removed from cart`;

      } else {
        itemCount = ItemToDeleteOrDatasetAngular.quantity;
        message = `${ItemToDeleteOrDatasetAngular.quantity} ${ItemToDeleteOrDatasetAngular.name.toUpperCase()} was removed from cart`;
        this.datasetIterator(this.deleteItemHandlerFn(ItemToDeleteOrDatasetAngular, DatasetAngular), DatasetAngular);
        this.datasetIterator(this.deleteItemHandlerFn(ItemToDeleteOrDatasetAngular, EntireDataSet), EntireDataSet);
      }

      return this._completer({
        actionFlag: CART_ACTION_FLAGS.DELETE,
        message,
        soundPath,
        cartDbEntity: CartEntity,
        itemCount
      });

    } catch (err) {
      this._toastMessageHandler(`${(err && err.message) || 'Error occured while trying to remove item from cart'}`);
    }
  }

  private async _completer({ actionFlag, message, soundPath, cartDbEntity, itemCount }: ICompliterArgs) {
    try {

      switch (actionFlag) {
        case CART_ACTION_FLAGS.ADD:
          cartDbEntity.TOTAL_ORDERS_IN_CART += itemCount;
          break;

        case CART_ACTION_FLAGS.DELETE:
          cartDbEntity.TOTAL_ORDERS_IN_CART -= itemCount;
          break;
      }

      await this._storageProvider.setItem(DATABASE_TOKENS.SHOPPING_CART, cartDbEntity);

      this._toastMessageHandler(message);

      this._events.publish(APP_EV.CART_ACTION, actionFlag, itemCount);

      return this._playSound(soundPath);

    } catch (err) {
      this._toastMessageHandler(`${(err && err.message) || 'Error occured'}`);
    }

  }

  private _playSound(soundPath?: string) {
    if (!soundPath) return;
    const SoundFilePath = `assets/sounds/${soundPath}`;
    return new Audio(SoundFilePath).play();
  }

  private _toastMessageHandler(errMessage: string) {
    this._storageProvider.configToast(errMessage)();
  }
  
}

interface ICompliterArgs {
  actionFlag: CART_ACTION_FLAGS;
  message: string;
  soundPath?: string;
  cartDbEntity: Cart;
  itemCount: number;
}
export interface IDatasetIteratorLambdaObjectInfo {
  menuItemArray: IMenuItem[];
  menuItem: IMenuItem;
  index: number;
}