names = ['Ala', 'Ola', 'Ela', 'Agnieszka', 'Jola']

const appendArray = function(array, container){

    array.forEach(function(element){
        
        container.appendChild(element)

    })
}

// funkcja tworząca li dla pojedynczego elementu
const renderListItem = function(name){

    const li = document.createElement('li')

    li.style.color = 'red'

    li.innerText = name

    return li
}

const namesUpperCase = names.map(function(element, index, array){
    return element.toUpperCase()
})

const toUpperCase = function(string) {
    return string.toUpperCase()
}


const namesElements =  (
    names
        .map(toUpperCase)
        .map(renderListItem)
)

appendArray(namesElements, document.body)
