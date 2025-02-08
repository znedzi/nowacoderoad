let names = []

const addName = function(newName){
    
    // musimy tablicę przypisać do zmiennej, gdyż za każdym
    // wywołaniem funkcji jest tworzona nowa tablica
    //i jeżeli nie zostanie przypisana do zmiennej to garbitch kolektor
    // za każdym razem ją usuwa
    // jeśli przypiszemy tablicę do zmiennej to za każdym razem nie modyfikujemy
    // samej tablicy tylko jej referencje
    names = names.concat(newName)
}

const nameExist = function(name){
    return names.includes(name)
}