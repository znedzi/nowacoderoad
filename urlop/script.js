class ZarzadzanieUrlopem {
    constructor() {
        this.konfiguracjeUrlopow = new Map(); // Klucz: rok, Wartość: { initialPodstawowy, initialDodatkowy, remainingPodstawowy, remainingDodatkowy }
        this.historiaUrlopow = [];
        
        this.loadData();
    }

    saveData() {
        const dataToSave = {
            konfiguracjeUrlopow: Array.from(this.konfiguracjeUrlopow.entries()),
            historiaUrlopow: this.historiaUrlopow
        };
        localStorage.setItem('zarzadzanieUrlopemData', JSON.stringify(dataToSave));
    }

    loadData() {
        const savedData = localStorage.getItem('zarzadzanieUrlopemData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            this.konfiguracjeUrlopow = new Map(parsedData.konfiguracjeUrlopow);
            this.historiaUrlopow = parsedData.historiaUrlopow;
        }
    }

    ustawKonfiguracje(podstawowy, dodatkowy, rok) {
        this.konfiguracjeUrlopow.set(rok, {
            initialPodstawowy: podstawowy,
            initialDodatkowy: dodatkowy,
            remainingPodstawowy: podstawowy,
            remainingDodatkowy: dodatkowy
        });
        this.saveData();
    }

    getTotalRemainingPodstawowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.remainingPodstawowy;
        }
        return total;
    }

    getTotalRemainingDodatkowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.remainingDodatkowy;
        }
        return total;
    }

    getTotalInitialPodstawowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.initialPodstawowy;
        }
        return total;
    }

    getTotalInitialDodatkowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.initialDodatkowy;
        }
        return total;
    }

    // Zmodyfikowana metoda sprawdzania dostępności, uwzględniająca priorytet lat
    sprawdzDostepnosc(typUrlopu, liczbaDni) {
        if (typUrlopu !== 'podstawowy' && typUrlopu !== 'dodatkowy') {
            return { canTake: true, message: '' }; // Dla L4/opieki zawsze true
        }

        const currentYear = new Date().getFullYear();

        // Posortowane lata od najstarszego do najnowszego
        const posortowaneLata = Array.from(this.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

        let totalRemainingVacation = 0; // Całkowity dostępny urlop dla danego typu
        let remainingInOlderYears = 0; // Urlop dostępny w latach starszych niż bieżący
        
        for (const rok of posortowaneLata) {
            const config = this.konfiguracjeUrlopow.get(rok);
            const remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';
            
            if (config && config[remainingProp] > 0) {
                totalRemainingVacation += config[remainingProp];
                if (rok < currentYear) {
                    remainingInOlderYears += config[remainingProp];
                }
            }
        }

        // Sprawdzamy, czy w ogóle jest wystarczająca suma dni
        if (totalRemainingVacation < liczbaDni) {
            return { 
                canTake: false, 
                message: `Brak wystarczających dni urlopu ${typUrlopu} na zgłoszenie ${liczbaDni} dni. Dostępne: ${totalRemainingVacation} dni.` 
            };
        }

        // Jeśli są dni pozostałe w starszych latach (zaległe)
        // i liczba dni do zgłoszenia jest większa niż te zaległe dni,
        // to znaczy, że system musiałby ruszyć urlop z bieżącego lub młodszego roku.
        // Wtedy blokujemy, bo są jeszcze zaległości.
        if (remainingInOlderYears > 0 && liczbaDni > remainingInOlderYears) {
             return { 
                 canTake: false, 
                 message: `Nie możesz wykorzystać urlopu z bieżącego/młodszego roku, gdy posiadasz jeszcze zaległy urlop z lat poprzednich (Pozostało ${remainingInOlderYears} dni zaległego urlopu ${typUrlopu}). Wykorzystaj najpierw dni zaległe.`
             };
        }
        
        // Jeśli nie ma zaległych dni LUB potrzebna liczba dni mieści się w zaległych dniach
        return { canTake: true, message: '' };
    }

    // Metoda do odejmowania dni urlopu z puli (już działa z priorytetem lat)
    deductVacationDays(typUrlopu, liczbaDni, dataRozpoczecia) {
        if (typUrlopu !== 'podstawowy' && typUrlopu !== 'dodatkowy') {
            return null; // Nie odejmujemy dni dla L4/opieki
        }

        let dniDoOdjecia = liczbaDni;
        let rokDeduukcji = null; 

        const posortowaneLata = Array.from(this.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

        for (const rok of posortowaneLata) {
            const config = this.konfiguracjeUrlopow.get(rok);
            let remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';

            if (config && config[remainingProp] > 0 && dniDoOdjecia > 0) {
                const odjeteZDanegoRoku = Math.min(dniDoOdjecia, config[remainingProp]);
                config[remainingProp] -= odjeteZDanegoRoku;
                dniDoOdjecia -= odjeteZDanegoRoku;
                
                if (rokDeduukcji === null || odjeteZDanegoRoku > 0) {
                    rokDeduukcji = rok;
                }
                if (dniDoOdjecia === 0) break;
            }
        }
        this.saveData();
        return rokDeduukcji; 
    }

    returnVacationDays(typUrlopu, liczbaDni, rokUrlopu) {
        if (typUrlopu !== 'podstawowy' && typUrlopu !== 'dodatkowy') {
            return;
        }

        const config = this.konfiguracjeUrlopow.get(rokUrlopu);
        if (config) {
            let remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';
            let initialProp = typUrlopu === 'podstawowy' ? 'initialPodstawowy' : 'initialDodatkowy';
            
            config[remainingProp] = Math.min(config[initialProp], config[remainingProp] + liczbaDni);
            
            this.saveData();
        }
    }

    zglosUrlop(typUrlopu, liczbaDni, dataRozpoczecia, adnotacje = '') {
        const start = new Date(dataRozpoczecia);
        const dzisiaj = new Date();
        dzisiaj.setHours(0,0,0,0);

        let isPastDate = false;
        if (start < dzisiaj) {
            isPastDate = true;
        }

        // Sprawdzenie dostępności z nową logiką priorytetu
        const checkResult = this.sprawdzDostepnosc(typUrlopu, liczbaDni);
        if (!checkResult.canTake) {
            return { success: false, message: checkResult.message };
        }
        
        let rokDeduukcji = new Date(dataRozpoczecia).getFullYear();
        if (typUrlopu === 'podstawowy' || typUrlopu === 'dodatkowy') {
            rokDeduukcji = this.deductVacationDays(typUrlopu, liczbaDni, dataRozpoczecia);
        }

        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        this.historiaUrlopow.push({
            id: id,
            typ: typUrlopu,
            dni: liczbaDni,
            od: dataRozpoczecia,
            status: 'zatwierdzony',
            rokUrlopu: rokDeduukcji, 
            adnotacje: adnotacje
        });
        this.saveData();

        let successMessage = `Dni wolne (${typUrlopu}) na ${liczbaDni} dni zgłoszone pomyślnie.`;
        if (isPastDate) {
            successMessage += ' **Uwaga: Data rozpoczęcia dni wolnych jest w przeszłości.**';
        }

        return { success: true, message: successMessage };
    }

    modyfikujUrlop(id, nowyTypUrlopu, nowaLiczbaDni, nowaDataRozpoczecia, noweAdnotacje) {
        const index = this.historiaUrlopow.findIndex(urlop => urlop.id === id);
        if (index === -1) {
            return { success: false, message: "Nie znaleziono zgłoszonego urlopu do modyfikacji." };
        }

        const staryUrlop = this.historiaUrlopow[index];

        // 1. Zwróć dni starego urlopu do puli (jeśli był to urlop podstawowy/dodatkowy)
        if (staryUrlop.typ === 'podstawowy' || staryUrlop.typ === 'dodatkowy') {
            this.returnVacationDays(staryUrlop.typ, staryUrlop.dni, staryUrlop.rokUrlopu);
        }

        // 2. Sprawdź dostępność dla nowego urlopu (jeśli to urlop podstawowy/dodatkowy)
        // Używamy nowej, rygorystycznej funkcji sprawdzającej dostępność
        if (nowyTypUrlopu === 'podstawowy' || nowyTypUrlopu === 'dodatkowy') {
            const checkResult = this.sprawdzDostepnosc(nowyTypUrlopu, nowaLiczbaDni);
            if (!checkResult.canTake) {
                // Jeśli brak dostępności, przywróć stary urlop i zwróć błąd
                // W tym scenariuszu, aby poprawnie przywrócić stan, musimy *ponownie odjąć* stary urlop z puli,
                // bo wcześniej go zwrócono.
                if (staryUrlop.typ === 'podstawowy' || staryUrlop.typ === 'dodatkowy') {
                    // UWAGA: Ta dedukcja może być problematyczna, jeśli w międzyczasie inne operacje wyczerpały pulę.
                    // Idealne rozwiązanie wymagałoby bardziej złożonego zarządzania stanem transakcyjnym.
                    // Na potrzeby tego zadania, akceptujemy to uproszczenie.
                    this.deductVacationDays(staryUrlop.typ, staryUrlop.dni, staryUrlop.rokUrlopu); 
                }
                return { success: false, message: `Modyfikacja niemożliwa: ${checkResult.message}` };
            }
        }
        
        // 3. Odejmij dni nowego urlopu z puli (jeśli to urlop podstawowy/dodatkowy)
        let nowyRokDeduukcji = new Date(nowaDataRozpoczecia).getFullYear();
        if (nowyTypUrlopu === 'podstawowy' || nowyTypUrlopu === 'dodatkowy') {
            nowyRokDeduukcji = this.deductVacationDays(nowyTypUrlopu, nowaLiczbaDni, nowaDataRozpoczecia);
        }

        // 4. Zaktualizuj wpis w historii
        this.historiaUrlopow[index] = {
            id: id,
            typ: nowyTypUrlopu,
            dni: nowaLiczbaDni,
            od: nowaDataRozpoczecia,
            status: 'zatwierdzony', 
            rokUrlopu: nowyRokDeduukcji,
            adnotacje: noweAdnotacje
        };
        this.saveData();
        return { success: true, message: "Urlop zmodyfikowany pomyślnie." };
    }


    obliczWykorzystanie() {
        const sumaZgloszonychDniUrlopu = this.historiaUrlopow.reduce((sum, urlop) => {
            // Sumujemy tylko urlopy podstawowe i dodatkowe do obliczenia wykorzystania
            if (urlop.typ === 'podstawowy' || urlop.typ === 'dodatkowy') {
                return sum + urlop.dni;
            }
            return sum;
        }, 0);
        
        const calkowityDostepnyUrlop = this.getTotalInitialPodstawowy() + this.getTotalInitialDodatkowy();

        if (calkowityDostepnyUrlop === 0) {
            return 0;
        }

        const procentWykorzystania = (sumaZgloszonychDniUrlopu / calkowityDostepnyUrlop) * 100;
        return procentWykorzystania.toFixed(2);
    }

    wyczyscWszystkieDane() {
        this.konfiguracjeUrlopow.clear();
        this.historiaUrlopow = [];
        this.saveData();
    }
}

// --- Logika obsługi HTML ---

const pracownik = new ZarzadzanieUrlopem();

const urlopCalkowityDniEl = document.getElementById('urlopCalkowityDni');
const urlopPodstawowyDniEl = document.getElementById('urlopPodstawowyDni');
const urlopDodatkowyDniEl = document.getElementById('urlopDodatkowyDni');
const wykorzystanieProcentEl = document.getElementById('wykorzystanieProcent');
const urlopRozbicieNaLataEl = document.getElementById('urlopRozbicieNaLata'); 
const urlopChartCanvas = document.getElementById('urlopChart'); // Element canvas dla wykresu
let urlopChartInstance; // Zmienna do przechowywania instancji wykresu

const configForm = document.getElementById('configForm');
const initialPodstawowyInput = document.getElementById('initialPodstawowy');
const initialDodatkowyInput = document.getElementById('initialDodatkowy');
const configMessageEl = document.getElementById('configMessage');

const selectYearEl = document.getElementById('selectYear');
const labelDodatkowyEl = document.getElementById('labelDodatkowy');
const labelPodstawowyEl = document.getElementById('labelPodstawowy');


const urlopForm = document.getElementById('urlopForm');
const typUrlopuSelect = document.getElementById('typUrlopu'); // Zmieniono nazwę zmiennej
const liczbaDniInput = document.getElementById('liczbaDni'); // Zmieniono nazwę zmiennej
const dataRozpoczeciaInput = document.getElementById('dataRozpoczecia'); // Zmieniono nazwę zmiennej
const adnotacjeInput = document.getElementById('adnotacje'); // Nowy element
const messageEl = document.getElementById('message');
const historiaUrlopowList = document.getElementById('historiaUrlopowList');

function formatujDateNaPolski(dataString) {
    const data = new Date(dataString);
    const dzien = String(data.getDate()).padStart(2, '0');
    const miesiac = String(data.getMonth() + 1).padStart(2, '0');
    const rok = data.getFullYear();
    return `${dzien}.${miesiac}.${rok}`;
}

function wyswietlKomunikat(el, msg, type) {
    el.textContent = msg;
    el.className = `message ${type}`;
    setTimeout(() => {
        el.textContent = '';
        el.className = 'message';
    }, 5000);
}

function aktualizujStanUrlopow() {
    urlopCalkowityDniEl.textContent = pracownik.getTotalInitialPodstawowy() + pracownik.getTotalInitialDodatkowy();
    urlopPodstawowyDniEl.textContent = pracownik.getTotalRemainingPodstawowy();
    urlopDodatkowyDniEl.textContent = pracownik.getTotalRemainingDodatkowy();
    wykorzystanieProcentEl.textContent = pracownik.obliczWykorzystanie();
    
    aktualizujRozbicieNaLata();
    aktualizujWykresUrlopu(); // Wywołaj funkcję aktualizującą wykres
}

function aktualizujHistorieUrlopow() {
    historiaUrlopowList.innerHTML = '';
    if (pracownik.historiaUrlopow.length === 0) {
        historiaUrlopowList.innerHTML = '<li>Brak zgłoszonych dni wolnych.</li>';
        return;
    }
    const posortowanaHistoria = [...pracownik.historiaUrlopow].sort((a, b) => new Date(b.od) - new Date(a.od));

    posortowanaHistoria.forEach((urlop) => {
        const listItem = document.createElement('li');
        const dataOd = formatujDateNaPolski(urlop.od);
        let typTekst = '';
        switch(urlop.typ) {
            case 'podstawowy': typTekst = 'Urlop podstawowy'; break;
            case 'dodatkowy': typTekst = 'Urlop dodatkowy'; break;
            case 'l4': typTekst = 'Zwolnienie lekarskie (L4)'; break;
            case 'opieka': typTekst = 'Opieka nad dzieckiem'; break;
            default: typTekst = urlop.typ;
        }

        listItem.innerHTML = `
            <div class="historia-info">
                <span>${typTekst} (${urlop.dni} dni)</span>
                <span>Data: ${dataOd} (rok: ${urlop.rokUrlopu})</span>
                <span style="color: #66bb6a;">${urlop.status === 'zatwierdzony' ? 'Zatwierdzony' : urlop.status}</span>
            </div>
            ${urlop.adnotacje ? `<p class="adnotacja">Adnotacje: ${urlop.adnotacje}</p>` : ''}
            <button class="edit-btn" data-id="${urlop.id}">Edytuj</button>
        `;
        historiaUrlopowList.appendChild(listItem);
    });

    // Dodaj słuchaczy zdarzeń dla przycisków edycji
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const idToEdit = event.target.dataset.id;
            const urlopToEdit = pracownik.historiaUrlopow.find(u => u.id === idToEdit);
            if (urlopToEdit) {
                // Wypełnij formularz danymi do edycji
                typUrlopuSelect.value = urlopToEdit.typ;
                liczbaDniInput.value = urlopToEdit.dni;
                dataRozpoczeciaInput.value = urlopToEdit.od;
                adnotacjeInput.value = urlopToEdit.adnotacje || '';
                
                // Zmień tekst przycisku submit na "Zapisz zmiany"
                urlopForm.querySelector('button[type="submit"]').textContent = 'Zapisz zmiany (Edycja)';
                urlopForm.dataset.editingId = idToEdit; // Zapisz ID edytowanego elementu
                wyswietlKomunikat(messageEl, 'Edytujesz istniejący wpis. Zmień dane i kliknij "Zapisz zmiany".', 'info');
            }
        });
    });
}

