class ZarzadzanieUrlopem {
    constructor() {
        // Mapa do przechowywania konfiguracji urlopów dla każdego roku.
        // Klucz: rok (liczba), Wartość: { initialPodstawowy, initialDodatkowy, remainingPodstawowy, remainingDodatkowy }
        this.konfiguracjeUrlopow = new Map();
        this.historiaUrlopow = [];
        
        // Wczytaj dane z localStorage przy tworzeniu obiektu
        this.loadData();
    }

    // Metoda do zapisywania stanu obiektu do localStorage
    saveData() {
        const dataToSave = {
            konfiguracjeUrlopow: Array.from(this.konfiguracjeUrlopow.entries()), // Map do Array
            historiaUrlopow: this.historiaUrlopow
        };
        localStorage.setItem('zarzadzanieUrlopemData', JSON.stringify(dataToSave));
    }

    // Metoda do wczytywania stanu obiektu z localStorage
    loadData() {
        const savedData = localStorage.getItem('zarzadzanieUrlopemData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            this.konfiguracjeUrlopow = new Map(parsedData.konfiguracjeUrlopow); // Array do Map
            this.historiaUrlopow = parsedData.historiaUrlopow;
        }
    }

    // Ustawia lub aktualizuje konfigurację urlopów dla konkretnego roku
    ustawKonfiguracje(podstawowy, dodatkowy, rok) {
        // Jeśli konfiguracja dla danego roku już istnieje, aktualizujemy ją.
        // W przeciwnym razie tworzymy nową.
        this.konfiguracjeUrlopow.set(rok, {
            initialPodstawowy: podstawowy,
            initialDodatkowy: dodatkowy,
            remainingPodstawowy: podstawowy, // Początkowo pozostałe dni są równe początkowym
            remainingDodatkowy: dodatkowy
        });
        this.saveData(); // Zapisz po zmianie konfiguracji
    }

    // Pobiera sumę wszystkich pozostałych dni urlopu podstawowego ze wszystkich lat
    getTotalRemainingPodstawowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.remainingPodstawowy;
        }
        return total;
    }

    // Pobiera sumę wszystkich pozostałych dni urlopu dodatkowego ze wszystkich lat
    getTotalRemainingDodatkowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.remainingDodatkowy;
        }
        return total;
    }

    // Pobiera sumę wszystkich początkowych dni urlopu podstawowego ze wszystkich lat
    getTotalInitialPodstawowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.initialPodstawowy;
        }
        return total;
    }

    // Pobiera sumę wszystkich początkowych dni urlopu dodatkowego ze wszystkich lat
    getTotalInitialDodatkowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.initialDodatkowy;
        }
        return total;
    }

    // Sprawdza dostępność urlopu na podstawie sumy ze wszystkich lat
    sprawdzDostepnosc(typUrlopu, liczbaDni) {
        if (typUrlopu === 'podstawowy') {
            return this.getTotalRemainingPodstawowy() >= liczbaDni;
        } else if (typUrlopu === 'dodatkowy') {
            return this.getTotalRemainingDodatkowy() >= liczbaDni;
        }
        return false;
    }

    // Zgłasza urlop, odejmując dni od najstarszych dostępnych
    zglosUrlop(typUrlopu, liczbaDni, dataRozpoczecia) {
        if (!this.sprawdzDostepnosc(typUrlopu, liczbaDni)) {
            return { success: false, message: `Brak wystarczających dni urlopu ${typUrlopu} na zgłoszenie ${liczbaDni} dni.` };
        }

        const start = new Date(dataRozpoczecia);
        if (start < new Date().setHours(0,0,0,0)) {
            return { success: false, message: "Data rozpoczęcia urlopu nie może być z przeszłości." };
        }

        let dniDoOdjecia = liczbaDni;
        let rokDeduukcji = null; // Rok, z którego faktycznie odjęto urlop

        // Sortujemy lata od najstarszego do najnowszego, aby odejmować od zaległego urlopu
        const posortowaneLata = Array.from(this.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

        for (const rok of posortowaneLata) {
            const config = this.konfiguracjeUrlopow.get(rok);
            let remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';

            if (config[remainingProp] > 0 && dniDoOdjecia > 0) {
                const odjeteZDanegoRoku = Math.min(dniDoOdjecia, config[remainingProp]);
                config[remainingProp] -= odjeteZDanegoRoku;
                dniDoOdjecia -= odjeteZDanegoRoku;
                
                // Jeśli to pierwszy rok, z którego odejmujemy, lub jedyny, to zapisz go
                if (rokDeduukcji === null || odjeteZDanegoRoku > 0) {
                    rokDeduukcji = rok;
                }
                // Jeśli odebraliśmy wszystkie dni, z których potrzebowaliśmy, możemy przerwać
                if (dniDoOdjecia === 0) break;
            }
        }

        this.historiaUrlopow.push({
            typ: typUrlopu,
            dni: liczbaDni,
            od: dataRozpoczecia,
            status: 'zatwierdzony',
            rokUrlopu: rokDeduukcji || new Date(dataRozpoczecia).getFullYear() // Użyj roku deduukcji lub roku rozpoczęcia urlopu
        });
        this.saveData(); // Zapisz po zgłoszeniu urlopu
        return { success: true, message: `Urlop ${typUrlopu} na ${liczbaDni} dni zgłoszony pomyślnie.` };
    }

    obliczWykorzystanie() {
        const sumaZgloszonychDni = this.historiaUrlopow.reduce((sum, urlop) => sum + urlop.dni, 0);
        const calkowityDostepnyUrlop = this.getTotalInitialPodstawowy() + this.getTotalInitialDodatkowy();

        if (calkowityDostepnyUrlop === 0) {
            return 0;
        }

        const wykorzystaneDni = sumaZgloszonychDni;
        const procentWykorzystania = (wykorzystaneDni / calkowityDostepnyUrlop) * 100;
        return procentWykorzystania.toFixed(2);
    }

    // Metoda do całkowitego resetowania danych (opcjonalna, do czyszczenia wszystkiego)
    wyczyscWszystkieDane() {
        this.konfiguracjeUrlopow.clear();
        this.historiaUrlopow = [];
        this.saveData(); // Zapisz pusty stan
    }
}

