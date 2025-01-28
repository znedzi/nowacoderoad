// odczytaj taski z localStorage, a jeśli nie istnieją utwórz pustą tablicę (lub)
const tasks = JSON.parse(localStorage.getItem('tasks')) || []

const addTask = function(newTaskText){
    const newTask = {
        text: newTaskText,
        timestamp: Date.now(),
    }

    tasks[tasks.length] = newTask
    // wywołanie render po każdej zmianie
    render()

    localStorage.setItem('tasks', JSON.stringify(tasks))
}

const renderTasks = function(){
    const taskContainer = document.createElement('div')

    // za pomocą pętli wyświetlamy i dodajemy do strony nasze zadania
    for(i=0; i< tasks.length; i++){
        const div = document.createElement('div')

        // task[i].text - bo to jest obiekt !!!
        div.innerText = tasks[i].text
        // 
        taskContainer.appendChild(div)
    }

    return taskContainer
}

const renderForm = function(){
    // tworzymy  kontener który będzie otaczał nam nasze elementy 
    // i dopiero je do niego dodajemy
    const formContainer = document.createElement('div')
    

    const form = document.createElement('form')
    const input = document.createElement('input')
    const button = document.createElement('button')

    button.innerText = "ADD NEW TASK"

    form.addEventListener(
        'submit',
        function(event) {
            // blokuj domyślne odświeżanie formularza
            event.preventDefault()
            addTask(input.value)
        }
    )

    formContainer.appendChild(form)
    form.appendChild(input)
    form.appendChild(button)
    
    

    return formContainer
}


const render = function(containerSelector = 'body') {
    const container = document.querySelector(containerSelector)

    if(!container) return
    
    // czyścimy nasz kontener przed wyświetleniem zadań
    container.innerHTML = ''

   const formContainer = renderForm()

    // wywołaliśmy funkcję, a obiekt który zwróciła dodaliśmy do drzewa DOM
    const tasksContainer = renderTasks()


    container.appendChild(formContainer)
    container.appendChild(tasksContainer)
    
}

// addTask('Wynieść śmieci')
// addTask('Umyć okna')
// addTask('Nauczyć się JS')
// addTask('Nauczyć się GIT')

// pierwsze wywołanie render()
render()