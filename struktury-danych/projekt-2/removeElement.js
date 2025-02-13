const removeElement = function(array, indexToRemove) {
    const head = array.slice(0, indexToRemove)
    const tail = array.slice(indexToRemove + 1)

    const newArray = head.concat(tail)

    return newArray
}