import * as mongotypes from 'mongodb'

/**
 *    Copyright 2018 Amazon.com, Inc. or its affiliates
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
const Path = require('path')
const fs = require('fs')
const Hapi = require('hapi')
const path = require('path')
const Boom = require('boom')
const color = require('color')
const ext = require('commander')
const jsonwebtoken = require('jsonwebtoken')
const request = require('request')
const ngrok = require('ngrok')
const { promisify } = require('util')
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
MongoClient.connect(url, function(err, client: mongotypes.MongoClient) {
  const db = client.db('twitch')

  // The developer rig uses self-signed certificates.  Node doesn't accept them
  // by default.  Do not use this in production.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  // Use verbose logging during development.  Set this to false for production.
  const verboseLogging = true
  const verboseLog = verboseLogging ? console.log.bind(console) : () => {}

  // Service state variables
  const initialColor = color('#6441A4') // super important; bleedPurple, etc.
  const serverTokenDurationSec = 30 // our tokens for pubsub expire after 30 seconds
  const userCooldownMs = 1000 // maximum input rate per user to prevent bot abuse
  const userCooldownClearIntervalMs = 60000 // interval to reset our tracking object
  const channelCooldownMs = 1000 // maximum broadcast rate per channel
  const bearerPrefix = 'Bearer ' // HTTP authorization headers have this prefix
  const colorWheelRotation = 30
  const channelColors = {}
  const channelCooldowns = {} // rate limit compliance
  let userCooldowns = {} // spam prevention
  var users = []
  const STRINGS = {
    secretEnv: usingValue('secret'),
    clientIdEnv: usingValue('client-id'),
    ownerIdEnv: usingValue('owner-id'),
    serverStarted: 'Server running at %s',
    secretMissing: missingValue('secret', 'EXT_SECRET'),
    clientIdMissing: missingValue('client ID', 'EXT_CLIENT_ID'),
    ownerIdMissing: missingValue('owner ID', 'EXT_OWNER_ID'),
    messageSendError: 'Error sending message to channel %s: %s',
    pubsubResponse: 'Message to c:%s returned %s',
    cyclingColor: 'Cycling color for c:%s on behalf of u:%s',
    colorBroadcast: 'Broadcasting color %s for c:%s',
    sendColor: 'Sending color %s to c:%s',
    cooldown: 'Please wait before clicking again',
    invalidAuthHeader: 'Invalid authorization header',
    invalidJwt: 'Invalid JWT',
  }

  ext
    .version(require('../package.json').version)
    .option('-s, --secret <secret>', 'Extension secret')
    .option('-c, --client-id <client_id>', 'Extension client ID')
    .option('-o, --owner-id <owner_id>', 'Extension owner ID')
    .parse(process.argv)

  const config = require('../conf/config.json')
  const ownerId = getOption('ownerId', 'EXT_OWNER_ID')
  const secret = Buffer.from(config.secret, 'base64')
  const clientId = config.clientId
  const channelId = '448291197'
  var api = require('twitch-helix-api')
  api.clientID = clientId

  const serverOptions = {
    host: 'localhost',
    port: 8081,
    //tls: {
    //  key: fs.readFileSync('/etc/letsencrypt/live/suicide.wiz.zone/privkey.pem'),
    //  cert: fs.readFileSync('/etc/letsencrypt/live/suicide.wiz.zone/fullchain.pem')
    //},
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public'),
      },
      cors: {
        origin: ['*'],
      },
    },
  }
  const serverPathRoot = path.resolve(__dirname, '..', 'conf', 'server')
  const server = new Hapi.Server(serverOptions)
  //const WebSockets = require('ws')
  var WebSockets = require('ws-mock').WsServer
  //const ws = new WebSockets()
  var ws = new WebSockets('ws://localhost:1337/Chat')
  ws.send = () => {}
  ws.addConnection()
  console.log(ws)
  ws.emit('warning', e => {})
  ws.on('open', function open() {
    ws.send('something')
  })

  ws.on('message', function incoming(data) {
    console.log(data)
  })
  ;(async () => {
    // Handle a viewer request to cycle the color.
    const url = await ngrok.connect({
      proto: 'http', // http|tcp|tls, defaults to http
      addr: 8081, // port or network address, defaultst to 80
      subdomain: 'suicide', // reserved tunnel name https://alex.ngrok.io
      authtoken: config.ngrAuth, // your authtoken from ngrok.com
      region: 'us', // one of ngrok regions (us, eu, au, ap), defaults to us
    })
    console.log('ngrok drinking microwaved soda at' + url)
    server.route({
      method: 'POST',
      path: '/clicked',
      handler: clickHandler,
    })

    server.route({
      method: 'POST',
      path: '/items',
      handler: spawnHandler,
    })
    server.route({
      method: 'PUT',
      path: '/tokens',
      handler: tokensHandler,
    })
    server.route({
      method: 'GET',
      path: '/user',
      handler: userHandler,
    })
    server.route({
      method: 'POST',
      path: '/idle',
      handler: idleHandler,
    })
    // Handle a new viewer requesting the color.
    server.route({
      method: 'GET',
      path: '/color/query',
      handler: colorQueryHandler,
    })

    server.route({
      method: 'GET',
      path:
        '/.well-known/acme-challenge/n-hRJ76hwiC-wrKeOPhkBdsXRG_1np6JCXO2D_BMmXk',
      handler: function(request, h) {
        return h.file('n-hRJ76hwiC-wrKeOPhkBdsXRG_1np6JCXO2D_BMmXk')
      },
    })
    server.route({
      method: 'GET',
      path: '/manny',
      handler: function(request, h) {
        return h.file('manny')
      },
    })
    // Start the server.
    await server.start()
    await server.register(require('@hapi/inert'))
    console.log(STRINGS.serverStarted, server.info.uri)
    var socketConnected = false

    // Periodically clear cool-down tracking to prevent unbounded growth due to
    // per-session logged-out user tokens.
    setInterval(() => {
      userCooldowns = {}
    }, userCooldownClearIntervalMs)
  })()

  function usingValue(name) {
    return `Using environment variable for ${name}`
  }

  function missingValue(name, variable) {
    const option = name.charAt(0)
    return `Extension ${name} required.\nUse argument "-${option} <${name}>" or environment variable "${variable}".`
  }

  // Get options from the command line or the environment.
  function getOption(optionName, environmentName) {
    const option = (() => {
      if (ext[optionName]) {
        return ext[optionName]
      } else if (process.env[environmentName]) {
        console.log(STRINGS[optionName + 'Env'])
        return process.env[environmentName]
      }
      console.log(STRINGS[optionName + 'Missing'])
      process.exit(1)
    })()
    console.log(`Using "${option}" for ${optionName}`)
    return option
  }

  // Verify the header and the enclosed JWT.
  function verifyAndDecode(header) {
    if (header.startsWith(bearerPrefix)) {
      try {
        const token = header.substring(bearerPrefix.length)

        return jsonwebtoken.decode(token)
      } catch (ex) {
        console.log(ex)
        throw Boom.unauthorized(STRINGS.invalidJwt)
      }
    }
    throw Boom.unauthorized(STRINGS.invalidAuthHeader)
  }

  function send(payload) {
    ws.send('click')
  }

  function clickHandler(req) {
    //return true
    //const payload = verifyAndDecode(req.headers.authorization);
    console.log('got click')
    let data = JSON.stringify(req.payload)
    let messageInd = 0
    let message = { messageInd, data }
    ws.send(JSON.stringify(message))
    return true
  }
  let usersGivenTokens = []
  async function tokensHandler(req) {
    const payload = verifyAndDecode(req.headers.authorization)
    const {
      channel_id: channelId,
      opaque_user_id: opaqueUserId,
      user_id: userId,
    } = payload
    let credits = 0
    console.log('tokenhandler')
    console.log(usersGivenTokens.indexOf(userId))
    console.log(usersGivenTokens)
    if (usersGivenTokens.indexOf(userId) === -1) {
      console.log('incremeting')
      let res = await db
        .collection('users')
        .findOneAndUpdate(
          { userId },
          { $inc: { credits: 10 } },
          { returnOriginal: false }
        )
      usersGivenTokens.push(userId)
      return res.value.credits
    } else {
      let user = await db.collection('users').findOne({ userId: userId })
      return user.credits
    }
  }

  async function spawnHandler(req) {
    console.log('got spawn')
    const payload = verifyAndDecode(req.headers.authorization)
    const { user_id: userId } = payload
    console.log('hello', req.payload)
    const { itemId, x, y, cost } = req.payload
    let messageInd = 1
    let message = { messageInd, data: { x, y, itemId } }
    let user = await db.collection('users').findOne({ userId: userId })
    if (user) {
      if (user.credits + cost >= 0) {
        user = await db
          .collection('users')
          .findOneAndUpdate(
            { userId },
            { $inc: { credits: cost } },
            { returnOriginal: false }
          )
        user = user.value
        ws.send(JSON.stringify(message))
      }
      console.log('returning credits', { credits: user.credits })
      return { credits: user.credits }
    }
    return false
  }
  async function userHandler(req) {
    const payload = verifyAndDecode(req.headers.authorization)
    const {
      channel_id: channelId,
      opaque_user_id: opaqueUserId,
      user_id: userId,
    } = payload
    console.log(channelId)
    let user = await db.collection('users').findOne({ userId: userId })
    let credits = 0
    if (!user) {
      let twitchuser = await api.users.getUsers({ id: userId })
      let userName = twitchuser.response.data[0].display_name
      await db.collection('users').insertOne({ userId, userName, credits: 100 })
      credits = 100
    } else {
      credits = user.credits
    }

    return { credits }
  }
  function idleHandler(req) {
    console.log('got idle')
    console.log(req.headers.authorization)
    const payload = verifyAndDecode(req.headers.authorization)
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload
    let messageInd = 1
    let message = { messageInd, data: '' }
    ws.send(JSON.stringify(message))
    return true
  }

  function broadcastCredits() {
    const headers = {
      'Client-ID': clientId,
      'Content-Type': 'application/json',
      Authorization: bearerPrefix + makeServerToken(channelId),
    }
    const body = JSON.stringify({
      content_type: 'application/json',
      message: 'tokenTime',
      targets: ['broadcast'],
    })

    // Send the broadcast request to the Twitch API.
    request(
      `https://api.twitch.tv/extensions/message/${channelId}`,
      {
        method: 'POST',
        headers,
        body,
      },
      (err, res) => {
        if (err) {
          console.log(STRINGS.messageSendError, channelId, err)
        } else {
          verboseLog(STRINGS.pubsubResponse, channelId, res.statusCode)
        }
      }
    )
  }
  setInterval(tokenTime, 6000, channelId + '')
  function colorCycleHandler(req) {
    // Verify all requests.
    const payload = verifyAndDecode(req.headers.authorization)
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload

    // Store the color for the channel.
    let currentColor = channelColors[channelId] || initialColor

    // Bot abuse prevention:  don't allow a user to spam the button.
    if (userIsInCooldown(opaqueUserId)) {
      throw Boom.tooManyRequests(STRINGS.cooldown)
    }

    // Rotate the color as if on a color wheel.
    verboseLog(STRINGS.cyclingColor, channelId, opaqueUserId)
    currentColor = color(currentColor)
      .rotate(colorWheelRotation)
      .hex()

    // Save the new color for the channel.
    channelColors[channelId] = currentColor

    // Broadcast the color change to all other extension instances on this channel.
    attemptColorBroadcast(channelId)

    return currentColor
  }

  function colorQueryHandler(req) {
    return true
    // Verify all requests.
    const payload = verifyAndDecode(req.headers.authorization)

    // Get the color for the channel from the payload and return it.
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload
    const currentColor = color(channelColors[channelId] || initialColor).hex()
    verboseLog(STRINGS.sendColor, currentColor, opaqueUserId)
    //return currentColor;
  }

  function tokenTime(channelId) {
    console.log('its token time')
    usersGivenTokens = []
    console.log(usersGivenTokens)
    broadcastCredits()
  }
  function attemptColorBroadcast(channelId) {
    // Check the cool-down to determine if it's okay to send now.
    const now = Date.now()
    const cooldown = channelCooldowns[channelId]
    if (!cooldown || cooldown.time < now) {
      // It is.
      sendColorBroadcast(channelId)
      channelCooldowns[channelId] = { time: now + channelCooldownMs }
    } else if (!cooldown.trigger) {
      // It isn't; schedule a delayed broadcast if we haven't already done so.
      cooldown.trigger = setTimeout(
        sendColorBroadcast,
        now - cooldown.time,
        channelId
      )
    }
  }

  function sendColorBroadcast(channelId) {
    // Set the HTTP headers required by the Twitch API.
    const headers = {
      'Client-ID': clientId,
      'Content-Type': 'application/json',
      Authorization: bearerPrefix + makeServerToken(channelId),
    }
    console.log(verifyAndDecode(bearerPrefix + makeServerToken(channelId)))
    console.log(headers)

    // Create the POST body for the Twitch API request.
    const currentColor = color(channelColors[channelId] || initialColor).hex()
    const body = JSON.stringify({
      content_type: 'application/json',
      message: currentColor,
      targets: ['broadcast'],
    })

    // Send the broadcast request to the Twitch API.
    verboseLog(STRINGS.colorBroadcast, currentColor, channelId)
    request(
      `https://api.twitch.tv/extensions/message/${channelId}`,
      {
        method: 'POST',
        headers,
        body,
      },
      (err, res) => {
        if (err) {
          console.log(STRINGS.messageSendError, channelId, err)
        } else {
          console.log(err)
          console.log(res.body)
          verboseLog(STRINGS.pubsubResponse, channelId, res.statusCode)
        }
      }
    )
  }

  // Create and return a JWT for use by this service.
  function makeServerToken(channelId) {
    const payload = {
      exp: Math.floor(Date.now() / 1000) + serverTokenDurationSec,
      channel_id: channelId,
      user_id: ownerId, // extension owner ID for the call to Twitch PubSub
      role: 'external',
      pubsub_perms: {
        send: ['broadcast'],
      },
    }
    //let signedJwt = jwt.sign(payload, secret);
    return jsonwebtoken.sign(payload, secret, { algorithm: 'HS256' })
  }

  function userIsInCooldown(opaqueUserId) {
    // Check if the user is in cool-down.
    const cooldown = userCooldowns[opaqueUserId]
    const now = Date.now()
    if (cooldown && cooldown > now) {
      return true
    }

    // Voting extensions must also track per-user votes to prevent skew.
    userCooldowns[opaqueUserId] = now + userCooldownMs
    return false
  }
})
