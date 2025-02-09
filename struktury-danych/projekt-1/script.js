let names = ["Ala", "Ela"]

const addName = function(newName){
    
    // musimy tablicę przypisać do zmiennej, gdyż za każdym
    // wywołaniem funkcji jest tworzona nowa tablica
    //i jeżeli nie zostanie przypisana do zmiennej to garbage collection
    // za każdym razem ją usuwa
    // jeśli przypiszemy tablicę do zmiennej to za każdym razem nie modyfikujemy
    // samej tablicy tylko jej referencje
    names = names.concat(newName)
}

// funkcja wyszukująca imię
const nameExist = function(name){
    return names.includes(name)
}

// funkcja, która tworzy liste elementów
const renderList = function() {

    // tworzymy element ul
    const ul = document.createElement('ul')

    // za pomocą pętli tworzymy kolejne elementy li
    // i do każdego przypisujemy tekst z tablicy
    for(let i = 0; i< names.length; i++) {
        
        const li = document.createElement('li')
        li.innerText = names[i]

        // dołączamy każdy utworzony element "li" do elementu "ul"
        ul.appendChild(li)

    }
    // zwracamy element "ul" wraz z dołączonymi do niego elementami "li"
    return ul
}


// tworzymy pole input do dodawania imion oraz przycisk
const renderNewNameInput = function() {
    const div = document.createElement('div')
    
    const input = document.createElement('input')
    const button = document.createElement('button')

    input.setAttribute('placeholder', 'Add new name')
    button.innerText = 'ADD'

    button.addEventListener(
        'click',
        function() {
            // Jeżeli wartość jest pusta to nic nie rób
            if (!input.value) return
            addName(input.value)
        }
    )

    div.appendChild(input)
    div.appendChild(button)

    return div
}

// tworzymy pole wyszukiwania imion
const renderSearchInput = function() {
    const div = document.createElement('div')
    
    const input = document.createElement('input')
   
    input.setAttribute('placeholder', 'Search name')
    
    div.appendChild(input)
    
    return div

}

// tworzymy paragraf dla wyświetlania wyników wyszukiwania przez funkcję searchInput
const renderSearchResult = function() {
    p = document.createElement('p')

    p.innerText = 'Result'

    return p
}


// render musi przyjmować kontener do którego będziemy wrzucać naszą aplikację
// u tworzymy 'div' i do niego dołączamy kolejne elementy aplikacji, a następnie zwracamy 'div'
const render = function () {
    div = document.createElement('div')

    const list = renderList()
    const newNameInput = renderNewNameInput()
    const searchInput = renderSearchInput()
    const searchResult = renderSearchResult()

    div.appendChild(list)
    div.appendChild(newNameInput)
    div.appendChild(searchInput)
    div.appendChild(searchResult)

    return div   
}

const init = function (containerSelector) {
    const container = document.querySelector(containerSelector)
    
    if(!container) return

    const app = render()

    container.appendChild(app)
}

init('body')

