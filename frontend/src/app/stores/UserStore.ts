import { observable, action} from 'mobx';
import { Window } from 'app/utils/TwitchExt';
import Authentication from 'app/utils/authentication';
import { ItemModel } from 'app/models';
import QueueStore, { User } from './QueueStore';
import InventoryStore from './InventoryStore';
export class UserStore {
  twitch;
  queueStore: QueueStore;
  inventoryStore: InventoryStore;
  @observable
  credits: number = 201;

  userId: string;
  user: User;

  noQueue:boolean; 
  
  auth = false;

  constructor(queueStore: QueueStore, inventoryStore:InventoryStore) {
    this.queueStore = queueStore;
    this.inventoryStore = inventoryStore
    console.log('createing user store');
    this.Authentication = new Authentication();
    this.twitch = ((window as unknown) as Window).Twitch.ext;
    if (this.twitch) {
      this.twitch.actions.requestIdShare();
      this.twitch.onAuthorized(async (auth) => {
        console.log('got authorization', auth);
        this.auth = true;
        this.Authentication.setToken(auth.token, auth.userId);
        try {
          console.log('getting user')
          let res = await this.getUser();
          if(res.statusCode===500){
            throw res;
          }
          this.user = res;
          this.queueStore.userId = this.user.userId;
          this.userId = this.user.userId;
          this.noQueue = this.user.noQueue;
          this.updateQueue();
          this.isLoaded = true
        }  catch (err){
          this.isLoaded = false;
          this.isError = true;
        }
      });

      //why in the fuck is my user store maintaining this im in hell right lol
      this.twitch.listen('broadcast', async (target, contentType, body) => {
        console.log('got broadcast', body);
        try{
          const payload = JSON.parse(body);
          console.log(payload);
          if(payload.type && payload.type === 'itemSpawn'){
            if(payload.userName !== this.user.userName){
              this.inventoryStore.addSpawn({x: payload.coordinates.x, y: payload.coordinates.y, userName: ""})
            }
          }
        }
        catch(err){
          console.log('not an object', err)
        }
        if (body === 'token-time') {
          let res = await this.Authentication.makeCall(
            'https://suicide2.ngrok.io/tokens',
            'PUT',
            {}
          );
          let credits = await res.json();
          console.log(credits);
          //this.setCredits(credits);
          this.updateQueue();
        } else if (body === 'queue') {
          this.updateQueue();
        }
      });

      this.twitch.onVisibilityChanged((isVisible, _c) => {});

      this.twitch.onContext((context, delta) => {});
    }
  }

  @observable
  isLoaded: boolean;

  @observable 
  isError: boolean;

  @action
  async setCredits(credits) {
    console.log('setting credits', credits);
    this.credits = credits;
  }

  @action
  async spawnItem({ x, y, item }: SpawnItemRequest) {
    let res = await this.Authentication.makeCall(
      'https://suicide2.ngrok.io/items',
      'POST',
      { x, y, itemId: item.itemId, username:this.user.userName, cost: 0 - item.cost }
    );
    this.queueStore.itemSpawned = true;
    this.setCredits((await res.json()).credits);
  }
  Authentication: Authentication;
  @action
  async getUser() {
    if(!this.auth){
      return
    }
    let res = (await this.Authentication.makeCall(
      'https://suicide2.ngrok.io/user',
      'GET',
      {}
    )) as Response;
    
    return await res.json();
  }

  async updateQueue() {
    if(!this.auth){
      return
    }
    let res = (await this.Authentication.makeCall(
      'https://suicide2.ngrok.io/queue',
      'GET',
      {}
    )) as Response;
    let queueData = await res.json();
    this.queueStore.setNewQueueData(queueData.userList, queueData.nextTurn, queueData.itemSpawned );
    if(this.queueStore.usersPlace===0) {
      await this.getUser();
      this.updateQueue();
    }
  }
}

interface SpawnItemRequest {
  x: number;
  y: number;
  item: ItemModel;
}

export default UserStore;
