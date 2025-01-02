const listItem = document.querySelector('.list-item')

console.log(listItem)
console.dir(listItem)

const listItems = document.querySelectorAll('.list-item')

console.log(listItems)


const secondaryListItems = document.querySelectorAll('#secondary-list .list-item')

console.log('secondaryListItems: ', secondaryListItems)

const mainList = document.querySelector('#main-list')

console.log(mainList);

const mainListLi = mainList.querySelectorAll('.list-item')

console.log('mainListLi', mainListLi)

for(let i = 0; i < mainListLi.length; i++){
    console.log(mainListLi[i])
}