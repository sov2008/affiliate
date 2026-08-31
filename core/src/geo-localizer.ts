export function generateGeoRouterScript(currentGeo: string, allGeos: string[]): string {
  if (allGeos.length <= 1) return '';
  
  return `
<script>
(function(){
  try {
    const lang = (navigator.language || navigator.userLanguage).split('-')[0].toUpperCase();
    const availableGeos = ${JSON.stringify(allGeos)};
    const current = "${currentGeo}";
    
    // Only suggest if the language matches an available geo, and it's not the current one
    if (lang !== current && availableGeos.includes(lang)) {
      // Suggest redirection or auto-redirect
      const doRedirect = confirm("We noticed your browser language is " + lang + ". Would you like to view the localized version?");
      if (doRedirect) {
        // Simple replace in URL (assuming campaign structure like cmp_name_DE)
        window.location.href = window.location.href.replace("_" + current, "_" + lang);
      }
    }
  } catch (e) {
    console.error("Geo-localization error:", e);
  }
})();
</script>
  `.trim();
}
