const loadTasks = function (){
    // odczytaj taski z localStorage, a jeśli nie istnieją utwórz pustą tablicę opcja (lub)
    return JSON.parse(localStorage.getItem('tasks')) || []
}

const saveTasks = function(){
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

const addTask = function(newTaskText){
    // Jeżeli newTaskText jest pustym stringiem to nic nie rób !
    if(!newTaskText) return

    const newTask = {
        text: newTaskText,
        timestamp: Date.now(),
    }

    tasks[tasks.length] = newTask
    // wywołanie render po każdej zmianie
    render()

    saveTasks()
}

const renderTask = function(task){
    
    // za pomocą pętli wyświetlamy i dodajemy do strony nasze zadania
   
        const li = document.createElement('li')

        li.style.fontFamily = 'sans-serif'
        li.style.fontSize = '14px'


        // task[i].text - bo to jest obiekt !!!
        li.innerText = tasks[i].text
        
        return li
}

const renderTasks = function(){
    const taskContainer = document.createElement('div')

    const ol = document.createElement('ol')

    for(i=0; i< tasks.length; i++){
        const li = renderTask(tasks[i])
        ol.appendChild(li)
}

    taskContainer.appendChild(ol)

    return taskContainer
}

const renderForm = function(){
    // tworzymy  kontener który będzie otaczał nam nasze elementy 
    // i dopiero do niego dodajemy wszystkie elementy
    const formContainer = document.createElement('div')
    

    const form = document.createElement('form')
    const input = document.createElement('input')
    const button = document.createElement('button')

    form.style.display = 'flex'
    
    input.style.borderRadius = '4px'
    input.style.outline = 'none'
    input.style.border = '1px solid rbga(0, 0, 0, 0.25)'
    input.style.height = '20px'
    input.style.boxSizing = 'content-box'
    input.style.width = '100%'
    
    button.style.height = '20px'
    button.style.outline = 'none'
    button.style.boxSizing = 'content-box'
    button.style.border = '1px solid rbga(0, 0, 0, 0.25)'
    button.style.backgroundColor = 'rbga(0, 0, 0, 0.1)'
    button.style.borderRadius = '4px'
    button.style.width = '100px'

    button.innerText = "ADD NEW TASK"

    // podpinamy nasłuch tam gdzie mamy formularz
    form.addEventListener(
        'submit',
        function(event) {
            // blokuj domyślne odświeżanie formularza
            event.preventDefault()
            addTask(input.value)
        }
    )

    form.appendChild(input)
    form.appendChild(button)
    formContainer.appendChild(form)
    
    

    return formContainer
}


const render = function(containerSelector = 'body') {
    // Jeżeli nie podamy funkcji innego parametru to domyślnie dopisze do 'body'
    // tworzymy container i doklejamy do niego kolejne div-y wygenerowne
    // za pomocą pętli for wywołanej przez funkcję renderForm()
    const container = document.querySelector(containerSelector)

    if(!container) return
    
    // czyścimy nasz kontener przed wyświetleniem zadań
    container.innerHTML = ''

   const formContainer = renderForm()

    // wywołaliśmy funkcję, a obiekt który zwróciła dodaliśmy do drzewa DOM
    const tasksContainer = renderTasks()

    // Wygenerowany formularz łącznie input i buttonem dołączmy do container
    container.appendChild(formContainer)

    // wygenerowane taski dołączamy do container
    container.appendChild(tasksContainer)
    
}

const tasks = loadTasks() 

// addTask('Wynieść śmieci')
// addTask('Umyć okna')
// addTask('Nauczyć się JS')
// addTask('Nauczyć się GIT')


// pierwsze wejście użytkownika na stronę wywołujemy funkcję render()
// oraz po każdej zmianie w tasks w funkcji addTask()
render()