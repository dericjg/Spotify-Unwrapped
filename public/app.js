const appContainer = document.querySelector(".app-container")

//let event delegation detect link clicks
appContainer.addEventListener('click', (e)=>{
  if (e.target.tagName === "I"){
    let type = e.target.getAttribute("data-type") === "artist" ? "artist" : "track"
    
    window.location.href = `http://open.spotify.com/${type}/${e.target.getAttribute("data-link")}`
  }
})

const appTabContainer = document.getElementById("page-tab-container")
const timeTabContainer = document.getElementById("time-tab-container")

const artistPage= document.getElementById("artist-app")
const trackPage = document.getElementById("tracks-app")


let currentPage = "artists"
let currentTime = "short"

function setCurrentPage(page){
  currentPage = page
}

function setCurrentTime(time){
  currentTime = time
}
//render() is responsible for checking
//the app state and updating the UI
//to reflect the state
function render(){
  const page = currentPage == "artists" ? artistPage : trackPage

  for (let p of page.children){
    p.classList.remove("active")
    if (p.getAttribute("data-id") == currentTime){
      p.classList.add("active")
    }
  }

  if (page.getAttribute("data-id") === "artists"){
  //  trackPage.classList.remove("active")
   // artistPage.classList.add("active")

    trackPage.style.display = "none"
    artistPage.style.display = "block"
    
  }else{
   // artistPage.classList.remove("active")
   // trackPage.classList.add("active")

    artistPage.style.display = "none"
    trackPage.style.display = "block"
  }
}

//changes the top content (tracks vs artists)
appTabContainer.addEventListener('click', (e)=>{
  if (e.target.tagName === "BUTTON"){
    for (let button of appTabContainer.children){
      button.classList.remove("active")
      if (button.getAttribute("data-id") === e.target.getAttribute("data-id")){
        button.classList.add("active")
      }
    }
    setCurrentPage(e.target.getAttribute("data-id"))
    render()
  }
})
//changes the time frame of the top items
timeTabContainer.addEventListener('click', (e)=>{
  if (e.target.tagName === "BUTTON"){
    for (let button of timeTabContainer.children){
      button.classList.remove("active")
      if (button.getAttribute("data-id") === e.target.getAttribute("data-id")){
        button.classList.add("active")
      }
    }
    setCurrentTime(e.target.getAttribute("data-id"))
    render()
  }
})



