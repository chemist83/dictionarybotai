document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('wordInput');
    const searchButton = document.getElementById('searchButton');
    const resultBox = document.getElementById('resultBox');

    searchButton.addEventListener('click', searchWord);
    wordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchWord();
        }
    });

    async function searchWord() {
        const word = wordInput.value.trim().toLowerCase();
        if (word === '') {
            displayMessage("Please enter a word.");
            return;
        }

        resultBox.innerHTML = '<div class="loader"></div>'; // Yükleme spinner'ını göster
        document.querySelector('.loader').style.display = 'block'; // Spinner'ı görünür yap

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

            // API'den 404 (Not Found) hatası gelirse
            if (!response.ok) {
                if (response.status === 404) {
                    displayMessage(`Sorry, we couldn't find '${word}'. Please check the spelling or try another word.`, 'error');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }

            const data = await response.json();
            displayResults(data);

        } catch (error) {
            console.error('Error fetching dictionary data:', error);
            displayMessage('An error occurred while fetching the definition. Please try again later.', 'error');
        } finally {
            document.querySelector('.loader').style.display = 'none'; // Spinner'ı gizle
        }
    }

    function displayResults(data) {
        resultBox.innerHTML = ''; // Önceki sonuçları temizle

        if (!data || data.length === 0) {
            displayMessage('No definitions found for this word.', 'error');
            return;
        }

        // Genellikle ilk eleman en alakalı tanımdır
        const entry = data[0];

        const wordTitle = document.createElement('h3');
        wordTitle.textContent = entry.word;
        resultBox.appendChild(wordTitle);

        if (entry.phonetics && entry.phonetics.length > 0) {
            entry.phonetics.forEach(p => {
                if (p.text) {
                    const phoneticText = document.createElement('p');
                    phoneticText.classList.add('phonetic');
                    phoneticText.textContent = p.text;
                    resultBox.appendChild(phoneticText);
                }
                // Ses dosyasını da ekleyebiliriz
                if (p.audio) {
                    const audio = document.createElement('audio');
                    audio.controls = true;
                    const source = document.createElement('source');
                    source.src = p.audio;
                    source.type = 'audio/mpeg'; // Veya diğer uygun tür
                    audio.appendChild(source);
                    resultBox.appendChild(audio);
                }
            });
        }

        if (entry.meanings && entry.meanings.length > 0) {
            entry.meanings.forEach(meaning => {
                const partOfSpeech = document.createElement('h4');
                partOfSpeech.textContent = meaning.partOfSpeech;
                resultBox.appendChild(partOfSpeech);

                const definitionList = document.createElement('ol');
                definitionList.classList.add('definition-list');

                meaning.definitions.forEach(def => {
                    const listItem = document.createElement('li');
                    listItem.textContent = def.definition;
                    if (def.example) {
                        const example = document.createElement('p');
                        example.classList.add('example');
                        example.textContent = `"${def.example}"`;
                        listItem.appendChild(example);
                    }
                    definitionList.appendChild(listItem);
                });
                resultBox.appendChild(definitionList);
            });
        } else {
            displayMessage('No definitions found for this word.', 'error');
        }
    }

    function displayMessage(message, type = '') {
        resultBox.innerHTML = `<p class="initial-message ${type}">${message}</p>`;
    }
});
