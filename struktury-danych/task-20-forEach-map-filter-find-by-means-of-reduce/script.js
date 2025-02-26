// ZA POMOCĄ REDUCE JESTEŚMY W STANIE NAPISAĆ DOWOLNĄ Z TYCH FUNKCJI (REDUCE JEST POTĘGĄ)
// JEDNAK DO PROSTYCH DZIAŁAŃ LEPIEJ ZASTOSOWAĆ DEDYKOWANĄ DO TEGO FUNKCJĘ

const numbers = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
const names = ['Ala', 'Ola', 'Ola', 'Ela']



const forEachResult = names.forEach(function(element, index, array){
    console.log(element)
})

console.log(forEachResult)


// wstawiamy pusty string jako element reduced(akumulator), gdyż nie jest nam potrzebny
// wykorzystujemy tylko samą pętlę do wyświetlenia elementów, funkcja wyświetla elementy
// i zwraca undefined
const reduceForEachResult = names.reduce(function(reduced, element, index, array){
    console.log(element)
}, '')

console.log(reduceForEachResult)

const mapResult = numbers.map(function(element, index, array){
    return element * 2
})

console.log(mapResult)


// map zawsze zwraca pustą tablicę, więc reduce też musi zaczynać od pustej tablicy
// tworzymy kolejne elementy * 2 i dodajemy do tablicy
const reduceMapResult = numbers.reduce(function(reduced, element, index, array){
    const newElement = element * 2
        
    return reduced.concat(newElement)

},[])

console.log(reduceMapResult)

// zwracamy tylko elementy dodatnie
const filterResult = numbers.filter(function(element, index, array){
    return element > 0
})

console.log(filterResult)

// zwracamy tylko elementy dodatnie (reszta z dzielenia równa się 0)
const filterResult2 = numbers.filter(function(element, index, array){
    return element % 2 === 0
})

console.log(filterResult2)

// dokładamy element do tablicy tylko wtedy gdy warunek jest spełniony
const reducedFilterResult = numbers.reduce(function(reduced, element, index, array){
    if (element % 2 === 0) {
        return reduced.concat(element)
    }
    // jeżeli warunek nie jest spełniony zwróć poprzednią wartość reduce
    return reduced
},[])


// const findResult = names.find(function(element, index, array){
//     return element === 'Ola'
// })

// console.log(findResult)


const reduceFindResult = names.reduce(function(reduced, element, index, array){
    // jeżeli element został już znaleziony to go zwracam za każdym obiegiem pętli
    // i jest to tylko pierwszy znaleziony element, blokujemy dalsze wyszukiwanie elementu
    // spełniającego zadane kryteria
    console.log('REDUCE-FIND')
    if(reduced) return reduced

    if(element === 'Ola'){
        console.log('REDUCE-FIND found element')
        return element
    }
    return reduced
    
},undefined)

console.log(reduceFindResult)
