import moment from 'moment'
export class UserListManager {
  queueTime: number
  userMap: UserMap = {}
  userQueue: User[] = []
  usersAnsweredRoll: String[] = []
  turnEnds: number
  itemSpawned: boolean
  constructor(queueTime: number) {
    this.queueTime = queueTime
  }

  addUser(user: User) {
    if (!this.userMap[user.userId]) {
      if(!user.userId) {
        user.userId = (Math.random()*1000).toString();
      }
      this.userMap[user.userId] = user
      if (this.userQueue.length === 0) {
        this.turnEnds = (moment(Date.now())
          .add(this.queueTime, 'seconds'))
          .valueOf()
      }
      if(!this.userQueue.find((userInQueue: User) => {return userInQueue.userId === user.userId})){
        this.userQueue.push(user)
      }
    }
  }

  rollCalled() {
    console.log(this.usersAnsweredRoll);
    for (const userId in this.userMap) {
      let found = this.usersAnsweredRoll.find(answeredUserId => {
        return answeredUserId === userId
      })
      if (!found) {
        if (this.userMap[userId].askedForRoll) {
          if(this.userQueue[0].userId === userId){
            this.next();
          }
          delete this.userMap[userId]
          console.log(`User: ${userId} not found bye bye now hunny`)
        } else {
          this.userMap[userId].askedForRoll = true
        }
      } else {
        //console.log(`User: ${this.userMap[userId].userName} checked in :)`)
      }
    }
    console.log('purging queue');
    this.userQueue = this.userQueue.filter(user => {
      return this.userMap.hasOwnProperty(user.userId);
    })
    this.usersAnsweredRoll = []
  }

  userResponded(userId: string) {
    if (this.usersAnsweredRoll.indexOf(userId) === -1) {
      this.usersAnsweredRoll.push(userId)
    }
  }

  next() {
    this.itemSpawned = false;
    this.turnEnds = (moment(Date.now())
      .add(this.queueTime, 'seconds')).valueOf()
    if (this.userQueue.length !== 0) {
      let user = this.userQueue.shift()
      this.userQueue.push(user)
    }
  }
}

export interface User {
  credits: number
  userName: string
  userId: string
  askedForRoll: boolean
  noQueue: boolean
}
interface UserMap {
  [userId: string]: User
}
