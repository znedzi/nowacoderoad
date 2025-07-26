class ZarzadzanieUrlopem {
    constructor(urlopPodstawowy = 0, urlopDodatkowy = 0) {
        this.urlopPodstawowyDni = urlopPodstawowy;
        this.urlopDodatkowyDni = urlopDodatkowy;
        this.poczatkowyUrlopPodstawowy = urlopPodstawowy;
        this.poczatkowyUrlopDodatkowy = urlopDodatkowy;
        this.historiaUrlopow = [];
        this.rokKonfiguracji = new Date().getFullYear(); 
    }

    ustawKonfiguracje(podstawowy, dodatkowy, rok) {
        this.urlopPodstawowyDni = podstawowy;
        this.urlopDodatkowyDni = dodatkowy;
        this.poczatkowyUrlopPodstawowy = podstawowy;
        this.poczatkowyUrlopDodatkowy = dodatkowy; // Poprawiona literówka
        this.rokKonfiguracji = rok;
    }

    sprawdzDostepnosc(typUrlopu, liczbaDni) {
        if (typUrlopu === 'podstawowy') {
            return this.urlopPodstawowyDni >= liczbaDni;
        } else if (typUrlopu === 'dodatkowy') {
            return this.urlopDodatkowyDni >= liczbaDni;
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

        if (typUrlopu === 'podstawowy') {
            this.urlopPodstawowyDni -= liczbaDni;
        } else {
            this.urlopDodatkowyDni -= liczbaDni;
        }
        this.historiaUrlopow.push({
            typ: typUrlopu,
            dni: liczbaDni,
            od: dataRozpoczecia,
            status: 'zatwierdzony',
            rokUrlopu: this.rokKonfiguracji
        });
        return { success: true, message: `Urlop ${typUrlopu} na ${liczbaDni} dni zgłoszony pomyślnie.` };
    }

    obliczWykorzystanie() {
        const sumaZgloszonychDni = this.historiaUrlopow.reduce((sum, urlop) => sum + urlop.dni, 0);
        const calkowityDostepnyUrlop = this.poczatkowyUrlopPodstawowy + this.poczatkowyUrlopDodatkowy;

        if (calkowityDostepnyUrlop === 0) {
            return 0;
        }

        const wykorzystaneDni = sumaZgloszonychDni;
        const procentWykorzystania = (wykorzystaneDni / calkowityDostepnyUrlop) * 100;
        return procentWykorzystania.toFixed(2);
    }

    resetujUrlopy(nowyUrlopPodstawowy = 0, nowyUrlopDodatkowy = 0, rok = new Date().getFullYear()) {
        this.urlopPodstawowyDni = nowyUrlopPodstawowy;
        this.urlopDodatkowyDni = nowyUrlopDodatkowy;
        this.poczatkowyUrlopPodstawowy = nowyUrlopPodstawowy;
        this.poczatkowyUrlopDodatkowy = nowyUrlopDodatkowy;
        this.historiaUrlopow = [];
        this.rokKonfiguracji = rok;
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
    urlopCalkowityDniEl.textContent = pracownik.poczatkowyUrlopPodstawowy + pracownik.poczatkowyUrlopDodatkowy;
    urlopPodstawowyDniEl.textContent = pracownik.urlopPodstawowyDni;
    urlopDodatkowyDniEl.textContent = pracownik.urlopDodatkowyDni;
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
            <span>Data: ${dataOd} (rok: ${urlop.rokUrlopu})</span>
            <span style="color: #66bb6a;">${urlop.status === 'zatwierdzony' ? 'Zatwierdzony' : urlop.status}</span>
        `;
        historiaUrlopowList.appendChild(listItem);
    });
}

// Funkcja wypełniająca listę rozwijaną latami - TYLKO Z PRZESZŁOŚCIĄ I BIEŻĄCYM ROKIEM
function wypelnijSelectLatami() {
    const currentYear = new Date().getFullYear();
    // Ustawienie zakresu lat: od 10 lat wstecz do bieżącego roku
    const startYear = currentYear - 10; 
    const endYear = currentYear; // Koniec to bieżący rok

    selectYearEl.innerHTML = ''; // Wyczyść istniejące opcje przed dodaniem nowych

    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true; // Domyślnie zaznacz bieżący rok
        }
        selectYearEl.appendChild(option);
    }
}

// Funkcja aktualizująca etykiety na podstawie wybranego roku
function zaktualizujEtykietyRoku() {
    const wybranyRok = selectYearEl.value;
    if (labelDodatkowyEl) {
        labelDodatkowyEl.textContent = `Początkowy urlop dodatkowy (dni, za rok ${wybranyRok}):`;
    }
    if (labelPodstawowyEl) {
        labelPodstawowyEl.textContent = `Początkowy urlop podstawowy (dni, za rok ${wybranyRok}):`;
    }
}


configForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const potwierdzenie = confirm("Czy na pewno chcesz zmienić konfigurację urlopów? Spowoduje to zresetowanie dostępnych dni i historii urlopów.");
    if (!potwierdzenie) {
        wyswietlKomunikat(configMessageEl, 'Zmiana konfiguracji anulowana.', 'error');
        return;
    }

    const initialPodstawowy = parseInt(initialPodstawowyInput.value);
    const initialDodatkowy = parseInt(initialDodatkowyInput.value);
    const selectedYear = parseInt(selectYearEl.value);

    if (isNaN(initialPodstawowy) || isNaN(initialDodatkowy) ||
        initialPodstawowy < 0 || initialDodatkowy < 0 || isNaN(selectedYear)) {
        wyswietlKomunikat(configMessageEl, 'Wszystkie wartości muszą być liczbami nieujemnymi, a rok musi być wybrany.', 'error');
        return;
    }

    pracownik.resetujUrlopy(initialPodstawowy, initialDodatkowy, selectedYear);
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

    if (pracownik.poczatkowyUrlopPodstawowy === 0 && pracownik.poczatkowyUrlopDodatkowy === 0 && pracownik.historiaUrlopow.length === 0) {
        wyswietlKomunikat(messageEl, 'Najpierw ustaw początkową liczbę dni urlopu w sekcji "Konfiguracja Urlopów".', 'error');
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