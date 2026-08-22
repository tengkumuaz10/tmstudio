(() => {
  const $ = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];

  // Year
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  // Scroll progress
  const progress = $("#scrollProgress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = p + "%";
    const header = $(".site-header");
    if (header) header.classList.toggle("scrolled", window.scrollY > 22);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => revealObserver.observe(el));

  // Mobile navigation
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  if (menuBtn && mobileMenu) {
    const closeMenu = () => {
      menuBtn.setAttribute("aria-expanded","false");
      mobileMenu.classList.remove("open");
      document.body.classList.remove("menu-open");
    };
    menuBtn.addEventListener("click", () => {
      const open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      mobileMenu.classList.toggle("open", !open);
      document.body.classList.toggle("menu-open", !open);
    });
    $$("a", mobileMenu).forEach(a => a.addEventListener("click", closeMenu));
  }

  // Custom cursor
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");
  if (dot && ring && window.matchMedia("(pointer:fine)").matches) {
    let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    window.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    }, {passive:true});
    const loop = () => {
      rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
      ring.style.left = rx+"px"; ring.style.top = ry+"px";
      requestAnimationFrame(loop);
    };
    loop();
    $$("a,button,[data-tilt]").forEach(el => {
      el.addEventListener("mouseenter",()=>ring.classList.add("active"));
      el.addEventListener("mouseleave",()=>ring.classList.remove("active"));
    });
  }

  // Spotlight cards
  $$(".spotlight-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX-r.left)+"px");
      card.style.setProperty("--my", (e.clientY-r.top)+"px");
    });
  });

  // Subtle tilt on premium visual blocks
  if (window.matchMedia("(pointer:fine)").matches) {
    $$("[data-tilt]").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width - .5;
        const y = (e.clientY-r.top)/r.height - .5;
        el.style.transform = `perspective(1000px) rotateX(${(-y*2.5).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg)`;
      });
      el.addEventListener("mouseleave", () => el.style.transform = "");
    });
  }

  // Magnetic buttons
  if (window.matchMedia("(pointer:fine)").matches) {
    $$(".magnetic").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top - r.height/2;
        btn.style.transform = `translate(${x*.07}px,${y*.11}px)`;
      });
      btn.addEventListener("mouseleave",()=>btn.style.transform="");
    });
  }

  // Vision builder
  const vision = {
    audience:"Company",
    tone:"Premium",
    goal:"Trust"
  };
  const copy = {
    Company:{
      Trust:["An established digital presence that earns trust fast.","Recommended: strategic homepage, services, proof, about, insights and a clear enquiry path.","6 sections"],
      Leads:["A focused company website built to turn attention into enquiries.","Recommended: value proposition, offer, proof, process, FAQ and high-intent contact path.","7 sections"],
      Reputation:["A brand-led corporate presence designed to strengthen reputation.","Recommended: manifesto, capabilities, leadership, selected impact, insights and contact.","6 sections"]
    },
    Individual:{
      Trust:["A polished personal site that makes your credibility instantly visible.","Recommended: positioning, expertise, selected work, experience, proof and contact.","6 sections"],
      Leads:["A personal brand site designed to convert interest into opportunities.","Recommended: offer, audience fit, outcomes, case studies, process, FAQ and contact.","7 sections"],
      Reputation:["An editorial portfolio that makes your name easier to remember.","Recommended: statement, selected work, profile, achievements, perspective and contact.","6 sections"]
    }
  };
  const intensity = {Premium:"Refined",Bold:"High-impact",Editorial:"Curated"};
  const accents = {Premium:"#b9ff63",Bold:"#8cecff",Editorial:"#c7a9ff"};

  const updateVision = () => {
    if (!$("#visionPreview")) return;
    $("#previewAudience").textContent = vision.audience;
    $("#previewTone").textContent = vision.tone;
    $("#previewGoal").textContent = vision.goal;
    const c = copy[vision.audience][vision.goal];
    $("#previewHeadline").textContent = c[0];
    $("#previewDescription").textContent = c[1];
    $("#previewPages").textContent = c[2];
    $("#previewIntensity").textContent = intensity[vision.tone];
    $("#visionPreview").style.setProperty("--preview-accent", accents[vision.tone]);
  };
  $$(".choice-row").forEach(group => {
    group.addEventListener("click", e => {
      const btn = e.target.closest(".choice");
      if (!btn) return;
      $$(".choice",group).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      vision[group.dataset.control] = btn.dataset.value;
      updateVision();
    });
  });
  updateVision();

  // Animated statistics
  const counters = $$("[data-count]");
  if (counters.length) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 900;
        const tick = now => {
          const t = Math.min((now-start)/duration,1);
          const eased = 1 - Math.pow(1-t,3);
          el.textContent = Math.round(target*eased);
          if (t<1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, {threshold:.5});
    counters.forEach(c => countObserver.observe(c));
  }
})();
