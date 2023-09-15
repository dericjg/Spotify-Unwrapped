let container = document.getElementById("content-container")

container.addEventListener('click', (e)=>{
  if (e.target.classList.contains("card")){
    let card = e.target
    window.location.assign("http://spotify-wrapped.notderic.repl.co/" + card.getAttribute("id"))
  }
})