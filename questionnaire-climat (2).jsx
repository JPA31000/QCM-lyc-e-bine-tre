import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "questionnaire-climat-answers";

// ── À PERSONNALISER ──────────────────────────────────────────────────────────
// Adresse du Drive où les élèves déposent leur PDF (laisser "" pour masquer le bloc)
const DRIVE_URL = "https://drive.google.com/drive/folders/1OYCMKkqUNOgfb_GqY8j1MqEK0h7F868U?usp=sharing";
const DRIVE_LABEL = "Dossier de dépôt de la classe"; // ← libellé affiché

// URL du script Apps Script de réception (voir apps-script-depot.gs à déployer).
// Tant que cette valeur est vide, le bouton « Transmettre » bascule sur le dépôt manuel.
const UPLOAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbxYINruJXkUFd6icH_rIPuKBQYyNRQEG52_NQrry3yRKEJeKV6isUx7gVwZ_lpJGHMPmg/exec"; // ← coller ici l'URL du Web App Apps Script (https://script.google.com/macros/s/…/exec)

// Logo du lycée (image embarquée en base64, aucun hébergement requis)
const LOGO_SRC = "data:image/jpeg;base64,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";

// ── Système de style central (palette chaleureuse, animations, mobile, a11y) ──
const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{font-family:'DM Sans',sans-serif;color:#57534e;background:linear-gradient(160deg,#fff7ed 0%,#fff1f2 52%,#fff7ed 100%);min-height:100vh;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:clamp(1rem,4vw,2rem)}
.screen--top{align-items:flex-start}
.card{background:#fff;border-radius:clamp(18px,4vw,26px);padding:clamp(1.5rem,5vw,2.75rem) clamp(1.25rem,4.5vw,2.5rem);width:100%;box-shadow:0 18px 48px rgba(234,88,12,0.13),0 2px 8px rgba(60,42,33,0.05)}
.qcard{animation:fadeUp .45s cubic-bezier(.4,0,.2,1) both}
.stagger>*{animation:fadeUp .5s cubic-bezier(.4,0,.2,1) both}
.stagger>*:nth-child(1){animation-delay:.04s}.stagger>*:nth-child(2){animation-delay:.09s}.stagger>*:nth-child(3){animation-delay:.14s}.stagger>*:nth-child(4){animation-delay:.19s}.stagger>*:nth-child(5){animation-delay:.24s}.stagger>*:nth-child(6){animation-delay:.29s}.stagger>*:nth-child(7){animation-delay:.34s}.stagger>*:nth-child(8){animation-delay:.39s}
button{font-family:'DM Sans',sans-serif;transition:transform .12s ease,box-shadow .2s ease,background .2s ease,border-color .2s ease,color .2s ease}
button:not(:disabled){cursor:pointer}
button:not(:disabled):active{transform:scale(.975)}
@media(hover:hover){.lift:not(:disabled):hover{transform:translateY(-1px)}}
input,textarea{font-family:'DM Sans',sans-serif}
h1,h2,h3{font-family:'Fraunces',Georgia,serif}
:focus{outline:none}
:focus-visible{outline:2.5px solid #ea580c;outline-offset:2px;border-radius:8px}
.pop{animation:pop .3s cubic-bezier(.34,1.56,.64,1)}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes pop{0%{transform:scale(.5);opacity:.4}60%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
.slider-input{-webkit-appearance:none;appearance:none;width:100%;height:34px;background:transparent;cursor:pointer;position:absolute;top:-7px;left:0;margin:0;opacity:0;z-index:2}
.slider-input::-webkit-slider-thumb{-webkit-appearance:none;width:38px;height:38px}
.slider-input::-moz-range-thumb{width:38px;height:38px;border:none}
@media(max-width:430px){.slider-tick--mid{display:none}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.01ms!important}}
`;


const QUESTIONS = [
  {
    id: "classe",
    section: "Profil",
    question: "1. Tu es actuellement :",
    type: "single",
    options: ["3PM", "CAP", "Bac professionnel seconde", "Bac professionnel première", "Bac professionnel terminale", "BTS", "DTMS", "Autre"],
  },
  {
    id: "securite",
    section: "Climat et sécurité",
    question: "2. Te sens-tu globalement en sécurité dans le lycée ?",
    type: "slider",
    options: ["Oui toujours", "Souvent", "Parfois", "Rarement", "Jamais"],
    optOut: "Je préfère ne pas répondre",
  },
  {
    id: "relations",
    section: "Climat et sécurité",
    question: "3. De manière générale, comment décrirais-tu les relations entre élèves dans le lycée ?",
    type: "slider",
    options: ["Très respectueuses", "Plutôt respectueuses", "Parfois tendues", "Souvent difficiles"],
    optOut: "Je ne sais pas",
  },
  {
    id: "lieux",
    section: "Climat et sécurité",
    question: "4. Y a-t-il des lieux dans le lycée où certains élèves peuvent se sentir moins à l'aise ? (plusieurs réponses possibles)",
    type: "multi_with_none",
    noneOption: "Aucun lieu en particulier",
    options: ["Cantine", "Couloirs", "Cour", "En classe", "Toilettes", "Vestiaires", "Internat", "Abords du lycée", "Réseaux sociaux entre élèves", "Autre"],
  },
  {
    id: "normalisation",
    section: "Situations observées",
    question: "5. Selon toi, certaines remarques ou blagues concernant les filles, les garçons ou l'apparence sont-elles considérées comme normales ou « pour rire » dans le lycée ?",
    type: "slider",
    options: ["Jamais", "Une ou deux fois dans l'année", "Quelques fois dans l'année", "Environ une fois par mois", "Plusieurs fois par mois"],
    optOut: "Je ne sais pas",
  },
  {
    id: "vu_entendu",
    section: "Situations observées",
    question: "6. As-tu déjà vu ou entendu dans le lycée : (plusieurs réponses possibles)",
    type: "multi_with_none",
    noneOption: "Aucune de ces situations",
    options: [
      "Remarques sur le corps ou l'apparence",
      "Blagues sur les filles ou les garçons",
      "Rumeurs sur la vie intime d'un élève",
      "Élèves qui insistent malgré un refus",
      "Gestes qui mettent quelqu'un mal à l'aise",
      "Diffusion de photos ou messages gênants",
      "Je préfère ne pas répondre",
    ],
  },
  {
    id: "frequence",
    section: "Situations observées",
    question: "7. Selon toi, ces situations arrivent :",
    type: "slider",
    options: ["Jamais", "Une ou deux fois dans l'année", "Quelques fois dans l'année", "Environ une fois par mois", "Plusieurs fois par mois", "Tous les jours"],
    optOut: "Je ne sais pas",
  },
  {
    id: "pression_amour",
    section: "Situations observées",
    question: "8. Penses-tu que certains élèves peuvent subir une pression des autres concernant les relations amoureuses ?",
    type: "single",
    options: ["Jamais", "Une ou deux fois dans l'année", "Quelques fois dans l'année", "Environ une fois par mois", "Plusieurs fois par mois", "Je ne sais pas"],
  },
  {
    id: "reseaux",
    section: "Situations observées",
    question: "9. Selon toi, les réseaux sociaux entre élèves peuvent-ils parfois être un lieu de moqueries, de rumeurs ou de pression ?",
    type: "slider",
    options: ["Jamais", "Une ou deux fois dans l'année", "Quelques fois dans l'année", "Environ une fois par mois", "Plusieurs fois par mois"],
    optOut: "Je ne sais pas",
  },
  {
    id: "reaction_temoins",
    section: "Réactions et soutien",
    question: "10. Quand un élève est témoin d'une situation qui met quelqu'un mal à l'aise, les autres élèves réagissent-ils ?",
    type: "slider",
    options: ["Oui souvent", "Parfois", "Rarement", "Jamais"],
    optOut: "Je ne sais pas",
  },
  {
    id: "demander_aide",
    section: "Réactions et soutien",
    question: "11. Penses-tu qu'il est facile pour un élève de demander de l'aide dans ce type de situation ?",
    type: "slider",
    options: ["Oui", "Plutôt oui", "Plutôt non", "Non"],
    optOut: "Je ne sais pas",
  },
  {
    id: "adultes_serieux",
    section: "Réactions et soutien",
    question: "12. Penses-tu que les adultes du lycée (prof, vie scolaire, …) prennent ces situations au sérieux ?",
    type: "slider",
    options: ["Oui", "Plutôt oui", "Plutôt non", "Non"],
    optOut: "Je ne sais pas",
  },
  {
    id: "cru_aide",
    section: "Réactions et soutien",
    question: "13. Penses-tu qu'un élève qui parle d'une situation difficile sera cru et aidé par les adultes du lycée ?",
    type: "slider",
    options: ["Oui", "Plutôt oui", "Plutôt non", "Non"],
    optOut: "Je ne sais pas",
  },
  {
    id: "vers_qui",
    section: "Trouver de l'aide",
    question: "14. Sais-tu vers quel adulte te tourner si toi ou un camarade avez un problème ?",
    type: "slider",
    options: ["Oui clairement", "Peut-être", "Non"],
  },
  {
    id: "connait_ressources",
    section: "Trouver de l'aide",
    question: "15. Connais-tu des personnes ou des lieux qui peuvent aider un élève en difficulté ?",
    type: "single",
    options: ["Oui", "Un peu", "Non"],
  },
  {
    id: "lesquelles",
    section: "Trouver de l'aide",
    question: "16. Si oui, lesquels connais-tu ? (plusieurs réponses possibles)",
    type: "multi",
    options: [
      "Professeur",
      "CPE",
      "Infirmier / infirmière",
      "Assistant d'éducation (AED)",
      "Psychologue scolaire / conseiller d'orientation",
      "Association extérieure / éducateur",
      "Proviseur",
      "Coordonnateur ULIS",
      "DDFPT",
      "Référent PHARE",
      "Autre",
    ],
  },
  {
    id: "parler_plus",
    section: "Pistes d'action",
    question: "17. Penses-tu qu'il serait utile de parler davantage de ces sujets au lycée ?",
    type: "slider",
    options: ["Oui", "Peut-être", "Non"],
    optOut: "Je ne sais pas",
  },
  {
    id: "actions",
    section: "Pistes d'action",
    question: "18. Quelles actions pourraient être utiles au lycée ? (plusieurs réponses possibles)",
    type: "multi",
    options: [
      "Interventions d'associations",
      "Discussions en classe",
      "Ateliers ou débats",
      "Affiches d'information",
      "Élèves ambassadeurs",
      "Création d'un lieu d'écoute ou refuge",
      "Formation des adultes",
      "Journée des diversités",
      "Conseil de vie lycéenne",
      "Maison des lycéens",
      "Comité d'éducation à la santé, à la citoyenneté et à l'environnement",
      "Autre",
    ],
  },
  {
    id: "idee",
    section: "Pistes d'action",
    question: "19. Si tu le souhaites, tu peux écrire ici une idée pour améliorer le respect et le bien-être des élèves dans le lycée : (réponse libre)",
    type: "text",
  },
];

const TOTAL = QUESTIONS.length;

// ── Sauvegarde localStorage ──────────────────────────────────────────────────
function saveToStorage(answers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, savedAt: new Date().toISOString() }));
    return true;
  } catch { return false; }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// Code identifiant aléatoire : 3 lettres + 3 chiffres (ex. "KQF482")
// Lettres I et O exclues (confusion avec 1 et 0) pour une lecture fiable du prof.
function randomCode() {
  const L = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const D = "0123456789";
  const pick = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return pick(L, 3) + pick(D, 3);
}

// ── Marqueur de données embarquées dans le PDF ───────────────────────────────
const DATA_MARKER = "CLIMAT_DATA_V1:";

// Encodage / décodage base64 compatible UTF-8 (accents) côté navigateur
function encodeB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function decodeB64(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

// Chargement robuste d'un script CDN : on attend que le global soit réellement dispo
function loadScript(src, globalReady) {
  return new Promise((resolve, reject) => {
    if (globalReady()) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = async () => {
      // Le onload peut précéder l'exposition du global : on poll jusqu'à 3 s
      for (let i = 0; i < 60; i++) {
        if (globalReady()) return resolve();
        await new Promise((r) => setTimeout(r, 50));
      }
      reject(new Error("Global indisponible après chargement de " + src));
    };
    s.onerror = () => reject(new Error("Échec du chargement de " + src));
    document.head.appendChild(s);
  });
}

// Téléchargement d'un blob (fonctionne hors iframe sandboxée ; fallback nouvel onglet)
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.open(url, "_blank"); // si le téléchargement direct est bloqué
  }
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ── Export PDF (jsPDF – téléchargement direct) ──────────────────────────────
function formatAnswer(q, answer) {
  if (!answer && answer !== 0) return "—";
  if (q.type === "text") return answer || "—";
  if (q.type === "single" || q.type === "slider") return answer;
  if (q.type === "multi" || q.type === "multi_with_none") {
    const vals = Array.isArray(answer) ? answer : [];
    if (vals.includes("__none__")) return q.noneOption || "Aucune";
    return vals.length ? vals.join(", ") : "—";
  }
  if (q.type === "grid") {
    return q.rows.map((row) => `${row} : ${answer[row] || "—"}`).join("\n");
  }
  return "—";
}

async function buildPdf(answers, studentId) {
  // Charge jsPDF depuis le CDN autorisé, en attendant que le global soit prêt
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    () => window.jspdf && window.jspdf.jsPDF
  );

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ── Réponses + identifiant embarqués dans les métadonnées (relecture prof) ──
  doc.setProperties({
    title: "Questionnaire Climat relationnel au lycée",
    subject: DATA_MARKER + encodeB64(JSON.stringify({ id: studentId, answers })),
    keywords: "climat,lycee,anonyme,id-" + studentId,
    creator: "questionnaire-climat",
  });

  const pageW = 210;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 20;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkY = (needed) => { if (y + needed > 280) addPage(); };

  // ── En-tête ──
  doc.setFillColor(99, 102, 241);
  doc.roundedRect(margin, y, contentW, 22, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Questionnaire – Climat relationnel au lycée", margin + 6, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Réponses du ${date}  ·  Code ${studentId}  ·  Questionnaire anonyme`, margin + 6, y + 17);
  y += 28;

  let lastSection = "";

  QUESTIONS.forEach((q) => {
    const ans = formatAnswer(q, answers[q.id]);
    const ansLines = q.type === "grid"
      ? ans.split("\n")
      : doc.splitTextToSize(ans, contentW - 14);

    // Hauteur calculée d'après le nb réel de lignes de la question ET de la réponse
    const qLines = doc.splitTextToSize(q.question, contentW - 12);
    const qH = qLines.length * 4.6;          // hauteur du texte de question
    const ansBoxH = ansLines.length * 5.2 + 4; // hauteur de la boîte réponse
    const blockH = 6 + qH + 3 + ansBoxH + 5;   // marges internes incluses

    checkY(blockH + 12);

    // Section header
    if (q.section !== lastSection) {
      lastSection = q.section;
      checkY(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(99, 102, 241);
      doc.text(q.section.toUpperCase(), margin, y);
      y += 5;
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.4);
      doc.line(margin, y, margin + contentW, y);
      y += 5;
    }

    // Fond du bloc question
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, contentW, blockH, 3, 3, "F");
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(margin, y, 3, blockH, 1.5, 1.5, "F");

    // Texte de la question
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 27, 75);
    doc.text(qLines, margin + 7, y + 6);

    // Boîte réponse (positionnée sous la question, quelle que soit sa hauteur)
    const ansBoxY = y + 6 + qH;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 7, ansBoxY, contentW - 14, ansBoxH, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(ansLines, margin + 10, ansBoxY + 5);

    y += blockH + 4;
  });

  // ── Pied de page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(`Document généré automatiquement · Page ${i}/${pageCount}`, pageW / 2, 291, { align: "center" });
  }

  // Téléchargement robuste (blob) plutôt que doc.save() — fallback nouvel onglet
  const blob = doc.output("blob");
  const datauri = doc.output("datauristring");
  const base64 = datauri.includes(",") ? datauri.split(",")[1] : "";
  return { blob, base64, filename: `climat-${studentId}.pdf` };
}

