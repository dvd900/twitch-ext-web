import { History } from 'history';
import { TodoModel } from 'app/models';
import { TodoStore } from './TodoStore';
import { RouterStore } from './RouterStore';
import {
  STORE_TODO,
  STORE_ROUTER,
  STORE_INVENTORY,
  STORE_USER,
  STORE_QUEUE
} from 'app/constants';
import InventoryStore from './InventoryStore';
import UserStore from './UserStore';
import QueueStore from './QueueStore';
export function createStores(history: History, defaultTodos?: TodoModel[]) {
  const todoStore = new TodoStore(defaultTodos);
  const routerStore = new RouterStore(history);
  const inventoryStore = new InventoryStore();
  const queueStore = new QueueStore();
  const userStore = new UserStore(queueStore, inventoryStore);

  return {
    [STORE_TODO]: todoStore,
    [STORE_ROUTER]: routerStore,
    [STORE_INVENTORY]: inventoryStore,
    [STORE_USER]: userStore,
    [STORE_QUEUE]: queueStore
  };
}
