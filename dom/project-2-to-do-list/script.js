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

const render = function(containerSelector = 'body') {
    const container = document.querySelector(containerSelector)

    if(!container) return
    
    // czyścimy nasz kontener przed wyświetleniem zadań
    container.innerHTML = ''

    // za pomocą pętli wyświetlamy i dodajemy do strony nasze zadania
    for(i=0; i< tasks.length; i++){
        const div = document.createElement('div')

        // task[i].text - bo to jest obiekt !!!
        div.innerText = tasks[i].text

        container.appendChild(div)
    }
}

addTask('Wynieść śmieci')
addTask('Umyć okna')
addTask('Nauczyć się JS')
addTask('Nauczyć się GIT')

// pierwsze wywołanie render()
render()