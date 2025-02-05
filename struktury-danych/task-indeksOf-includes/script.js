const names = ['Ala', 'Ola', 'Ela']
const numbers = [1,2,3,4,5,6,7,8,9]

const checkIfArrayIncludes = function(array, needle) {
     
    for(let i = 0; i< array.length; i++){
        const item = array[i]

        // console.log(i);
        
        // return spowoduje przerwanie funkcji w której się znajduje 
        // czyli checkIfArrayIncludes
        if (needle === item) return true
    }
    return false
}

console.log(checkIfArrayIncludes(names, 'Ala')) //true
console.log(checkIfArrayIncludes(names, 'Iza')) //false

// funkcja indexOf() wyszukaj index jest wbudowana w tablicę i w przypadku trafienia
// zwraca index liczbowy tablicy, a w przypadku nietrafienia wartość -1
console.log(names.indexOf('Ala')) //0
console.log(names.indexOf('Ola')) //1
console.log(names.indexOf('Ela')) //2
console.log(names.indexOf('Iza')) // -1 (nie odnaleziono)
console.log(names.indexOf('Ala', 2)) //szukaj od index-u 2, -1(nie odnaleziono)

console.log(names.indexOf('Ala') !== -1) //true
console.log(names.indexOf('Iza') !== -1) //false

console.log('includes: ' + names.includes('Ala')) //true
console.log('includes: ' + names.includes('Iza')) //false
console.log('includes: ' + names.includes('Ala', 2)) //false (szukaj od indeksu 2)