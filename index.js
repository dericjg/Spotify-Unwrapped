const express = require("express");
const request = require("request");
const querystring = require("querystring")
const bodyparser = require("body-parser")
const nunjucks = require("nunjucks")
const app = express()
const port = process.env.PORT
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = process.env.REDIRECT_URI


nunjucks.configure(__dirname + "/views", {
  autoescape: true,
  express: app
})
app.engine('html', nunjucks.render);
app.set('view engine', 'html');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"))


let token = null
let auth_code = null


app.get("/", (req, res) => {
  res.sendFile("index.html")
})

app.get("/login", (req, res) => {
  const state = "read";
  const scope = 'user-top-read'
  //make request to Spotify API to login user to Spotify and receive an Auth code, which can be used to request an Auth Token
  res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  }));
})

//this is an unecessary redirect route. 
//used for testing but hasnt been removed
app.get("/dashboard", (req, res) => {
  auth_code = req.query.code
  //retrieve authToken from auth code
  get_AuthToken(auth_code).then((data) => {
     token = data
    res.redirect("/home")
    }).catch((error)=>res.send(error))
})

app.get('/home', (req, res) => {
  getTop().then((data)=>{
    res.render("top-items.html", { items: data})
  }).catch((error)=> res.send(error))
})

app.listen(port, () => {
  console.log("listening for requests...\n\n")
})

async function get_AuthToken(Code) {
  return new Promise((resolve, reject) => {
    //deprecated package. used for testing, hasnt been removed
    request({
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
      form: { grant_type: "authorization_code", code: Code, redirect_uri: redirect_uri },
      json: true
    }, (err, res, body) => {
        resolve(body.access_token)
    })
  })
}

async function getTop() {
  return new Promise(async (resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }

  
    const types = ['artists', 'tracks']
    const times = ['short', 'medium', 'long']
    const limit = 20
    const data = {artists: {}, tracks: {}}

    for (let type of types){
      for (let time of times){
        let api_data = await fetch(`http://api.spotify.com/v1/me/top/${type}?time_range=${time}_term&limit=${limit}`, options)
        data[type][time] = await api_data.json()
      }
    }
   console.log(data)
   resolve(data)
  })
}