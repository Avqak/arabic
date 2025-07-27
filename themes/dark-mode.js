// Dark Mode Toggle Functionality
class DarkModeToggle {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    // Set initial theme immediately
    this.setTheme(this.theme);
    
    // Add event listeners
    this.addEventListeners();
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.theme = theme;
    this.updateToggleButton();
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  updateToggleButton() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const sunIcon = toggleBtn.querySelector('.sun-icon');
    const moonIcon = toggleBtn.querySelector('.moon-icon');

    if (this.theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
      toggleBtn.setAttribute('title', 'التبديل إلى الوضع الفاتح');
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
      toggleBtn.setAttribute('title', 'التبديل إلى الوضع الداكن');
    }
  }

  addEventListeners() {
    // Theme toggle button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#theme-toggle')) {
        this.toggleTheme();
      }
    });

    // Keyboard shortcut (Ctrl/Cmd + J)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
}

// Prevent flash of unstyled content by applying theme immediately
(function() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
})();

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DarkModeToggle();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DarkModeToggle();
  });
} else {
  new DarkModeToggle();
} 