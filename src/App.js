import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Pick an active section id from IntersectionObserver entries.
 * - Ignores null/undefined entries and ones without a valid target.id.
 * - Prefers the LAST intersecting entry.
 */
export function computeActiveFromEntries(entries, prevId) {
  let nextId = prevId;
  if (!Array.isArray(entries)) return nextId;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry || !entry.isIntersecting) continue;
    const target = entry.target;
    if (target && typeof target.id === "string" && target.id.length > 0) {
      nextId = target.id;
    }
  }
  return nextId;
}

/** Lightweight, dependency-free typewriter */
function Typewriter({ strings, typeSpeed = 80, backSpeed = 50, pause = 1200, loop = true, className = "" }) {
  const [idx, setIdx] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const current = strings?.[idx] || "";

  useEffect(() => {
    if (!current) return;
    let timeout = 0;

    if (!deleting && len < current.length) {
      timeout = typeSpeed;
      const t = setTimeout(() => setLen((l) => l + 1), timeout);
      return () => clearTimeout(t);
    }

    if (!deleting && len === current.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }

    if (deleting && len > 0) {
      timeout = backSpeed;
      const t = setTimeout(() => setLen((l) => l - 1), timeout);
      return () => clearTimeout(t);
    }

    if (deleting && len === 0) {
      const next = (idx + 1) % strings.length;
      setIdx(next);
      setDeleting(false);
      if (!loop && next === 0) {
        setLen(current.length);
        setDeleting(false);
      }
    }
  }, [current, deleting, len, typeSpeed, backSpeed, pause, idx, strings?.length, loop]);

  return (
    <span className={className} aria-live="polite">
      {current.slice(0, len)}
      <span className="inline-block w-1 h-6 align-middle ml-1 animate-pulse bg-current rounded-sm" />
    </span>
  );
}

