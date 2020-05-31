import moment from 'moment'
export class UserListManager {
  queueTime: number
  userMap: UserMap = {}
  userQueue: User[] = []
  usersAnsweredRoll: String[] = []
  turnEnds: number
  constructor(queueTime: number) {
    this.queueTime = queueTime
  }

  addUser(user: User) {
    if (!this.userMap[user.userId]) {
      console.log('adding user to userMap', user.userId)
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
    for (const userId in this.userMap) {
      let found = this.usersAnsweredRoll.find(answeredUserId => {
        return answeredUserId === userId
      })
      if (!found) {
        if (this.userMap[userId].askedForRoll) {
          delete this.userMap[userId]
          //console.log(`User: ${userId} not found bye bye now hunny`)
        } else {
          this.userMap[userId].askedForRoll = true
        }
      } else {
        //console.log(`User: ${this.userMap[userId].userName} checked in :)`)
      }
    }
    this.userQueue.filter(user => this.userMap.hasOwnProperty(user.userId))
    this.usersAnsweredRoll = []
  }

  userResponded(userId: string) {
    if (this.usersAnsweredRoll.indexOf(userId) === -1) {
      this.usersAnsweredRoll.push(userId)
    }
  }

  next() {
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
}
interface UserMap {
  [userId: string]: User
}
