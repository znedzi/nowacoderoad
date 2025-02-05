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
