const names = ['Ala', 'Ola', 'Ela']
const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]


// // zwraca index tablicy lub -1
// console.log(
//     names.indexOf('Ola') !== -1
// )

// // zwraca true bądź false
// console.log(
//     names.includes('Ola')
// )

const findByValue = function (value) {
    return function (element, index, array){
        return element === value
    }
}


const findAla = findByValue('Ala')


const foundElement = names.find(findByValue('Ola'))

console.log(foundElement)


const myOwnFind = function(array, callback) {

    for(let i = 0; i < array.length; i++){
        const element = array[i]
        const index = i

        const result = callback(element, index, array)

        // zwracamy elkement jeżeli callback zwróci  wartość prawdziwą
        if(result) {
            return element
        }
    }
}

const foundElementByMyOwnFind = myOwnFind(names, findByValue('Ela'))

const foundNumber = numbers.find(findByValue(3))

console.log(foundNumber)
