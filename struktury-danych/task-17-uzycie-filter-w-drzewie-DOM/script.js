names = ['Ala', 'Ola', 'Ela', 'Agnieszka', 'Jola', 'Krysia', 'Eryk']
let searchPhrase = ''

const appendArray = function(array, container){

    array.forEach(function(element){
        
        container.appendChild(element)

    })
}

// funkcja tworząca li dla pojedynczego elementu
const renderListItem = function(name){

    const li = document.createElement('li')

    li.innerText = name

    return li
}


const renderList = function(names){
    const listContainer = document.createElement('ul')
    
    const listItems = names.map(renderListItem)

    appendArray(listItems, listContainer)
    
    return listContainer
}

const renderForm = function(searchPhrase, onInput){

    // tworzymy formularz
    const form = document.createElement('form')
    // tworzymy input
    const input = document.createElement('input')
    // input zawsze ma być focus (pole input aktywne,
    // ale dopiero w drzewie DOM - na końcu wykonania całego kodu)
    setTimeout(
        function(){
            input.focus()
        },0
    )

    // pole input przyjmuje wartość searchPrase tuż po utworzeniu 
    input.value = searchPhrase
   
    input.addEventListener(
        'input',
        onInput
    )



    // dodajemy input do formularza
    form.appendChild(input)

    return form
}


const render = function(rootContainer){
    
    // czyścimy kontener
    rootContainer.innerHTML = ''
    
    
    // wywołanie poprzez event (cel) z uwagi na brak w scopie
    const onInput = function(event){
        searchPhrase = event.target.value
        
        render(rootContainer)
    }

    // filtrujemy listę wg. zadanych wskazówek
    const filterNames = names.filter(function(name){
        return name.includes(searchPhrase)
    })

    // generujemy formularz oraz input i przekazujemy funkcję inInput !!!!!
    const formElement = renderForm(searchPhrase, onInput)
    // generujemy przefiltrowaną listę
    const listElement = renderList(filterNames)

    //dodajemy wygenerowane elementy do kontenera
    rootContainer.appendChild(formElement)
    rootContainer.appendChild(listElement)
}

// dołączamy gotową listę do body
render(document.body)

