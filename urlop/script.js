class ZarzadzanieUrlopem {
    constructor() {
        this.konfiguracjeUrlopow = new Map();
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

    // Nowa metoda do ustawiania danych z zaimportowanego pliku
    setAllData(konfiguracjeUrlopowArray, historiaUrlopowArray) {
        this.konfiguracjeUrlopow = new Map(konfiguracjeUrlopowArray);
        this.historiaUrlopow = historiaUrlopowArray;
        this.saveData(); // Zapisz nowe dane od razu
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

    sprawdzDostepnosc(typUrlopu, liczbaDni, isModifying = false, oldUrlopId = null) {
        if (typUrlopu !== 'podstawowy' && typUrlopu !== 'dodatkowy') {
            return { canTake: true, message: '' };
        }

        const currentYear = new Date().getFullYear();
        const posortowaneLata = Array.from(this.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

        const tempKonfiguracjeUrlopow = new Map(this.konfiguracjeUrlopow);

        if (isModifying && oldUrlopId) {
            const oldUrlop = this.historiaUrlopow.find(u => u.id === oldUrlopId);
            if (oldUrlop && (oldUrlop.typ === 'podstawowy' || oldUrlop.typ === 'dodatkowy')) { 
                const config = tempKonfiguracjeUrlopow.get(oldUrlop.rokUrlopu);
                if (config) {
                    const remainingProp = oldUrlop.typ === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';
                    const initialProp = oldUrlop.typ === 'podstawowy' ? 'initialPodstawowy' : 'initialDodatkowy';
                    config[remainingProp] = Math.min(config[initialProp], config[remainingProp] + oldUrlop.dni);
                }
            }
        }

        let totalRemainingForType = 0;
        let remainingFromPreviousYears = 0;

        for (const rok of posortowaneLata) {
            const config = tempKonfiguracjeUrlopow.get(rok);
            const remainingProp = typUrlopu === 'podstawowy' ? 'remainingPodstawowy' : 'remainingDodatkowy';
            
            if (config && config[remainingProp] > 0) {
                totalRemainingForType += config[remainingProp];
                if (rok < currentYear) { 
                    remainingFromPreviousYears += config[remainingProp];
                }
            }
        }

        if (totalRemainingForType < liczbaDni) {
            return { 
                canTake: false, 
                message: `Brak wystarczających dni urlopu ${typUrlopu} na zgłoszenie ${liczbaDni} dni. Dostępne: ${totalRemainingForType} dni.` 
            };
        }

        if (remainingFromPreviousYears > 0 && liczbaDni > remainingFromPreviousYears) {
             return { 
                 canTake: false, 
                 message: `Nie możesz wykorzystać urlopu ${typUrlopu} z bieżącego lub przyszłego roku, gdy posiadasz jeszcze ${remainingFromPreviousYears} dni zaległego urlopu ${typUrlopu} z lat poprzednich. Wykorzystaj najpierw zaległe dni tego typu.`
             };
        }
        
        return { canTake: true, message: '' };
    }

    deductVacationDays(typUrlopu, liczbaDni, dataRozpoczecia) {
        if (typUrlopu !== 'podstawowy' && typUrlopu !== 'dodatkowy') {
            return null;
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
                
                if (rokDeduukcji === null) {
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

        if (staryUrlop.typ === 'podstawowy' || staryUrlop.typ === 'dodatkowy') {
            this.returnVacationDays(staryUrlop.typ, staryUrlop.dni, staryUrlop.rokUrlopu);
        }

        if (nowyTypUrlopu === 'podstawowy' || nowyTypUrlopu === 'dodatkowy') {
            const checkResult = this.sprawdzDostepnosc(nowyTypUrlopu, nowaLiczbaDni, true, id); 
            if (!checkResult.canTake) {
                if (staryUrlop.typ === 'podstawowy' || staryUrlop.typ === 'dodatkowy') {
                    this.deductVacationDays(staryUrlop.typ, staryUrlop.dni, staryUrlop.od);
                }
                return { success: false, message: `Modyfikacja niemożliwa: ${checkResult.message}` };
            }
        }
        
        let nowyRokDeduukcji = new Date(nowaDataRozpoczecia).getFullYear();
        if (nowyTypUrlopu === 'podstawowy' || nowyTypUrlopu === 'dodatkowy') {
            nowyRokDeduukcji = this.deductVacationDays(nowyTypUrlopu, nowaLiczbaDni, nowaDataRozpoczecia);
        }

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

    usunUrlop(id) {
        const index = this.historiaUrlopow.findIndex(urlop => urlop.id === id);
        if (index === -1) {
            return { success: false, message: "Nie znaleziono zgłoszonego urlopu do usunięcia." };
        }

        const urlopDoUsuniecia = this.historiaUrlopow[index];

        if (urlopDoUsuniecia.typ === 'podstawowy' || urlopDoUsuniecia.typ === 'dodatkowy') {
            this.returnVacationDays(urlopDoUsuniecia.typ, urlopDoUsuniecia.dni, urlopDoUsuniecia.rokUrlopu);
        }

        this.historiaUrlopow.splice(index, 1);
        this.saveData();
        return { success: true, message: "Urlop usunięty pomyślnie." };
    }

    obliczWykorzystanie() {
        const sumaZgloszonychDniUrlopu = this.historiaUrlopow.reduce((sum, urlop) => {
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

const pracownik = new ZarzadzanieUrlopem();

const urlopCalkowityDniEl = document.getElementById('urlopCalkowityDni');
const urlopPodstawowyDniEl = document.getElementById('urlopPodstawowyDni');
const urlopDodatkowyDniEl = document.getElementById('urlopDodatkowyDni');
const wykorzystanieProcentEl = document.getElementById('wykorzystanieProcent');
const urlopRozbicieNaLataEl = document.getElementById('urlopRozbicieNaLata'); 
const urlopChartCanvas = document.getElementById('urlopChart');
let urlopChartInstance;

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

const clearDataBtn = document.getElementById('clearAllDataBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');     // NOWY: Przycisk importu
const importFileInput = document.getElementById('importFileInput'); // NOWY: Ukryty input pliku

if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Czy na pewno chcesz wyczyścić WSZYSTKIE dane (konfiguracje i historię urlopów)? Tej operacji nie można cofnąć!')) {
            pracownik.wyczyscWszystkieDane();
            aktualizujStanUrlopow();
            aktualizujHistorieUrlopow();
            wypelnijSelectLatami();
            wyswietlKomunikat(messageEl, 'Wszystkie dane zostały wyczyszczone.', 'success');
        }
    });
}

// Obsługa eksportu danych
if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
        try {
            const dataToExport = {
                konfiguracjeUrlopow: Array.from(pracownik.konfiguracjeUrlopow.entries()),
                historiaUrlopow: pracownik.historiaUrlopow
            };
            const jsonData = JSON.stringify(dataToExport, null, 2);

            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date();
            const filename = `backup_urlopy_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.json`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            wyswietlKomunikat(messageEl, `Dane pomyślnie wyeksportowano do pliku: ${filename}`, 'success');

        } catch (error) {
            console.error("Błąd podczas eksportowania danych:", error);
            wyswietlKomunikat(messageEl, 'Wystąpił błąd podczas eksportowania danych. Sprawdź konsolę przeglądarki.', 'error');
        }
    });
}

// NOWY: Obsługa importu danych
if (importDataBtn && importFileInput) {
    importDataBtn.addEventListener('click', () => {
        // Kliknij ukryty input file, aby otworzyć okno wyboru pliku
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Pobierz pierwszy wybrany plik
        if (!file) {
            wyswietlKomunikat(messageEl, 'Nie wybrano pliku do importu.', 'info');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Sprawdź, czy zaimportowane dane mają oczekiwaną strukturę
                if (importedData.konfiguracjeUrlopow && importedData.historiaUrlopow) {
                    // Pytanie o potwierdzenie, bo import nadpisze bieżące dane
                    if (confirm('Czy na pewno chcesz zaimportować dane? Spowoduje to nadpisanie bieżących danych!')) {
                        pracownik.setAllData(importedData.konfiguracjeUrlopow, importedData.historiaUrlopow);
                        aktualizujStanUrlopow();
                        aktualizujHistorieUrlopow();
                        wypelnijSelectLatami(); // Odśwież select lat, na wypadek nowych konfiguracji lat
                        wyswietlKomunikat(messageEl, 'Dane zaimportowano pomyślnie.', 'success');
                    } else {
                        wyswietlKomunikat(messageEl, 'Import danych anulowany.', 'info');
                    }
                } else {
                    wyswietlKomunikat(messageEl, 'Nieprawidłowy format pliku JSON. Brakuje oczekiwanych danych.', 'error');
                }
            } catch (error) {
                console.error("Błąd podczas importowania danych:", error);
                wyswietlKomunikat(messageEl, 'Błąd odczytu lub parsowania pliku JSON. Upewnij się, że to prawidłowy plik backupu.', 'error');
            }
            // Zresetuj input pliku, aby ten sam plik mógł być wybrany ponownie (jeśli konieczne)
            event.target.value = ''; 
        };

        reader.onerror = () => {
            wyswietlKomunikat(messageEl, 'Wystąpił błąd podczas odczytu pliku.', 'error');
        };

        reader.readAsText(file); // Odczytaj plik jako tekst
    });
}


function formatujDateNaPolski(dataString) {
    const data = new Date(dataString);
    const dzien = String(data.getDate()).padStart(2, '0');
    const miesiac = String(data.getMonth() + 1).padStart(2, '0');
    const rok = data.getFullYear();
    return `${dzien}.${miesiac}.${rok}`;
}

function wyswietlKomunikat(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = `message ${type}`;
    setTimeout(() => {
        el.textContent = '';
        el.className = 'message';
    }, 5000); 
}

function aktualizujStanUrlopow() {
    if (urlopCalkowityDniEl) urlopCalkowityDniEl.textContent = pracownik.getTotalRemainingPodstawowy() + pracownik.getTotalRemainingDodatkowy();
    if (urlopPodstawowyDniEl) urlopPodstawowyDniEl.textContent = pracownik.getTotalRemainingPodstawowy();
    if (urlopDodatkowyDniEl) urlopDodatkowyDniEl.textContent = pracownik.getTotalRemainingDodatkowy();
    if (wykorzystanieProcentEl) wykorzystanieProcentEl.textContent = pracownik.obliczWykorzystanie();
    
    aktualizujRozbicieNaLata();
    aktualizujWykresUrlopu();
}

function aktualizujHistorieUrlopow() {
    if (!historiaUrlopowList) return;

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
            case 'l4': typTekst = 'Zwolnienie Lekarskie (L4)'; break;
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
            <div class="historia-actions">
                <button class="edit-btn" data-id="${urlop.id}">Edytuj</button>
                <button class="delete-btn" data-id="${urlop.id}">Usuń</button>
            </div>
        `;
        historiaUrlopowList.appendChild(listItem);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const idToEdit = event.target.dataset.id;
            const urlopToEdit = pracownik.historiaUrlopow.find(u => u.id === idToEdit);
            if (urlopToEdit) {
                if (typUrlopuSelect) typUrlopuSelect.value = urlopToEdit.typ;
                if (liczbaDniInput) liczbaDniInput.value = urlopToEdit.dni;
                if (dataRozpoczeciaInput) dataRozpoczeciaInput.value = urlopToEdit.od;
                if (adnotacjeInput) adnotacjeInput.value = urlopToEdit.adnotacje || '';
                
                const submitButton = urlopForm.querySelector('button[type="submit"]');
                if (submitButton) submitButton.textContent = 'Zapisz zmiany (Edycja)';
                if (urlopForm) urlopForm.dataset.editingId = idToEdit; 
                if (messageEl) wyswietlKomunikat(messageEl, 'Edytujesz istniejący wpis. Zmień dane i kliknij "Zapisz zmiany".', 'info');
                
                const editFormSection = document.getElementById('urlopForm');
                if (editFormSection) {
                    editFormSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const idToDelete = event.target.dataset.id;
            if (confirm('Czy na pewno chcesz usunąć ten wpis urlopu? Tej operacji nie można cofnąć!')) {
                const wynikUsuniecia = pracownik.usunUrlop(idToDelete);
                if (wynikUsuniecia.success) {
                    wyswietlKomunikat(messageEl, wynikUsuniecia.message, 'success');
                    aktualizujStanUrlopow();
                    aktualizujHistorieUrlopow();
                    const editingId = urlopForm.dataset.editingId;
                    if (editingId === idToDelete) {
                        urlopForm.reset();
                        const submitButton = urlopForm.querySelector('button[type="submit"]');
                        if (submitButton) submitButton.textContent = 'Zgłoś Urlop';
                        delete urlopForm.dataset.editingId;
                    }

                } else {
                    wyswietlKomunikat(messageEl, wynikUsuniecia.message, 'error');
                }
            }
        });
    });
}

function aktualizujRozbicieNaLata() {
    if (!urlopRozbicieNaLataEl) return;

    urlopRozbicieNaLataEl.innerHTML = ''; 

    if (pracownik.konfiguracjeUrlopow.size === 0) {
        urlopRozbicieNaLataEl.innerHTML = '<p>Brak skonfigurowanych urlopów dla poszczególnych lat.</p>';
        return;
    }

    const posortowaneLata = Array.from(pracownik.konfiguracjeUrlopow.keys()).sort((a, b) => a - b);

    let anyYearDisplayed = false;

    posortowaneLata.forEach(rok => {
        const config = pracownik.konfiguracjeUrlopow.get(rok);
        
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

    if (!anyYearDisplayed) {
        urlopRozbicieNaLataEl.innerHTML = '<p>Brak dostępnych dni urlopu w konfiguracji rocznej.</p>';
    }
}

function aktualizujWykresUrlopu() {
    if (!urlopChartCanvas) return;

    const totalInitial = pracownik.getTotalInitialPodstawowy() + pracownik.getTotalInitialDodatkowy();
    const totalRemaining = pracownik.getTotalRemainingPodstawowy() + pracownik.getTotalRemainingDodatkowy();
    const totalUsed = totalInitial - totalRemaining;

    const ctx = urlopChartCanvas.getContext('2d');

    if (urlopChartInstance) {
        urlopChartInstance.destroy();
    }
    
    if (totalInitial === 0 && totalUsed === 0 && totalRemaining === 0) {
        ctx.clearRect(0, 0, urlopChartCanvas.width, urlopChartCanvas.height);
        return;
    }

    urlopChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Wykorzystany urlop', 'Pozostały urlop'],
            datasets: [{
                data: [totalUsed, totalRemaining],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
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
                        color: '#f0f0f0'
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
    if (!selectYearEl) return;

    const currentYear = new Date().getFullYear(); 
    const startYear = currentYear - 10;
    const endYear = currentYear + 1;

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
    
    zaktualizujEtykietyRoku();
}

function zaktualizujEtykietyRoku() {
    if (!selectYearEl || !initialPodstawowyInput || !initialDodatkowyInput) return;

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


if (configForm) {
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
            wyswietlKomunikat(configMessageEl, 'Zmiana konfiguracji anulowana.', 'info');
            return;
        }

        pracownik.ustawKonfiguracje(initialPodstawowy, initialDodatkowy, selectedYear);

        aktualizujStanUrlopow();
        aktualizujHistorieUrlopow();
        wyswietlKomunikat(configMessageEl, `Konfiguracja urlopów za rok ${selectedYear} zaktualizowana pomyślnie.`, 'success');
    });
}

if (selectYearEl) {
    selectYearEl.addEventListener('change', zaktualizujEtykietyRoku);
}


if (urlopForm) {
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
        if (!dataRozpoczecia) {
            wyswietlKomunikat(messageEl, 'Proszę wybrać datę rozpoczęcia.', 'error');
            return;
        }

        if ((typUrlopu === 'podstawowy' || typUrlopu === 'dodatkowy') && pracownik.konfiguracjeUrlopow.size === 0) {
            wyswietlKomunikat(messageEl, 'Najpierw ustaw początkową liczbę dni urlopu w sekcji "Konfiguracja Urlopów" dla co najmniej jednego roku.', 'error');
            return;
        }
        
        let wynik;
        const editingId = urlopForm.dataset.editingId;
        
        if (editingId) {
            wynik = pracownik.modyfikujUrlop(editingId, typUrlopu, liczbaDni, dataRozpoczecia, adnotacje);
        } else {
            wynik = pracownik.zglosUrlop(typUrlopu, liczbaDni, dataRozpoczecia, adnotacje);
        }

        if (wynik.success) {
            wyswietlKomunikat(messageEl, wynik.message, 'success');
            urlopForm.reset();
            const submitButton = urlopForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.textContent = 'Zgłoś Urlop';
            delete urlopForm.dataset.editingId;

        } else {
            wyswietlKomunikat(messageEl, wynik.message, 'error');
        }

        aktualizujStanUrlopow();
        aktualizujHistorieUrlopow();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    pracownik.loadData();
    wypelnijSelectLatami();
    aktualizujStanUrlopow();
    aktualizujHistorieUrlopow();
});