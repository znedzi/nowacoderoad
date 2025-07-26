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

    sprawdzDostepnosc(typUrlopu, liczbaDni) {
        if (typUrlopu === 'podstawowy') {
            return this.getTotalRemainingPodstawowy() >= liczbaDni;
        } else if (typUrlopu === 'dodatkowy') {
            return this.getTotalRemainingDodatkowy() >= liczbaDni;
        }
        return false;
    }

    zglosUrlop(typUrlopu, liczbaDni, dataRozpoczecia) {
        if (!this.sprawdzDostepnosc(typUrlopu, liczbaDni)) {
            return { success: false, message: `Brak wystarczających dni urlopu ${typUrlopu} na zgłoszenie ${liczbaDni} dni.` };
        }

        const start = new Date(dataRozpoczecia);
        if (start < new Date().setHours(0,0,0,0)) {
            return { success: false, message: "Data rozpoczęcia urlopu nie może być z przeszłości." };
        }

        let dniDoOdjecia = liczbaDni;
        let rokDeduukcji = null; 

        const posortowaneLata = Array.from(this.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

        for (const rok of posortowaneLata) {
            const config = this.konfiguracjeUrlopow.get(rok);
            let remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';

            if (config[remainingProp] > 0 && dniDoOdjecia > 0) {
                const odjeteZDanegoRoku = Math.min(dniDoOdjecia, config[remainingProp]);
                config[remainingProp] -= odjeteZDanegoRoku;
                dniDoOdjecia -= odjeteZDanegoRoku;
                
                if (rokDeduukcji === null || odjeteZDanegoRoku > 0) {
                    rokDeduukcji = rok;
                }
                if (dniDoOdjecia === 0) break;
            }
        }

        this.historiaUrlopow.push({
            typ: typUrlopu,
            dni: liczbaDni,
            od: dataRozpoczecia,
            status: 'zatwierdzony',
            rokUrlopu: rokDeduukcji || new Date(dataRozpoczecia).getFullYear() 
        });
        this.saveData();
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
const urlopRozbicieNaLataEl = document.getElementById('urlopRozbicieNaLata'); // Nowy element

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
    
    aktualizujRozbicieNaLata(); // Wywołaj nową funkcję
}

function aktualizujHistorieUrlopow() {
    historiaUrlopowList.innerHTML = '';
    if (pracownik.historiaUrlopow.length === 0) {
        historiaUrlopowList.innerHTML = '<li>Brak zgłoszonych urlopów.</li>';
        return;
    }
    // Sortuj historię od najnowszych do najstarszych
    const posortowanaHistoria = [...pracownik.historiaUrlopow].sort((a, b) => new Date(b.od) - new Date(a.od));

    posortowanaHistoria.forEach((urlop) => {
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

// NOWA FUNKCJA: Aktualizuje rozbicie urlopów na lata
function aktualizujRozbicieNaLata() {
    urlopRozbicieNaLataEl.innerHTML = ''; // Wyczyść poprzedni widok

    if (pracownik.konfiguracjeUrlopow.size === 0) {
        urlopRozbicieNaLataEl.innerHTML = '<p>Brak skonfigurowanych urlopów dla poszczególnych lat.</p>';
        return;
    }

    // Posortuj lata od najstarszego do najnowszego
    const posortowaneLata = Array.from(pracownik.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

    posortowaneLata.forEach(rok => {
        const config = pracownik.konfiguracjeUrlopow.get(rok);
        const pElement = document.createElement('p');
        pElement.innerHTML = `
            <span class="rok">Rok ${rok}:</span>
            <span>Podstawowy: <span class="dni-ilosc">${config.remainingPodstawowy}</span> dni</span>
            <span>Dodatkowy: <span class="dni-ilosc">${config.remainingDodatkowy}</span> dni</span>
        `;
        urlopRozbicieNaLataEl.appendChild(pElement);
    });
}


function wypelnijSelectLatami() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10; 
    const endYear = currentYear;       

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

    aktualizujStanUrlopow();
    aktualizujHistorieUrlopow();
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

    if (pracownik.konfiguracjeUrlopow.size === 0) {
        wyswietlKomunikat(messageEl, 'Najpierw ustaw początkową liczbę dni urlopu w sekcji "Konfiguracja Urlopów" dla co najmniej jednego roku.', 'error');
        return;
    }
    
    if (!pracownik.sprawdzDostepnosc(typUrlopu, liczbaDni)) {
        wyswietlKomunikat(messageEl, `Brak wystarczających dni urlopu ${typUrlopu} na zgłoszenie ${liczbaDli} dni. Dostępne: ${typUrlopu === 'podstawowy' ? pracownik.getTotalRemainingPodstawowy() : pracownik.getTotalRemainingDodatkowy()} dni.`, 'error');
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
    wypelnijSelectLatami();
    zaktualizujEtykietyRoku();

    selectYearEl.addEventListener('change', zaktualizujEtykietyRoku);

    aktualizujStanUrlopow();
    aktualizujHistorieUrlopow();
});