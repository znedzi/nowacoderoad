const people = [
    {name: 'Ala', age: 25, work: {experience: 3, salary: 4010}, city: 'Lublin', favoriteColors: ['green', 'yellow']},
    {name: 'Ola', age: 21, work: {experience: 3, salary: 5040}, city: 'Warszawa', favoriteColors: ['black', 'yellow']},
    {name: 'Ela', age: 28, work: {experience: 3, salary: 1600}, city: 'Gdańsk', favoriteColors: ['green']},
    {name: 'Iza', age: 24, work: {experience: 3, salary: 6300}, city: 'Lublin', favoriteColors: ['white', 'red']},
]

// funkcją flatMap spłaszczamy tablicę
const allFavoriteColors = people.flatMap(function(person){ return person.favoriteColors})

console.log(allFavoriteColors)


const removeDuplicates = function(array){

    let arrayWithoutDuplicates = []
    
    for (let i = 0; i < array.length; i++){
        const element = array[i]
    
        if(!arrayWithoutDuplicates.includes(element)){
            arrayWithoutDuplicates = arrayWithoutDuplicates.concat(element)
        }
    }
    return arrayWithoutDuplicates

}


console.log(removeDuplicates(allFavoriteColors))

// funkcja zwraca tylko te elementy, na których się znajdujemy, tworząc nowa tablicę
// funkcja indexOf() zwraca zawsze index pierwszego elementu występującego w tablicy,
// co oznacza, że index nie pokryje się z indeksem duplikatu w tablicy 
const filterDuplicates = function(color, index, array) {
    return array.indexOf(color) === index
}

console.log(
    allFavoriteColors
        .filter(filterDuplicates)
)

