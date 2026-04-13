#!/usr/bin/env node
/**
 * 🔥 Static Site Cloner v61.0.0 — TECHNOZIS PERFECT CLONE
 *
 * FIXES in v61:
 *  1. Inactive cards NOW VISIBLE: subtle dark bg + dim border so all 3 cards
 *     are always shown side-by-side. Only active card gets bright border + image + body.
 *  2. Detail sections STRICT ROW: text always LEFT, image always RIGHT,
 *     never stacked vertically. Enforced via inline styles (not just classes)
 *     so page CSS can't override it.
 */

const puppeteer = require("puppeteer");
const fs        = require("fs-extra");
const path      = require("path");
const axios     = require("axios");
const prettier  = require("prettier");
const { URL }   = require("url");

// ─────────────────────────────────────────────────────────────
//  LEGAL PAGES
// ─────────────────────────────────────────────────────────────
const LEGAL = {
  terms: {
    slug: "/terms-and-conditions",
    title: "Terms & Conditions | Technozis",
    body: `<div style="max-width:800px;margin:60px auto 80px;padding:40px 30px;font-family:'Segoe UI',system-ui,sans-serif;background:#fff;border-radius:12px;color:#1a1a1a;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <h1 style="font-size:1.9rem;font-weight:800;color:#1a1a1a;margin-bottom:8px;text-align:center;">Terms &amp; Conditions</h1>
  <p style="color:#666;text-align:center;font-size:13px;margin-bottom:28px;border-bottom:1px solid #e5e7eb;padding-bottom:20px;">Last updated: 2025</p>
  <p style="color:#444;line-height:1.8;margin-bottom:24px;">Welcome to Technozis. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions:</p>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">1. Use of Website</h2><p style="color:#444;line-height:1.8;margin:0;">The content provided on this website is for general information purposes only. We reserve the right to modify or remove content without notice.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">2. Intellectual Property</h2><p style="color:#444;line-height:1.8;margin:0;">All content, trademarks, logos, and graphics are the property of Technozis or its licensors and are protected by applicable intellectual property laws.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">3. Client Engagement</h2><p style="color:#444;line-height:1.8;margin:0;">All client engagements for staffing or project delivery are governed by individual agreements, which will supersede the general terms stated here.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">4. Third-Party Links</h2><p style="color:#444;line-height:1.8;margin:0;">Our website may contain links to third-party websites. We do not endorse or accept responsibility for the content or use of these websites.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">5. Limitation of Liability</h2><p style="color:#444;line-height:1.8;margin:0;">Technozis shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use of our services or website.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">6. Governing Law</h2><p style="color:#444;line-height:1.8;margin:0;">These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Gurugram, Haryana.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">7. Changes to Terms</h2><p style="color:#444;line-height:1.8;margin:0;">We reserve the right to update these terms at any time. Continued use constitutes acceptance of the revised terms.</p></div>
  <p style="color:#888;font-size:13px;margin-top:32px;text-align:center;border-top:1px solid #e5e7eb;padding-top:16px;">Questions? <a href="/contact" style="color:#2563eb;">Contact Us</a> &nbsp;|&nbsp; <a href="/privacy-policy" style="color:#2563eb;">Privacy Policy</a></p>
</div>`,
  },
  privacy: {
    slug: "/privacy-policy",
    title: "Privacy Policy | Technozis",
    body: `<div style="max-width:800px;margin:60px auto 80px;padding:40px 30px;font-family:'Segoe UI',system-ui,sans-serif;background:#fff;border-radius:12px;color:#1a1a1a;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <h1 style="font-size:1.9rem;font-weight:800;color:#1a1a1a;margin-bottom:8px;text-align:center;">Privacy Policy</h1>
  <p style="color:#666;text-align:center;font-size:13px;margin-bottom:28px;border-bottom:1px solid #e5e7eb;padding-bottom:20px;">Last updated: 2025</p>
  <p style="color:#444;line-height:1.8;margin-bottom:24px;">At Technozis, we are committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and safeguard your data.</p>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">1. Information We Collect</h2><p style="color:#444;line-height:1.8;margin:0;">We collect information you provide directly — name, email, phone — when you contact us, apply for a job, or use our services. We may also collect usage data and cookies.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">2. How We Use Your Information</h2><p style="color:#444;line-height:1.8;margin:0;">We use your information to provide services, respond to inquiries, send relevant communications, and improve our website. We do not sell your personal data to third parties.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">3. Data Security</h2><p style="color:#444;line-height:1.8;margin:0;">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">4. Cookies</h2><p style="color:#444;line-height:1.8;margin:0;">Our website uses cookies to enhance your experience. You can disable cookies through your browser settings, though this may affect some functionality.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">5. Third-Party Services</h2><p style="color:#444;line-height:1.8;margin:0;">We may use third-party tools (analytics, CRM) that process data on our behalf. These are bound by their own privacy policies and our data processing agreements.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">6. Your Rights</h2><p style="color:#444;line-height:1.8;margin:0;">You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:careers@technozis.com" style="color:#2563eb;">careers@technozis.com</a>.</p></div>
  <div style="border-left:4px solid #2563eb;padding-left:16px;margin:24px 0;"><h2 style="font-size:1.05rem;font-weight:700;color:#1a1a1a;margin-bottom:8px;">7. Contact Us</h2><p style="color:#444;line-height:1.8;margin:0;">Technozis, DCG2-0210, DLF Corporate Green, Sector 74A, Gurugram, Haryana 122004. Email: <a href="mailto:careers@technozis.com" style="color:#2563eb;">careers@technozis.com</a></p></div>
  <p style="color:#888;font-size:13px;margin-top:32px;text-align:center;border-top:1px solid #e5e7eb;padding-top:16px;">Questions? <a href="/contact" style="color:#2563eb;">Contact Us</a> &nbsp;|&nbsp; <a href="/terms-and-conditions" style="color:#2563eb;">Terms &amp; Conditions</a></p>
</div>`,
  },
};

