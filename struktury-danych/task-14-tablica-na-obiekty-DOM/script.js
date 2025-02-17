names = ['Ala', 'Ola', 'Ela', 'Agnieszka']

const namesUpperCase = names.map(function(element, index, array){
    return element.toUpperCase()
})

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

// zamiana wszystkich elementów tablicy na listę li
// const namesElements = names.map(function(name, index, array){
//     return renderListItem(name)
// })

const namesElements = namesUpperCase.map(renderListItem)

appendArray(namesElements, document.body)
