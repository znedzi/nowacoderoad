// stan aplikacji
// co ten stan aplikacji zmienia
// kiedy ten stan aplikacji się zmienia

let mainContainer = null

let filter = 'ALL' //one of ALL, DONE, NOT-DONE
let sort = 'ASCENDING' // ASCENDING or DESCENDING

let searchPrase = ''
let searchInputFocused = false
let newToDoName = ''
let newToDoInputFocused = false

let tasks = [
    {
        name: 'Wynieść śmieci',
        isCompleted: false,
    }
]

const appendArray = function (array, container) {
    array.forEach(function(element){
        container.appendChild(element)
    })
}


const render = function(){
    return document.createTextNode('Ala ma kota')
}

const init = function(selector){
    const container = document.querySelector(selector)

    if(!container) {
        console.log('Container do not exist')
        return
    }

    mainContainer = container

    const app = render()

    mainContainer.appendChild(app)
}

init('.root')