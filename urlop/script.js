class ZarzadzanieUrlopem {
    constructor() {
        // Mapa do przechowywania konfiguracji urlopów dla poszczególnych lat.
        // Klucz: rok (liczba), Wartość: { initialPodstawowy, initialDodatkowy, remainingPodstawowy, remainingDodatkowy }
        this.konfiguracjeUrlopow = new Map();
        // Tablica do przechowywania historii zgłoszonych dni wolnych.
        this.historiaUrlopow = [];
        
        // Ładowanie danych z pamięci lokalnej przeglądarki przy starcie.
        this.loadData();
    }

    // Zapisuje aktualny stan danych do localStorage.
    saveData() {
        const dataToSave = {
            konfiguracjeUrlopow: Array.from(this.konfiguracjeUrlopow.entries()), // Konwertuje Map na Array dla zapisu JSON
            historiaUrlopow: this.historiaUrlopow
        };
        localStorage.setItem('zarzadzanieUrlopemData', JSON.stringify(dataToSave));
    }

    // Ładuje dane z localStorage przy starcie aplikacji.
    loadData() {
        const savedData = localStorage.getItem('zarzadzanieUrlopemData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            this.konfiguracjeUrlopow = new Map(parsedData.konfiguracjeUrlopow); // Konwertuje Array z powrotem na Map
            this.historiaUrlopow = parsedData.historiaUrlopow;
        }
    }

    // Ustawia lub aktualizuje początkową i pozostałą liczbę dni urlopu dla danego roku.
    ustawKonfiguracje(podstawowy, dodatkowy, rok) {
        this.konfiguracjeUrlopow.set(rok, {
            initialPodstawowy: podstawowy,    // Początkowa liczba dni urlopu podstawowego
            initialDodatkowy: dodatkowy,      // Początkowa liczba dni urlopu dodatkowego
            remainingPodstawowy: podstawowy,  // Pozostała liczba dni urlopu podstawowego
            remainingDodatkowy: dodatkowy     // Pozostała liczba dni urlopu dodatkowego
        });
        this.saveData(); // Zapisuje zmiany.
    }

    // Zwraca sumę pozostałych dni urlopu podstawowego ze wszystkich skonfigurowanych lat.
    getTotalRemainingPodstawowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.remainingPodstawowy;
        }
        return total;
    }

    // Zwraca sumę pozostałych dni urlopu dodatkowego ze wszystkich skonfigurowanych lat.
    getTotalRemainingDodatkowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.remainingDodatkowy;
        }
        return total;
    }

    // Zwraca sumę początkowych dni urlopu podstawowego ze wszystkich skonfigurowanych lat.
    getTotalInitialPodstawowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.initialPodstawowy;
        }
        return total;
    }

    // Zwraca sumę początkowych dni urlopu dodatkowego ze wszystkich skonfigurowanych lat.
    getTotalInitialDodatkowy() {
        let total = 0;
        for (const config of this.konfiguracjeUrlopow.values()) {
            total += config.initialDodatkowy;
        }
        return total;
    }

    // Sprawdza dostępność urlopu, uwzględniając priorytet wykorzystania dni z lat ubiegłych
    // dla konkretnego typu urlopu.
    sprawdzDostepnosc(typUrlopu, liczbaDni, isModifying = false, oldUrlopId = null) {
        // Urlop L4 i opieka nie są zarządzane pulą dni, więc zawsze są dozwolone i nie wymagają sprawdzania.
        if (typUrlopu !== 'podstawowy' && typUrlopu !== 'dodatkowy') {
            return { canTake: true, message: '' };
        }

        const currentYear = new Date().getFullYear();
        // Sortujemy lata rosnąco, aby zawsze brać pod uwagę najstarsze dostępne konfiguracje.
        const posortowaneLata = Array.from(this.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

        // Tworzymy tymczasową kopię konfiguracji, aby symulować zmiany bez wpływu na rzeczywiste dane
        // podczas fazy sprawdzania dostępności (szczególnie ważne przy modyfikacji).
        const tempKonfiguracjeUrlopow = new Map(JSON.parse(JSON.stringify(Array.from(this.konfiguracjeUrlopow.entries()))));

        // Jeśli sprawdzamy dostępność w trakcie modyfikacji istniejącego urlopu,
        // musimy najpierw "zwrócić" dni starego urlopu do tymczasowej puli.
        if (isModifying && oldUrlopId) {
            const oldUrlop = this.historiaUrlopow.find(u => u.id === oldUrlopId);
            // Zwracamy dni TYLKO jeśli stary urlop był tego samego typu co nowy zgłaszany typ.
            if (oldUrlop && oldUrlop.typ === typUrlopu) { 
                const config = tempKonfiguracjeUrlopow.get(oldUrlop.rokUrlopu);
                if (config) {
                    const remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';
                    const initialProp = typUrlopu === 'podstawowy' ? 'initialPodstawowy' : 'initialDodatkowy';
                    // Przywracamy dni, dbając o to, by nie przekroczyć początkowej liczby dla danego roku.
                    config[remainingProp] = Math.min(config[initialProp], config[remainingProp] + oldUrlop.dni);
                }
            }
        }

        let totalRemainingForType = 0;      // Całkowita dostępna pula dla DANEGO TYPU urlopu (np. tylko podstawowego).
        let remainingFromPreviousYears = 0; // Pula z lat STARSZYCH niż bieżący rok, dla DANEGO TYPU urlopu (zaległy).

        // Iterujemy przez posortowane lata, aby obliczyć sumy dla DANEGO TYPU urlopu.
        for (const rok of posortowaneLata) {
            const config = tempKonfiguracjeUrlopow.get(rok);
            // Określamy właściwość do sprawdzenia (remainingPodstawowy lub remainingDodatkowy).
            const remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';
            
            if (config && config[remainingProp] > 0) {
                totalRemainingForType += config[remainingProp];
                // Jeśli rok jest starszy niż bieżący, dodajemy do puli zaległego urlopu.
                if (rok < currentYear) { 
                    remainingFromPreviousYears += config[remainingProp];
                }
            }
        }

        // 1. Sprawdź, czy w ogóle jest wystarczająca całkowita liczba dni dla DANEGO TYPU urlopu.
        if (totalRemainingForType < liczbaDni) {
            return { 
                canTake: false, 
                message: `Brak wystarczających dni urlopu ${typUrlopu} na zgłoszenie ${liczbaDni} dni. Dostępne: ${totalRemainingForType} dni.` 
            };
        }

        // 2. Kluczowa logika priorytetu urlopu zaległego dla DANEGO TYPU:
        // Jeśli są dostępne dni z lat poprzednich (zaległe) dla TEGO TYPU URLOPU,
        // ORAZ zgłaszana liczba dni jest większa niż te dostępne zaległe dni.
        // Oznacza to, że aby zrealizować żądanie, trzeba by sięgnąć po urlop z bieżącego lub przyszłego roku.
        // W takim przypadku blokujemy zgłoszenie, ponieważ zaległości muszą być wykorzystane w pierwszej kolejności.
        if (remainingFromPreviousYears > 0 && liczbaDni > remainingFromPreviousYears) {
             return { 
                 canTake: false, 
                 message: `Nie możesz wykorzystać urlopu ${typUrlopu} z bieżącego lub przyszłego roku, gdy posiadasz jeszcze ${remainingFromPreviousYears} dni zaległego urlopu ${typUrlopu} z lat poprzednich. Wykorzystaj najpierw zaległe dni tego typu.`
             };
        }
        
        // Jeśli wszystkie powyższe warunki zostały spełnione, urlop może zostać zgłoszony.
        return { canTake: true, message: '' };
    }

    // Metoda do odejmowania dni urlopu z puli.
    // Zawsze zaczyna od najstarszych lat, co zapewnia priorytet wykorzystania zaległości.
    deductVacationDays(typUrlopu, liczbaDni, dataRozpoczecia) {
        // Pomijamy L4 i opiekę, ponieważ nie odejmujemy dni z puli urlopowej dla tych typów.
        if (typUrlopu !== 'podstawowy' && typUrlopu !== 'dodatkowy') {
            return null;
        }

        let dniDoOdjecia = liczbaDni;
        let rokDeduukcji = null; // Zapisuje rok, z którego ostatecznie pobrano urlop (najstarszy, jeśli z wielu lat)

        // Sortujemy lata od najstarszego do najnowszego, aby priorytezować wykorzystanie zaległości.
        const posortowaneLata = Array.from(this.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

        for (const rok of posortowaneLata) {
            const config = this.konfiguracjeUrlopow.get(rok);
            let remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';

            if (config && config[remainingProp] > 0 && dniDoOdjecia > 0) {
                // Obliczamy ile dni można odjąć z bieżącego roku konfiguracji.
                const odjeteZDanegoRoku = Math.min(dniDoOdjecia, config[remainingProp]);
                config[remainingProp] -= odjeteZDanegoRoku; // Odejmowanie dni.
                dniDoOdjecia -= odjeteZDanegoRoku;         // Zmniejszenie liczby dni do odjęcia.
                
                // Aktualizujemy rok deduukcji. Jeśli dni pobrano z tego roku, staje się on rokiem deduukcji.
                if (rokDeduukcji === null || odjeteZDanegoRoku > 0) {
                    rokDeduukcji = rok;
                }
                if (dniDoOdjecia === 0) break; // Jeśli wszystkie dni zostały odjęte, przerywamy pętlę.
            }
        }
        this.saveData(); // Zapisujemy zmiany.
        return rokDeduukcji; // Zwracamy rok, z którego pobrano urlop.
    }

    // Metoda do zwracania dni urlopu do puli (np. przy modyfikacji lub anulowaniu).
    returnVacationDays(typUrlopu, liczbaDni, rokUrlopu) {
        if (typUrlopu !== 'podstawowy' && typUrlopu !== 'dodatkowy') {
            return; // Nie zwracamy dni dla L4/opieki.
        }

        const config = this.konfiguracjeUrlopow.get(rokUrlopu);
        if (config) {
            let remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';
            let initialProp = typUrlopu === 'podstawowy' ? 'initialPodstawowy' : 'initialDodatkowy';
            
            // Dodajemy dni, ale nie przekraczamy początkowej wartości dla danego roku, aby uniknąć nadmiaru.
            config[remainingProp] = Math.min(config[initialProp], config[remainingProp] + liczbaDni);
            
            this.saveData(); // Zapisujemy zmiany.
        }
    }

    // Metoda do zgłaszania nowego urlopu.
    zglosUrlop(typUrlopu, liczbaDni, dataRozpoczecia, adnotacje = '') {
        const start = new Date(dataRozpoczecia);
        const dzisiaj = new Date();
        dzisiaj.setHours(0,0,0,0); // Ustawiamy godzinę na 00:00:00, aby porównywać tylko daty.

        let isPastDate = false;
        if (start < dzisiaj) {
            isPastDate = true; // Flaga, jeśli data rozpoczęcia jest w przeszłości.
        }

        // Sprawdzenie dostępności urlopu przed faktycznym zgłoszeniem.
        // Dla nowego zgłoszenia nie ma parametrów isModifying i oldUrlopId.
        const checkResult = this.sprawdzDostepnosc(typUrlopu, liczbaDni);
        if (!checkResult.canTake) {
            return { success: false, message: checkResult.message };
        }
        
        let rokDeduukcji = new Date(dataRozpoczecia).getFullYear(); // Domyślny rok odjęcia (może być zmieniony przez deductVacationDays).
        if (typUrlopu === 'podstawowy' || typUrlopu === 'dodatkowy') {
            // Odejmowanie dni z puli urlopowej. deductVacationDays dba o priorytet najstarszych lat.
            rokDeduukcji = this.deductVacationDays(typUrlopu, liczbaDni, dataRozpoczecia);
        }

        // Generowanie unikalnego ID dla wpisu w historii.
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        // Dodanie nowego wpisu do historii urlopów.
        this.historiaUrlopow.push({
            id: id,
            typ: typUrlopu,
            dni: liczbaDni,
            od: dataRozpoczecia,
            status: 'zatwierdzony', // Domyślny status zgłoszenia.
            rokUrlopu: rokDeduukcji, // Faktyczny rok, z którego odjęto urlop.
            adnotacje: adnotacje
        });
        this.saveData(); // Zapisanie historii.

        let successMessage = `Dni wolne (${typUrlopu}) na ${liczbaDni} dni zgłoszone pomyślnie.`;
        if (isPastDate) {
            successMessage += ' **Uwaga: Data rozpoczęcia dni wolnych jest w przeszłości.**';
        }

        return { success: true, message: successMessage };
    }

    // Metoda do modyfikowania istniejącego wpisu urlopu.
    modyfikujUrlop(id, nowyTypUrlopu, nowaLiczbaDni, nowaDataRozpoczecia, noweAdnotacje) {
        const index = this.historiaUrlopow.findIndex(urlop => urlop.id === id);
        if (index === -1) {
            return { success: false, message: "Nie znaleziono zgłoszonego urlopu do modyfikacji." };
        }

        const staryUrlop = this.historiaUrlopow[index];

        // 1. Zwróć dni starego urlopu do puli. Jest to kluczowe przed sprawdzeniem dostępności dla nowej wartości.
        if (staryUrlop.typ === 'podstawowy' || staryUrlop.typ === 'dodatkowy') {
            this.returnVacationDays(staryUrlop.typ, staryUrlop.dni, staryUrlop.rokUrlopu);
        }

        // 2. Sprawdź dostępność dla nowego urlopu.
        // Ważne: przekazujemy isModifying=true oraz ID starego urlopu do sprawdzDostepnosc,
        // aby symulacja zwracania dni działała poprawnie.
        if (nowyTypUrlopu === 'podstawowy' || nowyTypUrlopu === 'dodatkowy') {
            const checkResult = this.sprawdzDostepnosc(nowyTypUrlopu, nowaLiczbaDni, true, id); 
            if (!checkResult.canTake) {
                // Jeśli brak dostępności dla nowego zgłoszenia, musimy przywrócić stary urlop do puli.
                // Czyli "odejmujemy" dni starego urlopu ponownie, aby cofnąć jego "zwrot".
                if (staryUrlop.typ === 'podstawowy' || staryUrlop.typ === 'dodatkowy') {
                    // Zakładamy, że dni są jeszcze dostępne do cofnięcia zmian; w bardziej rozbudowanym systemie
                    // mogłoby to wymagać bardziej zaawansowanego mechanizmu transakcyjnego.
                    this.deductVacationDays(staryUrlop.typ, staryUrlop.dni, staryUrlop.rokUrlopu); 
                }
                return { success: false, message: `Modyfikacja niemożliwa: ${checkResult.message}` };
            }
        }
        
        // 3. Odejmij dni nowego urlopu z puli.
        let nowyRokDeduukcji = new Date(nowaDataRozpoczecia).getFullYear();
        if (nowyTypUrlopu === 'podstawowy' || nowyTypUrlopu === 'dodatkowy') {
            nowyRokDeduukcji = this.deductVacationDays(nowyTypUrlopu, nowaLiczbaDni, nowaDataRozpoczecia);
        }

        // 4. Zaktualizuj wpis w historii urlopów.
        this.historiaUrlopow[index] = {
            id: id, // ID pozostaje bez zmian
            typ: nowyTypUrlopu,
            dni: nowaLiczbaDni,
            od: nowaDataRozpoczecia,
            status: 'zatwierdzony', 
            rokUrlopu: nowyRokDeduukcji, // Zaktualizowany rok, z którego faktycznie pobrano urlop
            adnotacje: noweAdnotacje
        };
        this.saveData(); // Zapisz zmienioną historię.
        return { success: true, message: "Urlop zmodyfikowany pomyślnie." };
    }


    // Oblicza procent wykorzystania urlopu w stosunku do początkowej, całkowitej puli.
    obliczWykorzystanie() {
        const sumaZgloszonychDniUrlopu = this.historiaUrlopow.reduce((sum, urlop) => {
            // Sumujemy tylko urlopy podstawowe i dodatkowe do obliczenia wykorzystania.
            if (urlop.typ === 'podstawowy' || urlop.typ === 'dodatkowy') {
                return sum + urlop.dni;
            }
            return sum;
        }, 0);
        
        const calkowityDostepnyUrlop = this.getTotalInitialPodstawowy() + this.getTotalInitialDodatkowy();

        if (calkowityDostepnyUrlop === 0) {
            return 0; // Zapobiega dzieleniu przez zero.
        }

        const procentWykorzystania = (sumaZgloszonychDniUrlopu / calkowityDostepnyUrlop) * 100;
        return procentWykorzystania.toFixed(2); // Zwraca procent z dwoma miejscami po przecinku.
    }

    // Czyści wszystkie dane z konfiguracji i historii urlopów, resetując aplikację.
    wyczyscWszystkieDane() {
        this.konfiguracjeUrlopow.clear(); // Czyści mapę konfiguracji.
        this.historiaUrlopow = [];        // Czyści tablicę historii.
        this.saveData();                  // Zapisuje pusty stan.
    }
}

// --- Logika obsługi HTML i interakcji z DOM (interfejsem użytkownika) ---

// Tworzenie instancji klasy zarządzającej urlopem.
const pracownik = new ZarzadzanieUrlopem();

// Pobieranie referencji do elementów DOM.
const urlopCalkowityDniEl = document.getElementById('urlopCalkowityDni');
const urlopPodstawowyDniEl = document.getElementById('urlopPodstawowyDni');
const urlopDodatkowyDniEl = document.getElementById('urlopDodatkowyDni');
const wykorzystanieProcentEl = document.getElementById('wykorzystanieProcent');
const urlopRozbicieNaLataEl = document.getElementById('urlopRozbicieNaLata'); 
const urlopChartCanvas = document.getElementById('urlopChart');
let urlopChartInstance; // Zmienna do przechowywania instancji wykresu Chart.js.

const configForm = document.getElementById('configForm');
const initialPodstawowyInput = document.getElementById('initialPodstawowy');
const initialDodatkowyInput = document.getElementById('initialDodatkowy');
const configMessageEl = document.getElementById('configMessage');

const selectYearEl = document.getElementById('selectYear');
const labelDodatkowyEl = document.getElementById('labelDodatkowy');
const labelPodstawowyEl = document.getElementById('labelPodstawowy');

const urlopForm = document.getElementById('urlopForm');
const typUrlopuSelect = document.getElementById('typUrlopu');
const liczbaDniInput = document.getElementById('liczbaDni');
const dataRozpoczeciaInput = document.getElementById('dataRozpoczecia');
const adnotacjeInput = document.getElementById('adnotacje');
const messageEl = document.getElementById('message');
const historiaUrlopowList = document.getElementById('historiaUrlopowList');

// Funkcja pomocnicza do formatowania daty na polski format (DD.MM.RRRR).
function formatujDateNaPolski(dataString) {
    const data = new Date(dataString);
    const dzien = String(data.getDate()).padStart(2, '0');
    const miesiac = String(data.getMonth() + 1).padStart(2, '0'); // Miesiące są od 0 do 11
    const rok = data.getFullYear();
    return `${dzien}.${miesiac}.${rok}`;
}

// Funkcja pomocnicza do wyświetlania komunikatów użytkownikowi (sukces, błąd, informacja).
function wyswietlKomunikat(el, msg, type) {
    el.textContent = msg;
    el.className = `message ${type}`;
    // Komunikat znika po 5 sekundach.
    setTimeout(() => {
        el.textContent = '';
        el.className = 'message';
    }, 5000); 
}

// Aktualizuje sekcję "Aktualny Stan Urlopów" na pulpicie.
function aktualizujStanUrlopow() {
    urlopCalkowityDniEl.textContent = pracownik.getTotalInitialPodstawowy() + pracownik.getTotalInitialDodatkowy();
    urlopPodstawowyDniEl.textContent = pracownik.getTotalRemainingPodstawowy();
    urlopDodatkowyDniEl.textContent = pracownik.getTotalRemainingDodatkowy();
    wykorzystanieProcentEl.textContent = pracownik.obliczWykorzystanie();
    
    aktualizujRozbicieNaLata(); // Aktualizuje sekcję rozbicia urlopów na lata.
    aktualizujWykresUrlopu();    // Aktualizuje wykres wizualizujący wykorzystanie urlopu.
}

// Aktualizuje listę historii zgłoszonych dni wolnych.
function aktualizujHistorieUrlopow() {
    historiaUrlopowList.innerHTML = ''; // Czyści bieżącą listę.
    if (pracownik.historiaUrlopow.length === 0) {
        historiaUrlopowList.innerHTML = '<li>Brak zgłoszonych dni wolnych.</li>';
        return;
    }
    // Sortowanie historii od najnowszych wpisów do najstarszych.
    const posortowanaHistoria = [...pracownik.historiaUrlopow].sort((a, b) => new Date(b.od) - new Date(a.od));

    posortowanaHistoria.forEach((urlop) => {
        const listItem = document.createElement('li');
        const dataOd = formatujDateNaPolski(urlop.od);
        let typTekst = '';
        // Ustawienie wyświetlanej nazwy typu urlopu.
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
                <span>Data: ${dataOd} (rok: ${urlop.rokUrlopu || 'N/A'})</span>
                <span style="color: #66bb6a;">${urlop.status === 'zatwierdzony' ? 'Zatwierdzony' : urlop.status}</span>
            </div>
            ${urlop.adnotacje ? `<p class="adnotacja">Adnotacje: ${urlop.adnotacje}</p>` : ''}
            <button class="edit-btn" data-id="${urlop.id}">Edytuj</button>
        `;
        historiaUrlopowList.appendChild(listItem);
    });

    // Dodawanie słuchaczy zdarzeń dla przycisków edycji w historii.
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const idToEdit = event.target.dataset.id;
            const urlopToEdit = pracownik.historiaUrlopow.find(u => u.id === idToEdit);
            if (urlopToEdit) {
                // Wypełnienie formularza danymi edytowanego urlopu.
                typUrlopuSelect.value = urlopToEdit.typ;
                liczbaDniInput.value = urlopToEdit.dni;
                dataRozpoczeciaInput.value = urlopToEdit.od;
                adnotacjeInput.value = urlopToEdit.adnotacje || '';
                
                // Zmiana tekstu przycisku submit i ustawienie ID edytowanego elementu
                // w data-attribute formularza, aby zasygnalizować tryb edycji.
                urlopForm.querySelector('button[type="submit"]').textContent = 'Zapisz zmiany (Edycja)';
                urlopForm.dataset.editingId = idToEdit; 
                wyswietlKomunikat(messageEl, 'Edytujesz istniejący wpis. Zmień dane i kliknij "Zapisz zmiany".', 'info');
            }
        });
    });
}

// Aktualizuje sekcję z rozbiciem urlopów na poszczególne lata
function aktualizujRozbicieNaLata() {
    urlopRozbicieNaLataEl.innerHTML = ''; 

    if (pracownik.konfiguracjeUrlopow.size === 0) {
        urlopRozbicieNaLataEl.innerHTML = '<p>Brak skonfigurowanych urlopów dla poszczególnych lat.</p>';
        return;
    }

    // Sortowanie lat, aby wyświetlały się w kolejności chronologicznej
    const posortowaneLata = Array.from(pracownik.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

    let anyYearDisplayed = false; // Flaga do sprawdzenia, czy jakikolwiek rok został wyświetlony

    posortowaneLata.forEach(rok => {
        const config = pracownik.konfiguracjeUrlopow.get(rok);
        
        // Warunek: wyświetlaj rok tylko jeśli pozostały urlop podstawowy LUB dodatkowy jest większy od 0
        if (config && (config.remainingPodstawowy > 0 || config.remainingDodatkowy > 0)) {
            const pElement = document.createElement('p');
            pElement.innerHTML = `
                <span class="rok">Rok ${rok}:</span>
                <span>Podstawowy: <span class="dni-ilosc">${config.remainingPodstawowy}</span> dni</span>
                <span>Dodatkowy: <span class="dni-ilosc">${config.remainingDodatkowy}</span> dni</span>
            `;
            urlopRozbicieNaLataEl.appendChild(pElement);
            anyYearDisplayed = true;
        }
    });

    // Jeśli po przefiltrowaniu żaden rok nie został wyświetlony
    if (!anyYearDisplayed) {
        urlopRozbicieNaLataEl.innerHTML = '<p>Brak dostępnych dni urlopu w konfiguracji rocznej.</p>';
    }
}

// Aktualizuje i renderuje wykres kołowy wizualizujący wykorzystanie urlopu.
function aktualizujWykresUrlopu() {
    const totalInitial = pracownik.getTotalInitialPodstawowy() + pracownik.getTotalInitialDodatkowy();
    const totalRemaining = pracownik.getTotalRemainingPodstawowy() + pracownik.getTotalRemainingDodatkowy();
    const totalUsed = totalInitial - totalRemaining; // Obliczenie wykorzystanych dni.

    const ctx = urlopChartCanvas.getContext('2d');

    // Niszczy poprzednią instancję wykresu Chart.js, aby uniknąć nakładania się i błędów.
    if (urlopChartInstance) {
        urlopChartInstance.destroy();
    }

    // Tworzenie nowej instancji wykresu kołowego.
    urlopChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Wykorzystany urlop', 'Pozostały urlop'],
            datasets: [{
                data: [totalUsed, totalRemaining],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)', // Czerwony dla wykorzystanego.
                    'rgba(75, 192, 192, 0.8)'  // Zielony dla pozostałego.
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
                        color: '#f0f0f0' // Kolor tekstu legendy dla lepszej czytelności na ciemnym tle.
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
                                label += context.parsed + ' dni'; // Wyświetla liczbę dni w dymku.
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Wypełnia listę rozwijaną latami w sekcji konfiguracji urlopów.
function wypelnijSelectLatami() {
    const currentYear = new Date().getFullYear(); 
    const startYear = currentYear - 10;        // Lata od 10 lat wstecz od bieżącego.
    const endYear = currentYear + 1;           // Do roku bieżącego + 1 (dla konfiguracji przyszłego roku)

    selectYearEl.innerHTML = ''; // Czyści istniejące opcje.

    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true; // Domyślnie zaznacza bieżący rok.
        }
        selectYearEl.appendChild(option);
    }
    
    // Ustawia wartości początkowe pól formularza na podstawie wybranego roku
    // po wypełnieniu listy rozwijanej (domyślnie bieżący rok).
    const selectedYear = parseInt(selectYearEl.value);
    const configForSelectedYear = pracownik.konfiguracjeUrlopow.get(selectedYear);
    if (configForSelectedYear) {
        initialPodstawowyInput.value = configForSelectedYear.initialPodstawowy;
        initialDodatkowyInput.value = configForSelectedYear.initialDodatkowy;
    } else {
        initialPodstawowyInput.value = 0; // Domyślne 0, jeśli brak konfiguracji dla roku.
        initialDodatkowyInput.value = 0;
    }
}

// Aktualizuje etykiety pól formularza konfiguracji, aby pokazywały wybrany rok.
function zaktualizujEtykietyRoku() {
    const wybranyRok = parseInt(selectYearEl.value);
    if (labelDodatkowyEl) {
        labelDodatkowyEl.textContent = `Początkowy urlop dodatkowy (dni, za rok ${wybranyRok}):`;
    }
    if (labelPodstawowyEl) {
        labelPodstawowyEl.textContent = `Początkowy urlop podstawowy (dni, za rok ${wybranyRok}):`;
    }

    // Ładuje wartości konfiguracji dla wybranego roku do pól formularza.
    const configForSelectedYear = pracownik.konfiguracjeUrlopow.get(wybranyRok);
    if (configForSelectedYear) {
        initialPodstawowyInput.value = configForSelectedYear.initialPodstawowy;
        initialDodatkowyInput.value = configForSelectedYear.initialDodatkowy;
    } else {
        initialPodstawowyInput.value = 0;
        initialDodatkowyInput.value = 0;
    }
}


// --- Obsługa zdarzeń ---

// Obsługa formularza konfiguracji urlopów.
configForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Zapobiega domyślnemu przeładowaniu strony.

    const selectedYear = parseInt(selectYearEl.value);
    const initialPodstawowy = parseInt(initialPodstawowyInput.value);
    const initialDodatkowy = parseInt(initialDodatkowyInput.value);

    // Walidacja danych wejściowych.
    if (isNaN(initialPodstawowy) || isNaN(initialDodatkowy) ||
        initialPodstawowy < 0 || initialDodatkowy < 0 || isNaN(selectedYear)) {
        wyswietlKomunikat(configMessageEl, 'Wszystkie wartości muszą być liczbami nieujemnymi, a rok musi być wybrany.', 'error');
        return;
    }

    // Potwierdzenie użytkownika przed zmianą konfiguracji, ponieważ resetuje dni dla danego roku.
    const potwierdzenie = confirm(`Czy na pewno chcesz ustawić/zaktualizować konfigurację urlopów za rok ${selectedYear}? Spowoduje to zresetowanie dostępnych dni urlopu TYLKO dla tego roku do wartości początkowych.`);
    if (!potwierdzenie) {
        wyswietlKomunikat(configMessageEl, 'Zmiana konfiguracji anulowana.', 'error');
        return;
    }

    pracownik.ustawKonfiguracje(initialPodstawowy, initialDodatkowy, selectedYear);

    // Aktualizacja widoku po zmianie konfiguracji.
    aktualizujStanUrlopow();
    aktualizujHistorieUrlopow(); // Historia mogła się zmienić (np. poprzez przypisanie urlopu do innego roku).
    wyswietlKomunikat(configMessageEl, `Konfiguracja urlopów za rok ${selectedYear} zaktualizowana pomyślnie.`, 'success');
});

// Obsługa formularza zgłaszania/modyfikacji dni wolnych.
urlopForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Zapobiega domyślnemu przeładowaniu strony.

    const typUrlopu = typUrlopuSelect.value;
    const liczbaDni = parseInt(liczbaDniInput.value);
    const dataRozpoczecia = dataRozpoczeciaInput.value;
    const adnotacje = adnotacjeInput.value.trim();

    // Walidacja liczby dni.
    if (isNaN(liczbaDni) || liczbaDni <= 0) {
        wyswietlKomunikat(messageEl, 'Liczba dni musi być liczbą większą od zera.', 'error');
        return;
    }

    // Walidacja, czy konfiguracja urlopu istnieje, jeśli typ urlopu to podstawowy lub dodatkowy.
    if ((typUrlopu === 'podstawowy' || typUrlopu === 'dodatkowy') && pracownik.konfiguracjeUrlopow.size === 0) {
        wyswietlKomunikat(messageEl, 'Najpierw ustaw początkową liczbę dni urlopu w sekcji "Konfiguracja Urlopów" dla co najmniej jednego roku.', 'error');
        return;
    }
    
    // Kluczowe sprawdzenie dostępności i priorytetu urlopu przed faktycznym zgłoszeniem/modyfikacją.
    if (typUrlopu === 'podstawowy' || typUrlopu === 'dodatkowy') {
        const editingId = urlopForm.dataset.editingId; // Sprawdź, czy formularz jest w trybie edycji.
        // Przekazujemy informację o trybie edycji (`!!editingId` konwertuje na boolean) 
        // i ID edytowanego wpisu do `sprawdzDostepnosc`.
        const checkResult = pracownik.sprawdzDostepnosc(typUrlopu, liczbaDni, !!editingId, editingId);
        if (!checkResult.canTake) {
            wyswietlKomunikat(messageEl, checkResult.message, 'error');
            return;
        }
    }

    const editingId = urlopForm.dataset.editingId; // Ponownie pobieramy ID edytowanego wpisu.
    let wynik;

    if (editingId) {
        // Jeśli formularz jest w trybie edycji, wywołujemy metodę modyfikującą.
        wynik = pracownik.modyfikujUrlop(editingId, typUrlopu, liczbaDni, dataRozpoczecia, adnotacje);
        delete urlopForm.dataset.editingId; // Czyścimy data-attribute po zakończeniu edycji.
        urlopForm.querySelector('button[type="submit"]').textContent = 'Zapisz zmiany (Edycja)'; // Przywracamy tekst przycisku.
    } else {
        // W przeciwnym razie, zgłaszamy nowy urlop.
        wynik = pracownik.zglosUrlop(typUrlopu, liczbaDni, dataRozpoczecia, adnotacje);
    }

    if (wynik.success) {
        wyswietlKomunikat(messageEl, wynik.message, 'success');
        aktualizujStanUrlopow();    // Aktualizacja stanu.
        aktualizujHistorieUrlopow(); // Aktualizacja historii.
        urlopForm.reset();          // Czyści formularz po udanej operacji.
    } else {
        wyswietlKomunikat(messageEl, wynik.message, 'error');
    }
});

// Zdarzenie uruchamiane po załadowaniu całej zawartości DOM.
document.addEventListener('DOMContentLoaded', () => {
    wypelnijSelectLatami();         // Wypełnia listę rozwijaną latami.
    zaktualizujEtykietyRoku();      // Aktualizuje etykiety pól formularza konfiguracji.

    // Dodanie słuchacza zdarzeń dla zmiany wyboru roku w formularzu konfiguracji.
    selectYearEl.addEventListener('change', zaktualizujEtykietyRoku);

    aktualizujStanUrlopow();    // Initializacja stanu urlopów.
    aktualizujHistorieUrlopow(); // Initializacja historii urlopów.
});