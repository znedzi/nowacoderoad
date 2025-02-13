const initListApp = (function(){

//ZMIENNE OKREŚLAJĄ STAN NASZEJ APLIKACJI !!!
// Możemy nimi dowolnie sterować

// musimy użyć zmiennej ponieważ zawartość będzie się zmieniać
let appContainer = null
let names = ["Ala", "Ela"]
// musimy użyć zmiennej glogalnej, aby wartość przekazać do innej funkcji
let searchPrase = ''
let isSearchFocused = false

const removeElement = function(array, indexToRemove) {
    const head = array.slice(0, indexToRemove)
    const tail = array.slice(indexToRemove + 1)

    const newArray = head.concat(tail)

    return newArray
}

const addName = function(newName){
    if(!newName) return
    
    // musimy tablicę przypisać do zmiennej, gdyż za każdym
    // wywołaniem funkcji jest tworzona nowa tablica
    //i jeżeli nie zostanie przypisana do zmiennej to garbage collection
    // za każdym razem ją usuwa
    // jeśli przypiszemy tablicę do zmiennej to za każdym razem nie modyfikujemy
    // samej tablicy tylko jej referencje
    names = names.concat(newName)
    // po dodaniu imienia czyścimy pole input search
    searchPrase = ''
    // po każdej zmianie wywołujemy render()
    render()
}

const removeName = function(indexToRemove){

    names = removeElement(names, indexToRemove)

    render()
}

// funkcja wyszukująca imię
const nameExist = function(name){
    return names.includes(name)
}

// funkcja renderująca poszczególne elementy listy
const renderListItem = function(name, index) {

    const li = document.createElement('li')
    const button = document.createElement('button')
    // obiekt drzewa dom zawierający text z innerText
    const text = document.createTextNode(' ' + name)

    button.innerText = 'x'

    button.addEventListener(
        'click',
        function () {
            removeName(index)
        }
    )

    li.appendChild(button)
    li.appendChild(text)

    return li
}


// funkcja, która tworzy całą liste elementów
const renderList = function() {

    // tworzymy element ul
    const ul = document.createElement('ul')

    // za pomocą pętli tworzymy kolejne elementy li
    // i do każdego przypisujemy tekst z tablicy
    for(let i = 0; i< names.length; i++) {
        
        // przekazujemy kolejne elementy tablicy jako parametr funkcji renderListItem
        const li = renderListItem(names[i], i)
       
        // dołączamy każdy utworzony element "li" do elementu "ul"
        ul.appendChild(li)

    }
    // zwracamy element "ul" wraz z dołączonymi do niego elementami "li"
    return ul
}

// tworzymy pole input do dodawania imion oraz przycisk
const renderNewNameInput = function() {
    // formularz powoduje, że działa również enter
    const form = document.createElement('form')
    
    const input = document.createElement('input')
    const button = document.createElement('button')

    input.setAttribute('placeholder', 'Add new name')
    button.innerText = 'ADD'

    // ustawiamy nasłuch na formularz
    form.addEventListener(
        'submit',
        function(event) {
            // blokuj domyślne zachowanie przeglądarki
            event.preventDefault()
           
            addName(input.value)
        }
    )

    form.appendChild(input)
    form.appendChild(button)

    return form
}

// tworzymy pole wyszukiwania imion
const renderSearchInput = function() {
    const div = document.createElement('div')
    
    const input = document.createElement('input')
   
    input.setAttribute('placeholder', 'Search name')

    // przypisujemy wartość zmiennej searchPrase do pola input.value 
    input.value = searchPrase

    // wywołujemy funkcję input.focus(), która ustawia kursor w tym polu
    // set timeout (jak wszystkie) funkcje asynchroniczne, powoduje 
    // wykonanie funkcji wewnątrz niego dopiero po całym kodzie który miał być 
    // wywoływany, nawet jeśli ma czas 0 ms.
    // (wywołaj setTimeout, ale dopiero po wykonaniu całego kodu, który ma być 
    // zrobiony)
    // Jeżeli isSearchFocused (pole jest aktywne) to go rejestrujemy
    if(isSearchFocused){
        setTimeout(
            function() {
                input.focus()
            },
            0
        )
    }
    
 
    input.addEventListener(
        'input',
        function(){
            // ustawiamy zmienną globalną w zależności od input.value (na bieżąco)
            searchPrase = input.value
            // w momencie wprowadzania zmian w polu search ustawiamy zmienną
            isSearchFocused = true
            // po zmianie wywołujemy render()
            render()
        }
    )
    
    div.appendChild(input)
    
    return div

}

// tworzymy paragraf dla wyświetlania wyników wyszukiwania przez funkcję searchInput
const renderSearchResult = function() {
    p = document.createElement('p')

    if(nameExist(searchPrase)){
        p.innerText = 'Search phrase exists in list'
    } else {
        p.innerText = 'Search phrase NOT Exists in list'
    }
    
    return p
}


// render musi przyjmować kontener do którego będziemy wrzucać naszą aplikację
// u tworzymy 'div' i do niego dołączamy kolejne elementy aplikacji, a następnie zwracamy 'div'
const render = function () {
    
    // za pierwszym razem appContainer jest null, więc musimy go stworzyć
    // potem gdy już istnieje to, nie tworzymy go ponownie tylko z niego korzystamy
    if(!appContainer){
       appContainer = document.createElement('div')
    } 

    // czyszczenie poprzedniej wersji o czy już mówiliśmy
    appContainer.innerHTML = ''


    const list = renderList()
    const newNameInput = renderNewNameInput()
    const searchInput = renderSearchInput()
    const searchResult = renderSearchResult()

    appContainer.appendChild(list)
    appContainer.appendChild(newNameInput)
    appContainer.appendChild(searchInput)
    appContainer.appendChild(searchResult)

    // po każdym render() usuwamy isSearchFocused()
    isSearchFocused = false

    return appContainer   
}

const init = function (containerSelector) {
    const container = document.querySelector(containerSelector)
    
    if(!container) return

    const app = render()

    container.appendChild(app)
}

return init

})()