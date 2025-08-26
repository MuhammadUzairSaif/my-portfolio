import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Pure helper to pick an active section id from IntersectionObserver entries.
 * - Ignores null/undefined entries.
 * - Ignores entries without a valid target.id (non-empty string).
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

/** Lightweight, dependency-free typewriter effect. */
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

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("home");
  const activeRef = useRef("home");
  const shouldReduceMotion = useReducedMotion();

  const resumeUrl = "/resume.pdf"; // replace with your file
  const FORM_ENDPOINT = ""; // e.g., https://formspree.io/f/xxxx — leave empty to disable submit

  const translations = useMemo(() => ({
    en: {
      name: "Muhammad Uzair Saif",
      headline: "Salesforce & MuleSoft Developer",
      heroText: "Passionate about Salesforce, MuleSoft, and building interactive web solutions.",
      nav: ["home", "features", "portfolio", "blog", "resume", "contact"],
      viewWork: "View Work",
      printCV: "Print / Save CV",
      features: "Features",
      portfolio: "Portfolio",
      blog: "Blog",
      resume: "Resume",
      contact: "Contact Me",
      searchPlaceholder: "Search projects or tags...",
      testimonials: "Testimonials",
      projects: "Projects",
      integrations: "Integrations",
      certifications: "Certifications",
      yearsExp: "Years Experience",
      noResults: (q) => `No projects match "${q}"`,
      readMore: "Read more",
      close: "Close",
      send: "Send Message",
      backToTop: "Back to top ↑",
    },
  }), []);
  const [lang, setLang] = useState("en");
  const t = (key, ...args) => typeof translations[lang][key] === "function" ? translations[lang][key](...args) : translations[lang][key];
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

    sections.forEach((sec) => { if (sec && sec.id) observer.observe(sec); });
    return () => { sections.forEach((sec) => { if (sec && sec.id) observer.unobserve(sec); }); observer.disconnect(); };
  }, [lang]);

  // ---- Runtime Test Cases ----
  useEffect(() => {
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
      computeActiveFromEntries([
        { isIntersecting: true, target: { id: "home" } },
        { isIntersecting: true, target: { id: "portfolio" } },
      ], "home") === "portfolio",
      "Test 4 failed"
    );
    console.assert(
      computeActiveFromEntries([{ isIntersecting: false, target: { id: "resume" } }], "home") === "home",
      "Test 5 failed"
    );
    console.assert(computeActiveFromEntries([], "home") === "home", "Test 6 failed");
  }, []);

  // Portfolio data + search
  const [query, setQuery] = useState("");
  const projects = useMemo(() => ([
    { id: 1, title: "Salesforce Automation", tags: ["Salesforce", "Apex"], img: "https://via.placeholder.com/800x400?text=Salesforce+Automation", desc: "Automated lead routing, data checks, and event tracking with Apex + Flows.", links: { demo: "#", repo: "#" } },
    { id: 2, title: "MuleSoft API Suite", tags: ["MuleSoft", "Integration"], img: "https://via.placeholder.com/800x400?text=MuleSoft+API+Suite", desc: "API-led integration for ERP/CRM, monitoring and retries.", links: { demo: "#", repo: "#" } },
    { id: 3, title: "Data Pipeline Monitor", tags: ["Data", "ETL"], img: "https://via.placeholder.com/800x400?text=Data+Pipeline+Monitor", desc: "Anomaly detection, alerts, and audit logging across ETL jobs.", links: { demo: "#", repo: "#" } },
  ]), []);
  const filtered = projects.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())));

  // Modal for project details
  const [modal, setModal] = useState(null);
  const openModal = (p) => setModal(p);
  const closeModal = () => setModal(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Blog scaffold
  const posts = useMemo(() => ([
    { id: "b1", title: "Improving Flow Orchestrations", date: "2025-06-10", tags: ["Salesforce", "Flow"], excerpt: "Design tips for long-running orchestrations and error recovery.", cover: "https://via.placeholder.com/800x400?text=Blog+1" },
    { id: "b2", title: "MuleSoft Retry Patterns", date: "2025-05-22", tags: ["MuleSoft", "Integration"], excerpt: "Idempotency, retries, and circuit breakers in the wild.", cover: "https://via.placeholder.com/800x400?text=Blog+2" },
    { id: "b3", title: "Data Quality Lifelines", date: "2025-04-02", tags: ["Data", "ETL"], excerpt: "Quick wins to boost data reliability without heavy tooling.", cover: "https://via.placeholder.com/800x400?text=Blog+3" },
  ]), []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="font-sans scroll-smooth bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 h-1 bg-indigo-500 z-[60]" style={{ width: `${progress * 100}%` }} />

      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-md shadow z-50">
        <nav className="container mx-auto flex justify-between items-center p-4">
          <h1 className="font-bold text-xl">{t('name')}</h1>
          <ul className="flex gap-3 md:gap-6 items-center">
            {navItems.map((sec) => (
              <li
                key={sec}
                data-testid={`nav-${sec}`}
                className={`cursor-pointer capitalize hover:opacity-80 ${activeSection === sec ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""}`}
                onClick={() => scrollToSection(sec)}
              >
                {sec}
              </li>
            ))}
            <li>
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="px-2 py-1 rounded border bg-white dark:bg-gray-900">
                <option value="en">EN</option>
              </select>
            </li>
            <li><ThemeToggle /></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-700">
        <motion.img
          src="https://via.placeholder.com/150"
          alt="Profile"
          className="w-40 h-40 rounded-full shadow-lg border-4 border-white"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.5 }}
          animate={shouldReduceMotion ? false : { opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
        <h2 className="text-4xl md:text-5xl font-bold mt-6 text-center">
          <Typewriter
            strings={[t('name'), t('headline'), "Building useful things"]}
            typeSpeed={80}
            backSpeed={50}
            pause={1200}
            loop
            className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent"
          />
        </h2>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl text-center px-4">
          {t('heroText')}
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => scrollToSection(translations[lang].nav[2])} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:brightness-110">{t('viewWork')}</button>
          <a href={resumeUrl} download className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">Download Resume</a>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">{t('printCV')}</button>
        </div>
      </section>

      {/* Features Section */}
      <section id={translations[lang].nav[1]} className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-12">{t('features')}</h2>
        </div>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-4">
          {["Sales Cloud", "Service Cloud", "Integrations"].map((feat, i) => (
            <motion.div key={i} whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.02 }} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
              <h3 className="text-xl font-semibold mb-2">{feat}</h3>
              <p className="text-gray-600 dark:text-gray-300">Expertise in {feat} delivering business solutions.</p>
            </motion.div>
          ))}
        </div>

        {/* Achievements mini-metrics */}
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 px-4 text-center">
          <div><span className="text-3xl font-bold">25</span><div className="text-sm opacity-70">{t('projects')}</div></div>
          <div><span className="text-3xl font-bold">15</span><div className="text-sm opacity-70">{t('integrations')}</div></div>
          <div><span className="text-3xl font-bold">5</span><div className="text-sm opacity-70">{t('certifications')}</div></div>
          <div><span className="text-3xl font-bold">6</span><div className="text-sm opacity-70">{t('yearsExp')}</div></div>
        </div>
      </section>

      {/* Portfolio Section with search + modal */}
      <section id={translations[lang].nav[2]} className="py-20">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">{t('portfolio')}</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="mb-8 w-full md:w-1/2 px-4 py-2 rounded-lg border bg-white dark:bg-gray-900"
          />
        </div>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-4">
          {filtered.map((p) => (
            <motion.div key={p.id} whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.02 }} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden cursor-pointer" onClick={() => openModal(p)}>
              <img src={p.img} alt={p.title} className="w-full h-40 object-cover" loading="lazy" />
              <div className="p-4 text-left">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map(tg => <span key={tg} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">{tg}</span>)}
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center opacity-70">{t('noResults', query)}</div>
          )}
        </div>

        {/* Project Modal */}
        {modal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="max-w-3xl w_full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <img src={modal.img} alt={modal.title} className="w-full h-56 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-semibold">{modal.title}</h3>
                <p className="mt-2 opacity-90">{modal.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {modal.tags.map(tg => <span key={tg} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">{tg}</span>)}
                </div>
                <div className="mt-4 flex gap-3">
                  {modal.links?.demo && <a className="px-4 py-2 rounded-lg bg-indigo-600 text-white" href={modal.links.demo} target="_blank" rel="noreferrer">Live Demo</a>}
                  {modal.links?.repo && <a className="px-4 py-2 rounded-lg border" href={modal.links.repo} target="_blank" rel="noreferrer">Repository</a>}
                </div>
                <div className="mt-6 text-right">
                  <button className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700" onClick={closeModal}>{t('close')}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Blog Section */}
      <section id={translations[lang].nav[3]} className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-12">{t('blog')}</h2>
        </div>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-4">
          {posts.map((post) => (
            <article key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden text-left">
              <img src={post.cover} alt={post.title} className="w-full h-40 object-cover" loading="lazy" />
              <div className="p-4">
                <div className="text-xs opacity-70">{post.date}</div>
                <h3 className="font-semibold text-lg mt-1">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{post.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map(tg => <span key={tg} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">{tg}</span>)}
                </div>
                <button className="mt-4 px-3 py-1 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700">{t('readMore')}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Resume Section */}
      <section id={translations[lang].nav[4]} className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-12">{t('resume')}</h2>
        </div>
        <div className="container mx-auto grid md:grid-cols-2 gap-8 px-4">
          <div className="text-left">
            <h3 className="font-semibold text-xl mb-4">Experience</h3>
            <ul className="space-y-4">
              <li>
                <strong>Salesforce Developer</strong> – Tectonic (2023–2024)
                <p className="text-gray-600 dark:text-gray-300">Automation, LWC, Flow development, API integrations.</p>
              </li>
              <li>
                <strong>Machine Minder / Data Assistant</strong> – Dunbia (2022–2023)
                <p className="text-gray-600 dark:text-gray-300">Data entry, SAP reporting, operational assistance.</p>
              </li>
            </ul>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-xl mb-4">Skills</h3>
            {[
              ["Apex", 90],
              ["Flows", 85],
              ["MuleSoft", 80],
            ].map(([skill, pct], i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between mb-1"><span>{skill}</span><span>{pct}%</span></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"><div className="h-2 bg-indigo-600 rounded" style={{ width: `${pct}%` }}></div></div>
              </div>
            ))}
            <div className="mt-4 flex gap-3">
              <a href={resumeUrl} download className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Download Resume</a>
              <button onClick={() => window.print()} className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">{t('printCV')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section (Formspree-ready) */}
      <section id={translations[lang].nav[5]} className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">{t('contact')}</h2>
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
            <textarea name="message" placeholder="Your Message" className="w-full border p-3 rounded bg-white dark:bg-gray-900" rows={5} required />
            <button type="submit" className="bg-indigo-600 text-white w-full py-3 rounded hover:brightness-110">{t('send')}</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm opacity-80">
        <div className="mb-4">
          <button onClick={toTop} className="px-3 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800">{t('backToTop')}</button>
        </div>
        <div>© {new Date().getFullYear()} {t('name')} — All rights reserved.</div>
      </footer>
    </div>
  );
}
