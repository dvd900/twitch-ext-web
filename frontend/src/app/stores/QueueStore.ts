import { observable, action, computed } from 'mobx';
import * as moment from 'moment';

export class QueueStore {
  @observable
  queueList: User[] = [];
  @observable
  nextTurn: number;
  @observable
  isLoaded: boolean;

  userId: string;

  constructor() {}

  @action
  setNewQueueData(queueList: User[], nextTurn: number) {
    this.queueList = queueList;
    this.nextTurn = nextTurn;
    this.isLoaded = true;
  }

  @action
  next() {
    this.nextTurn = moment.default(Date.now())
      .add(30, 'seconds')
      .valueOf();
    if (this.queueList.length !== 0) {
      let user = this.queueList.shift();
      this.queueList.push(user);
    }
  }

  @computed
  get usersPlace(): number {
    console.log(this.userId);
    return 1 + this.queueList.findIndex((user) => user.userId === this.userId);
  }
}

export interface User {
  credits: number;
  userName: string;
  userId: string;
  askedForRoll: boolean;
}

export default QueueStore;
