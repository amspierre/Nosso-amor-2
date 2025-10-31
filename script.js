(function(){
  // NAV TOGGLE (mobile)
  const navToggle=document.querySelector('.nav-toggle');
  const mainNav=document.querySelector('.main-nav');
  navToggle.addEventListener('click',()=>{
    mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
  });

  // Gallery: assign deterministic row spans for mosaic feel
  const gallery=document.getElementById('gallery');
  function setGallerySpans(){
    const imgs = gallery.querySelectorAll('img');
    const sizes = [30,45,36,24,42,28,34,22,40,26,32,30]; // row heights (in grid-auto-rows units)
    imgs.forEach((img,i)=>{
      const span = sizes[i % sizes.length] || 32;
      img.style.gridRow = `span ${span}`;
    });
  }
  setGallerySpans();

  // Lightbox for gallery
  gallery.addEventListener('click', e => {
    if(e.target.tagName !== 'IMG') return;
    const src = e.target.src;
    const overlay = document.createElement('div');
    overlay.style.position='fixed';overlay.style.inset=0;overlay.style.background='rgba(0,0,0,0.8)';
    overlay.style.display='flex';overlay.style.alignItems='center';overlay.style.justifyContent='center';overlay.style.zIndex=9999;
    const img = document.createElement('img');img.src = src;img.style.maxWidth='94%';img.style.maxHeight='94%';img.style.borderRadius='10px';
    overlay.appendChild(img);
    overlay.addEventListener('click',()=>overlay.remove());
    document.body.appendChild(overlay);
  });

  // Messages
  window.saveMessage = function(e){
    e.preventDefault();
    const name = document.getElementById('name').value || 'Anônimo';
    const msg = document.getElementById('message').value.trim();
    if(!msg) return alert('Escreva uma mensagem antes de enviar.');
    const box = document.createElement('div');
    box.className='msg-box';
    box.innerHTML = `<strong>${escapeHtml(name)}</strong><p class=\"muted\">${escapeHtml(msg)}</p>`;
    document.getElementById('messages').prepend(box);
    document.getElementById('name').value='';document.getElementById('message').value='';
  }
  function escapeHtml(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}

  // Playlist: scroll-snap carousel with central detection
  const carousel = document.getElementById('carousel');
  const trackEls = Array.from(carousel.querySelectorAll('.track'));
  const controls = {
    prev: document.querySelector('.ctrl.prev'),
    play: document.querySelector('.ctrl.play'),
    next: document.querySelector('.ctrl.next'),
    status: document.querySelector('.player-status')
  };
  let centerIndex = 2; // initial center

  function updateActive(){
    trackEls.forEach(t=> t.classList.remove('active'));
    const active = trackEls[centerIndex];
    if(active) active.classList.add('active');
    // pause others
    trackEls.forEach((t,i)=>{
      const a = t.querySelector('audio'); if(!a) return; if(i!==centerIndex){a.pause(); a.currentTime=0;}
    });
    // update status
    controls.status.textContent = `Faixa selecionada: ${active ? active.querySelector('.meta strong').textContent : '—'}`;
    // ensure active is visible
    if(active) active.scrollIntoView({behavior:'smooth',inline:'center'});
  }

  updateActive();

  // Prev/Next buttons
  controls.prev.addEventListener('click', ()=>{ centerIndex = Math.max(0, centerIndex-1); updateActive(); });
  controls.next.addEventListener('click', ()=>{ centerIndex = Math.min(trackEls.length-1, centerIndex+1); updateActive(); });

  // Play/Pause toggles central audio
  controls.play.addEventListener('click', ()=>{
    const active = trackEls[centerIndex]; if(!active) return;
    const audio = active.querySelector('audio');
    if(!audio) return;
    if(audio.paused){
      // pause others
      trackEls.forEach((t,i)=>{ const a=t.querySelector('audio'); if(a && i!==centerIndex){a.pause(); a.currentTime=0;} });
      audio.play(); controls.play.textContent='⏸'; controls.status.textContent = `Tocando: ${active.querySelector('.meta strong').textContent}`;
    } else { audio.pause(); controls.play.textContent='▶'; controls.status.textContent = `Pausado: ${active.querySelector('.meta strong').textContent}`; }
  });

  // clicking a track recenters it
  trackEls.forEach((t,i)=> t.addEventListener('click', ()=>{ centerIndex = i; updateActive(); }));

  // pause when audio ends
  trackEls.forEach((t,i)=>{
    const a = t.querySelector('audio'); if(!a) return; a.addEventListener('ended', ()=>{ if(i===centerIndex) controls.play.textContent='▶'; controls.status.textContent = `Encerrada: ${t.querySelector('.meta strong').textContent}`; });
  });

  // detect scroll to update centerIndex (debounced)
  let scrollTimeout;
  const calcCenterIndex = ()=>{
    const rects = trackEls.map(t=>t.getBoundingClientRect());
    const viewportCenter = carousel.getBoundingClientRect().left + carousel.getBoundingClientRect().width/2;
    let closest = 0; let minDist = Infinity;
    rects.forEach((r,i)=>{ const cx = r.left + r.width/2; const dist = Math.abs(viewportCenter - cx); if(dist < minDist){minDist = dist; closest = i;} });
    centerIndex = closest; updateActive();
  };
  carousel.addEventListener('scroll', ()=>{ clearTimeout(scrollTimeout); scrollTimeout = setTimeout(calcCenterIndex,120); });

  // simple swipe support for carousel (mobile)
  let startX=0;
  carousel.addEventListener('touchstart', e=> startX = e.touches[0].clientX );
  carousel.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - startX;
    if(dx > 40) { centerIndex = Math.max(0, centerIndex-1); updateActive(); }
    else if(dx < -40) { centerIndex = Math.min(trackEls.length-1, centerIndex+1); updateActive(); }
  });

})();