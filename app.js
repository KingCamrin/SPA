// Dictionary SPA Application
class DictionaryApp {
    constructor() {
        this.apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
        this.initializeElements();
        this.attachEventListeners();
    }

    // Initialize DOM elements
    initializeElements() {
        this.searchForm = document.getElementById('search-form');
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.loadingSection = document.getElementById('loading');
        this.resultsSection = document.getElementById('results-section');
        this.errorSection = document.getElementById('error-section');
        this.wordTitle = document.getElementById('word-title');
        this.phoneticText = document.getElementById('phonetic-text');
        this.definitionsContainer = document.getElementById('definitions-container');
        this.errorText = document.getElementById('error-text');
    }

    // Attach event listeners
    attachEventListeners() {
        this.searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        
        // Add enter key support for search input
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch(e);
            }
        });

        // Add input validation
        this.searchInput.addEventListener('input', () => this.validateInput());
    }

    // Validate search input
    validateInput() {
        const value = this.searchInput.value.trim();
        this.searchBtn.disabled = value.length === 0;
    }

    // Handle search form submission
    async handleSearch(event) {
        event.preventDefault();
        
        const searchTerm = this.searchInput.value.trim();
        if (!searchTerm) {
            this.showError('Please enter a word to search.');
            return;
        }

        // Show loading state
        this.showLoading();
        
        try {
            const data = await this.fetchWordData(searchTerm);
            this.displayResults(data);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Word not found. Please try a different word.');
        }
    }

    // Fetch word data from API
    async fetchWordData(word) {
        const response = await fetch(this.apiUrl + encodeURIComponent(word));
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    }

    // Display search results
    displayResults(data) {
        if (!data || data.length === 0) {
            this.showError('No results found.');
            return;
        }

        const wordData = data[0]; // Use first result
        
        // Hide loading and error sections
        this.hideAllSections();
        
        // Display word title
        this.wordTitle.textContent = wordData.word || 'Unknown';
        
        // Display phonetic information
        this.displayPhonetics(wordData.phonetics || []);
        
        // Display definitions
        this.displayDefinitions(wordData.meanings || []);
        
        // Show results section
        this.resultsSection.classList.remove('hidden');
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Display phonetic information
    displayPhonetics(phonetics) {
        let phoneticText = '';

        // Find phonetic text
        for (const phonetic of phonetics) {
            if (phonetic.text && !phoneticText) {
                phoneticText = phonetic.text;
            }
        }

        // Display phonetic text
        if (phoneticText) {
            this.phoneticText.textContent = phoneticText;
        } else {
            this.phoneticText.textContent = '';
        }
    }

    // Display word definitions
    displayDefinitions(meanings) {
        this.definitionsContainer.innerHTML = '';

        if (meanings.length === 0) {
            this.definitionsContainer.innerHTML = '<p>No definitions available.</p>';
            return;
        }

        meanings.forEach(meaning => {
            const definitionGroup = this.createDefinitionGroup(meaning);
            this.definitionsContainer.appendChild(definitionGroup);
        });
    }

    // Create definition group element
    createDefinitionGroup(meaning) {
        const group = document.createElement('div');
        group.className = 'definition-group';



        // Definitions list
        if (meaning.definitions && meaning.definitions.length > 0) {
            const definitionsList = document.createElement('ul');
            definitionsList.className = 'definition-list';

            meaning.definitions.forEach((def, index) => {
                if (index < 3) { // Limit to 3 definitions per part of speech
                    const listItem = this.createDefinitionItem(def);
                    definitionsList.appendChild(listItem);
                }
            });

            group.appendChild(definitionsList);
        }

        return group;
    }

    // Create individual definition item
    createDefinitionItem(definition) {
        const listItem = document.createElement('li');
        listItem.className = 'definition-item';

        // Definition text
        const defText = document.createElement('div');
        defText.className = 'definition-text';
        defText.textContent = definition.definition || 'No definition available';
        listItem.appendChild(defText);

        // Example (if available)
        if (definition.example) {
            const example = document.createElement('div');
            example.className = 'example-text';
            example.textContent = definition.example;
            listItem.appendChild(example);
        }

        return listItem;
    }

    // Show loading state
    showLoading() {
        this.hideAllSections();
        this.loadingSection.classList.remove('hidden');
    }

    // Show error message
    showError(message) {
        this.hideAllSections();
        this.errorText.textContent = message;
        this.errorSection.classList.remove('hidden');
    }

    // Hide all result sections
    hideAllSections() {
        this.loadingSection.classList.add('hidden');
        this.resultsSection.classList.add('hidden');
        this.errorSection.classList.add('hidden');
    }
}

// Utility Functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new DictionaryApp();
    
    // Add some sample searches for demo
    const searchInput = document.getElementById('search-input');
    const sampleWords = ['hello', 'beautiful', 'serendipity', 'eloquent', 'adventure'];
    
    // Add placeholder rotation
    let currentWordIndex = 0;
    setInterval(() => {
        if (searchInput.value === '') {
            searchInput.placeholder = `Try searching for "${sampleWords[currentWordIndex]}"...`;
            currentWordIndex = (currentWordIndex + 1) % sampleWords.length;
        }
    }, 3000);

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search input when pressing '/' key
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Clear search with Escape key
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.blur();
        }
    });

    console.log('Dictionary SPA initialized successfully!');
});


