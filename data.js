// Lerninhalte: Business-Englisch
// Jedes Thema enthält Redewendungen (phrases) und Vokabeln (vocab).
window.TOPICS = [
  {
    id: "meetings",
    title: "Meetings",
    icon: "👥",
    intro: "Meetings eröffnen, leiten, unterbrechen und zusammenfassen.",
    phrases: [
      { en: "Let's get started, shall we?", de: "Wollen wir anfangen?" },
      { en: "The purpose of today's meeting is to agree on the budget.", de: "Ziel des heutigen Meetings ist es, uns auf das Budget zu einigen." },
      { en: "Sorry to interrupt, but could I add something?", de: "Entschuldigung, dass ich unterbreche, aber darf ich etwas ergänzen?" },
      { en: "Could you elaborate on that point?", de: "Könnten Sie diesen Punkt näher erläutern?" },
      { en: "I see your point, but I'm not entirely convinced.", de: "Ich verstehe Ihren Standpunkt, bin aber nicht ganz überzeugt." },
      { en: "Let's move on to the next item on the agenda.", de: "Kommen wir zum nächsten Punkt der Tagesordnung." },
      { en: "To sum up, we've agreed on three action items.", de: "Zusammenfassend haben wir uns auf drei Aufgaben geeinigt." },
      { en: "Who will take the minutes today?", de: "Wer schreibt heute das Protokoll?" }
    ],
    vocab: [
      { term: "agenda", de: "Tagesordnung", example: "Please send me the agenda before Monday." },
      { term: "minutes", de: "Protokoll", example: "The minutes will be circulated tomorrow." },
      { term: "action item", de: "Aufgabe / To-do", example: "Each action item needs an owner." },
      { term: "to postpone", de: "verschieben", example: "We had to postpone the meeting." },
      { term: "consensus", de: "Einigkeit, Konsens", example: "We finally reached a consensus." },
      { term: "follow-up", de: "Nachbereitung, Folgetermin", example: "Let's schedule a follow-up next week." }
    ]
  },
  {
    id: "emails",
    title: "E-Mails",
    icon: "✉️",
    intro: "Professionelle E-Mails einleiten, Anliegen formulieren und höflich abschließen.",
    phrases: [
      { en: "I hope this email finds you well.", de: "Ich hoffe, es geht Ihnen gut." },
      { en: "I'm writing to follow up on our conversation yesterday.", de: "Ich schreibe Ihnen bezüglich unseres gestrigen Gesprächs." },
      { en: "Please find attached the updated proposal.", de: "Anbei finden Sie das aktualisierte Angebot." },
      { en: "Could you please confirm receipt of this email?", de: "Könnten Sie bitte den Erhalt dieser E-Mail bestätigen?" },
      { en: "I would appreciate it if you could reply by Friday.", de: "Ich wäre Ihnen dankbar, wenn Sie bis Freitag antworten könnten." },
      { en: "Apologies for the delayed response.", de: "Entschuldigen Sie die verspätete Antwort." },
      { en: "Please don't hesitate to contact me if you have any questions.", de: "Bei Fragen können Sie sich jederzeit gerne an mich wenden." },
      { en: "I look forward to hearing from you.", de: "Ich freue mich auf Ihre Rückmeldung." }
    ],
    vocab: [
      { term: "attachment", de: "Anhang", example: "The attachment is too large to send." },
      { term: "to forward", de: "weiterleiten", example: "Could you forward this to the team?" },
      { term: "to cc someone", de: "jemanden in Kopie setzen", example: "Please cc my manager on the reply." },
      { term: "deadline", de: "Frist", example: "The deadline for the report is Thursday." },
      { term: "regarding", de: "bezüglich", example: "I'm writing regarding your invoice." },
      { term: "kind regards", de: "Mit freundlichen Grüßen", example: "Kind regards, Anna" }
    ]
  },
  {
    id: "phone",
    title: "Telefon & Video-Calls",
    icon: "📞",
    intro: "Anrufe annehmen, Nachrichten hinterlassen und technische Probleme klären.",
    phrases: [
      { en: "Good morning, this is Anna speaking. How can I help you?", de: "Guten Morgen, hier spricht Anna. Wie kann ich Ihnen helfen?" },
      { en: "Could I speak to someone in the sales department, please?", de: "Könnte ich bitte jemanden aus dem Vertrieb sprechen?" },
      { en: "I'm afraid she's not available at the moment.", de: "Leider ist sie gerade nicht erreichbar." },
      { en: "Would you like to leave a message?", de: "Möchten Sie eine Nachricht hinterlassen?" },
      { en: "Sorry, you're breaking up. Could you repeat that?", de: "Entschuldigung, die Verbindung ist schlecht. Könnten Sie das wiederholen?" },
      { en: "I think you're on mute.", de: "Ich glaube, Ihr Mikrofon ist stummgeschaltet." },
      { en: "Can everyone see my screen?", de: "Können alle meinen Bildschirm sehen?" },
      { en: "I'll call you back in ten minutes.", de: "Ich rufe Sie in zehn Minuten zurück." }
    ],
    vocab: [
      { term: "to hold the line", de: "dranbleiben", example: "Could you hold the line, please?" },
      { term: "to put someone through", de: "jemanden durchstellen", example: "I'll put you through to Mr. Smith." },
      { term: "extension", de: "Durchwahl", example: "My extension is 245." },
      { term: "to hang up", de: "auflegen", example: "Please don't hang up." },
      { term: "connection", de: "Verbindung", example: "The connection is very poor today." },
      { term: "to share one's screen", de: "den Bildschirm teilen", example: "Let me share my screen." }
    ]
  },
  {
    id: "presentations",
    title: "Präsentationen",
    icon: "📊",
    intro: "Präsentationen strukturieren, Grafiken beschreiben und Fragen beantworten.",
    phrases: [
      { en: "Today I'd like to talk to you about our results for the third quarter.", de: "Heute möchte ich mit Ihnen über unsere Ergebnisse im dritten Quartal sprechen." },
      { en: "My presentation is divided into three parts.", de: "Meine Präsentation ist in drei Teile gegliedert." },
      { en: "As you can see from this chart, sales have increased significantly.", de: "Wie Sie dieser Grafik entnehmen können, ist der Umsatz deutlich gestiegen." },
      { en: "This brings me to my next point.", de: "Das bringt mich zu meinem nächsten Punkt." },
      { en: "Let me give you an example.", de: "Lassen Sie mich ein Beispiel geben." },
      { en: "That's a very good question.", de: "Das ist eine sehr gute Frage." },
      { en: "I'm happy to take any questions now.", de: "Ich beantworte jetzt gerne Ihre Fragen." },
      { en: "Thank you for your attention.", de: "Vielen Dank für Ihre Aufmerksamkeit." }
    ],
    vocab: [
      { term: "slide", de: "Folie", example: "On the next slide you can see the figures." },
      { term: "to increase", de: "steigen, erhöhen", example: "Costs increased by five percent." },
      { term: "to decline", de: "sinken, zurückgehen", example: "Demand declined in the summer." },
      { term: "revenue", de: "Umsatz, Erlös", example: "Our revenue reached two million euros." },
      { term: "key takeaway", de: "wichtigste Erkenntnis", example: "The key takeaway is that we need to invest." },
      { term: "trend", de: "Entwicklung, Trend", example: "This trend is likely to continue." }
    ]
  },
  {
    id: "negotiation",
    title: "Verhandlungen",
    icon: "🤝",
    intro: "Angebote machen, Kompromisse finden und Vereinbarungen festhalten.",
    phrases: [
      { en: "What would you propose?", de: "Was würden Sie vorschlagen?" },
      { en: "We could offer a ten percent discount if you order in bulk.", de: "Wir könnten zehn Prozent Rabatt anbieten, wenn Sie in großen Mengen bestellen." },
      { en: "I'm afraid that's not acceptable for us.", de: "Das ist für uns leider nicht akzeptabel." },
      { en: "Is there any flexibility on the price?", de: "Gibt es beim Preis Spielraum?" },
      { en: "Let's try to find a compromise.", de: "Versuchen wir, einen Kompromiss zu finden." },
      { en: "If you can deliver by March, we can agree to those terms.", de: "Wenn Sie bis März liefern können, stimmen wir diesen Bedingungen zu." },
      { en: "I need to check with my team before I can commit.", de: "Ich muss mich mit meinem Team abstimmen, bevor ich zusagen kann." },
      { en: "I think we have a deal.", de: "Ich glaube, wir sind uns einig." }
    ],
    vocab: [
      { term: "terms and conditions", de: "Geschäftsbedingungen", example: "Please read the terms and conditions carefully." },
      { term: "discount", de: "Rabatt", example: "We can't offer a bigger discount." },
      { term: "to compromise", de: "einen Kompromiss eingehen", example: "Both sides had to compromise." },
      { term: "bottom line", de: "Schmerzgrenze; Endergebnis", example: "What's your bottom line?" },
      { term: "leverage", de: "Verhandlungsmacht, Druckmittel", example: "We have little leverage in this situation." },
      { term: "to close a deal", de: "einen Abschluss machen", example: "We closed the deal yesterday." }
    ]
  },
  {
    id: "smalltalk",
    title: "Small Talk & Networking",
    icon: "☕",
    intro: "Gespräche beginnen, sich vorstellen und Kontakte pflegen.",
    phrases: [
      { en: "Nice to meet you. I've heard a lot about you.", de: "Schön, Sie kennenzulernen. Ich habe schon viel von Ihnen gehört." },
      { en: "What line of work are you in?", de: "In welcher Branche sind Sie tätig?" },
      { en: "How was your flight?", de: "Wie war Ihr Flug?" },
      { en: "Is this your first time in Berlin?", de: "Sind Sie zum ersten Mal in Berlin?" },
      { en: "Let me introduce you to my colleague.", de: "Darf ich Ihnen meinen Kollegen vorstellen?" },
      { en: "Here's my business card.", de: "Hier ist meine Visitenkarte." },
      { en: "It was a pleasure talking to you.", de: "Es war mir ein Vergnügen, mit Ihnen zu sprechen." },
      { en: "Let's keep in touch.", de: "Lassen Sie uns in Kontakt bleiben." }
    ],
    vocab: [
      { term: "colleague", de: "Kollege / Kollegin", example: "My colleague will join us later." },
      { term: "industry", de: "Branche", example: "I work in the automotive industry." },
      { term: "to network", de: "Kontakte knüpfen", example: "Conferences are great for networking." },
      { term: "business card", de: "Visitenkarte", example: "I've run out of business cards." },
      { term: "to catch up", de: "sich austauschen, auf den neuesten Stand bringen", example: "Let's catch up over coffee." },
      { term: "acquaintance", de: "Bekannte(r)", example: "He's a business acquaintance." }
    ]
  },
  {
    id: "interview",
    title: "Vorstellungsgespräch",
    icon: "💼",
    intro: "Über Erfahrungen, Stärken und Ziele sprechen.",
    phrases: [
      { en: "I have over ten years of experience in project management.", de: "Ich habe über zehn Jahre Erfahrung im Projektmanagement." },
      { en: "In my current role, I'm responsible for a team of five.", de: "In meiner aktuellen Position bin ich für ein Team von fünf Personen verantwortlich." },
      { en: "One of my greatest strengths is problem solving.", de: "Eine meiner größten Stärken ist das Lösen von Problemen." },
      { en: "I'm looking for a new challenge.", de: "Ich suche eine neue Herausforderung." },
      { en: "Could you tell me more about the team I would be working with?", de: "Könnten Sie mir mehr über das Team erzählen, mit dem ich arbeiten würde?" },
      { en: "What are the next steps in the application process?", de: "Wie sind die nächsten Schritte im Bewerbungsprozess?" },
      { en: "I'm a fast learner and I enjoy working under pressure.", de: "Ich lerne schnell und arbeite gern unter Druck." },
      { en: "Thank you for taking the time to meet with me.", de: "Vielen Dank, dass Sie sich Zeit für mich genommen haben." }
    ],
    vocab: [
      { term: "résumé / CV", de: "Lebenslauf", example: "I've attached my CV." },
      { term: "to apply for", de: "sich bewerben um", example: "I'm applying for the position of team lead." },
      { term: "salary", de: "Gehalt", example: "What are your salary expectations?" },
      { term: "notice period", de: "Kündigungsfrist", example: "My notice period is three months." },
      { term: "achievement", de: "Erfolg, Leistung", example: "What is your biggest achievement?" },
      { term: "skills", de: "Fähigkeiten, Kenntnisse", example: "Communication skills are essential." }
    ]
  },
  {
    id: "projects",
    title: "Projekte & Termine",
    icon: "📅",
    intro: "Über Fortschritt, Probleme und Zeitpläne berichten.",
    phrases: [
      { en: "We're on track to finish the project by the end of the month.", de: "Wir liegen im Plan, um das Projekt bis Monatsende abzuschließen." },
      { en: "We're running behind schedule.", de: "Wir sind im Verzug." },
      { en: "Can we push the deadline back by a week?", de: "Können wir die Frist um eine Woche verschieben?" },
      { en: "Could you give me a quick status update?", de: "Könnten Sie mir kurz den aktuellen Stand mitteilen?" },
      { en: "We've run into an unexpected problem.", de: "Wir sind auf ein unerwartetes Problem gestoßen." },
      { en: "I'll keep you posted.", de: "Ich halte Sie auf dem Laufenden." },
      { en: "Does Tuesday at ten work for you?", de: "Passt Ihnen Dienstag um zehn?" },
      { en: "Let's touch base again next week.", de: "Lassen Sie uns nächste Woche wieder abstimmen." }
    ],
    vocab: [
      { term: "milestone", de: "Meilenstein", example: "We reached an important milestone." },
      { term: "stakeholder", de: "Interessengruppe, Beteiligter", example: "All stakeholders must approve the plan." },
      { term: "to delegate", de: "delegieren", example: "A good manager knows how to delegate." },
      { term: "workload", de: "Arbeitspensum", example: "My workload is very high this week." },
      { term: "to prioritize", de: "priorisieren", example: "We need to prioritize these tasks." },
      { term: "scope", de: "Umfang", example: "The scope of the project has changed." }
    ]
  }
];

