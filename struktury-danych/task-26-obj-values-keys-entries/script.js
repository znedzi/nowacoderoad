const peopleObject = {
    '00001': { name: 'Ala', age: 25 },
    '00002': { name: 'Ola', age: 21 },
    '00003': { name: 'Ela', age: 28 },
    '00004': { name: 'Iza', age: 24 },
}

const namesObject = {
        '00001': 'Ala', 
        '00002': 'Ola',
        '00003': 'Ela',
        '00004': 'Iza',
}

const keys = Object.keys(peopleObject)
console.log(keys)

const values = Object.values(peopleObject)
console.log(values)

const entries = Object.entries(peopleObject)
console.log(entries)


const objectToArray = function(object, keyPropertyName = 'id') {

    // następuje najpierw zamiana na wpisy, 
    // a następnie mapowania tych wpisów do tablicy
    // która ma wewnątrz obiekty
    return (
        Object
            // jeśli obiekt nie istnieje to wstawiamy pusty {}
            // dzięki temu unikamy błędu
            .entries(object || {})
            .map(function(entry){

            const key = entry[0]
            const value = entry[1]

            if (typeof value === 'object'){
                value[keyPropertyName] = key         
                return value
            }

            return {
                [keyPropertyName]: key,
                value: value,
            }
        })
    )
}

console.log(objectToArray(peopleObject))
console.log(objectToArray(namesObject))
