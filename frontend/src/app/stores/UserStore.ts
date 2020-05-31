import { observable, action} from 'mobx';
import { Window } from 'app/utils/TwitchExt';
import Authentication from 'app/utils/authentication';
import { ItemModel } from 'app/models';
import QueueStore, { User } from './QueueStore';
export class UserStore {
  twitch;
  queueStore: QueueStore;
  @observable
  credits: number = 201;

  userId: string;
  user: User;

  constructor(queueStore: QueueStore) {
    this.queueStore = queueStore;
    console.log('createing user store');
    this.Authentication = new Authentication();
    this.twitch = ((window as unknown) as Window).Twitch.ext;
    if (this.twitch) {
      this.twitch.actions.requestIdShare();
      this.twitch.onAuthorized(async (auth) => {
        this.Authentication.setToken(auth.token, auth.userId);
        this.user = await this.getUser();
        this.queueStore.userId = this.user.userId;
        this.userId = this.user.userId;
        this.updateQueue();
        this.isLoaded = true;
      });

      //why in the fuck is my user store maintaining this im in hell right lol
      this.twitch.listen('broadcast', async (target, contentType, body) => {
        if (body === 'token-time') {
          let res = await this.Authentication.makeCall(
            'https://suicide.ngrok.io/tokens',
            'PUT',
            {}
          );
          let credits = await res.json();
          console.log(credits);
          //this.setCredits(credits);
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

  @action
  async setCredits(credits) {
    console.log('setting credits', credits);
    this.credits = credits;
  }

  @action
  async spawnItem({ x, y, item }: SpawnItemRequest) {
    y=1-y;
    let res = await this.Authentication.makeCall(
      'https://suicide.ngrok.io/items',
      'POST',
      { x, y, itemId: item.itemId, cost: 0 - item.cost }
    );
    this.setCredits((await res.json()).credits);
  }
  Authentication;
  @action
  async getUser() {
    let res = (await this.Authentication.makeCall(
      'https://suicide.ngrok.io/user',
      'GET',
      {}
    )) as Response;

    return await res.json();
  }

  async updateQueue() {
    let res = (await this.Authentication.makeCall(
      'https://suicide.ngrok.io/queue',
      'GET',
      {}
    )) as Response;
    let queueData = await res.json();
    this.queueStore.setNewQueueData(queueData.userList, queueData.nextTurn);
  }
}

interface SpawnItemRequest {
  x: number;
  y: number;
  item: ItemModel;
}

export default UserStore;