const CONFIG = {
  startUrl:  "https://www.technozis.com",
  outputDir: path.join(__dirname, "cloned-site"),
  maxPages:  500,
  requestTimeout: 30000,
  navTimeout:     60000,
  pageSettle:     2500,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
  viewport:  { width: 1440, height: 900 },
  assetExtensions: /\.(css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|otf|eot|ico|mp4|webm|ogg|map|xml|pdf)$/i,
  skipAssetPatterns: [
    /\/_next\/static\/(chunks|runtime|webpack|development)\//i,
    /\/_next\/data\//i,
    /\.js(\.map)?(\?|#|$)/i,
  ],
  badPaths: [
    /^\/static(\?|$)/i, /^\/modal(\?|$)/i,
    /^\/_/i, /^\/api\//i,
  ],
  linkMap: {
    "Careers":"/careers","Business":"/business","About Us":"/company","Contact Us":"/contact",
    "ServiceNow":"/services/service-now","Salesforce":"/services/salesforce",
    "Data Analytics":"/services/data-analytics","Open AI":"/services/open-ai",
    "Oracle":"/services/oracle","SAP":"/services/sap",
    "Cloud & Infra":"/services/cloud-infra","Mobility & Development":"/services/mobility-development",
    "Blockchain & Web3":"/services/blockchain-web3",
    "Explore Open Roles":"/careers/opportunities","View Opportunitites":"/careers/opportunities",
    "View Opportunities":"/careers/opportunities","Meet with an expert":"/contact",
    "Get in Touch":"/contact","Apply Now":"/careers/opportunities",
    "See All Jobs":"/careers/opportunities","Get Started":"/contact",
    "Let's Talk":"/contact","Lets Talk":"/contact",
    "Professional Services & Build Teams":"/business/professional-services",
    "Managed IT Services":"/business/managed-it","Develop & Operate":"/business/develop-operate",
    "Community":"/careers/community","Culture":"/careers/culture","Open Roles":"/careers/opportunities",
  },
  extraPages: [
    "/services/service-now","/services/salesforce","/services/data-analytics",
    "/services/open-ai","/services/oracle","/services/sap",
    "/services/cloud-infra","/services/mobility-development","/services/blockchain-web3",
    "/business/professional-services","/business/managed-it","/business/develop-operate",
    "/careers/community","/careers/culture","/careers/opportunities",
  ],
  // FIX v60: Added proper inline SVG icons for Mobility & Development and Blockchain & Web3
  dropdownItems: [
    {label:"ServiceNow",         route:"/services/service-now",         icon:"/static/images/services/servicenow.svg"},
    {label:"Salesforce",         route:"/services/salesforce",          icon:"/static/images/services/salesforce.svg"},
    {label:"Data Analytics",     route:"/services/data-analytics",      icon:"/static/images/services/powerbi.svg"},
    {label:"Open AI",            route:"/services/open-ai",             icon:"/static/images/services/generativeai.svg"},
    {label:"Oracle",             route:"/services/oracle",              icon:"/static/images/services/oracle.svg"},
    {label:"SAP",                route:"/services/sap",                 icon:"/static/images/services/cib_sap.svg"},
    {label:"Cloud & Infra",      route:"/services/cloud-infra",         icon:"/static/images/services/aws.svg"},
    // These two now use inline SVG icons instead of empty strings
    {label:"Mobility & Development", route:"/services/mobility-development",
      iconSvg:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.75;flex-shrink:0"><rect x="5" y="2" width="14" height="20" rx="2" stroke="white" stroke-width="1.5"/><circle cx="12" cy="18" r="1" fill="white"/><path d="M9 6h6M9 9h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`},
    {label:"Blockchain & Web3",  route:"/services/blockchain-web3",
      iconSvg:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.75;flex-shrink:0"><path d="M12 2L4 6v6c0 4.42 3.36 8.57 8 9.93C17.64 20.57 21 16.42 21 12V6l-9-4z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`},
  ],
};

// ─────────────────────────────────────────────────────────────
//  STYLES v60
//  FIX: Business cards redesigned to match original:
//    - Dark background (#0e0e0e) always, regardless of live page colors
//    - Equal-width columns (each card flex:1)
//    - Active card: rounded white border highlight, NOT a colored background
//    - Image shown inside card as rounded inset (not as absolute overlay taking 44%)
//    - Inactive cards: only title visible, centered
//    - Active card: title + description + button revealed
// ─────────────────────────────────────────────────────────────
const STYLES = `<style id="tz-v60">
/* ── Dropdown ── */
[data-tz-drop]{position:relative;cursor:default!important;}
[data-tz-drop]>a,[data-tz-drop]>span,[data-tz-drop]>p,[data-tz-drop]>li{pointer-events:none!important;cursor:default!important;}
.tz-drop{display:none;position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);min-width:260px;background:#111;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:8px 0;z-index:99999;box-shadow:0 20px 60px rgba(0,0,0,0.7);}
.tz-drop a{display:flex!important;align-items:center;gap:12px;padding:10px 18px;color:#fff!important;text-decoration:none!important;font-size:14px;font-weight:500;white-space:nowrap;pointer-events:auto!important;transition:background 0.15s;}
.tz-drop a:hover{background:rgba(255,255,255,0.08);border-radius:6px;}
/* FIX v60: icon images get inverted to white; inline SVGs render natively */
.tz-drop a img{width:20px;height:20px;object-fit:contain;filter:brightness(0) invert(1);opacity:0.75;flex-shrink:0;}
.tz-drop a svg{flex-shrink:0;}

/* ── Business card switcher v62 ──
   ALL 3 cards fully visible by default (image + text + button always shown).
   Active/hovered card gets brighter border only. No hiding of content.
── */
.tz-biz-switcher{
  display:flex;
  width:100%;
  gap:10px;
  background:#080808;
  border-radius:20px;
  padding:12px;
  box-sizing:border-box;
}

.tz-biz-card{
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
  padding:20px 20px 28px;
  box-sizing:border-box;
  cursor:pointer;
  flex:1;
  min-width:0;
  border-radius:14px;
  /* ALL cards always visible */
  background:#141414;
  border:1.5px solid rgba(255,255,255,0.18);
  transition:border-color 0.3s ease, background 0.3s ease;
  overflow:hidden;
}

/* Active / hovered: brighter border only */
.tz-biz-card.tz-active,
.tz-biz-card:hover{
  border-color:rgba(255,255,255,0.8)!important;
  background:#1e1e1e!important;
}

/* Image ALWAYS fully visible on ALL cards */
.tz-biz-img{
  display:block;
  width:100%;
  height:160px;
  object-fit:cover;
  border-radius:10px;
  margin-bottom:16px;
  opacity:1;
  transform:none;
  flex-shrink:0;
}

/* Text area */
.tz-biz-text{
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
}

.tz-biz-label{
  font-size:11px;font-weight:600;color:rgba(255,255,255,.55);
  text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px;
}
.tz-biz-title{
  font-size:1.35rem;font-weight:800;color:#fff;line-height:1.3;margin:0;
}

/* Body (desc + button) ALWAYS visible on ALL cards */
.tz-biz-body{
  overflow:visible;
  opacity:1;
  max-height:none;
  margin-top:10px;
}

.tz-biz-desc{
  color:rgba(255,255,255,.8);font-size:14px;line-height:1.65;margin:0 0 18px;
}
.tz-biz-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:10px 24px;border:1.5px solid rgba(255,255,255,.55);border-radius:50px;
  color:#fff!important;font-size:13px;font-weight:500;
  text-decoration:none!important;background:transparent;
  transition:background .2s,border-color .2s;width:fit-content;cursor:pointer;
}
.tz-biz-btn:hover{background:rgba(255,255,255,.15);border-color:#fff;}

/* ── Business detail sections — STRICT: text LEFT, image RIGHT, always row ──
   Using !important everywhere + min-height to prevent collapse
── */
.tz-sec{
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  gap:60px!important;
  width:100%!important;
  box-sizing:border-box!important;
  flex-wrap:nowrap!important;
}
.tz-sec-text{
  flex:1 1 0!important;
  min-width:280px!important;
  max-width:55%!important;
  order:1!important;
  /* Force text child always on left */
}
.tz-sec-img{
  flex:1 1 0!important;
  min-width:240px!important;
  max-width:45%!important;
  order:2!important;
  /* Force image child always on right */
}
.tz-sec-img img{
  width:100%!important;
  height:auto!important;
  display:block!important;
  border-radius:14px!important;
  object-fit:cover!important;
  opacity:1!important;
  visibility:visible!important;
  transform:none!important;
}
@media(max-width:768px){
  .tz-sec{flex-direction:column!important;gap:30px!important;flex-wrap:wrap!important;}
  .tz-sec-text{max-width:100%!important;min-width:0!important;}
  .tz-sec-img{max-width:100%!important;min-width:0!important;}
  .tz-biz-switcher{flex-direction:column!important;}
  .tz-biz-card{flex:none!important;}
}

/* ── FAQ accordion ── */
.tz-faq-answer{max-height:0!important;overflow:hidden!important;opacity:0;display:block!important;visibility:visible!important;transition:max-height .42s cubic-bezier(.4,0,.2,1),opacity .3s ease;}
.tz-faq-answer.tz-open{max-height:800px!important;opacity:1;}
.tz-faq-trigger{cursor:pointer!important;user-select:none;}
.tz-faq-icon{display:inline-flex;transition:transform .3s ease;}
.tz-faq-trigger.tz-open .tz-faq-icon{transform:rotate(180deg);}

/* ── Scroll anchor ── */
.tz-biz-anchor{display:block;position:relative;top:-90px;visibility:hidden;height:0;}
</style>`;

// ─────────────────────────────────────────────────────────────
//  SHIM v60
// ─────────────────────────────────────────────────────────────
const SHIM = `<script id="tz-shim-v60">
(function(){
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-tz-drop]')&&!e.target.closest('.tz-drop')){
      e.preventDefault();e.stopPropagation();
      var id=e.target.closest('[data-tz-drop]').getAttribute('data-tz-drop');
      var d=document.getElementById(id);
      if(d)d.style.display=d.style.display==='block'?'none':'block';
      return;
    }
    var a=e.target.closest('a[href]');
    if(!a)return;
    var h=a.getAttribute('href')||'';
    if(h.indexOf('htmlContent')>-1||h.indexOf('/static?')>-1){
      e.preventDefault();e.stopPropagation();
      var hl=h.toLowerCase();
      var isP=hl.includes('privacy-container')||hl.includes('privacy-policy')||
              (!hl.includes('terms-container')&&hl.indexOf('privacy')!==-1&&hl.indexOf('privacy')<hl.indexOf('terms'));
      window.location.href=isP?'/privacy-policy':'/terms-and-conditions';
      return;
    }
    if(h.startsWith('#')){
      var el=document.getElementById(h.slice(1));
      if(el){e.preventDefault();e.stopPropagation();el.scrollIntoView({behavior:'smooth',block:'start'});}
      return;
    }
    if(h&&h!=='#'&&(h.startsWith('/')||h.startsWith('./'))){
      e.preventDefault();e.stopPropagation();window.location.href=h;
    }
  },true);

  function initDropdowns(){
    document.querySelectorAll('[data-tz-drop]').forEach(function(trigger){
      var d=document.getElementById(trigger.getAttribute('data-tz-drop'));
      if(!d)return;
      var tm;
      trigger.addEventListener('mouseenter',function(){clearTimeout(tm);d.style.display='block';});
      trigger.addEventListener('mouseleave',function(){tm=setTimeout(function(){d.style.display='none';},200);});
      d.addEventListener('mouseenter',function(){clearTimeout(tm);});
      d.addEventListener('mouseleave',function(){tm=setTimeout(function(){d.style.display='none';},200);});
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initDropdowns);
  }else{initDropdowns();}
})();
</script>`;

// ─────────────────────────────────────────────────────────────
//  FAQ SCRIPT v60
// ─────────────────────────────────────────────────────────────
const FAQ_SCRIPT = `<script id="tz-faq-v60">
(function(){
  function initFaq(){
    var items=[];
    var byClass=Array.prototype.slice.call(document.querySelectorAll('div,li')).filter(function(el){
      var cn=el.className||'';
      return typeof cn==='string'&&(cn.indexOf('faqItem')!==-1||cn.indexOf('faq_item')!==-1||cn.indexOf('accordionItem')!==-1||cn.indexOf('accordion_item')!==-1);
    });
    if(byClass.length){items=byClass;}
    if(!items.length){
      var listEl=Array.prototype.slice.call(document.querySelectorAll('div,ul')).find(function(el){
        var cn=el.className||'';
        return typeof cn==='string'&&(cn.indexOf('faqList')!==-1||cn.indexOf('accordionContainer')!==-1||cn.indexOf('faqContainer')!==-1||cn.indexOf('faqWrap')!==-1);
      });
      if(listEl){items=Array.prototype.slice.call(listEl.children).filter(function(c){return c.tagName==='DIV'||c.tagName==='LI';});}
    }
    if(!items.length){
      items=Array.prototype.slice.call(document.querySelectorAll('div')).filter(function(div){
        if(div.children.length<2)return false;
        var first=div.children[0],last=div.children[div.children.length-1];
        return first!==last&&first.querySelector('svg')&&(first.textContent||'').trim().length>5&&(last.textContent||'').trim().length>10;
      }).slice(0,25);
      if(items.length<=2)items=[];
    }
    if(!items.length)return;
    items.forEach(function(item){
      var children=Array.prototype.slice.call(item.children);
      if(children.length<2)return;
      var questionEl=children[0],answerEl=children[children.length-1];
      if(questionEl===answerEl)return;
      if(questionEl.getAttribute('data-tz-faq-wired'))return;
      questionEl.setAttribute('data-tz-faq-wired','1');
      answerEl.removeAttribute('style');answerEl.removeAttribute('hidden');
      Array.prototype.slice.call(answerEl.querySelectorAll('*')).forEach(function(el){
        if(el.style&&el.style.display==='none')el.style.display='';
        if(el.style&&el.style.visibility==='hidden')el.style.visibility='';
        if(el.style&&el.style.opacity==='0')el.style.opacity='';
      });
      answerEl.classList.add('tz-faq-answer');
      questionEl.classList.add('tz-faq-trigger');
      questionEl.style.cursor='pointer';
      var svg=questionEl.querySelector('svg');
      if(svg&&!svg.closest('.tz-faq-icon')){
        var span=document.createElement('span');span.className='tz-faq-icon';
        svg.parentNode.insertBefore(span,svg);span.appendChild(svg);
      }
      questionEl.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        var isOpen=answerEl.classList.contains('tz-open');
        document.querySelectorAll('.tz-faq-answer').forEach(function(a){a.classList.remove('tz-open');});
        document.querySelectorAll('.tz-faq-trigger').forEach(function(t){t.classList.remove('tz-open');});
        if(!isOpen){answerEl.classList.add('tz-open');questionEl.classList.add('tz-open');}
      });
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initFaq);}else{initFaq();}
})();
</script>`;

const domain    = new URL(CONFIG.startUrl).origin;
const visited   = new Set();
const queue     = new Set([CONFIG.startUrl]);
const assets    = new Set();
const fakeUrls  = new Set();
const outputDir = CONFIG.outputDir;
CONFIG.extraPages.forEach(p=>queue.add(domain+p));

function cleanUrl(raw){try{const u=new URL(raw);return(u.origin+u.pathname).replace(/\/+$/,"")||domain;}catch{return raw.split("?")[0].split("#")[0].replace(/\/+$/,"")||domain;}}
function isBadPath(p){return!p||CONFIG.badPaths.some(r=>r.test(p));}
function isValidPage(url){if(!url)return false;try{new URL(url);}catch{return false;}if(!url.startsWith(domain))return false;if(/^(mailto|tel|javascript|#)/i.test(url))return false;if(CONFIG.assetExtensions.test(url.split("?")[0]))return false;if(/[?&](_rsc|htmlContent|modal)=/i.test(url))return false;if(url.includes("#"))return false;try{if(isBadPath(new URL(url).pathname))return false;}catch{}if(fakeUrls.has(cleanUrl(url)))return false;return true;}
function enqueue(url,source){const u=cleanUrl(url);if(!isValidPage(u)||visited.has(u)||queue.has(u))return;queue.add(u);console.log(`    [+][${source}] ${u}`);}
function isSkippedAsset(url){return CONFIG.skipAssetPatterns.some(p=>p.test(url));}
async function prettify(html){try{return await prettier.format(html,{parser:"html",printWidth:120,tabWidth:2,useTabs:false,htmlWhitespaceSensitivity:"ignore"});}catch{return html;}}
async function waitHydration(page){await page.evaluate(async()=>{await new Promise(resolve=>{let t=0;const c=()=>{t++;if((window.__NEXT_DATA__&&window.next)||t>60)return resolve();setTimeout(c,200);};setTimeout(c,300);setTimeout(resolve,15000);});});await new Promise(r=>setTimeout(r,800));}

// ─────────────────────────────────────────────────────────────
//  LEGAL PAGES
// ─────────────────────────────────────────────────────────────
async function saveLegalPage(browser,legal){
  console.log(`\n[legal] ${legal.slug}`);
  const page=await browser.newPage();
  await page.setUserAgent(CONFIG.userAgent);await page.setViewport(CONFIG.viewport);await setupPage(page);
  try{
    await page.goto(domain,{waitUntil:["domcontentloaded","networkidle0"],timeout:40000});
    await waitHydration(page);
    await page.evaluate((body,title)=>{
      document.title=title;
      const targets=['main','[class*="contentWrapper"]','[class*="pageWrapper"]'].map(s=>document.querySelector(s)).filter(Boolean);
      const footer=document.querySelector('footer')||document.querySelector('[class*="footer"]');
      if(targets.length){targets[0].innerHTML=body;}
      else if(footer&&footer.parentNode){const div=document.createElement('div');div.innerHTML=body;footer.parentNode.insertBefore(div,footer);}
    },legal.body,legal.title);
    await injectLinks(page,legal.slug);
    await saveHtml(await page.content(),path.join(outputDir,legal.slug,'index.html'),legal.slug);
    console.log(`  [legal] ✅ saved`);
  }catch(e){console.log(`  [legal] ❌ ${e.message.slice(0,80)}`);}
  await page.close();
}

// ─────────────────────────────────────────────────────────────
//  BUSINESS PAGE FULL REBUILD v60
//  KEY CHANGE: cards use dark bg + border-highlight, NOT colored bg + flex-expand
// ─────────────────────────────────────────────────────────────
async function fixBusinessPage(page){
  console.log("  [biz v60] full rebuild starting...");

  // STEP 1: Slow-scroll entire page to trigger ALL scroll animations
  await page.evaluate(async()=>{
    await new Promise(resolve=>{
      const totalH=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
      let y=0;
      const step=()=>{
        window.scrollBy(0,150);y+=150;
        if(y<totalH+600){requestAnimationFrame(step);}
        else{window.scrollTo(0,0);setTimeout(resolve,1000);}
      };
      step();
    });
  });
  await new Promise(r=>setTimeout(r,2000));

  // STEP 2: Trigger hover on card-like elements to expose hidden content
  await page.evaluate(async()=>{
    const cardSelectors=[
      '[class*="card"],[class*="Card"]',
      '[class*="engagement"],[class*="Engagement"]',
      '[class*="service"],[class*="Service"]',
    ];
    cardSelectors.forEach(sel=>{
      document.querySelectorAll(sel).forEach(el=>{
        ['mouseenter','mouseover'].forEach(ev=>
          el.dispatchEvent(new MouseEvent(ev,{bubbles:true,cancelable:true}))
        );
      });
    });
    await new Promise(r=>setTimeout(r,800));

    // Nuclear: force ALL animated elements visible
    document.querySelectorAll('*').forEach(function(el){
      if(el.tagName==='SCRIPT'||el.tagName==='STYLE')return;
      var cs=window.getComputedStyle(el);
      var op=parseFloat(cs.opacity);
      var tr=cs.transform||'none';
      if(op<0.05&&tr!=='none'){
        el.style.opacity='1';
        el.style.transform='none';
        el.style.transition='none';
      }
      if(cs.visibility==='hidden')el.style.visibility='visible';
      if(cs.maxHeight==='0px'){
        var cn=el.className||'';
        if(typeof cn==='string'&&!cn.includes('faq')&&!cn.includes('Faq')&&!cn.includes('accordion')){
          el.style.maxHeight='none';el.style.overflow='visible';
        }
      }
    });
  });
  await new Promise(r=>setTimeout(r,500));

  // STEP 3: Capture card data (trigger each card individually)
  const cardData=await page.evaluate(async()=>{
    let container=null;
    for(const sel of['[class*="engagementSection"]','[class*="servicesSection"]','[class*="Engagement"]','[class*="cardContainer"]','[class*="CardContainer"]']){
      const el=document.querySelector(sel);
      if(el&&el.children.length>=2&&el.children.length<=5){container=el;break;}
    }
    if(!container){
      for(const div of document.querySelectorAll('div')){
        if(div.children.length!==3)continue;
        const kids=Array.from(div.children);
        if(!kids.every(k=>k.tagName==='DIV'))continue;
        const allHaveBg=kids.every(k=>{
          const bg=window.getComputedStyle(k).backgroundColor;
          return bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'&&bg!=='';
        });
        if(allHaveBg&&div.textContent.trim().length>30){container=div;break;}
      }
    }
    if(!container)return[];

    const result=[];
    const cards=Array.from(container.children);

    for(let i=0;i<cards.length;i++){
      const card=cards[i];
      ['mouseenter','mouseover','click'].forEach(ev=>card.dispatchEvent(new MouseEvent(ev,{bubbles:true,cancelable:true})));
      await new Promise(r=>setTimeout(r,900));

      Array.from(card.querySelectorAll('*')).forEach(el=>{
        const cs=window.getComputedStyle(el);
        if(parseFloat(cs.opacity)<0.5)el.style.opacity='1';
        if(cs.visibility==='hidden')el.style.visibility='visible';
        if(cs.display==='none')el.style.display='';
        if(cs.maxHeight==='0px'){el.style.maxHeight='2000px';el.style.overflow='visible';}
        const tr=cs.transform||'none';
        if(tr!=='none')el.style.transform='none';
      });

      // NOTE v60: we still read bg for reference but DO NOT use it in the rebuilt card
      const bg=window.getComputedStyle(card).backgroundColor;

      const labelEl=card.querySelector('[class*="subTitle"],[class*="subtitle"],[class*="label"],[class*="Label"],[class*="eyebrow"],[class*="category"]');
      const label=labelEl?labelEl.textContent.trim():'';

      const titleEl=card.querySelector('h1,h2,h3,h4');
      const title=titleEl?titleEl.textContent.trim():'';

      const ps=Array.from(card.querySelectorAll('p')).filter(p=>p.textContent.trim().length>8);
      const desc=ps.map(p=>p.textContent.trim()).join(' ');

      let imgSrc='';
      const imgEl=card.querySelector('img');
      if(imgEl){
        imgSrc=imgEl.getAttribute('src')||imgEl.getAttribute('data-src')||'';
        if(imgSrc.includes('/_next/image?url=')){try{imgSrc=decodeURIComponent(imgSrc.split('url=')[1].split('&')[0]);}catch{}}
      }
      if(!imgSrc){
        const ns=card.querySelector('noscript');
        if(ns){const m=ns.innerHTML.match(/src=["']([^"']+)["']/);if(m)imgSrc=m[1];}
      }

      result.push({bg,label,title,desc,imgSrc});
      card.dispatchEvent(new MouseEvent('mouseleave',{bubbles:true}));
      await new Promise(r=>setTimeout(r,150));
    }
    return result;
  });

  console.log("  [biz v60] cards:",cardData.map(c=>c.title||c.label||'?').join(' | '));

  const scrollAnchors=[
    {id:'tz-prof-svc',   kw:['Professional Services','Unlock Expert','On-demand IT','Staffing']},
    {id:'tz-managed-it', kw:['Managed IT','Proactive','Secure IT','Keep Your Stack']},
    {id:'tz-digital',    kw:['Digital','Accelerate','Strategy to','Reimagine','Develop & Operate']},
  ];

  await page.evaluate((cardData,scrollAnchors)=>{
    const main=document.querySelector('main')||document.body;

    // ── 4a: Rebuild card switcher with DARK BACKGROUND + BORDER HIGHLIGHT ──
    let cardContainer=null;
    for(const sel of['[class*="engagementSection"]','[class*="servicesSection"]','[class*="Engagement"]','[class*="cardContainer"]','[class*="CardContainer"]']){
      const el=document.querySelector(sel);
      if(el&&el.children.length>=2&&el.children.length<=5){cardContainer=el;break;}
    }
    if(!cardContainer){
      for(const div of document.querySelectorAll('div')){
        if(div.children.length!==3)continue;
        const kids=Array.from(div.children);
        if(!kids.every(k=>k.tagName==='DIV'))continue;
        const allHaveBg=kids.every(k=>{
          const bg=window.getComputedStyle(k).backgroundColor;
          return bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'&&bg!=='';
        });
        if(allHaveBg&&div.textContent.trim().length>30){cardContainer=div;break;}
      }
    }

    if(cardContainer&&cardData.length>0){
      const switcher=document.createElement('div');
      switcher.className='tz-biz-switcher';

      cardData.forEach(function(card,idx){
        const cardEl=document.createElement('div');
        // v60: always dark, active gets border via CSS class
        cardEl.className='tz-biz-card'+(idx===0?' tz-active':'');
        // No inline background color — CSS handles it as #0e0e0e dark

        // Image at top of card (hidden on inactive, shown on active/hover via CSS)
        if(card.imgSrc){
          const img=document.createElement('img');
          img.src=card.imgSrc;
          img.className='tz-biz-img';
          img.alt=card.title||'';
          cardEl.appendChild(img);
        }

        const textWrap=document.createElement('div');
        textWrap.className='tz-biz-text';

        if(card.label&&card.label!==card.title){
          const lbl=document.createElement('p');lbl.className='tz-biz-label';lbl.textContent=card.label;
          textWrap.appendChild(lbl);
        }

        const titleEl=document.createElement('h2');titleEl.className='tz-biz-title';
        titleEl.textContent=card.title||card.label;textWrap.appendChild(titleEl);

        const bodyEl=document.createElement('div');bodyEl.className='tz-biz-body';

        if(card.desc){
          const descEl=document.createElement('p');descEl.className='tz-biz-desc';
          descEl.textContent=card.desc;bodyEl.appendChild(descEl);
        }

        const anchorId=scrollAnchors[idx]?scrollAnchors[idx].id:'';
        const btn=document.createElement('a');
        btn.href=anchorId?'#'+anchorId:'#';
        btn.className='tz-biz-btn';btn.textContent='Know More \u2192';
        bodyEl.appendChild(btn);

        textWrap.appendChild(bodyEl);
        cardEl.appendChild(textWrap);

        // Hover: update tz-active
        cardEl.addEventListener('mouseenter',function(){
          document.querySelectorAll('.tz-biz-card').forEach(function(c){c.classList.remove('tz-active');});
          cardEl.classList.add('tz-active');
        });

        switcher.appendChild(cardEl);
      });

      cardContainer.parentNode.replaceChild(switcher,cardContainer);
      console.log('[biz v60] switcher rebuilt with dark cards');
    }

    // ── 4b: Fix all text+image detail sections ──
    // Text ALWAYS left (order:1), image ALWAYS right (order:2).
    // Apply inline styles directly so page CSS cannot override.
    const processedKeys=new Set();

    Array.from(main.querySelectorAll('div,section')).forEach(function(el){
      if(el.closest('.tz-biz-switcher'))return;
      if(el.classList.contains('tz-sec'))return;
      const children=Array.from(el.children);
      if(children.length<2||children.length>5)return;

      let textChild=null,imgChild=null;
      children.forEach(function(child){
        const hasH=!!(child.querySelector('h1,h2,h3,h4'));
        const textLen=(child.textContent||'').trim().replace(/\s+/g,' ').length;
        const imgEl=child.querySelector('img');
        const imgOnly=!!imgEl&&textLen<25;
        const isText=(hasH||textLen>60)&&textLen>25;
        if(isText&&!textChild)textChild=child;
        if(imgOnly&&!imgChild)imgChild=child;
      });

      if(!textChild||!imgChild||textChild===imgChild)return;

      const hEl=textChild.querySelector('h1,h2,h3,h4');
      if(!hEl)return;
      const hKey=(hEl.textContent||'').trim().slice(0,40);
      if(processedKeys.has(hKey))return;
      processedKeys.add(hKey);

      // Add classes
      el.classList.add('tz-sec');
      textChild.classList.add('tz-sec-text');
      imgChild.classList.add('tz-sec-img');

      // Also force inline styles — belt AND suspenders so page CSS loses
      el.setAttribute('style',(el.getAttribute('style')||'')+
        ';display:flex!important;flex-direction:row!important;align-items:center!important;'+
        'gap:60px!important;width:100%!important;box-sizing:border-box!important;flex-wrap:nowrap!important;');
      textChild.setAttribute('style',(textChild.getAttribute('style')||'')+
        ';flex:1 1 0!important;min-width:280px!important;max-width:55%!important;order:1!important;');
      imgChild.setAttribute('style',(imgChild.getAttribute('style')||'')+
        ';flex:1 1 0!important;min-width:240px!important;max-width:45%!important;order:2!important;'+
        'opacity:1!important;visibility:visible!important;transform:none!important;');

      // Force all text child content visible
      Array.from(textChild.querySelectorAll('*')).forEach(function(c){
        if(parseFloat((window.getComputedStyle(c).opacity)||'1')<0.1){
          c.style.opacity='1';c.style.transform='none';c.style.visibility='visible';
        }
        if(window.getComputedStyle(c).display==='none')c.style.display='';
      });

      // Force images visible + decode Next.js URLs
      Array.from(imgChild.querySelectorAll('img')).forEach(function(img){
        var src=img.getAttribute('src')||'';
        if(src.includes('/_next/image?url=')){try{img.src=decodeURIComponent(src.split('url=')[1].split('&')[0]);}catch{}}
        if(!img.getAttribute('src')&&img.getAttribute('data-src'))img.src=img.getAttribute('data-src');
        img.setAttribute('style','width:100%!important;height:auto!important;display:block!important;'+
          'border-radius:14px!important;object-fit:cover!important;opacity:1!important;'+
          'visibility:visible!important;transform:none!important;');
      });
    });

    // ── 4c: Insert scroll anchors ──
    scrollAnchors.forEach(function(anchor){
      if(document.getElementById(anchor.id))return;
      var found=null;
      Array.from(document.querySelectorAll('h1,h2,h3,h4')).forEach(function(h){
        if(found||h.closest('.tz-biz-switcher'))return;
        if(anchor.kw.some(function(k){return(h.textContent||'').includes(k);}))found=h;
      });
      if(!found)return;
      var section=found.parentElement;
      for(var i=0;i<6;i++){
        if(!section||section.tagName==='BODY')break;
        if(section.offsetHeight>120)break;
        section=section.parentElement;
      }
      var el=document.createElement('div');
      el.id=anchor.id;el.className='tz-biz-anchor';
      if(section&&section.parentNode)section.parentNode.insertBefore(el,section);
    });

    // ── 4d: Fix CTA links ──
    document.querySelectorAll('a,button').forEach(function(el){
      var t=(el.textContent||'').trim();
      if(["Let's Talk","Let's Build Together","Start Managing IT Smarter",
          "Meet with an Expert","Meet with an expert","Get Started"].includes(t)){
        if(el.tagName==='A')el.setAttribute('href','/contact');
      }
    });

    // ── 4e: Final nuclear pass — force all remaining invisible elements visible ──
    Array.from(document.querySelectorAll('main *,body>div *')).forEach(function(el){
      if(el.tagName==='SCRIPT'||el.tagName==='STYLE')return;
      if(el.closest('.tz-biz-body'))return;
      if(el.closest('.tz-faq-answer'))return;
      var cs=window.getComputedStyle(el);
      var op=parseFloat(cs.opacity);
      var tr=cs.transform||'none';
      if(op<0.05){el.style.opacity='1';}
      if(tr!=='none'&&op<0.5){el.style.transform='none';}
      if(cs.visibility==='hidden'&&!el.closest('.tz-biz-switcher'))el.style.visibility='visible';
    });

    // ── 4f: Decode remaining Next.js image URLs ──
    document.querySelectorAll('img').forEach(function(img){
      var src=img.getAttribute('src')||'';
      if(src.includes('/_next/image?url=')){try{img.src=decodeURIComponent(src.split('url=')[1].split('&')[0]);}catch{}}
      if(!img.getAttribute('src')&&img.getAttribute('data-src'))img.src=img.getAttribute('data-src');
    });

  },cardData,scrollAnchors);

  console.log("  [biz v60] ✅ full rebuild done");
}

// ─────────────────────────────────────────────────────────────
//  FAQ FIX
// ─────────────────────────────────────────────────────────────
async function fixFaq(page){
  const count=await page.evaluate(()=>{
    var items=[];
    var byClass=Array.from(document.querySelectorAll('div,li')).filter(function(el){
      var cn=el.className||'';
      return typeof cn==='string'&&(cn.includes('faqItem')||cn.includes('faq_item')||cn.includes('accordionItem')||cn.includes('accordion_item'));
    });
    if(byClass.length)items=byClass;
    if(!items.length){
      var container=Array.from(document.querySelectorAll('div,ul')).find(function(el){
        var cn=el.className||'';
        return typeof cn==='string'&&(cn.includes('faqList')||cn.includes('accordionContainer')||cn.includes('faqContainer')||cn.includes('faqWrap'));
      });
      if(container){items=Array.from(container.children).filter(function(c){return c.tagName==='DIV'||c.tagName==='LI';});}
    }
    if(!items.length)return 0;
    var fixed=0;
    items.forEach(function(item){
      var children=Array.from(item.children);
      if(children.length<2)return;
      var answerEl=children[children.length-1];
      if(answerEl===children[0])return;
      answerEl.removeAttribute('style');answerEl.removeAttribute('hidden');fixed++;
    });
    return fixed;
  });
  if(count>0)console.log(`  [faq] pre-cleared ${count} answer elements`);
  else console.log('  [faq] ⚠️  no FAQ items found to pre-clear');
}

// ─────────────────────────────────────────────────────────────
//  DROPDOWN v60 — FIX: support iconSvg inline for items without file icons
// ─────────────────────────────────────────────────────────────
function buildDropdownHtml(){
  const items=CONFIG.dropdownItems.map(item=>{
    let iconHtml='';
    if(item.iconSvg){
      // Use inline SVG directly
      iconHtml=item.iconSvg;
    }else if(item.icon){
      iconHtml=`<img src="${item.icon}" alt="" onerror="this.style.display='none'">`;
    }else{
      iconHtml=`<span style="width:20px;height:20px;display:inline-block;"></span>`;
    }
    return`      <a href="${item.route}">${iconHtml}${item.label}</a>`;
  }).join('\n');
  return`<div class="tz-drop" id="tz-wwd">\n${items}\n  </div>`;
}
function injectDropdown(html){
  if(html.includes('tz-wwd'))return html;
  const drop=buildDropdownHtml();
  const tags=['a','span','li','button','p','div'];
  for(const tag of tags){
    const re=new RegExp(`(<${tag}\\b[^>]*>)(\\s*(?:<[^>]+>\\s*)*What we do(?:\\s*</[^>]+>)*\\s*)(</${tag}>)`,'i');
    if(re.test(html)){
      html=html.replace(re,(m,open,mid,close)=>{
        const newOpen=open.replace(new RegExp(`^<${tag}\\b`,'i'),`<${tag} data-tz-drop="tz-wwd" style="position:relative;"`).replace(/\s+href=["'][^"']*["']/gi,'');
        return newOpen+mid+close+'\n'+drop;
      });
      if(html.includes('tz-wwd')){console.log('  [dropdown] injected');break;}
    }
  }
  if(!html.includes('tz-wwd'))html=html.replace('</nav>',drop+'\n</nav>');
  return html;
}

function fixLegalLinks(html){
  html=html.replace(/href="\/static\?[^"]*[Pp]rivacy[^"]*"/g,'href="/privacy-policy"');
  html=html.replace(/href="\/static\?[^"]*[Tt]erms[^"]*"/g,'href="/terms-and-conditions"');
  html=html.replace(/href="\/static%3F[^"]*[Pp]rivacy[^"]*"/g,'href="/privacy-policy"');
  html=html.replace(/href="\/static%3F[^"]*[Tt]erms[^"]*"/g,'href="/terms-and-conditions"');
  return html;
}

async function injectLinks(page,pagePath){
  const result=await page.evaluate((domain,pagePath,linkMap)=>{
    const log=[],wrapped=new WeakSet();let injected=0;
    function route(text){
      if(!text?.trim())return null;const t=text.trim();
      if(t.endsWith('?')||t.length>60||t.includes('\n'))return null;
      if(t.toLowerCase()==='what we do')return null;
      if(linkMap[t])return linkMap[t];
      const tl=t.toLowerCase();for(const[k,v]of Object.entries(linkMap))if(k.toLowerCase()===tl)return v;
      return null;
    }
    function wrap(el,r,zone){
      if(wrapped.has(el)||el.closest('a'))return;
      try{const a=document.createElement('a');a.href=r;a.style.cssText='text-decoration:none;color:inherit;display:contents;cursor:pointer;';el.parentNode.insertBefore(a,el);a.appendChild(el);wrapped.add(el);injected++;log.push(`[${zone}] "${el.textContent?.trim().slice(0,35)}" → ${r}`);}catch{}
    }
    document.querySelectorAll('a').forEach(function(a){
      const attr=a.getAttribute('href')||'';
      if(attr.startsWith('/static?')||attr.includes('htmlContent')){
        const al=attr.toLowerCase();
        var isP=al.includes('privacy-container')||al.includes('privacy-policy')||(!al.includes('terms-container')&&al.indexOf('privacy')<al.indexOf('terms')&&al.indexOf('privacy')!==-1);
        if(isP){a.setAttribute('href','/privacy-policy');injected++;log.push('[fix] privacy');}
        else if(al.includes('terms')||al.includes('terms-container')){a.setAttribute('href','/terms-and-conditions');injected++;log.push('[fix] terms');}
        return;
      }
      if(!attr||attr==='#'){try{const u=new URL(a.href,window.location.origin);if(u.origin===window.location.origin){const p=u.pathname.replace(/\/+$/,'')||'/';if(p&&p!==attr)a.setAttribute('href',p);}}catch{}}
    });
    document.querySelectorAll('header,nav,[role="navigation"]').forEach(function(zone){
      zone.querySelectorAll('p,span,li,button,a').forEach(function(el){
        const text=el.textContent?.trim();
        if(el.tagName==='A'){
          if((text||'').toLowerCase()==='what we do')return;
          const attr=el.getAttribute('href')||'';
          if(!attr||attr==='#'){const r=route(text);if(r){el.setAttribute('href',r);injected++;log.push(`[nav-a] "${(text||'').slice(0,30)}" → ${r}`);}}
          return;
        }
        if(wrapped.has(el)||el.closest('a'))return;
        const kids=[...el.children].filter(c=>!['SVG','IMG','SPAN','B','I','EM','STRONG','BR','PATH','G','CIRCLE'].includes(c.tagName));
        if(kids.length>1||!text||text.length>40||text.includes('\n')||text.endsWith('?'))return;
        const r=route(text);if(r)wrap(el,r,'nav');
      });
    });
    [...document.querySelectorAll('footer,[class*="footer"]')].forEach(function(zone){
      zone.querySelectorAll('p,span,li,div,a').forEach(function(el){
        if(wrapped.has(el))return;
        const text=el.textContent?.trim();
        if(!text||text.length>60||text.includes('\n')||text.endsWith('?'))return;
        if(el.tagName!=='A'&&el.closest('a'))return;
        if(el.tagName==='DIV'&&[...el.children].filter(c=>!['SVG','IMG','SPAN','BR'].includes(c.tagName)).length>1)return;
        if(el.tagName==='A'){
          const attr=el.getAttribute('href')||'';
          if(attr.startsWith('/static?')||attr.includes('htmlContent')){
            const al=attr.toLowerCase();
            var isP=al.includes('privacy-container')||al.includes('privacy-policy')||(!al.includes('terms-container')&&al.indexOf('privacy')<al.indexOf('terms')&&al.indexOf('privacy')!==-1);
            if(isP){el.setAttribute('href','/privacy-policy');injected++;log.push('[footer] privacy');}
            else if(al.includes('terms')){el.setAttribute('href','/terms-and-conditions');injected++;log.push('[footer] terms');}
            return;
          }
          if(!attr||attr==='#'){const r=route(text);if(r){el.setAttribute('href',r);injected++;log.push(`[footer-a] "${text.slice(0,30)}" → ${r}`);}}
          return;
        }
        const r=route(text);if(r)wrap(el,r,'footer');
      });
    });
    document.querySelectorAll('div,button,span').forEach(function(el){
      if(wrapped.has(el)||el.closest('a')||el.querySelectorAll('a').length>0)return;
      const cs=window.getComputedStyle(el);
      if(cs.cursor!=='pointer'&&el.tagName!=='BUTTON'&&el.getAttribute('role')!=='button')return;
      const text=el.textContent?.trim()||'';
      if(!text||text.length<3||text.length>40||text.endsWith('?')||text.includes('\n')||text.split(/\s+/).length>6)return;
      const r=route(text);if(r&&r!==pagePath)wrap(el,r,'cta');
    });
    return{injected,log};
  },domain,pagePath,CONFIG.linkMap);
  result.log.forEach(l=>console.log(`  ${l}`));
  console.log(`  [inject] ${result.injected} links`);
}

function rewrite(html){
  const esc=domain.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  html=html.replace(new RegExp(`((?:href|src|action)=")${esc}(/[^"]*)"`, "g"), '$1$2"');
  html=html.replace(new RegExp(`((?:href|src|action)=")${esc}"`, "g"), '$1/"');
  html=html.replace(new RegExp(esc,"g"),"");
  html=html.replace(/(\s(?:src|href))="\/\//g,'$1="https://');
  html=html.replace(/\/_next\/image\?url=([^&"'\s]+)[^"']*/gi,(_,e)=>{try{return decodeURIComponent(e);}catch{return e;}});
  html=html.replace(/<base[^>]*>\s*/gi,"");
  return html;
}
function strip(html){
  html=html.replace(/(<style[^>]*>[\s\S]*?<\/style>)/gi,function(s){
    if(s.includes('tz-v60'))return s;
    return s.replace(/\s*!important/gi,'');
  });
  html=html.replace(/\s+style="\s*;*\s*"/gi,'');
  html=html.replace(/style="\s*"/gi,'');
  return html;
}
function staticify(html){
  html=html.replace(/<script[^>]+src=["'][^"']*["'][^>]*>(<\/script>)?/gi,"");
  html=html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi,(m,a,c)=>{
    if(c.includes("tz-shim-v60")||c.includes("tz-faq-v60")||/ld\+json/i.test(a))return m;
    return "";
  });
  html=html.replace(/<link[^>]+rel=["']?(?:preload|prefetch|modulepreload)["']?[^>]*>/gi,m=>/\.(?:woff2?|ttf|otf|eot)/i.test(m)?m:"");
  html=html.replace(/<link[^>]+href=["'][^"']*\/_next\/static\/(?:chunks|runtime|webpack)[^"']*["'][^>]*>/gi,"");
  html=html.replace(/<link[^>]+href=["'][^"']*\/_next\/data\/[^"']*["'][^>]*>/gi,"");
  html=html.replace(/\s+data-react\w*=["'][^"']*["']/gi,"");
  html=html.replace(/\s+data-next-[a-z-]+=["'][^"']*["']/gi,"");
  html=html.replace(/\s+data-reactroot(=["'][^"']*["'])?/gi,"");
  html=html.replace(/<noscript[^>]*id=["']__next[^"']*["'][^>]*>[\s\S]*?<\/noscript>/gi,"");
  html=html.replace(/\s+on(?:Click|Change|Mouse(?:Enter|Leave|Over)|Key(?:Down|Up|Press)|Focus|Blur|Submit|Reset|Scroll|Touch\w*)=["'][^"']*["']/g,"");
  html=html.replace(/(\n\s*){3,}/g,"\n\n");
  return html;
}
function fixContentWrappers(html){
  // Force all concurrentContent sections to be side-by-side flex rows
  // rightAligned: text div first, img second (text LEFT, img RIGHT)
  // leftAligned: img first, text div second (img LEFT, text RIGHT)
  // Either way: flex row with gap, no stacking
  html=html.replace(
    /(<div class="style_contentWrapper__bHvne style_rightAligned__OSaSs")(\s*>)/g,
    '$1 style="display:flex;flex-direction:row;align-items:center;gap:60px;width:100%;padding:60px 80px;box-sizing:border-box;"$2'
  );
  html=html.replace(
    /(<div class="style_contentWrapper__bHvne style_leftAligned__Kk7CJ")(\s*>)/g,
    '$1 style="display:flex;flex-direction:row;align-items:center;gap:60px;width:100%;padding:60px 80px;box-sizing:border-box;"$2'
  );
  html=html.replace(
    /(<div class="style_textContent__yMitl style_rightAligned__OSaSs")(\s*>)/g,
    '$1 style="flex:1 1 0;min-width:0;"$2'
  );
  html=html.replace(
    /(<div class="style_textContent__yMitl style_leftAligned__Kk7CJ")(\s*>)/g,
    '$1 style="flex:1 1 0;min-width:0;"$2'
  );
  html=html.replace(
    /(<img\b[^>]*class="style_image__QLitv"[^>]*\/?>)/g,
    function(m){
      if(m.includes('style='))return m;
      return m.replace('class="style_image__QLitv"',
        'class="style_image__QLitv" style="flex:0 0 42%;max-width:42%;width:42%;height:auto;border-radius:14px;object-fit:cover;display:block;"');
    }
  );
  return html;
}

function addShims(html){
  if(html.includes("tz-shim-v60"))return html;
  const s=STYLES+"\n"+SHIM+"\n"+FAQ_SCRIPT;
  if(html.includes("</body>"))return html.replace("</body>",s+"\n</body>");
  if(html.includes("</head>"))return html.replace("</head>",STYLES+"\n</head>").replace("</body>",SHIM+"\n"+FAQ_SCRIPT+"\n</body>");
  return html+"\n"+s;
}
async function saveHtml(html,savePath,pagePath){
  if(!html.trim().toLowerCase().startsWith("<!doctype"))html="<!DOCTYPE html>\n"+html;
  if(!/<meta[^>]+charset/i.test(html))html=html.replace(/(<head[^>]*>)/i,'$1\n  <meta charset="utf-8">');
  html=rewrite(html);html=fixLegalLinks(html);html=strip(html);html=staticify(html);
  html=fixContentWrappers(html);html=injectDropdown(html);html=addShims(html);html=await prettify(html);
  await fs.ensureDir(path.dirname(savePath));
  await fs.writeFile(savePath,html,"utf8");
  console.log("  [save]",savePath.replace(outputDir,""));
  console.log(`  [✓] hrefs:${(html.match(/href="\//gi)||[]).length} lines:${html.split("\n").length}`);
}

async function fetchText(url){try{const r=await axios.get(url,{timeout:12000,headers:{"User-Agent":CONFIG.userAgent},validateStatus:s=>s<500});if(r.status>=400)return null;return typeof r.data==="string"?r.data:JSON.stringify(r.data);}catch{return null;}}
async function parseSitemap(xmlOrUrl,depth=0){if(depth>4)return;const xml=xmlOrUrl.startsWith("http")?await fetchText(xmlOrUrl):xmlOrUrl;if(!xml)return;for(const m of xml.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi))await parseSitemap(m[1].trim(),depth+1);for(const m of xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/gi)){const u=m[1].trim();if(u.startsWith(domain))enqueue(u,"sitemap");}if(!xml.includes("<url>")&&!xml.includes("<sitemap>"))for(const m of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)){const u=m[1].trim();if(u.startsWith(domain))enqueue(u,"sitemap-loc");}}
async function discoverSitemaps(){console.log("[sitemap] discovering...");const robots=await fetchText(domain+"/robots.txt");if(robots)for(const line of robots.split("\n")){const m=line.match(/^Sitemap:\s*(.+)/i);if(m)await parseSitemap(m[1].trim());}for(const c of["/sitemap.xml","/sitemap_index.xml"]){const xml=await fetchText(domain+c);if(xml&&xml.includes("<loc>")){await parseSitemap(xml);break;}}}
async function dlAsset(rawUrl){try{if(!rawUrl||!rawUrl.startsWith(domain)||isSkippedAsset(rawUrl))return;const clean=rawUrl.split("?")[0].split("#")[0];if(assets.has(clean)||(!CONFIG.assetExtensions.test(clean)&&!clean.includes("/static/")))return;assets.add(clean);const dp=decodeURIComponent(new URL(clean).pathname);const fp=path.join(outputDir,dp);await fs.ensureDir(path.dirname(fp));const r=await axios({url:clean,method:"GET",responseType:"arraybuffer",timeout:CONFIG.requestTimeout,validateStatus:s=>s<500,headers:{"User-Agent":CONFIG.userAgent}});if(r.status>=400)return;let data=r.data;if(/\.css$/i.test(clean)){try{const txt=Buffer.isBuffer(data)?data.toString("utf8"):String(data);const cleaned=txt.replace(/@import\s+["'][^"']*\/_next\/static\/(?:chunks|runtime|webpack)[^"']*["'];?\s*/gi,"");let pretty=cleaned;try{pretty=await prettier.format(cleaned,{parser:"css",printWidth:120,tabWidth:2});}catch{}data=Buffer.from(pretty,"utf8");console.log("  [css]",dp);for(const m of cleaned.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)){const s=m[1];if(!s.startsWith("data:")){if(s.startsWith("http")){if(s.startsWith(domain))await dlAsset(s);}else if(s.startsWith("/"))await dlAsset(domain+s);}}}catch{}}else{console.log("  [dl]",dp);}await fs.writeFile(fp,data);}catch{}}
async function dlHtmlAssets(html){const srcs=new Set();for(const m of html.matchAll(/(?:src|data-src)=["']([^"'\s>]+\.(?:png|jpg|jpeg|svg|gif|webp|ico|mp4|webm))["']/gi))srcs.add(m[1]);for(const m of html.matchAll(/\/_next\/image\?url=([^&"'\s]+)/gi)){try{const d=decodeURIComponent(m[1]);if(d.startsWith("/"))srcs.add(d);}catch{}}for(const m of html.matchAll(/<noscript[^>]*>([\s\S]*?)<\/noscript>/gi))for(const im of m[1].matchAll(/src=["']([^"']+\.(?:png|jpg|jpeg|svg|gif|webp|ico))["']/gi))srcs.add(im[1]);for(const src of srcs){if(src.startsWith("http")){if(src.startsWith(domain))await dlAsset(src);}else if(src.startsWith("/"))await dlAsset(domain+src);}}
async function waitDynamic(page){await page.evaluate(async()=>{await new Promise(resolve=>{const check=()=>{const busy=[...document.querySelectorAll('[class*="skeleton"],[class*="shimmer"],[class*="loading"],[class*="spinner"]')].some(el=>{const cs=window.getComputedStyle(el);return cs.display!=="none"&&cs.visibility!=="hidden"&&cs.opacity!=="0";});if(!busy)return resolve();setTimeout(check,300);};setTimeout(check,800);setTimeout(resolve,12000);});});}
async function harvestLinks(page){const found=new Set();await page.evaluate(async()=>{await new Promise(res=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,300);y+=300;if(y>=document.body.scrollHeight+300){clearInterval(t);res();}},50);});document.querySelectorAll('nav *,header *').forEach(el=>['mouseover','mouseenter'].forEach(e=>el.dispatchEvent(new MouseEvent(e,{bubbles:true}))));window.scrollTo(0,0);});await new Promise(r=>setTimeout(r,500));const links=await page.evaluate(domain=>{const s=new Set();document.querySelectorAll("a").forEach(a=>{try{const h=a.href||'';if(h.startsWith(domain)&&!h.includes("#")&&!h.includes("htmlContent")&&!h.includes("/static?"))s.add(h);}catch{}});try{const raw=JSON.stringify(window.__NEXT_DATA__||{});for(const m of raw.matchAll(/"(\/[a-zA-Z][a-zA-Z0-9/_-]{1,100})"/g)){const p=m[1];if(!p.includes(".")&&!p.startsWith("/_")&&!p.startsWith("/api")&&!p.startsWith("/static")&&p.length<120)s.add(domain+p);}(window.__BUILD_MANIFEST?.sortedPages||[]).forEach(p=>{if(!p.includes("[")&&!p.startsWith("/_"))s.add(domain+p);});}catch{}return[...s];},domain);links.forEach(l=>found.add(l));Object.values(CONFIG.linkMap).forEach(r=>{if(r&&r.startsWith('/'))enqueue(domain+r,"linkmap");});return[...found].filter(u=>isValidPage(cleanUrl(u)));}
async function setupPage(page){await page.evaluateOnNewDocument(domain=>{window.__HARVESTED_LINKS__=[];const hook=()=>{if(!window.next?.router)return;const orig=window.next.router.push.bind(window.next.router);window.next.router.push=(url,...a)=>{if(typeof url==="string"&&url.startsWith("/")&&!url.startsWith("/static"))window.__HARVESTED_LINKS__.push(domain+url);return orig(url,...a);};};hook();document.addEventListener("DOMContentLoaded",hook);window.addEventListener("load",hook);},domain);await page.setRequestInterception(true);page.on("request",req=>{if(!req.isInterceptResolutionHandled())req.continue();});page.on("response",async res=>{const url=res.url();if(url.startsWith(domain)&&!isSkippedAsset(url))await dlAsset(url);});}

async function scrapePage(browser,url){
  const clean=cleanUrl(url);if(visited.has(clean))return;
  visited.add(clean);
  console.log(`\n${"═".repeat(60)}\n[page] ${clean}`);
  const page=await browser.newPage();
  await page.setUserAgent(CONFIG.userAgent);await page.setViewport(CONFIG.viewport);await setupPage(page);
  try{await page.goto(clean,{waitUntil:["domcontentloaded","networkidle0"],timeout:CONFIG.navTimeout});}
  catch(e){console.log("  [warn]",e.message.split("\n")[0]);}
  const pagePath=new URL(clean).pathname.replace(/\/+$/,'')||'/';
  const finalUrl=cleanUrl(page.url());
  if(finalUrl!==clean&&finalUrl===domain){console.log("  [skip] redirected");fakeUrls.add(clean);await page.close();return;}
  await waitDynamic(page);await waitHydration(page);
  if(pagePath==='/business')await fixBusinessPage(page);
  await fixFaq(page);
  await new Promise(r=>setTimeout(r,CONFIG.pageSettle));
  await injectLinks(page,pagePath);
  const links=await harvestLinks(page);links.forEach(l=>enqueue(l,"page"));
  const html=await page.content();await dlHtmlAssets(html);
  let savePath=path.join(outputDir,pagePath);
  if(!/\.(html|htm)$/i.test(savePath))savePath=path.join(savePath,"index.html");
  await saveHtml(html,savePath,pagePath);
  await page.close();
}

async function capture404(browser){
  console.log("\n[404]");const page=await browser.newPage();
  await page.setUserAgent(CONFIG.userAgent);await page.setViewport(CONFIG.viewport);
  try{await page.goto(domain+"/xyz-404",{waitUntil:"networkidle2",timeout:20000});await new Promise(r=>setTimeout(r,2000));await saveHtml(await page.content(),path.join(outputDir,"404.html"),"/404");}
  catch{await fs.writeFile(path.join(outputDir,"404.html"),`<!DOCTYPE html><html><head><meta charset="utf-8"><title>404</title></head><body style="background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:min-height:100vh;font-family:system-ui"><div style="text-align:center"><h1 style="font-size:6rem;color:#e74c3c">404</h1><p>Page not found</p><a href="/" style="color:#4a9eff">← Home</a></div></body></html>`,"utf8");}
  await page.close();
}

async function generateServer(){
  await fs.writeFile(path.join(outputDir,"server.js"),`const http=require("http"),fs=require("fs"),path=require("path");const PORT=process.env.PORT||3000,ROOT=__dirname;const MIME={".html":"text/html; charset=utf-8",".css":"text/css",".js":"application/javascript",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".gif":"image/gif",".webp":"image/webp",".ico":"image/x-icon",".woff":"font/woff",".woff2":"font/woff2",".ttf":"font/ttf",".mp4":"video/mp4",".webm":"video/webm",".pdf":"application/pdf"};function c(p){p=decodeURIComponent((p||"/").split("?")[0].split("#")[0]);return p!=="/"&&p.endsWith("/")?p.slice(0,-1):p;}function r(u){const p=c(u);for(const f of[path.join(ROOT,p),path.join(ROOT,p,"index.html"),path.join(ROOT,p+".html")]){try{if(fs.statSync(f).isFile())return{file:f,status:200};}catch{}}try{const f=path.join(ROOT,"404.html");if(fs.statSync(f).isFile())return{file:f,status:404};}catch{}return{file:null,status:404};}http.createServer((req,res)=>{const{file,status}=r(req.url);if(!file){res.writeHead(404);return res.end("Not Found");}const ext=path.extname(file).toLowerCase();res.writeHead(status,{"Content-Type":MIME[ext]||"application/octet-stream","Cache-Control":ext===".html"?"no-cache":"public,max-age=86400"});fs.createReadStream(file).pipe(res);}).listen(PORT,()=>{console.log("\\n  ✅ http://localhost:"+PORT+"\\n");});`,"utf8");
  console.log("  [OK] server.js");
}

(async()=>{
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  🔥 Static Site Cloner v62.0.0 — TECHNOZIS PERFECT CLONE   ║");
  console.log("║  ✅ FIX: ALL 3 cards fully shown (img+text always visible)  ║");
  console.log("║  ✅ FIX: Detail sections forced flex-row via inline styles   ║");
  console.log("║  ✅ fixContentWrappers() post-process on every page save     ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("🎯 Target:", CONFIG.startUrl,"\n📁 Output:", outputDir,"\n");

  await fs.ensureDir(outputDir);
  await discoverSitemaps();

  const browser=await puppeteer.launch({
    headless:"new",
    args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-web-security","--allow-running-insecure-content","--disable-gpu"],
  });

  await saveLegalPage(browser,LEGAL.terms);
  await saveLegalPage(browser,LEGAL.privacy);
  visited.add(domain+'/terms-and-conditions');
  visited.add(domain+'/privacy-policy');

  let count=0,errors=0;
  while(queue.size>0&&count<CONFIG.maxPages){
    const url=queue.values().next().value;queue.delete(url);
    if(visited.has(cleanUrl(url)))continue;
    try{await scrapePage(browser,url);count++;}
    catch(e){console.log("  [error]",url,"→",e.message.split("\n")[0]);errors++;visited.add(cleanUrl(url));}
    console.log(`\n  📊 done:${count} queued:${queue.size} assets:${assets.size} errors:${errors}`);
  }

  await capture404(browser);
  await browser.close();
  await generateServer();
  console.log(`\n  ✅ DONE! Pages:${count} Assets:${assets.size} Errors:${errors}`);
  console.log("  ▶  cd cloned-site && node server.js\n");
})().catch(err=>{console.error("💥",err);process.exit(1);});