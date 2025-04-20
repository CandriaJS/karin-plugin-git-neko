document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.repo-language').forEach(el => {
    const lang = el.textContent.trim().toLowerCase()
    console.log(lang)
    el.style.setProperty('--lang-color', LanguageColors[lang] || '#cccccc')
  })
})