// --- Logika obsługi HTML ---

const pracownik = new ZarzadzanieUrlopem();

const urlopCalkowityDniEl = document.getElementById('urlopCalkowityDni');
const urlopPodstawowyDniEl = document.getElementById('urlopPodstawowyDni');
const urlopDodatkowyDniEl = document.getElementById('urlopDodatkowyDni');
const wykorzystanieProcentEl = document.getElementById('wykorzystanieProcent');

const configForm = document.getElementById('configForm');
const initialPodstawowyInput = document.getElementById('initialPodstawowy');
const initialDodatkowyInput = document.getElementById('initialDodatkowy');
const configMessageEl = document.getElementById('configMessage');

const selectYearEl = document.getElementById('selectYear');
const labelDodatkowyEl = document.getElementById('labelDodatkowy');
const labelPodstawowyEl = document.getElementById('labelPodstawowy');


const urlopForm = document.getElementById('urlopForm');
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
}

function aktualizujHistorieUrlopow() {
    historiaUrlopowList.innerHTML = '';
    if (pracownik.historiaUrlopow.length === 0) {
        historiaUrlopowList.innerHTML = '<li>Brak zgłoszonych urlopów.</li>';
        return;
    }
    pracownik.historiaUrlopow.forEach((urlop) => {
        const listItem = document.createElement('li');
        const dataOd = formatujDateNaPolski(urlop.od);

        listItem.innerHTML = `
            <span>${urlop.typ === 'podstawowy' ? 'Urlop podstawowy' : 'Urlop dodatkowy'} (${urlop.dni} dni)</span>
            <span>Data: ${dataOd} (rok urlopu: ${urlop.rokUrlopu})</span>
            <span style="color: #66bb6a;">${urlop.status === 'zatwierdzony' ? 'Zatwierdzony' : urlop.status}</span>
        `;
        historiaUrlopowList.appendChild(listItem);
    });
}