// Télécharge le PDF sur l'appareil de l'élève
async function exportPDF(answers, studentId) {
  const { blob, filename } = await buildPdf(answers, studentId);
  downloadBlob(blob, filename);
}

// Transmet le PDF au Drive via le Web App Apps Script (anonyme, sans connexion élève)
async function uploadPdf(answers, studentId) {
  const { base64, filename } = await buildPdf(answers, studentId);
  const fd = new FormData();
  fd.append("filename", filename);
  fd.append("code", String(studentId));
  fd.append("mime", "application/pdf");
  fd.append("data", base64);
  // Les Web Apps Apps Script ne renvoient pas d'en-tête CORS : le navigateur
  // interdit de LIRE la réponse depuis une autre origine. On envoie donc la
  // requête en "no-cors" (le POST atteint le serveur et le fichier est bien
  // créé dans le Drive), mais la réponse est opaque et illisible.
  // On considère donc l'absence d'erreur réseau comme un succès.
  // Seul repli en cas de coupure réseau / blocage : le dépôt manuel.
  await fetch(UPLOAD_ENDPOINT, { method: "POST", body: fd, mode: "no-cors" });
  return { ok: true };
}

// ── Composants UI ────────────────────────────────────────────────────────────

function ProgressBar({ current, total, section }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", gap: "0.6rem" }}>
        {section && (
          <span style={{ fontSize: "0.74rem", color: "#9a3412", background: "#fff3ec", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", padding: "0.28rem 0.7rem", borderRadius: "99px" }}>{section}</span>
        )}
        <span style={{ fontSize: "0.8rem", color: "#7c6f64", fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", marginLeft: "auto" }}>{current} / {total}</span>
      </div>
      <div style={{ height: "8px", background: "#f1e9e2", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#fb923c,#ea580c)", borderRadius: "99px", transition: "width 0.45s cubic-bezier(.34,1.2,.4,1)" }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "0.7rem" }}>
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current - 1;
          const active = i === current - 1;
          return (
            <span key={i} style={{ width: active ? "9px" : "7px", height: active ? "9px" : "7px", borderRadius: "50%", background: done || active ? "linear-gradient(135deg,#fb923c,#ea580c)" : "#ece5df", boxShadow: active ? "0 0 0 3px #fed7aa" : "none", transition: "all 0.3s" }} />
          );
        })}
      </div>
    </div>
  );
}

// Couleur d'un palier : t=0 (vert, début d'échelle) → t=1 (rouge, fin d'échelle).
// Dans toutes les questions, l'index 0 correspond à la réponse la plus favorable,
// donc vert = favorable, rouge = défavorable, de façon cohérente.
function scaleColor(t) {
  const stops = [[34, 197, 94], [132, 204, 22], [234, 179, 8], [249, 115, 22], [239, 68, 68]];
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  const f = x - i;
  const c = stops[i].map((a, k) => Math.round(a + (stops[i + 1][k] - a) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const SCALE_EMOJIS = ["😊", "🙂", "😐", "😕", "😟"];

function SliderChoice({ options, optOut, value, onChange }) {
  const n = options.length;
  const index = value !== undefined ? options.indexOf(value) : -1;
  const onScale = index >= 0;
  const optOutSelected = optOut && value === optOut;
  const t = n <= 1 ? 0 : index / (n - 1);
  const pct = t * 100;
  const C = onScale ? scaleColor(t) : "#d6cdc5";
  const emoji = onScale ? SCALE_EMOJIS[Math.round(t * (SCALE_EMOJIS.length - 1))] : null;
  return (
    <div style={{ padding: "0.5rem 0.25rem 0.25rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem", minHeight: "4rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {onScale ? (
          <>
            <div key={emoji} className="pop" style={{ fontSize: "2.6rem", marginBottom: "0.35rem", lineHeight: 1 }}>{emoji}</div>
            <div style={{ fontWeight: 700, fontSize: "1.12rem", color: C, transition: "color 0.2s" }}>{value}</div>
          </>
        ) : optOutSelected ? (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#7c6f64" }}>{optOut}</div>
        ) : (
          <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#a8a29e", fontSize: "0.92rem" }}>← Glisse le curseur pour répondre →</div>
        )}
      </div>
      <div style={{ position: "relative", padding: "10px 0", opacity: optOutSelected ? 0.35 : 1, transition: "opacity 0.2s" }}>
        {/* Spectre vert → rouge en fond, portion atteinte mise en valeur */}
        <div style={{ height: "8px", borderRadius: "99px", background: "linear-gradient(to right,#22c55e,#84cc16,#eab308,#f97316,#ef4444)", opacity: onScale ? 1 : 0.3, transition: "opacity 0.2s" }} />
        {onScale && <div style={{ position: "absolute", top: "10px", left: `${pct}%`, right: 0, height: "8px", borderRadius: "0 99px 99px 0", background: "#ece5df" }} />}
        <input type="range" min={0} max={n - 1} value={onScale ? index : Math.floor((n - 1) / 2)} onChange={(e) => onChange(options[parseInt(e.target.value)])} className="slider-input" />
        <div style={{ position: "absolute", top: "50%", left: `calc(${onScale ? pct : 50}% - 15px)`, transform: "translateY(-50%)", width: "30px", height: "30px", borderRadius: "50%", background: C, border: "3px solid #fff", boxShadow: "0 3px 12px rgba(0,0,0,0.28)", transition: "left 0.1s,background 0.2s", pointerEvents: "none", zIndex: 1 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.8rem", gap: "0.3rem" }}>
        {options.map((opt, i) => (
          <span key={opt} className={`slider-tick${i === 0 || i === n - 1 ? "" : " slider-tick--mid"}`} onClick={() => onChange(opt)} style={{ cursor: "pointer", fontSize: "0.72rem", color: index === i ? scaleColor(n <= 1 ? 0 : i / (n - 1)) : "#a8a29e", fontWeight: index === i ? 700 : 400, textAlign: "center", flex: 1, lineHeight: 1.25, transition: "color 0.2s" }}>{opt}</span>
        ))}
      </div>
      {optOut && (
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button onClick={() => onChange(optOut)} style={{ padding: "0.5rem 1.2rem", borderRadius: "99px", border: optOutSelected ? "2px solid #ea580c" : "2px solid #ece5df", background: optOutSelected ? "#fff3ec" : "#fff", color: optOutSelected ? "#9a3412" : "#7c6f64", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", fontWeight: optOutSelected ? 600 : 400, cursor: "pointer", transition: "all 0.18s" }}>{optOut}</button>
        </div>
      )}
    </div>
  );
}

// ── Gestion de l'option « Autre » avec champ libre ──────────────────────────
const OTHER = "Autre";
const isOther = (v) => typeof v === "string" && (v === OTHER || v.startsWith(OTHER + " :"));
const otherTextOf = (v) => (isOther(v) ? v.replace(/^Autre\s*:?\s*/, "") : "");
const makeOther = (txt) => (txt && txt.length ? `${OTHER} : ${txt}` : OTHER);

function OtherInput({ text, onText }) {
  return (
    <input
      type="text" value={text} autoFocus
      onChange={(e) => onText(e.target.value)}
      placeholder="Précise ta réponse…"
      style={{ width: "100%", marginTop: "0.5rem", padding: "0.7rem 1rem", borderRadius: "10px", border: "2px solid #fed7aa", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "#57534e", outline: "none", boxSizing: "border-box", background: "#fff" }}
    />
  );
}

function SingleChoice({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} className="stagger">
      {options.map((opt) => {
        if (opt === OTHER) {
          const selected = isOther(value);
          return (
            <div key={opt} style={{ display: "flex", flexDirection: "column" }}>
              <button onClick={() => onChange(selected ? value : OTHER)} style={{ padding: "0.85rem 1.2rem", borderRadius: "12px", border: selected ? "2px solid #ea580c" : "2px solid #ece5df", background: selected ? "#fff3ec" : "#fff", color: selected ? "#9a3412" : "#57534e", fontFamily: "'DM Sans', sans-serif", fontSize: "0.97rem", fontWeight: selected ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "all 0.18s", boxShadow: selected ? "0 0 0 4px #fdba7455" : "none" }}>Autre…</button>
              {selected && <OtherInput text={otherTextOf(value)} onText={(t) => onChange(makeOther(t))} />}
            </div>
          );
        }
        const selected = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{ padding: "0.85rem 1.2rem", borderRadius: "12px", border: selected ? "2px solid #ea580c" : "2px solid #ece5df", background: selected ? "#fff3ec" : "#fff", color: selected ? "#9a3412" : "#57534e", fontFamily: "'DM Sans', sans-serif", fontSize: "0.97rem", fontWeight: selected ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "all 0.18s", boxShadow: selected ? "0 0 0 4px #fdba7455" : "none" }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({ options, value = [], onChange }) {
  const otherEntry = value.find(isOther);
  const setOtherText = (txt) => onChange([...value.filter((v) => !isOther(v)), makeOther(txt)]);
  const toggle = (opt) => {
    if (opt === OTHER) {
      return otherEntry ? onChange(value.filter((v) => !isOther(v))) : onChange([...value, OTHER]);
    }
    value.includes(opt) ? onChange(value.filter((v) => v !== opt)) : onChange([...value, opt]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} className="stagger">
      {options.map((opt) => {
        const selected = opt === OTHER ? !!otherEntry : value.includes(opt);
        const row = (
          <button key={opt} onClick={() => toggle(opt)} style={{ padding: "0.85rem 1.2rem", borderRadius: "12px", border: selected ? "2px solid #ea580c" : "2px solid #ece5df", background: selected ? "#fff3ec" : "#fff", color: selected ? "#9a3412" : "#57534e", fontFamily: "'DM Sans', sans-serif", fontSize: "0.97rem", fontWeight: selected ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "all 0.18s", display: "flex", alignItems: "center", gap: "0.7rem", boxShadow: selected ? "0 0 0 4px #fdba7455" : "none", width: "100%" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "5px", border: selected ? "none" : "2px solid #d6cdc5", background: selected ? "#ea580c" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selected && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            {opt === OTHER ? "Autre…" : opt}
          </button>
        );
        return opt === OTHER ? (
          <div key={opt} style={{ display: "flex", flexDirection: "column" }}>
            {row}
            {selected && <OtherInput text={otherTextOf(otherEntry)} onText={setOtherText} />}
          </div>
        ) : row;
      })}
    </div>
  );
}

function MultiWithNone({ options, noneOption, value = [], onChange }) {
  const noneSelected = value.includes("__none__");
  const otherEntry = value.find(isOther);
  const toggleNone = () => noneSelected ? onChange([]) : onChange(["__none__"]);
  const setOtherText = (txt) => onChange([...value.filter((v) => !isOther(v) && v !== "__none__"), makeOther(txt)]);
  const toggleOpt = (opt) => {
    const base = value.filter((v) => v !== "__none__");
    if (opt === OTHER) {
      return otherEntry ? onChange(base.filter((v) => !isOther(v))) : onChange([...base, OTHER]);
    }
    base.includes(opt) ? onChange(base.filter((v) => v !== opt)) : onChange([...base, opt]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }} className="stagger">
      <button onClick={toggleNone} style={{ padding: "0.85rem 1.2rem", borderRadius: "12px", border: noneSelected ? "2px solid #ea580c" : "2px solid #ece5df", background: noneSelected ? "#fff3ec" : "#fff", color: noneSelected ? "#9a3412" : "#57534e", fontFamily: "'DM Sans', sans-serif", fontSize: "0.97rem", fontWeight: noneSelected ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "all 0.18s", boxShadow: noneSelected ? "0 0 0 4px #fdba7455" : "none" }}>{noneOption}</button>
      <div style={{ height: "1px", background: "#ece5df", margin: "0.3rem 0" }} />
      {options.map((opt) => {
        const selected = !noneSelected && (opt === OTHER ? !!otherEntry : value.includes(opt));
        const row = (
          <button key={opt} onClick={() => toggleOpt(opt)} disabled={noneSelected} style={{ padding: "0.85rem 1.2rem", borderRadius: "12px", border: selected ? "2px solid #ea580c" : "2px solid #ece5df", background: selected ? "#fff3ec" : noneSelected ? "#faf6f2" : "#fff", color: selected ? "#9a3412" : noneSelected ? "#a8a29e" : "#57534e", fontFamily: "'DM Sans', sans-serif", fontSize: "0.97rem", fontWeight: selected ? 600 : 400, cursor: noneSelected ? "not-allowed" : "pointer", textAlign: "left", transition: "all 0.18s", display: "flex", alignItems: "center", gap: "0.7rem", boxShadow: selected ? "0 0 0 4px #fdba7455" : "none", width: "100%" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "5px", border: selected ? "none" : "2px solid #d6cdc5", background: selected ? "#ea580c" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selected && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            {opt === OTHER ? "Autre…" : opt}
          </button>
        );
        return opt === OTHER ? (
          <div key={opt} style={{ display: "flex", flexDirection: "column" }}>
            {row}
            {selected && <OtherInput text={otherTextOf(otherEntry)} onText={setOtherText} />}
          </div>
        ) : row;
      })}
    </div>
  );
}

function GridChoice({ rows, cols, value = {}, onChange }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
        <thead>
          <tr>
            <th style={{ width: "50%", padding: "0.5rem 0.7rem", textAlign: "left" }}></th>
            {cols.map((col) => (
              <th key={col} style={{ padding: "0.5rem 0.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "#7c6f64", textAlign: "center", letterSpacing: "0.02em", textTransform: "uppercase" }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row} style={{ background: i % 2 === 0 ? "#faf6f2" : "#fff" }}>
              <td style={{ padding: "0.8rem 0.7rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.91rem", color: "#57534e", borderRadius: "10px 0 0 10px" }}>{row}</td>
              {cols.map((col, j) => {
                const selected = value[row] === col;
                return (
                  <td key={col} style={{ textAlign: "center", padding: "0.8rem 0.5rem", borderRadius: j === cols.length - 1 ? "0 10px 10px 0" : "0" }}>
                    <button onClick={() => onChange({ ...value, [row]: col })} style={{ width: "26px", height: "26px", borderRadius: "50%", border: selected ? "none" : "2px solid #d6cdc5", background: selected ? "#ea580c" : "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", boxShadow: selected ? "0 0 0 4px #fdba7466" : "none" }}>
                      {selected && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextAnswer({ value = "", onChange }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Écris ta réponse ici…" rows={5}
      style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "2px solid #ece5df", fontFamily: "'DM Sans', sans-serif", fontSize: "0.97rem", color: "#57534e", resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border 0.18s", background: "#fff" }}
      onFocus={(e) => (e.target.style.border = "2px solid #ea580c")}
      onBlur={(e) => (e.target.style.border = "2px solid #ece5df")} />
  );
}

// ── Page de remerciement ─────────────────────────────────────────────────────
function ThankYou({ answers, onRestart }) {
  const [downloaded, setDownloaded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [send, setSend] = useState("idle"); // idle | sending | sent | error
  const [sendErr, setSendErr] = useState("");
  const [code] = useState(randomCode); // généré une seule fois, stable

  const handleDownload = async () => {
    setExporting(true);
    try {
      await exportPDF(answers, code);
      setDownloaded(true);
    } catch (e) {
      alert("Erreur lors de la génération du PDF. Vérifie ta connexion internet.");
    }
    setExporting(false);
  };

  const handleTransmit = async () => {
    // Pas d'endpoint configuré → dépôt manuel (télécharge puis ouvre le dossier)
    if (!UPLOAD_ENDPOINT) {
      if (!downloaded) await handleDownload();
      if (DRIVE_URL) window.open(DRIVE_URL, "_blank", "noopener");
      return;
    }
    setSend("sending"); setSendErr("");
    try {
      await uploadPdf(answers, code);
      setSend("sent");
    } catch (e) {
      setSend("error");
      setSendErr(e && e.message ? e.message : "Échec de l'envoi");
    }
  };

  const directUpload = !!UPLOAD_ENDPOINT;

  return (
    <>
      <style>{THEME_CSS}</style>
      <div className="screen">
        <div className="card stagger" style={{ maxWidth: "480px", textAlign: "center" }}>
          <div className="pop" style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #fb923c, #f43f5e)", margin: "0 auto 1.4rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", boxShadow: "0 12px 30px rgba(234,88,12,0.30)" }}>🎉</div>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(1.6rem,6vw,2rem)", color: "#3c2a21", marginBottom: "0.8rem" }}>Merci beaucoup !</h2>
          <p style={{ fontSize: "1rem", color: "#7c6f64", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Tes réponses anonymes vont vraiment aider à rendre le lycée plus accueillant. 💛
          </p>

        {/* Code identifiant attribué */}
        <div style={{ background: "#fff8f0", borderRadius: "14px", padding: "1.1rem", marginBottom: "1.2rem" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#7c6f64", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Ton code anonyme</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.8rem", fontWeight: 700, color: "#9a3412", letterSpacing: "0.18em" }}>{code}</div>
        </div>

        {send === "sent" ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "14px", padding: "1.3rem 1.2rem", marginBottom: "1rem", color: "#166534" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>✓</div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.25rem" }}>Questionnaire transmis&nbsp;!</div>
            <div style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>Tes réponses ont bien été envoyées. Tu peux fermer la page.</div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "0.92rem", color: "#7c6f64", marginBottom: "1rem" }}>Transmets tes réponses à ton professeur&nbsp;:</p>

            {/* Bouton principal : transmettre */}
            <button className="lift" onClick={handleTransmit} disabled={send === "sending"} style={{ width: "100%", padding: "1rem 1.5rem", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #ea580c, #fb923c)", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: send === "sending" ? "wait" : "pointer", boxShadow: "0 6px 18px rgba(234,88,12,0.32)", textShadow: "0 1px 2px rgba(120,40,0,0.25)", marginBottom: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {send === "sending" ? "Envoi en cours…" : "Transmettre le questionnaire"}
            </button>

            {/* Bouton secondaire : télécharger */}
            <button onClick={handleDownload} disabled={exporting} style={{ width: "100%", padding: "0.85rem 1.5rem", borderRadius: "12px", border: "2px solid #ece5df", background: "transparent", color: downloaded ? "#166534" : "#7c6f64", fontWeight: 600, fontSize: "0.92rem", cursor: exporting ? "wait" : "pointer", marginBottom: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {exporting ? "Génération…" : downloaded ? "Fichier téléchargé ✓ — re-télécharger" : "Télécharger le questionnaire"}
            </button>

            {/* Repli manuel : si envoi direct indisponible ou en échec */}
            {(send === "error" || !directUpload) && (
              <div style={{ textAlign: "left", background: send === "error" ? "#fef2f2" : "#fff3ec", border: `1px solid ${send === "error" ? "#fecaca" : "#fde4c8"}`, borderRadius: "12px", padding: "1rem 1.1rem", marginBottom: "0.5rem" }}>
                {send === "error" && (
                  <div style={{ color: "#b91c1c", fontSize: "0.86rem", fontWeight: 600, marginBottom: "0.5rem" }}>L'envoi automatique n'a pas abouti. Dépose ton fichier manuellement&nbsp;:</div>
                )}
                {send !== "error" && (
                  <div style={{ color: "#9a3412", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.5rem" }}>Dépôt du fichier</div>
                )}
                <p style={{ fontSize: "0.86rem", color: "#57534e", lineHeight: 1.55, margin: "0 0 0.7rem" }}>
                  Télécharge ton fichier <strong>climat-{code}.pdf</strong>, puis ouvre le dossier et glisse-le à l'intérieur.
                </p>
                {DRIVE_URL && (
                  <a href={DRIVE_URL} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "0.75rem 1rem", borderRadius: "10px", background: "#fff", border: "2px solid #ea580c", color: "#9a3412", fontWeight: 600, fontSize: "0.88rem", textDecoration: "none", textAlign: "center" }}>
                    📂 Ouvrir {DRIVE_LABEL} →
                  </a>
                )}
              </div>
            )}
          </>
        )}

        {/* Recommencer */}
        <button onClick={onRestart} style={{ width: "100%", padding: "0.9rem 1.5rem", borderRadius: "12px", border: "2px solid #ece5df", background: "transparent", color: "#7c6f64", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.97rem", cursor: "pointer" }}>
          Recommencer
        </button>
        </div>
      </div>
    </>
  );
}

// ── App principale ───────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [restored, setRestored] = useState(false);

  // Chargement depuis localStorage au démarrage
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved && saved.answers && Object.keys(saved.answers).length > 0) {
      setRestored(true);
    }
  }, []);

  // Sauvegarde automatique à chaque changement de réponse
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveToStorage(answers);
      setSavedMsg("Sauvegardé ✓");
      const t = setTimeout(() => setSavedMsg(""), 2000);
      return () => clearTimeout(t);
    }
  }, [answers]);

  const handleRestart = () => {
    clearStorage();
    setAnswers({});
    setStep(0);
    setDone(false);
    setRestored(false);
  };

  if (done) return <ThankYou answers={answers} onRestart={handleRestart} />;

  // ── Accueil ──
  if (step === 0) {
    const saved = loadFromStorage();
    const hasSaved = saved && saved.answers && Object.keys(saved.answers).length > 0;
    const savedDate = hasSaved && saved.savedAt
      ? new Date(saved.savedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : null;

    return (
      <>
        <style>{THEME_CSS}</style>
        <div className="screen">
          <div className="card stagger" style={{ maxWidth: "520px", textAlign: "center" }}>
            <img src={LOGO_SRC} alt="Lycée Urbain Vitry" style={{ display: "block", width: "100%", maxWidth: "300px", height: "auto", margin: "0 auto 1.6rem", borderRadius: "14px", boxShadow: "0 10px 28px rgba(60,42,33,0.16)" }} />
            <div style={{ display: "inline-block", background: "#fff3ec", color: "#9a3412", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.4rem 1rem", borderRadius: "99px", marginBottom: "1.2rem" }}>Questionnaire anonyme</div>
            <h1 style={{ fontSize: "clamp(1.7rem,6vw,2.1rem)", fontWeight: 600, color: "#3c2a21", marginBottom: "1rem", lineHeight: "1.2" }}>Comment te sens-tu au lycée&nbsp;?</h1>
            <p style={{ fontSize: "1rem", color: "#7c6f64", lineHeight: "1.7", marginBottom: "1.6rem" }}>
              Ton avis compte vraiment. Ce questionnaire <strong style={{ color: "#9a3412" }}>100&nbsp;% anonyme</strong> nous aide à rendre le lycée plus accueillant pour tout le monde.
            </p>

            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.8rem" }}>
              {[["🔒", "Anonyme"], ["⏱️", "≈ 5 minutes"], ["💬", "19 questions"]].map(([ic, tx]) => (
                <span key={tx} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#faf6f2", border: "1px solid #ece5df", color: "#57534e", fontSize: "0.82rem", fontWeight: 500, padding: "0.45rem 0.85rem", borderRadius: "99px" }}>
                  <span aria-hidden="true">{ic}</span>{tx}
                </span>
              ))}
            </div>

            <button className="lift" onClick={() => setStep(1)} style={{ width: "100%", background: "linear-gradient(135deg, #ea580c, #fb923c)", color: "#fff", border: "none", padding: "1.05rem 2.5rem", borderRadius: "99px", fontWeight: 700, fontSize: "1.02rem", boxShadow: "0 8px 22px rgba(234,88,12,0.38)", textShadow: "0 1px 2px rgba(120,40,0,0.25)", marginBottom: "0.8rem" }}>
              C'est parti →
            </button>

            {hasSaved && (
              <button onClick={() => { const s = loadFromStorage(); setAnswers(s.answers); setStep(1); }} style={{ width: "100%", background: "transparent", border: "2px solid #ece5df", color: "#7c6f64", padding: "0.85rem", borderRadius: "99px", fontWeight: 600, fontSize: "0.9rem" }}>
                ↩ Reprendre là où j'en étais {savedDate ? `(${savedDate})` : ""}
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Question ──
  const qIndex = step - 1;
  const q = QUESTIONS[qIndex];
  const answer = answers[q.id];
  const isLast = qIndex === QUESTIONS.length - 1;
  const prevSection = qIndex > 0 ? QUESTIONS[qIndex - 1].section : null;
  const showSection = q.section !== prevSection;

  const canContinue = (() => {
    if (q.type === "text") return true;
    if (q.type === "single" || q.type === "slider") return !!answer;
    if (q.type === "multi") return Array.isArray(answer) && answer.length > 0;
    if (q.type === "multi_with_none") return Array.isArray(answer) && answer.length > 0;
    if (q.type === "grid") return q.rows.every((row) => answer && answer[row]);
    return false;
  })();

  const setAnswer = (val) => setAnswers((prev) => ({ ...prev, [q.id]: val }));
  const handleNext = () => { if (isLast) setDone(true); else setStep((s) => s + 1); };

  return (
    <>
      <style>{THEME_CSS}</style>
      <div className="screen screen--top" style={{ paddingTop: "clamp(1rem,4vw,2.5rem)" }}>
        <div className="card qcard" key={step} style={{ maxWidth: "600px" }}>

          {/* Indicateur sauvegarde */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.4rem", minHeight: "1.1rem" }}>
            {savedMsg && (
              <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>{savedMsg}</span>
            )}
          </div>

          <ProgressBar current={step} total={TOTAL} section={q.section} />

          <h2 style={{ fontWeight: 600, fontSize: "clamp(1.2rem,4.2vw,1.4rem)", color: "#3c2a21", margin: "1.4rem 0 1.6rem", lineHeight: "1.4" }}>
            {q.question}
          </h2>

          {q.type === "slider" && <SliderChoice options={q.options} optOut={q.optOut} value={answer} onChange={setAnswer} />}
          {q.type === "single" && <SingleChoice options={q.options} value={answer} onChange={setAnswer} />}
          {q.type === "multi" && <MultiChoice options={q.options} value={answer} onChange={setAnswer} />}
          {q.type === "multi_with_none" && <MultiWithNone options={q.options} noneOption={q.noneOption} value={answer} onChange={setAnswer} />}
          {q.type === "grid" && <GridChoice rows={q.rows} cols={q.cols} value={answer} onChange={setAnswer} />}
          {q.type === "text" && <TextAnswer value={answer} onChange={setAnswer} />}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", alignItems: "center", gap: "0.8rem" }}>
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} style={{ background: "transparent", border: "2px solid #ece5df", color: step === 1 ? "#d6cdc5" : "#7c6f64", padding: "0.8rem 1.4rem", borderRadius: "99px", fontWeight: 600, fontSize: "0.9rem" }}>
              ← Précédent
            </button>
            <button className="lift" onClick={handleNext} disabled={!canContinue} style={{ flex: "0 1 auto", background: canContinue ? "linear-gradient(135deg, #ea580c, #fb923c)" : "#ece5df", color: canContinue ? "#fff" : "#a8a29e", border: "none", padding: "0.85rem 2rem", borderRadius: "99px", fontWeight: 700, fontSize: "0.95rem", cursor: canContinue ? "pointer" : "not-allowed", boxShadow: canContinue ? "0 6px 18px rgba(234,88,12,0.32)" : "none", textShadow: canContinue ? "0 1px 2px rgba(120,40,0,0.25)" : "none" }}>
              {isLast ? "Envoyer ✓" : "Suivant →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
