import { Offer } from '../types';

export function injectWeb3Connect(html: string, offer: Offer, campaignId: string): string {
  if (offer.vertical !== 'crypto' && offer.vertical !== 'web3' && offer.vertical !== 'trading' && offer.vertical !== 'finance') {
    return html;
  }

  const web3Script = `
<script>
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a');
  links.forEach(a => {
    // Clone node to remove existing click listeners (like the default beacon)
    const newA = a.cloneNode(true);
    a.parentNode.replaceChild(newA, a);
    
    newA.addEventListener('click', async (e) => {
      e.preventDefault();
      const targetUrl = newA.getAttribute('href') || '#';
      
      const urlParams = new URLSearchParams(window.location.search);
      const clickId = urlParams.get('click_id') || '';
      const variant = window.location.pathname.includes('/v2') ? 'v2' : 'v1';
      const baseCampaignId = "${campaignId}".split('/')[0];
      
      let walletAddress = '';
      
      if (typeof window.ethereum !== 'undefined') {
        try {
          // 1. Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          walletAddress = accounts[0] || '';
        } catch (err) {
          console.warn('MetaMask connection failed or rejected.', err);
        }
      }
      
      // 3. Send analytics beacon
      const workerBaseUrl = "${process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev'}";
      const beaconUrl = \`\${workerBaseUrl}/click?click_id=\${clickId}&variant=\${variant}&campaign_id=\${baseCampaignId}\${walletAddress ? '&wallet_address=' + walletAddress : ''}\`;
      navigator.sendBeacon(beaconUrl);
      
      // 4. Redirect user
      if (walletAddress && targetUrl.includes('?')) {
        window.location.href = targetUrl + '&wallet=' + walletAddress;
      } else if (walletAddress) {
        window.location.href = targetUrl + '?wallet=' + walletAddress;
      } else {
        window.location.href = targetUrl;
      }
    });
  });
});
</script>
  `;

  if (html.includes('</body>')) {
    return html.replace('</body>', `\n${web3Script}\n</body>`);
  }
  return html + web3Script;
}
