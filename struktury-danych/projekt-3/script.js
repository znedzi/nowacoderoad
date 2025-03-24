// stan aplikacji
// co ten stan aplikacji zmienia
// kiedy ten stan aplikacji się zmienia

// App state

let mainContainer = null

let filter = 'ALL' //one of ALL, DONE, NOT-DONE
let sort = 'ASCENDING' // ASCENDING or DESCENDING

let searchPrase = ''
let searchInputFocused = false
let newToDoName = 'asd'
let newToDoInputIsFocused = false

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


// State changing functions

const onNewToDoNameChange = function(event){
    newToDoInputIsFocused = true
    newToDoName = event.target.value
    update()
}

// co się stanie po kliknięciu w button
const onNewToDoSubmit = function(event){
    event.preventDefault()

    newToDoName

    tasks = tasks.concat({
        name: newToDoName,
        isCompleted: false,
    })
    // czyścimy nasz formularz
    newToDoName = ''
    // odświeżamy nasz formularz
    update()
}

// Generic / helper functions

const focus = function(condition, element){
     // trick wywołujemy focusa za 0 milisekund co powoduje wykonanie 
     // dopiero na końcu całego kodu co powoduje, że nie tracimy focusa
     //  z pola input
    if(condition){
        setTimeout(
            function(){
             element.focus()
            },0
        )
    }
}

const appendArray = function (array, container) {
    array.forEach(function(element){
        container.appendChild(element)
    })
}

const onTaskCompleteToggle = function(indexToToggle){
    
        // Jeżeli indeks różni się od tego na którym jesteśmy to zwróć taska bez zmian
        tasks = tasks.map(function(task, index){
        if(index !== indexToToggle) return task

        // Jeżeli indeks pokrywa się to zwróć taska ze zmienionym isCompleted
        return {
            name: task.name,
            isCompleted: !task.isCompleted,
        }
    })

    update()
}


// rendering

const renderTask = function(task, onClick){
    const container = document.createElement('li')
    container.className = 'todo-list__list-item'

    container.addEventListener(
        'click',
        onClick
    )

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
    const container = document.createElement('ol')
    container.className = 'todo-list__list'

    // zamieniamy każdy task na element drzewa DOM
    const tasksElement = tasks.map(function (task, index){
          
        return renderTask(task, function(){onTaskCompleteToggle(index)})
    })

    appendArray(tasksElement, container)
    

    return container
}

const renderNewTaskInput = function(onChange, focusCondition, className){
    const input = document.createElement('input')
    input.className = className

    input.value = newToDoName

    input.addEventListener('input', onChange)

    focus(focusCondition, input)

    return input
}



const renderNewTaskButton = function(label){
    const button = document.createElement('button')
    button.className = 'todo-list__button'
    button.innerText = label

    return button
}

// tworzymy kontener dla formularza, nie musimy tego robić dla inputa i buttona
// które to dołączymy do formularza (patrz wyżej)
const renderNewTaskForm = function(){
    const container = document.createElement('form')
    container.className = 'todo-list__from'

    container.addEventListener('submit', onNewToDoSubmit)

    const inputElement = renderNewTaskInput(
        onNewToDoNameChange,
        newToDoInputIsFocused,
        'todo-list__input'
    )
    container.appendChild(inputElement)

    const buttonElement = renderNewTaskButton('ADD')
    container.appendChild(buttonElement)

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

    const renderNewTaskFormElement = renderNewTaskForm()
    const taskListElement = renderTasksLists(tasks)

    // Przykładowe wyświetlenie textu
    // const text = document.createTextNode(newToDoName)
    // container.appendChild(text)
    
    
    container.appendChild(renderNewTaskFormElement)
    container.appendChild(taskListElement)

    return container

    // Przykład
    // element drzewa DOM, który reprezentuje sam tekst
    // return document.createTextNode('Ala ma kota')
}

const update = function(){
    mainContainer.innerHTML = ''
    
    const app = render()
    mainContainer.appendChild(app)
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