// Aussprache-Training: typische Schwierigkeiten für Deutschsprachige
window.PRONUNCIATION = [
  {
    title: "„th“ – stimmlos [θ] und stimmhaft [ð]",
    tip: "Zungenspitze leicht zwischen die Zähne legen und Luft ausströmen lassen. Nicht wie „s“, „z“, „f“ oder „d“ sprechen.",
    pairs: [["think", "sink"], ["three", "free"], ["thank", "tank"], ["they", "day"], ["though", "dough"]],
    sentence: "I think the three of them thought it through thoroughly."
  },
  {
    title: "„w“ [w] vs. „v“ [v]",
    tip: "Beim englischen „w“ die Lippen rund machen wie bei „u“ – die Zähne berühren die Lippe nicht. Beim „v“ berühren die oberen Zähne die Unterlippe.",
    pairs: [["west", "vest"], ["wine", "vine"], ["wet", "vet"], ["while", "vile"], ["worse", "verse"]],
    sentence: "We were very worried about the value of the West Virginia venture."
  },
  {
    title: "Stimmhafte Endungen (keine Auslautverhärtung)",
    tip: "Im Deutschen wird „d“ am Wortende zu „t“. Im Englischen bleibt der Laut weich – und der Vokal davor wird länger.",
    pairs: [["bad", "bat"], ["dog", "dock"], ["rise", "rice"], ["prize", "price"], ["leave", "leaf"]],
    sentence: "The bad news is that the prize was raised."
  },
  {
    title: "Kurzes [æ] vs. [e]",
    tip: "Für [æ] den Mund weit öffnen, fast wie ein „ä“ mit gesenktem Kiefer. [e] ist geschlossener, wie in „Bett“.",
    pairs: [["bad", "bed"], ["man", "men"], ["sad", "said"], ["had", "head"], ["marry", "merry"]],
    sentence: "The manager had a plan to expand the brand."
  },
  {
    title: "Das englische „r“",
    tip: "Das „r“ wird nicht gerollt und nicht im Rachen gebildet. Die Zungenspitze leicht nach hinten biegen, ohne den Gaumen zu berühren.",
    pairs: [["right", "light"], ["read", "lead"], ["road", "load"], ["pray", "play"], ["crown", "clown"]],
    sentence: "The report really reached the right reader."
  },
  {
    title: "Endung „-ed“: [t], [d] oder [ɪd]",
    tip: "Nach stimmlosen Lauten [t] (worked), nach stimmhaften [d] (called), nach t/d [ɪd] (wanted). Keine zusätzliche Silbe bei „worked“!",
    pairs: [["worked", "wanted"], ["called", "needed"], ["asked", "added"], ["planned", "started"], ["helped", "decided"]],
    sentence: "We discussed, planned, and finally decided on the project."
  }
];
