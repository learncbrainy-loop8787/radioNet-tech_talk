const BASE_URL = "http://localhost:3000"
const WARRIORS_URL = `${BASE_URL}/warriors`
const UNIT_WARRIORS_URL = `${BASE_URL}/unit_warriors`
const UNITS_URL = `${BASE_URL}/units`
const USERS_URL = `${BASE_URL}/users`

const addIcon = "https://cdn2.iconfinder.com/data/icons/bwpx/icons/symbol_addition.gif"
const removeIcon = "http://icons.iconarchive.com/icons/icons8/windows-8/16/Editing-Delete-icon.png"
const signUpForm = document.querySelector(".container")
const addUserForm = document.querySelector(".signup-form")
const inputFields = document.querySelectorAll(".input-text")
const signUpBtnPhrase = document.querySelector(".sign-up-btn")
const mainContainer = document.querySelector("main")
const unitContainer = document.querySelector(".unit-container")
const unitBtn = document.querySelector(".unit-button")
const logoutBtn = document.querySelector(".logout-btn")
const sortOptions = document.querySelector('.options')

let loggedIn = null
let signedUp = false 



function hideSignUpForm(){
    signUpForm.style.display = 'none'
}

signUpForm.addEventListener('submit', function(e){
    e.preventDefault()
    fetch(USERS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            name: inputFields[0].value,
            email: inputFields[1].value,
        })
    })
    .then(res => res.json())
    .then(function(object){
        loggedIn = object
        localStorage.loggedIn = object.id
        renderLoggedInUser()
        }
    )
})

unitBtn.addEventListener('mouseover', () =>{
    unitContainer.style.display = "block"
})

unitBtn.addEventListener('mouseout', () => {
    unitContainer.style.display = "none"
    
})

logoutBtn.addEventListener('click', () => {
    localStorage.clear(loggedIn)
    window.location.reload()
})


sortOptions.addEventListener('change', function(e){
    fetch(BASE_URL + `/${e.target.value}`)
    .then(res => res.json())
    .then(warriors => renderWarriors(warriors))
})


function renderLoggedInUser(){
    let currentUnit = loggedIn.units[loggedIn.units.length - 1]
    let welcome = document.querySelector('#welcome')
    welcome.innertText = " "
    welcome.innerText = `Welcome ${loggedIn.name}!`
    unitContainer.innerHTML = " "
    updateQuantity()
    for (let name in warriorsObj) {
        let unit_warrior = warriorsObj[name][0]
        let total = (unit_warrior.warrior.kills * warriorsObj[name].length)
        unitContainer.innerHTML += `<div id="unitwarrior-${unit_warrior.id}"><p> <img src=${removeIcon} onClick=removeFromUnit(event) data-unit-warrior-id="${unit_warrior.id}"> 
        <img src=${addIcon} onClick=addToUnit(event) data-unit-warrior-id="${unit_warrior.id}" data-warrior-id="${unit_warrior.warrior.id}"> <strong>${unit_warrior.warrior.name}</strong> x ${warriorsObj[name].length} - ${total} </p></div>`
    }
    unitContainer.innerHTML += `<p> <strong>Total kills: </strong> ${currentUnit.total}
    <button class="dday" onClick=dday(event) data-unit-id="${currentUnit.id}"> go to war </button></p>`
    fetchWarriors() 
}
    

function dday(event){
    let currentUnit = loggedIn.units[loggedIn.units.length - 1]
    if(currentUnit.total > 0){
    alert("Rest in peace. May death come to you!")
    let unitId = event.target.dataset.unitId
    fetch(BASE_URL + "/dday", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            id: unitId
        })
    })
    .then(res => res.json())
    .then(res => {
        loggedIn = res
        renderLoggedInUser()
    })
}} 






function fetchWarriors(){
    
    fetch(WARRIORS_URL)
    .then(res => res.json())
    .then(warriors => renderWarriors(warriors))     
}

function renderWarriors(warriors){
    mainContainer.innerHTML = ""
    warriors.forEach(warrior => {
        mainContainer.innerHTML += `<div class="card">
        <img src=${warrior.image} class="warrior-avatar" />
        <h2>${warrior.name}</h2>
        <p>Specialty:<em>${warrior.specialty}</em></p> 
        <p><strong>Experience Level:</strong> ${warrior.exp_level}</p>
        <p> Kills-${warrior.kills}<p>
        <p>Troops-${warrior.troops}<p> 
        <button onClick=addToUnit(event) data-warrior-id="${warrior.id}"> its d day </button>
        </br>
      </div>`
    })
}


function addToUnit(event){
    let unitId = loggedIn.units[loggedIn.units.length - 1].id
    let warrriorCard = event.target.parentElement
    fetch(UNIT_WARRIORS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            unit_id: `${unitId}`,
            warrior_id: `${event.target.dataset.warriorId}`,
        }),
    })
    .then(res => res.json())
    .then(res => {
        loggedIn = res
        renderLoggedInUser()
    })
}
    
function removeFromUnit(event){
    let unitWarrior = event.target.dataset.unitWarriorId
    fetch(UNIT_WARRIORS_URL + "/" + unitWarrior, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            id: unitWarrior,
        }),
    })
    .then(res => res.json())
    .then(res => {
        loggedIn = res
        renderLoggedInUser()
    })
}


function checkForUser(){
    if(localStorage.loggedIn){
        let id = localStorage.loggedIn
        fetch(USERS_URL + "/" + id)
        .then(res => res.json())
        .then(function(res){
            loggedIn = res 
            renderLoggedInUser()
        })
        hideSignUpForm();
    } else {
        signUpForm.style.display = "block"
    }
}


let warriorsObj = {}
function updateQuantity(){
    warriorsObj = {}
    loggedIn.units[loggedIn.units.length - 1].unit_warriors.forEach(unit_warrior => {
        if (!(unit_warrior.warrior.name in warriorsObj)){
            warriorsObj[unit_warrior.warrior.name] = [unit_warrior]
        } else {
            warriorsObj[unit_warrior.warrior.name].push(unit_warrior)
        }
    })
}
   

checkForUser()