// Funkcja wypełniająca listę rozwijaną latami - TYLKO Z PRZESZŁOŚCIĄ I BIEŻĄCYM ROKIEM
function wypelnijSelectLatami() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10; // 10 lat wstecz
    const endYear = currentYear;       // Do bieżącego roku

    selectYearEl.innerHTML = ''; 

    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true; 
        }
        selectYearEl.appendChild(option);
    }
    // Po wypełnieniu selecta, ustaw wartości pól input na podstawie istniejącej konfiguracji dla wybranego roku
    const selectedYear = parseInt(selectYearEl.value);
    const configForSelectedYear = pracownik.konfiguracjeUrlopow.get(selectedYear);
    if (configForSelectedYear) {
        initialPodstawowyInput.value = configForSelectedYear.initialPodstawowy;
        initialDodatkowyInput.value = configForSelectedYear.initialDodatkowy;
    } else {
        // Jeśli brak konfiguracji dla wybranego roku, ustaw pola na 0
        initialPodstawowyInput.value = 0;
        initialDodatkowyInput.value = 0;
    }
}

// Funkcja aktualizująca etykiety na podstawie wybranego roku
function zaktualizujEtykietyRoku() {
    const wybranyRok = parseInt(selectYearEl.value);
    if (labelDodatkowyEl) {
        labelDodatkowyEl.textContent = `Początkowy urlop dodatkowy (dni, za rok ${wybranyRok}):`;
    }
    if (labelPodstawowyEl) {
        labelPodstawowyEl.textContent = `Początkowy urlop podstawowy (dni, za rok ${wybranyRok}):`;
    }

    // Dodatkowo, po zmianie roku w select, zaktualizuj wartości inputów
    const configForSelectedYear = pracownik.konfiguracjeUrlopow.get(wybranyRok);
    if (configForSelectedYear) {
        initialPodstawowyInput.value = configForSelectedYear.initialPodstawowy;
        initialDodatkowyInput.value = configForSelectedYear.initialDodatkowy;
    } else {
        // Jeśli brak konfiguracji dla wybranego roku, ustaw pola na 0
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

    // Ustawienie konfiguracji dla wybranego roku
    pracownik.ustawKonfiguracje(initialPodstawowy, initialDodatkowy, selectedYear);

    aktualizujStanUrlopow(); // Zaktualizuj sumy
    aktualizujHistorieUrlopow(); // Historia pozostaje bez zmian, ale odświeżamy widok
    wyswietlKomunikat(configMessageEl, `Konfiguracja urlopów za rok ${selectedYear} zaktualizowana pomyślnie.`, 'success');
});


urlopForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const typUrlopu = document.getElementById('typUrlopu').value;
    const liczbaDni = parseInt(document.getElementById('liczbaDni').value);
    const dataRozpoczecia = document.getElementById('dataRozpoczecia').value;

    if (isNaN(liczbaDni) || liczbaDni <= 0) {
        wyswietlKomunikat(messageEl, 'Liczba dni urlopu musi być liczbą większą od zera.', 'error');
        return;
    }

    // Sprawdzenie, czy w ogóle są jakieś skonfigurowane urlopy
    if (pracownik.konfiguracjeUrlopow.size === 0) {
        wyswietlKomunikat(messageEl, 'Najpierw ustaw początkową liczbę dni urlopu w sekcji "Konfiguracja Urlopów" dla co najmniej jednego roku.', 'error');
        return;
    }
    
    // Sprawdzenie, czy jest wystarczająco urlopu ogółem
    if (!pracownik.sprawdzDostepnosc(typUrlopu, liczbaDni)) {
        wyswietlKomunikat(messageEl, `Brak wystarczających dni urlopu ${typUrlopu} na zgłoszenie ${liczbaDni} dni. Dostępne: ${typUrlopu === 'podstawowy' ? pracownik.getTotalRemainingPodstawowy() : pracownik.getTotalRemainingDodatkowy()} dni.`, 'error');
        return;
    }

    const wynik = pracownik.zglosUrlop(typUrlopu, liczbaDni, dataRozpoczecia);

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
    wypelnijSelectLatami(); // Wypełnij listę rozwijaną latami i ustaw wartości inputów
    zaktualizujEtykietyRoku(); // Ustaw początkowe etykiety z domyślnym rokiem

    // Dodaj słuchacza zmiany dla selecta, aby dynamicznie zmieniać etykiety i wartości inputów
    selectYearEl.addEventListener('change', zaktualizujEtykietyRoku);

    aktualizujStanUrlopow();
    aktualizujHistorieUrlopow();
});