(() => {
    document.documentElement.classList.add('js');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const PHOTOS = { 1: '1.jpg', 2: '2.webp', 3: '3.webp', 4: '4.jpg' };

    const portrait = document.getElementById('portrait');
    const switchBtns = Array.from(document.querySelectorAll('.switch-btn'));
    let currentPhoto = '2';

    // split ascii art into lines for the dot-matrix print animation
    document.querySelectorAll('pre.ascii').forEach((pre) => {
        const lines = pre.textContent.replace(/\n$/, '').split('\n');
        pre.textContent = '';
        pre._lines = lines.map((ln) => {
            const s = document.createElement('span');
            s.className = 'ascii-line';
            s.textContent = ln;
            pre.appendChild(s);
            pre.appendChild(document.createTextNode('\n'));
            return s;
        });
    });

    const printAscii = (pre) => {
        const spans = pre._lines || [];
        if (reduced || spans.length === 0) {
            spans.forEach((s) => s.classList.add('on'));
            return;
        }
        let i = 0;
        const t = setInterval(() => {
            if (i < spans.length) {
                spans[i].classList.add('on');
                i++;
            } else {
                clearInterval(t);
            }
        }, 24);
    };

    // photo switcher
    const realImg = document.querySelector('.portrait__real');

    const switchPhoto = (n) => {
        if (n === currentPhoto || !PHOTOS[n]) return;
        currentPhoto = n;

        switchBtns.forEach((b) => {
            const active = b.dataset.photo === n;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (realImg) realImg.src = PHOTOS[n];

        document.querySelectorAll('pre.ascii').forEach((pre) => {
            const show = pre.dataset.art === n;
            pre.hidden = !show;
            if (show) {
                pre._lines.forEach((s) => s.classList.remove('on'));
                printAscii(pre);
            }
        });
    };

    switchBtns.forEach((b) => {
        b.setAttribute('aria-pressed', b.dataset.photo === currentPhoto ? 'true' : 'false');
        b.addEventListener('click', () => switchPhoto(b.dataset.photo));
    });

    // click the portrait to toggle between ASCII art and the real photo (in-frame)
    if (portrait) {
        const toggle = () => {
            const on = portrait.classList.toggle('is-real');
            portrait.setAttribute('aria-pressed', on ? 'true' : 'false');
        };
        portrait.addEventListener('click', toggle);
        portrait.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    }

    const runSection = (sec) => {
        if (sec._ran) return;
        sec._ran = true;
        const body = sec.querySelector('.term__body');
        if (body) body.classList.add('is-visible');
        const ascii = sec.querySelector('pre.ascii:not([hidden])');
        if (ascii) printAscii(ascii);
        decodeTitle(sec.querySelector('.sec-title'));
    };

    const GLYPHS = '!@#$%^&*';

    const decodeTitle = (title) => {
        if (!title) return;
        const final = title.textContent.trim();
        let frame = 0;
        const hold = 6;
        const iv = setInterval(() => {
            const reveal = Math.max(0, Math.floor((frame - hold) / 2));
            let out = '';
            for (let i = 0; i < final.length; i++) {
                out += (i < reveal || final[i] === ' ') ? final[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            title.textContent = out;
            frame++;
            if (reveal >= final.length) {
                clearInterval(iv);
                title.textContent = final;
            }
        }, 60);
    };

    const sections = document.querySelectorAll('[data-term]');

    if (reduced || !('IntersectionObserver' in window)) {
        sections.forEach(runSection);
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    runSection(en.target);
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.08 });
        sections.forEach((s) => io.observe(s));
    }

    // in-page image viewer (lightbox)
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lbImg = lightbox.querySelector('.lightbox__img');
        const lbTag = lightbox.querySelector('.lightbox__tag');

        const openLightbox = (src, alt, tag) => {
            lbImg.setAttribute('src', src);
            lbImg.alt = alt || '';
            lbTag.textContent = tag || '';
            lightbox.hidden = false;
            document.body.classList.add('no-scroll');
        };

        const closeLightbox = () => {
            lightbox.hidden = true;
            lbImg.removeAttribute('src');
            document.body.classList.remove('no-scroll');
        };

        // work thumbnails keep their <a href> as a no-JS fallback, but open in-page when JS runs
        document.querySelectorAll('.files .cert').forEach((a) => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const img = a.querySelector('img');
                const tag = a.querySelector('.cert__tag');
                openLightbox(a.getAttribute('href'), img ? img.alt : '', tag ? tag.textContent : '');
            });
        });

        // main work images open the viewer too
        document.querySelectorAll('.files .bb_img, .files .work_img').forEach((img) => {
            img.classList.add('is-zoomable');
            img.addEventListener('click', () => openLightbox(img.src, img.alt, '[ full view ]'));
        });

        lightbox.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
        });
    }

    // statusbar clock
    const clock = document.getElementById('clock');
    if (clock) {
        const pad = (n) => String(n).padStart(2, '0');
        const tick = () => {
            const d = new Date();
            clock.textContent = `[ ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ]`;
        };
        tick();
        setInterval(tick, 1000);
    }

    // paper / CRT mode switch
    const modeBtn = document.getElementById('modeToggle');
    const crtFlash = document.getElementById('crtFlash');
    if (modeBtn) {
        const label = modeBtn.querySelector('#modeLabel');
        const flash = () => {
            if (!crtFlash) return;
            crtFlash.classList.remove('is-on');
            void crtFlash.offsetWidth;
            crtFlash.classList.add('is-on');
        };
        const setMode = (dark) => {
            const wasDark = document.documentElement.classList.contains('crt');
            document.documentElement.classList.toggle('crt', dark);
            label.textContent = dark ? '[ PAPER ]' : '[ CRT ]';
            modeBtn.setAttribute('aria-pressed', String(dark));
            try { localStorage.setItem('mode', dark ? 'crt' : 'paper'); } catch {}
            if (dark && !wasDark && !reduced) flash();
        };
        modeBtn.addEventListener('click', () => setMode(!document.documentElement.classList.contains('crt')));
        setMode(document.documentElement.classList.contains('crt'));
    }

    // copy email button
    document.querySelectorAll('.copy-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const text = btn.dataset.copy;
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            }
            btn.classList.add('is-copied');
            btn.textContent = '[ copied ]';
            setTimeout(() => {
                btn.classList.remove('is-copied');
                btn.textContent = '[ copy ]';
            }, 1600);
        });
    });

    // konami code — an ASCII cat strolls across the footer
    const CAT_FRAMES = [
        [' /\\_/\\ ', '( -.- )', ' > ~ < '],
        [' /\\_/\\ ', '( o.o )', ' > ^ < ']
    ];

    const spawnCat = () => {
        const footer = document.querySelector('.footer');
        if (!footer || footer._cat) return;
        footer._cat = true;
        const cat = document.createElement('pre');
        cat.className = 'konami-cat';
        cat.setAttribute('aria-hidden', 'true');
        footer.appendChild(cat);
        if (reduced) {
            cat.textContent = CAT_FRAMES[0].join('\n');
            cat.style.transform = `translateX(${window.innerWidth - 90}px)`;
            setTimeout(() => { cat.remove(); footer._cat = false; }, 3000);
            return;
        }
        let x = -80;
        const step = () => {
            x += 3.4;
            cat.textContent = CAT_FRAMES[Math.floor(x / 30) % 2].join('\n');
            cat.style.transform = `translateX(${x}px)`;
            if (x < window.innerWidth + 40) requestAnimationFrame(step);
            else { cat.remove(); footer._cat = false; }
        };
        requestAnimationFrame(step);
    };

    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIndex = 0;
    document.addEventListener('keydown', (e) => {
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        konamiIndex = k === KONAMI[konamiIndex] ? konamiIndex + 1 : (k === KONAMI[0] ? 1 : 0);
        if (konamiIndex === KONAMI.length) {
            konamiIndex = 0;
            spawnCat();
        }
    });

    // mouse trail — decorative glyphs printed behind the cursor
    if (window.matchMedia('(pointer: fine)').matches) {
        const GLYPHS_TRAIL = '!@#$%^&*';
        let lastX = -100;
        let lastY = -100;
        document.addEventListener('mousemove', (e) => {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            if (dx * dx + dy * dy < 576) return;
            lastX = e.clientX;
            lastY = e.clientY;
            const g = document.createElement('span');
            g.className = 'mouse-glyph';
            g.textContent = GLYPHS_TRAIL[Math.floor(Math.random() * GLYPHS_TRAIL.length)];
            g.style.left = `${e.clientX - 6 + Math.random() * 12}px`;
            g.style.top = `${e.clientY - 8 + Math.random() * 12}px`;
            g.style.fontSize = `${10 + Math.floor(Math.random() * 7)}px`;
            document.body.appendChild(g);
            g.addEventListener('animationend', () => g.remove());
        }, { passive: true });
    }
})();
