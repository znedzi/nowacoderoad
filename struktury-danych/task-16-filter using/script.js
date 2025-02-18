const names = ['Ala', 'Ola', 'Ela', 'Iza']

const namesWithoutElement = names.filter(function(element, index, array){
    return element !== 'Ela'
})

console.log(namesWithoutElement)


const removeArrayElement = function(array, indexToRemove){
    return array.filter(function(element, index, array){
        return index !== indexToRemove
    })
}

const namesWithoutElement2 = removeArrayElement(names, 2)
console.log(namesWithoutElement2);

const namesWithoutElement3 = removeArrayElement(names, names.indexOf('Ela'))
console.log(namesWithoutElement3);