function aktualizujRozbicieNaLata() {
    urlopRozbicieNaLataEl.innerHTML = ''; 

    if (pracownik.konfiguracjeUrlopow.size === 0) {
        urlopRozbicieNaLataEl.innerHTML = '<p>Brak skonfigurowanych urlopów dla poszczególnych lat.</p>';
        return;
    }

    const posortowaneLata = Array.from(pracownik.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

    posortowaneLata.forEach(rok => {
        const config = pracownik.konfiguracjeUrlopow.get(rok);
        const pElement = document.createElement('p');
        pElement.innerHTML = `
            <span class="rok">Rok ${rok}:</span>
            <span>Podstawowy: <span class="dni-ilosc">${config ? config.remainingPodstawowy : 0}</span> dni</span>
            <span>Dodatkowy: <span class="dni-ilosc">${config ? config.remainingDodatkowy : 0}</span> dni</span>
        `;
        urlopRozbicieNaLataEl.appendChild(pElement);
    });
}

// NOWA FUNKCJA: Aktualizuje wykres wykorzystania urlopu
function aktualizujWykresUrlopu() {
    const totalInitial = pracownik.getTotalInitialPodstawowy() + pracownik.getTotalInitialDodatkowy();
    const totalRemaining = pracownik.getTotalRemainingPodstawowy() + pracownik.getTotalRemainingDodatkowy();
    const totalUsed = totalInitial - totalRemaining; // To jest uproszczone, bo obliczamy to też w obliczWykorzystanie

    const ctx = urlopChartCanvas.getContext('2d');

    if (urlopChartInstance) {
        urlopChartInstance.destroy(); // Zniszcz poprzednią instancję wykresu, jeśli istnieje
    }

    urlopChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Wykorzystany urlop', 'Pozostały urlop'],
            datasets: [{
                data: [totalUsed, totalRemaining],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)', // Czerwony dla wykorzystanego
                    'rgba(75, 192, 192, 0.8)'  // Zielony dla pozostałego
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f0f0f0' // Kolor tekstu legendy
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + ' dni';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}


function wypelnijSelectLatami() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10; 
    const endYear = currentYear;       

    selectYearEl.innerHTML = ''; 

    for (let year = startYear; year <= endYear + 1; year++) { // Dodano +1, aby można było skonfigurować przyszły rok
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true; 
        }
        selectYearEl.appendChild(option);
    }
    
    const selectedYear = parseInt(selectYearEl.value);
    const configForSelectedYear = pracownik.konfiguracjeUrlopow.get(selectedYear);
    if (configForSelectedYear) {
        initialPodstawowyInput.value = configForSelectedYear.initialPodstawowy;
        initialDodatkowyInput.value = configForSelectedYear.initialDodatkowy;
    } else {
        initialPodstawowyInput.value = 0;
        initialDodatkowyInput.value = 0;
    }
}

