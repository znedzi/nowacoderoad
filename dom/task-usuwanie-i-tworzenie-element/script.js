function prepend(container, element){
    container.insertBefore(element, container.firstElementChild)
}

function remove(element){
    element.parentElement.removeChild(element)
}

const container = document.querySelector('.container')

const p = document.createElement('p')

p.innerText = '>> Lorem ipsum dolor sit amet consectetur 4. <<'
p.setAttribute('class', 'paragraph fourth')

// container.append(p)

container.insertBefore(p, container.secondElementChild)

prepend(container, p)

// element will be moved  form position to new
// if it is already displayed (included in DOM)
container.appendChild(p)

// usuń cały kontener
// container.remove()

// usuń pierwszy element
// document.querySelector('.first').remove()

// starsza metoda, usuń pierwszy element
// container.removeChild(document.querySelector('.first'))

remove(document.querySelector('.first'))