const people = [
    {id: '00001', name: 'Ala', age: 25 },
    {id: '00002', name: 'Ola', age: 21 },
    {id: '00003', name: 'Ela', age: 28 },
    {id: '00004', name: 'Iza', age: 24 },
]



const arrayToObject = function(array, keyPropertyName = 'id') {
    return array.reduce(
    
        function(reduced, person, index,array){
            const key = person[keyPropertyName]
            const value = person
    
            // delete służy do usuwania wartości z obiektu
            delete value[keyPropertyName]
            
            reduced[key] = value
            
            return reduced
        },{}
    )
}

const peopleObject = arrayToObject(people, 'id')

console.log(peopleObject)
