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
  console.log("auth code: " + req.query.code)
  //retrieve authToken from auth code
  get_AuthToken(auth_code).then((data) => {
    console.log("token data: " + data)
     token = data
    res.redirect("/home")
    }).catch((error)=>console.log(error))
})

app.get('/home', (req, res) => {
  console.log("routing to home")
  getTop(token).then((data)=>{
    console.log("data: ")
    console.log(data)
    res.render("top-items.html", { items: data})
  }).catch((error)=> console.log(error) )
})

app.listen(port, () => {
  console.log("listening for requests...\n\n")
})

async function get_AuthToken(Code) {
  return new Promise(async(resolve, reject) => {
    const headers = {
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    }
    
    const formData = new FormData()
    formData.append('grant_type', 'authorization_code')
    formData.append('code', Code)
    formData.append('redirect_uri', redirect_uri)
    const form = new URLSearchParams(formData)
    const options = {
      method: "POST",
      headers: headers,
      body: form,
    }
    
   const result = await fetch('https://accounts.spotify.com/api/token', options)
    if (result.status == 200){
      let data = await result.json()
      resolve(data.access_token)
    }
    else{
      console.log("error: " + result.status)
      reject("Error")
    }
  })
}

async function getTop(token) {
  return new Promise(async (resolve, reject) => {
    if (!token){
      console.log("token undefined")
    }
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
   resolve(data)
  })
}