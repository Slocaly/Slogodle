try {
  var v = localStorage.getItem('logodle_dark_v1');
  document.documentElement.dataset.theme = v === '1' ? 'dark' : 'light';
} catch (e) {}
