try {
  var saved = JSON.parse(localStorage.getItem("cadence-settings"));
  var theme = saved && saved.state && saved.state.theme;
  if (theme === "light" || theme === "cream" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
} catch (e) {
  /* no saved settings yet: the defaults apply */
}