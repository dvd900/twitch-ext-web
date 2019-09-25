import { observable, action } from 'mobx';
import {Window} from 'app/utils/TwitchExt'
import Authentication from 'app/utils/authentication';
export class UserStore {
    twitch;
  @observable
  credits:number = 201;  
  constructor() {
    console.log('createing user store')
    this.Authentication = new Authentication()
    this.twitch = (window as unknown as Window).Twitch.ext; 
    if(this.twitch){
        this.twitch.actions.requestIdShare();
        this.twitch.onAuthorized((auth)=>{
            console.log(auth);
            this.Authentication.setToken(auth.token, auth.userId)
            this.getUser();
            this.isLoaded = true;
        })

        this.twitch.listen('broadcast',(target,contentType,body)=>{
            console.log('gott broadcastttttt',body);
            this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
            // now that you've got a listener, do something with the result... 

            // do something...

        })

        this.twitch.onVisibilityChanged((isVisible,_c)=>{
        })

        this.twitch.onContext((context,delta)=>{
        })
    }
  }

  @observable
  isLoaded: boolean;

  Authentication;
  @action
  async getUser(){
    this.Authentication.makeCall('https://suicide.ngrok.io/user', 'GET', {})
  }
  


}

export default UserStore;
