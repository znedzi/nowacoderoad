const section = document.getElementById('main-list')

console.log(section)
console.dir(section)

const listItems = document.getElementsByClassName('list-item')

console.log(listItems)


for(let i = 0; i < listItems.length; i++){
    console.log(listItems[i])
}


const listItemsByTagName = document.getElementsByTagName('li')

console.log(listItemsByTagName)