function zaktualizujEtykietyRoku() {
    const wybranyRok = parseInt(selectYearEl.value);
    if (labelDodatkowyEl) {
        labelDodatkowyEl.textContent = `Początkowy urlop dodatkowy (dni, za rok ${wybranyRok}):`;
    }
    if (labelPodstawowyEl) {
        labelPodstawowyEl.textContent = `Początkowy urlop podstawowy (dni, za rok ${wybranyRok}):`;
    }

    const configForSelectedYear = pracownik.konfiguracjeUrlopow.get(wybranyRok);
    if (configForSelectedYear) {
        initialPodstawowyInput.value = configForSelectedYear.initialPodstawowy;
        initialDodatkowyInput.value = configForSelectedYear.initialDodatkowy;
    } else {
        initialPodstawowyInput.value = 0;
        initialDodatkowyInput.value = 0;
    }
}


configForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedYear = parseInt(selectYearEl.value);
    const initialPodstawowy = parseInt(initialPodstawowyInput.value);
    const initialDodatkowy = parseInt(initialDodatkowyInput.value);

    if (isNaN(initialPodstawowy) || isNaN(initialDodatkowy) ||
        initialPodstawowy < 0 || initialDodatkowy < 0 || isNaN(selectedYear)) {
        wyswietlKomunikat(configMessageEl, 'Wszystkie wartości muszą być liczbami nieujemnymi, a rok musi być wybrany.', 'error');
        return;
    }

    const potwierdzenie = confirm(`Czy na pewno chcesz ustawić/zaktualizować konfigurację urlopów za rok ${selectedYear}? Spowoduje to zresetowanie dostępnych dni urlopu TYLKO dla tego roku do wartości początkowych.`);
    if (!potwierdzenie) {
        wyswietlKomunikat(configMessageEl, 'Zmiana konfiguracji anulowana.', 'error');
        return;
    }

    pracownik.ustawKonfiguracje(initialPodstawowy, initialDodatkowy, selectedYear);

    // Po zmianie konfiguracji, musimy też wyczyścić historię, jeśli nie chcemy by odnosiła się do nieistniejących pul
    // Albo, co lepsze, przy konfiguracji danego roku nadpisujemy tylko jego initial i remaining,
    // a historia pozostaje, ale to jest już zaimplementowane, więc tu tylko aktualizacje widoku.
    aktualizujStanUrlopow();
    aktualizujHistorieUrlopow();
    wyswietlKomunikat(configMessageEl, `Konfiguracja urlopów za rok ${selectedYear} zaktualizowana pomyślnie.`, 'success');
});


urlopForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const typUrlopu = typUrlopuSelect.value;
    const liczbaDni = parseInt(liczbaDniInput.value);
    const dataRozpoczecia = dataRozpoczeciaInput.value;
    const adnotacje = adnotacjeInput.value.trim();

    if (isNaN(liczbaDni) || liczbaDni <= 0) {
        wyswietlKomunikat(messageEl, 'Liczba dni musi być liczbą większą od zera.', 'error');
        return;
    }

    if ((typUrlopu === 'podstawowy' || typUrlopu === 'dodatkowy') && pracownik.konfiguracjeUrlopow.size === 0) {
        wyswietlKomunikat(messageEl, 'Najpierw ustaw początkową liczbę dni urlopu w sekcji "Konfiguracja Urlopów" dla co najmniej jednego roku.', 'error');
        return;
    }
    
    // Kluczowa zmiana: wywołujemy nową sprawdzDostepnosc i reagujemy na jej wynik
    if (typUrlopu === 'podstawowy' || typUrlopu === 'dodatkowy') {
        const checkResult = pracownik.sprawdzDostepnosc(typUrlopu, liczbaDni);
        if (!checkResult.canTake) {
            wyswietlKomunikat(messageEl, checkResult.message, 'error');
            return;
        }
    }

    const editingId = urlopForm.dataset.editingId;
    let wynik;

    if (editingId) {
        wynik = pracownik.modyfikujUrlop(editingId, typUrlopu, liczbaDni, dataRozpoczecia, adnotacje);
        delete urlopForm.dataset.editingId;
        urlopForm.querySelector('button[type="submit"]').textContent = 'Zgłoś';
    } else {
        wynik = pracownik.zglosUrlop(typUrlopu, liczbaDni, dataRozpoczecia, adnotacje);
    }

    if (wynik.success) {
        wyswietlKomunikat(messageEl, wynik.message, 'success');
        aktualizujStanUrlopow();
        aktualizujHistorieUrlopow();
        urlopForm.reset();
    } else {
        wyswietlKomunikat(messageEl, wynik.message, 'error');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    wypelnijSelectLatami();
    zaktualizujEtykietyRoku();

    selectYearEl.addEventListener('change', zaktualizujEtykietyRoku);

    aktualizujStanUrlopow();
    aktualizujHistorieUrlopow();
});