// zapisywanie prostych danych do localStorage
// localStorage.setItem('name', 'Zbyszek')
// localStorage.setItem('number', 123)

// const name = localStorage.getItem('name')
// const number = localStorage.getItem('number')


// zapisywanie tablic i obiektów do localStorage za pomoca JSON.stringify

localStorage.setItem('names',JSON.stringify(['Ala', 'Ola', 'Ela']))
localStorage.setItem('tasks',JSON.stringify([
    {
        isCompleted: true,
        text: 'Learn DOM',
    }
]))

// odczyt danych z localStorage za pomocą JSON.parse

console.log(JSON.parse(localStorage.getItem("names")))
console.log(JSON.parse(localStorage.getItem("tasks")))

// pobieranie z localStorage nieistniejącej wartości zwróci null
// null jest watością fałszywą wieć przy zamianie na Number(null), zwraca 0. 
localStorage.getItem('unknow-key')
