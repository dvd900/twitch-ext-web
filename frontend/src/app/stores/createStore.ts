import { History } from 'history';
import { TodoModel } from 'app/models';
import { TodoStore } from './TodoStore';
import { RouterStore } from './RouterStore';
import { STORE_TODO, STORE_ROUTER, STORE_INVENTORY, STORE_USER } from 'app/constants';
import InventoryStore from './InventoryStore';
import UserStore from './UserStore';

export function createStores(history: History, defaultTodos?: TodoModel[]) {
  const todoStore = new TodoStore(defaultTodos);
  const routerStore = new RouterStore(history);
  const inventoryStore = new InventoryStore();
  const userStore = new UserStore();
  return {
    [STORE_TODO]: todoStore,
    [STORE_ROUTER]: routerStore,
    [STORE_INVENTORY] : inventoryStore,
    [STORE_USER]: userStore 
  };
}
