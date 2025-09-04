// Dark Mode Toggle Functionality
class DarkModeController {
    constructor() {
        this.init();
    }

    init() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        // Setup toggle button event listener
        this.setupToggleButton();
        
        // Listen for system theme changes
        this.listenForSystemThemeChanges();
    }

    setupToggleButton() {
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleButton(theme);
    }

    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateToggleButton(theme) {
        const toggleButton = document.getElementById('theme-toggle');
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');

        if (toggleButton && sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
                toggleButton.setAttribute('title', 'التبديل إلى الوضع الفاتح');
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
                toggleButton.setAttribute('title', 'التبديل إلى الوضع الداكن');
            }
        }
    }

    listenForSystemThemeChanges() {
        // Listen for system dark mode preference changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // Only apply system theme if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Method to apply theme based on system preference if no saved preference
    applySystemTheme() {
        if (!localStorage.getItem('theme')) {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            this.setTheme(systemTheme);
        }
    }
}

// Initialize dark mode controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DarkModeController();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeController;
}