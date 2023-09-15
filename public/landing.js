let login_button = document.getElementById("login-button")

login_button.addEventListener('click', ()=>{
  console.log("clicked")
  window.location.assign("https://spotify-wrapped.notderic.repl.co/login")
})