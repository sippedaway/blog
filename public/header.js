document.addEventListener('DOMContentLoaded', () => {

  const headerHTML = `
    <header>
      <h1 onclick="window.location.href='/'">sipped/blog</h1>
      <div class="social-icons">
        <a href="https://sipped.org" class="social-icon" title="Website"><i class="fas fa-globe"></i><span>Personal website</span></a>
        <a href="https://github.com/sippedaway" class="social-icon" title="GitHub"><i class="fab fa-github"></i><span>GitHub</span></a>
        <a href="https://discord.com/users/1270801870163546194" class="social-icon" title="Discord"><i class="fab fa-discord"></i><span>Discord</span></a>
        <a href="https://ko-fi.com/sipped" class="social-icon" title="Ko-fi"><i class="fas fa-coffee"></i><span>Ko-fi</span></a>
        <a href="#" id="email-button" class="social-icon" title="Email"><i class="fas fa-envelope"></i><span>Email</span></a>
      </div>
      <button id="options-button">Options</button>
    </header>
    <div id="popup-overlay" class="popup-overlay hidden"></div>
    <div id="options-popup" class="popup hidden">
      <div class="popup-content">
        <span class="close">&times;</span>
        <h2>Theme</h2>
        <p style="margin:0;">Choose one of the theme presets:</p>
        <div class="theme-buttons">
          <button class="theme-button" data-theme="basic-light">Basic Light</button>
          <button class="theme-button" data-theme="basic-dark">Basic Dark</button>
          <button class="theme-button" data-theme="midnight">Midnight</button>
          <button class="theme-button" data-theme="earth">Earth</button>
          <button class="theme-button" data-theme="soft">Soft</button>
        </div>
        <hr style="width: 100%; border: 1px solid var(--grayed-out)">
        <p style="margin:0;">Or create a custom theme:</p>
        <label for="primary-color">Primary Color:</label>
        <input type="color" id="primary-color" name="primary-color" value="#007bff">
        <label for="background-color">Background Color:</label>
        <input type="color" id="background-color" name="background-color" value="#f9f9f9">
        <label for="text-color">Text Color:</label>
        <input type="color" id="text-color" name="text-color" value="#333">
        <label for="gray-color">Gray Color:</label>
        <input type="color" id="gray-color" name="gray-color" value="#f0f0f0">
        <button id="save-colors">Apply custom theme</button>
      </div>
    </div>
    <div id="email-popup" class="popup hidden">
      <div class="popup-content">
        <span id="emailclose-button" class="close">&times;</span>
        <h2>Contact me!</h2>
        <p>There are a few ways to contact me, whether it's to talk about something, ask a question or help with a project...</p>
        <p>Feel free to send me an email:</p>
        <button id="personal-email">Personal email</button>
        <p>hello@sipped.org</p>
        <hr style="width: 100%; border: 1px solid var(--grayed-out)">
        <p>Or if it's business related:</p>
        <button id="business-email">Business Email</button>
        <p>business@sipped.org</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  const optionsButton = document.getElementById('options-button');
  const optionsPopup = document.getElementById('options-popup');
  const closePopup = document.querySelector('.close');
  const popupOverlay = document.getElementById('popup-overlay');
  const saveColorsButton = document.getElementById('save-colors');
  const themeButtons = document.querySelectorAll('.theme-button');
  const emailButton = document.getElementById('email-button');
  const emailPopup = document.getElementById('email-popup');
  const personalEmailButton = document.getElementById('personal-email');
  const businessEmailButton = document.getElementById('business-email');
  const emailCloseButton = document.getElementById('emailclose-button');

  const themes = {
    'basic-light': {
      '--primary-color': '#007bff',
      '--background-color': '#f9f9f9',
      '--text-color': '#333',
      '--grayed-out': '#f0f0f0'
    },
    'basic-dark': {
      '--primary-color': '#007bff',
      '--background-color': '#333',
      '--text-color': '#eee',
      '--grayed-out': '#5e5e5e'
    },
    'midnight': {
      '--primary-color': '#007bff',
      '--background-color': '#1a1a2e',
      '--text-color': '#e3e3e3',
      '--grayed-out': '#3a3a52'
    },
    'earth': {
      '--primary-color': '#4caf50', 
      '--background-color': '#f5f5dc', 
      '--text-color': '#8b4513', 
      '--grayed-out': '#d2b48c' 
    },
    'soft': {
      '--primary-color': '#add8e6', 
      '--background-color': '#ffb6c1', 
      '--text-color': '#333', 
      '--grayed-out': '#f0f8ff' 
    }
  };

  function applyTheme(theme) {
    const themeColors = themes[theme];
    for (const [key, value] of Object.entries(themeColors)) {
      document.documentElement.style.setProperty(key, value);
    }
    localStorage.setItem('theme', theme);
    highlightSelectedTheme(theme);
  }

  function highlightSelectedTheme(theme) {
    themeButtons.forEach(button => {
      button.classList.toggle('selected', button.dataset.theme === theme);
    });
  }

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.dataset.theme;
      applyTheme(theme);
      localStorage.setItem('theme', theme); 
    });
  });

  optionsButton.addEventListener('click', () => {
    optionsPopup.classList.remove('hidden');
    popupOverlay.classList.remove('hidden');
  });

  closePopup.addEventListener('click', () => {
    optionsPopup.classList.add('hidden');
    popupOverlay.classList.add('hidden');
  });

  emailButton.addEventListener('click', () => {
    emailPopup.classList.remove('hidden');
    popupOverlay.classList.remove('hidden');
  });

  emailCloseButton.addEventListener('click', () => {
    emailPopup.classList.add('hidden');
    popupOverlay.classList.add('hidden');
  });

  personalEmailButton.addEventListener('click', () => {
    window.location.href = 'mailto:hello@sipped.org';
  });

  businessEmailButton.addEventListener('click', () => {
    window.location.href = 'mailto:business@sipped.org';
  });

  saveColorsButton.addEventListener('click', () => {
    const primaryColor = document.getElementById('primary-color').value;
    const backgroundColor = document.getElementById('background-color').value;
    const textColor = document.getElementById('text-color').value;
    const grayColor = document.getElementById('gray-color').value;

    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--grayed-out', grayColor);

    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    localStorage.setItem('textColor', textColor);
    localStorage.setItem('grayColor', grayColor);
    localStorage.setItem('theme', 'custom'); 

    optionsPopup.classList.add('hidden');
    popupOverlay.classList.add('hidden');
    highlightSelectedTheme('custom');
  });

  const savedTheme = localStorage.getItem('theme') || 'basic-dark';
  if (savedTheme in themes) {
    applyTheme(savedTheme);
  } else {
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    const savedBackgroundColor = localStorage.getItem('backgroundColor');
    const savedTextColor = localStorage.getItem('textColor');
    const savedGrayColor = localStorage.getItem('grayColor');

    if (savedPrimaryColor) {
      document.documentElement.style.setProperty('--primary-color', savedPrimaryColor);
      document.getElementById('primary-color').value = savedPrimaryColor;
    }
    if (savedBackgroundColor) {
      document.documentElement.style.setProperty('--background-color', savedBackgroundColor);
      document.getElementById('background-color').value = savedBackgroundColor;
    }
    if (savedTextColor) {
      document.documentElement.style.setProperty('--text-color', savedTextColor);
      document.getElementById('text-color').value = savedTextColor;
    }
    if (savedGrayColor) {
      document.documentElement.style.setProperty('--grayed-out', savedGrayColor);
      document.getElementById('gray-color').value = savedGrayColor;
    }
    highlightSelectedTheme('custom');
  }
});