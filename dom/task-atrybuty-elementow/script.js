(function(containerSelector) {
    
const container = document.querySelector(containerSelector)

if(!container) return

const input = container.querySelector('input')

const button = container.querySelector('button')

const p = container.querySelector('p')

//dodaj klasę red do znacznika <p>
p.setAttribute('class', 'red')
// p.setAttribute('class', 'green')

// p.removeAttribute('class')

input.setAttribute('type', 'number')

// attributes without a value returns empty string
console.log(button.getAttribute('disabled'))
console.log(typeof button.getAttribute('disabled'))

//usuń atrybut zablokowany
button.removeAttribute('disabled')

console.log(button.getAttribute('disabled'))
console.log(typeof button.getAttribute('disabled'))

//ustaw atrybut zablokowany
// button.setAttribute('disabled', '') 

})('#working-area-2')