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
    },
    {
        name: 'Zmyć naczynia',
        isCompleted: true,
    }
]

const appendArray = function (array, container) {
    array.forEach(function(element){
        container.appendChild(element)
    })
}

const renderTask = function(task){
    const container = document.createElement('div')
    container.className = 'todo-list_list-item'

    if(task.isCompleted){
        container.className = container.className + ' todo-list__list-item--completed'
    }

    container.innerText = task.name

    return container
}

// dobrze jest taski do funkcji przekazywać jako parametr, bo wtedy mogą to być taski
// już w jakiś sposób przefiltrowane (np. tylko taski wykonane, lub w jakiś sposób posortowane)
// jeśli nie podamy tasks w parametrze funkcji, taski zostaną pobrane z globalnego scopa

const renderTasksLists = function(tasks){
    const container = document.createElement('div')
    container.className = 'todo-list_list'

    // zamieniamy każdy task na element drzewa DOM
    const tasksElement = tasks.map((task) => {
          
        return renderTask(task)
    })

    appendArray(tasksElement, container)
    

    return container
}


// funkcja render renderuje całą aplikację i powinna ją zwrócić
// tylko funkcja render powinna zaglądać do głownego scopa w poszukiwaniu tasków
// natomiast wszystkie podfunkcje powinny mieć taski przekazywane przez funkcję render()
// w postaci parametrów
const render = function(){
    // kazda funkcja może mieć wewnątrz siebie własny kontener ze względu na scop(zakres)
    const container = document.createElement('div')
    container.className = 'todo-list'

    const taskListElement = renderTasksLists(tasks)

    container.appendChild(taskListElement)

    return container

    // Przykład
    // element drzewa DOM, który reprezentuje sam tekst
    // return document.createTextNode('Ala ma kota')
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