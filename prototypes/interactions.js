/* CJX Stage Animations & Interactions */

document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initCjxAnimations();
  initStarRating();
  initBudgetSlider();
  initFilterToggle();
  initTabNavigation();
  initLiveFeedSimulation();
});

function initThemeToggle() {
  var savedTheme = localStorage.getItem('agent-foundry-theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateToggleIcons();

  var toggleButtons = document.querySelectorAll('.theme-toggle');
  toggleButtons.forEach(function (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var currentTheme = document.documentElement.getAttribute('data-theme');
      var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('agent-foundry-theme', newTheme);
      updateToggleIcons();
    });
  });
}

function updateToggleIcons() {
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var toggleButtons = document.querySelectorAll('.theme-toggle');
  toggleButtons.forEach(function (toggleBtn) {
    var icon = toggleBtn.querySelector('.theme-toggle-icon');
    var label = toggleBtn.querySelector('.theme-toggle-label');
    if (icon) icon.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  });
}

function initCjxAnimations() {
  const entranceElements = document.querySelectorAll('[data-cjx-entrance]');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  entranceElements.forEach(function (element) {
    element.style.animationPlayState = 'paused';
    observer.observe(element);
  });
}

function initStarRating() {
  const starContainers = document.querySelectorAll('.rating-stars-interactive');
  starContainers.forEach(function (container) {
    const stars = container.querySelectorAll('.star');
    stars.forEach(function (star, index) {
      star.addEventListener('click', function () {
        stars.forEach(function (starItem, starIndex) {
          if (starIndex <= index) {
            starItem.classList.add('selected');
          } else {
            starItem.classList.remove('selected');
          }
        });
      });

      star.addEventListener('mouseenter', function () {
        stars.forEach(function (starItem, starIndex) {
          if (starIndex <= index) {
            starItem.style.color = '#F59E0B';
          } else {
            starItem.style.color = '';
          }
        });
      });

      star.addEventListener('mouseleave', function () {
        stars.forEach(function (starItem) {
          if (!starItem.classList.contains('selected')) {
            starItem.style.color = '';
          }
        });
      });
    });
  });
}

function initBudgetSlider() {
  const slider = document.getElementById('budget-slider');
  const preview = document.getElementById('budget-preview');
  if (slider && preview) {
    slider.addEventListener('input', function () {
      const value = slider.value;
      preview.textContent = 'This task will likely cost ~$' + value + ' based on similar tasks';
    });
  }
}

function initFilterToggle() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function (filterBtn) {
    filterBtn.addEventListener('click', function () {
      filterBtn.classList.toggle('active');
    });
  });
}

function initTabNavigation() {
  const tabGroups = document.querySelectorAll('.tab-group');
  tabGroups.forEach(function (group) {
    const tabs = group.querySelectorAll('.tab-item');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (tabItem) {
          tabItem.classList.remove('active');
        });
        tab.classList.add('active');
      });
    });
  });
}

function initLiveFeedSimulation() {
  const feed = document.querySelector('.live-feed');
  if (!feed || !feed.dataset.simulate) return;

  const messages = [
    { time: '10:30:23', msg: 'Agent started analyzing code...', type: '' },
    { time: '10:30:45', msg: 'Found 3 bugs in auth module', type: '' },
    { time: '10:30:46', msg: 'Tool: code_interpreter', type: 'tool-call' },
    { time: '10:30:47', msg: 'Command: python analyze_code.py', type: 'tool-call' },
    { time: '10:31:02', msg: 'Writing test cases...', type: '' },
    { time: '10:31:30', msg: 'Task completed in 67 seconds', type: 'success' },
  ];

  let messageIndex = 0;

  function addMessage() {
    if (messageIndex >= messages.length) return;
    const messageData = messages[messageIndex];
    const entry = document.createElement('div');
    entry.className = 'feed-entry ' + messageData.type;
    entry.innerHTML = '<span class="feed-timestamp">[' + messageData.time + ']</span><span class="feed-message">' + messageData.msg + '</span>';
    entry.style.opacity = '0';
    feed.appendChild(entry);

    requestAnimationFrame(function () {
      entry.style.transition = 'opacity 0.3s ease';
      entry.style.opacity = '1';
    });

    feed.scrollTop = feed.scrollHeight;
    messageIndex++;
    setTimeout(addMessage, 1500 + Math.random() * 1000);
  }

  setTimeout(addMessage, 1000);
}