/** Theme toggle with localStorage persistence */
function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme-dark");
    const initial = stored === "true";
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);
  const onToggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme-dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  };
  return (
    <button
      onClick={onToggle}
      className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const activeRef = useRef("home");
  const shouldReduceMotion = useReducedMotion();

  // === Personalization ===
  const resumeUrl = "/resume.pdf"; // Put your PDF in public/resume.pdf
  const FORM_ENDPOINT = "https://formspree.io/f/xeolqvka"; // e.g. "https://formspree.io/f/XXXXYYYY"

  // Translations (defined BEFORE any usage)
  const translations = useMemo(
  () => ({
    en: {
      name: "Muhammad Uzair Saif",
      headline: "Versatile Software Engineer | Salesforce & MuleSoft Specialist",
      heroText:
        "6+ years delivering enterprise SaaS on Salesforce, .NET, and middleware (MuleSoft, IBM IIB). Strong in Agile and SDLC, scalable architectures, and cross-functional collaboration.",
      nav: ["home", "features", "portfolio", "experience", "education", "certifications", "contact"],
      viewWork: "View Work",
      features: "Skills Snapshot",
      portfolio: "Key Projects",
      experience: "Experience",
      education: "Education",
      certifications: "Certifications",
      contact: "Contact Me",
      searchPlaceholder: "Search projects or tags...",
      testimonials: "Testimonials",
      projects: "Projects",
      integrations: "Integrations",
      certsCount: "Certifications",
      yearsExp: "Years Experience",
      noResults: (q) => `No projects match "${q}"`,
      readMore: "Read more",
      close: "Close",
      send: "Send Message",
      backToTop: "Back to top ↑",
    },
    de: {
      name: "Muhammad Uzair Saif",
      headline: "Vielseitiger Softwareentwickler | Salesforce- & MuleSoft-Spezialist",
      heroText:
        "6+ Jahre Erfahrung mit Enterprise-SaaS auf Salesforce, .NET und Middleware (MuleSoft, IBM IIB). Stark in Agile und SDLC, skalierbare Architekturen und funktionsübergreifende Zusammenarbeit.",
      nav: ["Startseite", "Fähigkeiten", "Projekte", "Erfahrung", "Bildung", "Zertifizierungen", "Kontakt"],
      viewWork: "Arbeiten ansehen",
      features: "Fähigkeiten im Überblick",
      portfolio: "Wichtige Projekte",
      experience: "Erfahrung",
      education: "Bildung",
      certifications: "Zertifizierungen",
      contact: "Kontakt",
      searchPlaceholder: "Projekte oder Tags suchen...",
      testimonials: "Referenzen",
      projects: "Projekte",
      integrations: "Integrationen",
      certsCount: "Zertifizierungen",
      yearsExp: "Jahre Erfahrung",
      noResults: (q) => `Keine Projekte gefunden für "${q}"`,
      readMore: "Mehr lesen",
      close: "Schließen",
      send: "Nachricht senden",
      backToTop: "Zurück nach oben ↑",
    },
    it: {
      name: "Muhammad Uzair Saif",
      headline: "Ingegnere Software Versatile | Specialista Salesforce & MuleSoft",
      heroText:
        "Oltre 6 anni di esperienza nella fornitura di SaaS aziendali su Salesforce, .NET e middleware (MuleSoft, IBM IIB). Forte in Agile e SDLC, architetture scalabili e collaborazione cross-funzionale.",
      nav: ["home", "competenze", "portfolio", "esperienza", "istruzione", "certificazioni", "contatto"],
      viewWork: "Vedi lavori",
      features: "Competenze in breve",
      portfolio: "Progetti principali",
      experience: "Esperienza",
      education: "Istruzione",
      certifications: "Certificazioni",
      contact: "Contattami",
      searchPlaceholder: "Cerca progetti o tag...",
      testimonials: "Testimonianze",
      projects: "Progetti",
      integrations: "Integrazioni",
      certsCount: "Certificazioni",
      yearsExp: "Anni di esperienza",
      noResults: (q) => `Nessun progetto corrisponde a "${q}"`,
      readMore: "Leggi di più",
      close: "Chiudi",
      send: "Invia messaggio",
      backToTop: "Torna su ↑",
    },
    fr: {
      name: "Muhammad Uzair Saif",
      headline: "Ingénieur Logiciel Polyvalent | Spécialiste Salesforce & MuleSoft",
      heroText:
        "Plus de 6 ans à livrer des SaaS d’entreprise sur Salesforce, .NET et middleware (MuleSoft, IBM IIB). Solide en Agile et SDLC, architectures évolutives et collaboration interfonctionnelle.",
      nav: ["accueil", "compétences", "portfolio", "expérience", "éducation", "certifications", "contact"],
      viewWork: "Voir mes travaux",
      features: "Aperçu des compétences",
      portfolio: "Projets clés",
      experience: "Expérience",
      education: "Éducation",
      certifications: "Certifications",
      contact: "Contactez-moi",
      searchPlaceholder: "Rechercher projets ou tags...",
      testimonials: "Témoignages",
      projects: "Projets",
      integrations: "Intégrations",
      certsCount: "Certifications",
      yearsExp: "Années d'expérience",
      noResults: (q) => `Aucun projet ne correspond à "${q}"`,
      readMore: "Lire plus",
      close: "Fermer",
      send: "Envoyer un message",
      backToTop: "Retour en haut ↑",
    },
    nl: {
      name: "Muhammad Uzair Saif",
      headline: "Veelzijdige Software Engineer | Salesforce- & MuleSoft-specialist",
      heroText:
        "Meer dan 6 jaar ervaring met enterprise SaaS op Salesforce, .NET en middleware (MuleSoft, IBM IIB). Sterk in Agile en SDLC, schaalbare architecturen en samenwerking over teams heen.",
      nav: ["home", "vaardigheden", "portfolio", "ervaring", "opleiding", "certificeringen", "contact"],
      viewWork: "Bekijk werk",
      features: "Vaardigheden overzicht",
      portfolio: "Belangrijkste projecten",
      experience: "Ervaring",
      education: "Opleiding",
      certifications: "Certificeringen",
      contact: "Neem contact op",
      searchPlaceholder: "Zoek projecten of tags...",
      testimonials: "Getuigenissen",
      projects: "Projecten",
      integrations: "Integraties",
      certsCount: "Certificeringen",
      yearsExp: "Jaren ervaring",
      noResults: (q) => `Geen projecten gevonden voor "${q}"`,
      readMore: "Lees meer",
      close: "Sluiten",
      send: "Verstuur bericht",
      backToTop: "Terug naar boven ↑",
    },
  }),
  []
);
  const [lang, setLang] = useState("en");
  const t = (key, ...args) =>
    typeof translations[lang][key] === "function" ? translations[lang][key](...args) : translations[lang][key];
  const navItems = translations[lang].nav;

  // Scroll progress bar
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      setProgress(height ? scrolled / height : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const SOCIALS = {
    linkedin: "https://www.linkedin.com/in/muzairsaif/",   // ← your LinkedIn
    trailblazer: "https://www.salesforce.com/trailblazer/muzairsaif",    // ← your Trailblazer
    //github: "https://github.com/uzairsaif",             // optional
    // email: "mailto:you@example.com",                    // optional
  };
  // Observe sections (robust & cleanup)
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const sections = Array.from(document.querySelectorAll("section[id]"));
    if (sections.length === 0) return;

    if (typeof window.IntersectionObserver !== "function") {
      const onScroll = () => {
        let current = activeRef.current;
        for (const sec of sections) {
          if (!sec || !sec.id) continue;
          const rect = sec.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          if (mid >= 0 && mid <= window.innerHeight) current = sec.id;
        }
        if (current !== activeRef.current) {
          activeRef.current = current;
          setActiveSection(current);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const nextId = computeActiveFromEntries(entries, activeRef.current);
        if (typeof nextId === "string" && nextId.length > 0 && nextId !== activeRef.current) {
          activeRef.current = nextId;
          setActiveSection(nextId);
        }
      },
      { threshold: 0.6, root: null, rootMargin: "-56px 0px -20% 0px" }
    );

    sections.forEach((sec) => {
      if (sec && sec.id) observer.observe(sec);
    });
    return () => {
      sections.forEach((sec) => {
        if (sec && sec.id) observer.unobserve(sec);
      });
      observer.disconnect();
    };
  }, [lang]);

  // ---- Runtime Test Cases (keep + add) ----
  useEffect(() => {
    // Existing tests
    console.assert(computeActiveFromEntries([null, undefined], "home") === "home", "Test 1 failed");
    console.assert(
      computeActiveFromEntries([{ isIntersecting: true, target: null }], "home") === "home",
      "Test 2 failed"
    );
    console.assert(
      computeActiveFromEntries([{ isIntersecting: true, target: { id: "features" } }], "home") === "features",
      "Test 3 failed"
    );
    console.assert(
      computeActiveFromEntries(
        [
          { isIntersecting: true, target: { id: "home" } },
          { isIntersecting: true, target: { id: "portfolio" } },
        ],
        "home"
      ) === "portfolio",
      "Test 4 failed"
    );
    console.assert(
      computeActiveFromEntries([{ isIntersecting: false, target: { id: "resume" } }], "home") === "home",
      "Test 5 failed"
    );
    console.assert(computeActiveFromEntries([], "home") === "home", "Test 6 failed");

    // Added tests: robust against empty/non-string ids
    console.assert(
      computeActiveFromEntries([{ isIntersecting: true, target: { id: "" } }], "home") === "home",
      "Test 7 failed (empty id)"
    );
    console.assert(
      computeActiveFromEntries([{ isIntersecting: true, target: { id: 123 } }], "home") === "home",
      "Test 8 failed (non-string id)"
    );

    // Added tests: translations presence
    console.assert(!!translations && !!translations.en, "Test 9 failed (translations missing)");
    
  }, []);

  // === CV-driven data ===
  const skills = useMemo(
    () => [
      ["Salesforce ", 90],
      ["Salesforce Apex", 90],
      ["Salesforce Flows", 85],
      ["Lightning Web Components (LWC)", 85],
      ["MuleSoft", 90],
      ["IBM Integration Bus", 70],
      ["Rest API", 90],
      ["Soap API", 90],
      [".NET / C#", 80],
      ["Java ", 95],
      ["SQL ", 95],
      ["CI/CD & Git", 80],
    ],
    []
  );

  const experience = useMemo(
    () => [
      {
        title: "Technical Consultant",
        company: "Tectonic Pvt. Limited",
        date: "Jan 2022 – Nov 2024",
        bullets: [
          "Implemented Salesforce Service Cloud; improved agent productivity by ~35%.",
          "Built real-time sync between Salesforce & SQL Server; 40% faster updates.",
          "Delivered 3+ MuleSoft integrations; boosted data sync efficiency by ~60%.",
          "Led 3 devs; projects delivered ~20% ahead of schedule.",
        ],
      },
      {
        title: "Senior Software Engineer",
        company: "Techlogix Pvt. Limited",
        date: "Jan 2021 – Dec 2021",
        bullets: [
          "Developed IBM IIB flows for debit card modules; ~45% faster transactions.",
          "Resolved 10+ production defects; reduced downtime by ~30%.",
          "Built customer data workflows; cut manual effort by ~70%.",
        ],
      },
      {
        title: "Software Engineer",
        company: "Wemsol Pvt. Limited (KEENU)",
        date: "Apr 2018 – Jan 2021",
        bullets: [
          "Integrated 10+ payment providers into NetConnect; +50% digital payments.",
          "Built secure .NET services with RSA encryption; 99.9% uptime maintained.",
          "Mentored juniors and led Git branch strategy.",
        ],
      },
    ],
    []
  );

  const projects = useMemo(
    () => [
      {
        id: 1,
        title: "Breckenridge Grand Vacations — Salesforce",
        tags: ["Salesforce", "REST", "Integrations"],
        img: "breckenridgegrandvacations.jpg",
        links: { demo: "https://breckenridgegrandvacations.com/" },
      },
      {
        id: 2,
        title: "Yellowstone Club — MuleSoft",
        tags: ["MuleSoft", "APIs", "Salesforce"],
        img: "yellowstoneclub.jpg",
        links: { demo: "https://yellowstoneclub.com/"},
      },
      {
        id: 3,
        title: "Biltmore — Salesforce & MuleSoft",
        tags: ["Salesforce", "MuleSoft", "Real-time"],
        img: "biltmore.jpg",
        links: { demo: "https://www.biltmore.com/"},
      },
      {
        id: 4,
        title: "Cherokee Nation — Salesforce Marketing Cloud & MuleSoft",
        tags: ["LWC", "Community", "Engagement", "Integration"],
        img: "cherokee.jpg",
        links: { demo: "https://www.cherokee.org/"},
      },
      {
        id: 5,
        title: "NetConnect — Payment Gateway (KEENU)",
        tags: [".NET", "Payments", "Security"],
        img: "Keenu.jpg",
        links: { demo: "https://keenu.pk/" },
      },
      {
        id: 6,
        title: "Merchant Portal (KEENU)",
        tags: [".NET Core", "Reporting", "APIs"],
        img: "MerchantPortal.jpg",
        links: { demo: "https://merchant.keenu.pk/MOB/" },
      },
    ],
    []
  );

  const posts = useMemo(
    () => [
      {
        id: "b1",
        title: "Improving Flow Orchestrations",
        date: "2025-06-10",
        tags: ["Salesforce", "Flow"],
        excerpt: "Design tips for long-running orchestrations and error recovery.",
        cover: "https://via.placeholder.com/800x400?text=Blog+1",
      },
      {
        id: "b2",
        title: "MuleSoft Retry Patterns",
        date: "2025-05-22",
        tags: ["MuleSoft", "Integration"],
        excerpt: "Idempotency, retries, and circuit breakers in the wild.",
        cover: "https://via.placeholder.com/800x400?text=Blog+2",
      },
      {
        id: "b3",
        title: "Data Quality Lifelines",
        date: "2025-04-02",
        tags: ["Data", "ETL"],
        excerpt: "Quick wins to boost data reliability without heavy tooling.",
        cover: "https://via.placeholder.com/800x400?text=Blog+3",
      },
    ],
    []
  );

  // Search & Modal
  const [query, setQuery] = useState("");
  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );
  const [modal, setModal] = useState(null);
  const openModal = (p) => setModal(p);
  const closeModal = () => setModal(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ===== Render =====
  return (
    <div className="font-sans scroll-smooth bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 h-1 bg-indigo-500 z-[60]" style={{ width: `${progress * 100}%` }} />

      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-md shadow z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <a
  href="/"
  className="font-bold text-xl hover:opacity-80 cursor-pointer"
>
  {t("name")}
</a>
          <ul className="flex gap-3 md:gap-6 items-center">
            {navItems.map((sec) => (
              <li
                key={sec}
                data-testid={`nav-${sec}`}
                className={`cursor-pointer capitalize hover:opacity-80 ${
                  activeSection === sec ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""
                }`}
                onClick={() => scrollToSection(sec)}
              >
                {sec}
              </li>
            ))}
            <li>
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="
                    appearance-none pr-8 pl-3 py-1.5 rounded-md
                    border border-gray-300 bg-white text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                    dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
                  "
                >
                  <option value="en">EN</option>
                  <option value="de">DE</option>
                  <option value="it">IT</option>
                  <option value="fr">FR</option>
                  <option value="nl">NL</option>
                </select>

                {/* Custom dropdown arrow */}
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="h-screen flex flex-col items-center justify-center 
             bg-gradient-to-r from-blue-50 to-purple-100 
             dark:bg-black dark:bg-none"
      >
        <motion.img
          src="ProfilePic.jpg"
          alt="Profile"
          className="w-40 h-40 rounded-full shadow-lg border-4 border-white"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.5 }}
          animate={shouldReduceMotion ? false : { opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
        <h2 className="text-4xl md:text-5xl font-bold mt-6 text-center">
          <Typewriter
            strings={[t("name"), t("headline")]}
            typeSpeed={80}
            backSpeed={50}
            pause={1200}
            loop
            className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent"
          />
        </h2>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl text-center px-4">{t("heroText")}</p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => scrollToSection(translations[lang].nav[2])}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:brightness-110"
          >
            {t("viewWork")}
          </button>
          <a href={resumeUrl} download className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">
            Download Resume
          </a>
        </div>
        {/* Find with me */}
<div className="mt-10 text-center">
  <div className="tracking-[0.25em] text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">
    Find me
  </div>

  <div className="mt-5 flex items-center justify-center gap-5">
    {/* LinkedIn */}
    <a
      href={SOCIALS.linkedin}
      target="_blank"
      rel="noreferrer"
      aria-label="LinkedIn"
      className="group w-16 h-16 inline-flex items-center justify-center rounded-2xl 
                 bg-white shadow-[6px_6px_14px_rgba(0,0,0,0.08),-6px_-6px_14px_rgba(255,255,255,0.8)]
                 border border-white/70
                 transition transform hover:-translate-y-0.5 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.10),-8px_-8px_20px_rgba(255,255,255,0.9)]
                 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none dark:hover:bg-gray-800"
    >
      {/* LinkedIn SVG */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:opacity-100">
        <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8.5h4V23h-4V8.5ZM8 8.5h3.8v2h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-5.9c0-1.4-.02-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V23h-4V8.5Z"
              fill="currentColor" className="text-gray-700 dark:text-gray-200"/>
      </svg>
    </a>

    {/* Trailblazer */}
    <a
      href={SOCIALS.trailblazer}
      target="_blank"
      rel="noreferrer"
      aria-label="Salesforce Trailblazer"
      className="group w-16 h-16 inline-flex items-center justify-center rounded-2xl 
                 bg-white shadow-[6px_6px_14px_rgba(0,0,0,0.08),-6px_-6px_14px_rgba(255,255,255,0.8)]
                 border border-white/70
                 transition transform hover:-translate-y-0.5 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.10),-8px_-8px_20px_rgba(255,255,255,0.9)]
                 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none dark:hover:bg-gray-800"
    >
      {/* Trailhead-style badge (generic mountain icon) */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:opacity-100">
        <path d="M3 19l6-10 3 5 3-4 6 9H3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
              className="text-gray-700 dark:text-gray-200"/>
        <path d="M1 19h22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              className="text-gray-400 dark:text-gray-600"/>
      </svg>
    </a>
  </div>
</div>
      </section>

      {/* Skills / Features Banner (full-bleed) */}
      <section id={translations[lang].nav[1]} className="relative py-20 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-400 dark:bg-black dark:bg-none" />
        <div className="relative max-w-7xl mx-auto px-4 text-white">
          <h2 className="text-4xl font-extrabold mb-12 drop-shadow-lg text-center">{t("features")}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {skills.map(([skill, pct], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="backdrop-blur bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white p-6 rounded-xl shadow-xl border border-white/20"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{skill}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-200/70 dark:bg-gray-700/70 rounded">
                  <div className="h-2 bg-indigo-600 rounded" style={{ width: `${pct}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Salesforce Domain Knowledge */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">
              Salesforce Domain Knowledge
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Sales Cloud */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition">
                <div className="text-pink-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 014-4h.586A2 2 0 0110 9h1a2 2 0 012 2v0a4 4 0 014 4h-1" />
                  </svg>
                </div>
                <h4 className="font-semibold text-xl text-gray-900 dark:text-white">Sales Cloud</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Streamline sales processes and drive business growth with Salesforce Sales Cloud.
                </p>
              </div>

              {/* Service Cloud */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition">
                <div className="text-pink-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c0-1.104-.896-2-2-2S8 6.896 8 8s.896 2 2 2 2-.896 2-2zm-6 8h12M6 16v2h12v-2" />
                  </svg>
                </div>
                <h4 className="font-semibold text-xl text-gray-900 dark:text-white">Service Cloud</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Deliver exceptional customer service and support with Salesforce Service Cloud.
                </p>
              </div>

              {/* Experience Cloud */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition">
                <div className="text-pink-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h4 className="font-semibold text-xl text-gray-900 dark:text-white">Experience Cloud</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Build personalized, branded digital experiences for customers and partners.
                </p>
              </div>

              {/* Marketing Cloud */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition">
                <div className="text-pink-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276a1 1 0 010 1.448L15 16v-6zM4 6h16M4 18h16" />
                  </svg>
                </div>
                <h4 className="font-semibold text-xl text-gray-900 dark:text-white">Marketing Cloud</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Create data-driven campaigns to boost engagement and growth.
                </p>
              </div>

              {/* Data Cloud */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition">
                <div className="text-pink-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16v12H4z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-xl text-gray-900 dark:text-white">Data Cloud</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Unify and manage data across sources to drive insights and decisions.
                </p>
              </div>

              {/* MuleSoft */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition">
                <div className="text-pink-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-xl text-gray-900 dark:text-white">MuleSoft</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Seamlessly integrate Salesforce with third-party apps and business platforms.
                </p>
              </div>
            </div>
          </div>


          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
            {[
              ["15+", t("projects")],
              ["20+", t("integrations")],
              [12, t("certsCount")],
              ["6+", t("yearsExp")],
            ].map(([num, label], i) => (
              <div
                key={i}
                className="backdrop-blur bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white rounded-xl p-6 shadow border border-white/20"
              >
                <span className="text-3xl font-bold">{num}</span>
                <div className="text-sm opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Banner with search + modal (full-bleed) */}
      <section id={translations[lang].nav[2]} className="relative py-20 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-500 dark:bg-black dark:bg-none" />
        <div className="relative max-w-7xl mx-auto px-4 text-white">
          <h2 className="text-4xl font-extrabold mb-6 drop-shadow-lg text-center">{t("portfolio")}</h2>
          <div className="flex justify-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="mb-10 w-full md:w-1/2 px-4 py-3 rounded-xl border border-white/30 bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/70"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {filtered.map((p, idx) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.02 }}
                className="backdrop-blur bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white rounded-xl shadow overflow-hidden cursor-pointer border border-white/20"
                onClick={() => openModal(p)}
              >
                <img src={p.img} alt={p.title} className="w-full h-40 object-cover" loading="lazy" />
                <div className="p-4 text-left">
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{p.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((tg) => (
                      <span key={tg} className="text-xs px-2 py-1 rounded-full bg-gray-100/90 dark:bg-gray-700/70">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
            {filtered.length === 0 && <div className="col-span-full text-center opacity-90">{t("noResults", query)}</div>}
          </div>
        </div>

        {/* Project Modal */}
        {modal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
            <div
              className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={modal.img} alt={modal.title} className="w-full h-56 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-semibold">{modal.title}</h3>
                <p className="mt-2 opacity-90">{modal.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {modal.tags.map((tg) => (
                    <span key={tg} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                      {tg}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  {modal.links?.demo && (
                    <a className="px-4 py-2 rounded-lg bg-indigo-600 text-white" href={modal.links.demo} target="_blank" rel="noreferrer">
                      Website
                    </a>
                  )}
                </div>
                <div className="mt-6 text-right">
                  <button className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700" onClick={closeModal}>
                    {t("close")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      

      {/* Experience Banner (full-bleed) */}
      <section id={translations[lang].nav[3]} className="relative py-20 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 dark:bg-black dark:bg-none" />
        <div className="relative max-w-7xl mx-auto px-4 text-white">
          <h2 className="text-4xl font-extrabold mb-12 drop-shadow-lg text-center">{t("experience")}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {experience.map((role, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="backdrop-blur bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white p-6 rounded-xl shadow-xl border border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-xl">{role.title}</h3>
                    <div className="opacity-90">{role.company}</div>
                  </div>
                  <span className="text-sm opacity-90 whitespace-nowrap">{role.date}</span>
                </div>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  {role.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Banner (full-bleed) */}
      <section id={translations[lang].nav[4]} className="relative py-20 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:bg-black dark:bg-none" />
        <div className="relative max-w-7xl mx-auto px-4 text-white">
          <h2 className="text-4xl font-extrabold mb-12 drop-shadow-lg text-center">{t("education")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                uni: "University of East Anglia",
                degree: "MSc Digital Business & Management",
                years: "2023 – 2024",
              },
              {
                uni: "Bahria University",
                degree: "MS Software Engineering",
                years: "2019 – 2021",
              },
              {
                uni: "Bahria University",
                degree: "BS Software Engineering",
                years: "2013 – 2017",
              },
            ].map((ed, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="backdrop-blur bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white p-6 rounded-xl shadow-xl border border-white/20 text-left"
              >
                <h3 className="font-semibold">{ed.uni}</h3>
                <div className="opacity-90">{ed.degree}</div>
                <div className="text-sm opacity-80">{ed.years}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Banner (full-bleed) */}
      <section id={translations[lang].nav[5]} className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:bg-black dark:bg-none" />
        <div className="relative max-w-7xl mx-auto text-center px-4 text-white">
          <h2 className="text-4xl font-extrabold mb-12 drop-shadow-lg">{t("certifications")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Salesforce Administrator",
              "Platform App Builder",
              "Platform Developer I",
              "Platform Developer II",
              "Data Cloud Consultant",
              "AI Specialist",
              "AI Associate",
              "Sharing & Visibility Architect",
              "Sales Cloud Consultant",
              "Salesforce Certified Associate",
              "MuleSoft Developer",
              "MuleSoft Associate",
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="backdrop-blur bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white p-6 rounded-xl shadow-lg hover:scale-105 transform transition"
              >
                <span className="font-semibold">{c}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id={translations[lang].nav[6]} className="py-20 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">{t("contact")}</h2>
          <form
            className="max-w-lg mx-auto space-y-4 text-left"
            action={FORM_ENDPOINT || undefined}
            method={FORM_ENDPOINT ? "POST" : undefined}
            onSubmit={(e) => {
              if (!FORM_ENDPOINT) {
                e.preventDefault();
                alert("Set FORM_ENDPOINT (e.g., Formspree) to enable submissions.");
              }
            }}
          >
            <input name="name" type="text" placeholder="Your Name" className="w-full border p-3 rounded bg-white dark:bg-gray-900" required />
            <input name="email" type="email" placeholder="Your Email" className="w-full border p-3 rounded bg-white dark:bg-gray-900" required />
            <input name="phone" type="text" placeholder="Phone Number" className="w-full border p-3 rounded bg-white dark:bg-gray-900" required />
            <textarea name="message" placeholder="Your Message" className="w-full border p-3 rounded bg-white dark:bg-gray-900" rows={5} required />
            <button type="submit" className="bg-indigo-600 text-white w-full py-3 rounded hover:brightness-110">{t("send")}</button>
          </form>
        </div>
        <div className="mt-10 text-center">
  <div className="tracking-[0.25em] text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">
    Find me
  </div>
  <div className="mt-5 flex items-center justify-center gap-5">
    {/* LinkedIn */}
    <a
      href={SOCIALS.linkedin}
      target="_blank"
      rel="noreferrer"
      aria-label="LinkedIn"
      className="group w-16 h-16 inline-flex items-center justify-center rounded-2xl 
                 bg-white shadow-[6px_6px_14px_rgba(0,0,0,0.08),-6px_-6px_14px_rgba(255,255,255,0.8)]
                 border border-white/70
                 transition transform hover:-translate-y-0.5 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.10),-8px_-8px_20px_rgba(255,255,255,0.9)]
                 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none dark:hover:bg-gray-800"
    >
      {/* LinkedIn SVG */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:opacity-100">
        <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 8.5h4V23h-4V8.5ZM8 8.5h3.8v2h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-5.9c0-1.4-.02-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V23h-4V8.5Z"
              fill="currentColor" className="text-gray-700 dark:text-gray-200"/>
      </svg>
    </a>

    {/* Trailblazer */}
    <a
      href={SOCIALS.trailblazer}
      target="_blank"
      rel="noreferrer"
      aria-label="Salesforce Trailblazer"
      className="group w-16 h-16 inline-flex items-center justify-center rounded-2xl 
                 bg-white shadow-[6px_6px_14px_rgba(0,0,0,0.08),-6px_-6px_14px_rgba(255,255,255,0.8)]
                 border border-white/70
                 transition transform hover:-translate-y-0.5 hover:shadow-[10px_10px_20px_rgba(0,0,0,0.10),-8px_-8px_20px_rgba(255,255,255,0.9)]
                 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none dark:hover:bg-gray-800"
    >
      {/* Trailhead-style badge (generic mountain icon) */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:opacity-100">
        <path d="M3 19l6-10 3 5 3-4 6 9H3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
              className="text-gray-700 dark:text-gray-200"/>
        <path d="M1 19h22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              className="text-gray-400 dark:text-gray-600"/>
      </svg>
    </a>
  </div>
</div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm opacity-80">
        <div className="mb-4">
          <button onClick={toTop} className="px-3 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">{t("backToTop")}</button>
        </div>
        <div>© {new Date().getFullYear()} {t("name")} — All rights reserved.</div>
      </footer>
    </div>
  );
}
