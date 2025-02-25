const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const sum = numbers.reduce(
    function(reduced, element, index, array){
    console.log('reduced', reduced, 'element', element)
    return reduced + element + element
}, 0
)

console.log(sum)