// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Smooth scroll for internal links (native behavior on most browsers via CSS; JS fallback)
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').substring(1);
    const el = document.getElementById(id);
    if(el){
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// Add to Calendar (downloads an .ics file)
document.getElementById('addToCalendarBtn').addEventListener('click', ()=>{
  // TODO: Update date/time & location below
  const title = "Ikima & Iwuese Wedding";
  const start = "20251220T100000"; // YYYYMMDDTHHMMSS (local)
  const end   = "20251220T160000";
  const location = "St. XXX Parish, Makurdi; Reception at Venue XYZ, Makurdi";
  const description = "Join us to celebrate our wedding day! Dress code: all shades of brown.";

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Site//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@wedding.local
DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], {type: 'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wedding.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// RSVP form -> save to localStorage (can be replaced with a backend later)
const RSVP_KEY = 'wedding_rsvps';
const rsvpForm = document.getElementById('rsvpForm');
const rsvpSuccess = document.getElementById('rsvpSuccess');

rsvpForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(rsvpForm).entries());

  // Basic validation
  if(!data.name || !data.email || !data.attendance || !data.guests){
    alert('Please fill all required fields.');
    return;
  }

  const list = JSON.parse(localStorage.getItem(RSVP_KEY) || '[]');
  list.push({...data, ts: new Date().toISOString()});
  localStorage.setItem(RSVP_KEY, JSON.stringify(list));

  rsvpSuccess.hidden = false;
  rsvpForm.reset();
});

// Copy account number
document.querySelectorAll('[data-copy]').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const text = btn.getAttribute('data-copy');
    try{
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      setTimeout(()=> btn.textContent = 'Copy Account Number', 1500);
    }catch{
      alert('Copy failed. Please select and copy manually.');
    }
  });
});

// Gallery lightbox
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

gallery.addEventListener('click', (e)=>{
  const img = e.target.closest('img');
  if(!img) return;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || 'Photo';
  if(typeof lightbox.showModal === 'function') lightbox.showModal();
});

// Well Wishes
const WISH_KEY = 'wedding_wishes';
const wishForm = document.getElementById('wishForm');
const wishesList = document.getElementById('wishesList');

function renderWishes(){
  const wishes = JSON.parse(localStorage.getItem(WISH_KEY) || '[]').reverse();
  wishesList.innerHTML = wishes.map(w => `
    <article class="wish">
      <div class="wish__head">
        <span>${escapeHtml(w.wisher)}${w.location ? ` • ${escapeHtml(w.location)}` : ''}</span>
        <time datetime="${w.ts}">${new Date(w.ts).toLocaleString()}</time>
      </div>
      <p class="wish__msg">${escapeHtml(w.message)}</p>
    </article>
  `).join('') || '<p>No wishes yet. Be the first!</p>';
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

wishForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(wishForm);
  const wisher = fd.get('wisher')?.trim();
  const message = fd.get('message')?.trim();
  const location = fd.get('location')?.trim();
  if(!wisher || !message){
    alert('Please add your name and message.');
    return;
  }
  const wishes = JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
  wishes.push({ wisher, location, message, ts: new Date().toISOString() });
  localStorage.setItem(WISH_KEY, JSON.stringify(wishes));
  wishForm.reset();
  renderWishes();
});

renderWishes();
