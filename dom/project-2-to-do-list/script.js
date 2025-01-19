const tasks = []

const addTask = function(newTaskText){
    const newTask = {
        timestamp: Date.now(),
        text: newTaskText,
    }

    tasks[tasks.length] = newTask
    // wywołanie render po każdej zmianie
    render()
        
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
    const formCointainer = document.createElement('div')
    

    const input = document.createElement('input')
    const button = document.createElement('button')

    button.innerText = "ADD NEW TASK"

    formCointainer.appendChild(button)
    formCointainer.appendChild(input)

    return formCointainer
}


const render = function(containerSelector = 'body') {
    const container = document.querySelector(containerSelector)

    if(!container) return
    
    // czyścimy nasz kontener przed wyświetleniem zadań
    container.innerHTML = ''

   const formCointainer = renderForm()

    // wywołaliśmy funkcję, a obiekt który zwróciła dodaliśmy do drzewa DOM
    const tasksContainer = renderTasks()


    container.appendChild(formCointainer)
    container.appendChild(tasksContainer)
    
}

addTask('Wynieść śmieci')
addTask('Umyć okna')
addTask('Nauczyć się JS')
addTask('Nauczyć się GIT')

// pierwsze wywołanie render()
render()