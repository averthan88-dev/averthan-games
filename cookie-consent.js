/* Cookie Consent Banner for Averthan Games
   Include this script on every page: <script src="/cookie-consent.js"></script>
   or with relative path: <script src="../cookie-consent.js"></script> */
(function(){
  if(document.cookie.indexOf('av_cookie_consent=')!==-1) return;

  var overlay=document.createElement('div');
  overlay.id='cookieConsentBanner';
  overlay.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:rgba(10,10,26,0.97);border-top:1px solid rgba(108,92,231,0.3);padding:16px 24px;font-family:Nunito,sans-serif;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;backdrop-filter:blur(10px);';

  var text=document.createElement('p');
  text.style.cssText='color:#c0c0c0;font-size:14px;margin:0;max-width:600px;line-height:1.5;';
  text.innerHTML='We use cookies to save your game progress and display ads via Google AdSense. By clicking "Accept All", you consent to all cookies. See our <a href="/cookie-policy.html" style="color:#a29bfe;">Cookie Policy</a> for details.';

  var btnWrap=document.createElement('div');
  btnWrap.style.cssText='display:flex;gap:10px;flex-shrink:0;';

  var acceptBtn=document.createElement('button');
  acceptBtn.textContent='Accept All';
  acceptBtn.style.cssText='padding:10px 24px;border-radius:10px;border:none;background:linear-gradient(135deg,#6c5ce7,#a29bfe);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:Nunito,sans-serif;white-space:nowrap;';

  var essentialBtn=document.createElement('button');
  essentialBtn.textContent='Essential Only';
  essentialBtn.style.cssText='padding:10px 24px;border-radius:10px;border:1px solid rgba(108,92,231,0.4);background:transparent;color:#a29bfe;font-size:14px;font-weight:700;cursor:pointer;font-family:Nunito,sans-serif;white-space:nowrap;';

  function setConsent(val){
    var exp=new Date(Date.now()+365*86400000).toUTCString();
    document.cookie='av_cookie_consent='+val+';expires='+exp+';path=/;SameSite=Lax';
    overlay.remove();
  }

  acceptBtn.onclick=function(){ setConsent('all'); };
  essentialBtn.onclick=function(){ setConsent('essential'); };

  btnWrap.appendChild(acceptBtn);
  btnWrap.appendChild(essentialBtn);
  overlay.appendChild(text);
  overlay.appendChild(btnWrap);
  document.body.appendChild(overlay);
})();
