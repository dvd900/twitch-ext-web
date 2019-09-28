import { observable, action } from 'mobx';
import { Window } from 'app/utils/TwitchExt';
import Authentication from 'app/utils/authentication';
import { ItemModel } from 'app/models';
export class UserStore {
  twitch;
  @observable
  credits: number = 201;
  constructor() {
    console.log('createing user store');
    this.Authentication = new Authentication();
    this.twitch = ((window as unknown) as Window).Twitch.ext;
    if (this.twitch) {
      this.twitch.actions.requestIdShare();
      this.twitch.onAuthorized((auth) => {
        console.log(auth);
        this.Authentication.setToken(auth.token, auth.userId);
        this.getUser();
        this.isLoaded = true;
      });

      this.twitch.listen('broadcast', async (target, contentType, body) => {
        let res = await this.Authentication.makeCall(
          'https://suicide.ngrok.io/tokens',
          'PUT',
          {}
        );
        let credits = await res.json();
        this.setCredits(credits);
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
    this.setCredits((await res.json()).credits);
  }
}
interface SpawnItemRequest {
  x: number;
  y: number;
  item: ItemModel;
}

export default UserStore;
