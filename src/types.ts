
export interface StrapiMedia {
  url: string;
  name?: string;
  formats?: any;
}

export interface EventData {
  id: number;
  documentId: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  content?: any;
  main_photo?: StrapiMedia;
  other_photos?: StrapiMedia[];
}

export interface AlbumData {
  id: number;
  documentId: string;
  title: string;
  year?: string | number;
  photos?: StrapiMedia[];
}

export interface ReportData {
  id: number;
  documentId: string;
  title: string;
  year?: string;
  file?: StrapiMedia;
}

export interface BoardMemberData {
  id: number;
  documentId: string;
  name: string;
  surname?: string;
  role: string;
  photo?: StrapiMedia;
  bio?: string;
}

export interface AboutData {
  id: number;
  documentId: string;
  text?: any;
}

export type Language = 'fr' | 'en' | 'de';

export interface Event {
  id: string;
  year: string;
  date: string;
  title: string;
  desc: string;
  content: string;
  type: 'Social' | 'Admin' | 'Infra' | 'Santé' | 'Culture' | 'Éducation';
  image: string;
}

export interface Translation {
  nav: {
    home: string;
    events: string;
    albums: string;
    contact: string;
    support: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    presentationTitle: string;
    presentationText: string;
    recentEvents: string;
    boardTitle: string;
    reportsTitle: string;
  };
  events: {
    title: string;
    timeline: string;
    readMore: string;
    close: string;
  };
  albums: {
    title: string;
    year: string;
  };
  contact: {
    title: string;
    formName: string;
    formEmail: string;
    formMessage: string;
    formSubmit: string;
    historyTitle: string;
    missionTitle: string;
    partnersTitle: string;
    achievementsTitle: string;
  };
  support: {
    title: string;
    motivation: string;
    donateTitle: string;
    donateButton: string;
  };
  about: {
    title: string;
    text: string;
  };
  history: {
    title: string;
    text: string;
  };
}

export const translations: Record<Language, Translation> = {
  fr: {
    nav: {
      home: 'Accueil',
      events: 'Événements',
      albums: 'Albums',
      contact: 'Contact',
      support: 'Soutenir l’AMESCAO'
    },
    home: {
      heroTitle: 'AMESCAO',
      heroSubtitle: 'Bâtir ensemble l’avenir de la jeunesse du Canton d’Aouda',
      presentationTitle: 'Notre Vision, Votre Avenir',
      presentationText: 'AMESCAO n’est pas seulement une amicale, c’est une communauté vivante et solidaire. Nous croyons que chaque jeune du canton d’Aouda porte en lui une force capable de transformer son avenir et celui de toute la collectivité. Notre vision est de faire de l’éducation, de la culture, de la santé et de l’entrepreneuriat les piliers d’un développement durable et inclusif. Nous unissons nos énergies pour que les défis deviennent des opportunités, que l’action collective mène au succès, et que chaque réussite individuelle soit célébrée comme une victoire partagée. Ensemble, nous bâtissons un avenir où la jeunesse est le moteur du progrès et la fierté de notre canton.',
      recentEvents: 'Nos Dernières Actions',
      boardTitle: 'Le Bureau : Des Leaders Engagés',
      reportsTitle: 'Transparence & Impact'
    },
    events: {
      title: 'Nos Actions',
      timeline: 'À travers ses actions, AMESCAO écrit l’histoire du canton d’Aouda : une jeunesse engagée, des initiatives porteuses et des moments qui façonnent l’avenir.',
      readMore: 'Découvrir l’impact',
      close: 'Fermer'
    },
    albums: {
      title: 'Souvenirs en Images',
      year: 'Année'
    },
    contact: {
      title: 'Rejoignez le Mouvement',
      formName: 'Votre Nom',
      formEmail: 'Votre Email',
      formMessage: 'Votre Message',
      formSubmit: 'Envoyer avec enthousiasme',
      historyTitle: 'Héritage & Racines',
      missionTitle: 'Notre Boussole',
      partnersTitle: 'Main dans la Main',
      achievementsTitle: 'Victoires Communes'
    },
    support: {
      title: 'Investissez dans Demain',
      motivation: 'Chaque contribution est une graine semée pour l’éducation et l’épanouissement d’un jeune. Ensemble, finançons des bourses, des bibliothèques et des rêves.',
      donateTitle: 'Soutenir l’Impact',
      donateButton: 'Je soutiens l’AMESCAO'
    },
    about : {
      title : 'À Propos de Nous',
      text : 'L’AMESCAO, c’est avant tout une histoire de passion, d’engagement et de solidarité. Fondée en 2010 par un groupe de jeunes visionnaires du canton d’Aouda, notre association a grandi pour devenir un acteur incontournable du développement local. Notre mission est claire : offrir à chaque jeune les moyens de réaliser son potentiel et de contribuer activement à la construction d’un avenir meilleur pour notre communauté. À travers des projets éducatifs, culturels, sanitaires et entrepreneuriaux, nous transformons les défis en opportunités et les rêves en réalités. Rejoignez-nous dans cette aventure collective où chaque action compte et où chaque succès est une victoire partagée.'

    },
    history: {
      title: 'Héritage & Racines',
      text: ' L’histoire d’AMESCAO commence lors du congrès fondateur des 29, 30 et 31 décembre 1997 à Aouda. Animés par le désir de s’unir et d’agir pour leur canton, les jeunes ont décidé de créer une amicale structurée, dotée de statuts et reconnue officiellement par le ministère de l’Administration territoriale. Depuis, AMESCAO a multiplié les initiatives : cours de vacances rassemblant des centaines d’élèves, sensibilisations sur la santé et la prévention des IST/VIH, forums de jeunes, dons de kits scolaires et d’actes de naissance, ainsi que des activités sportives favorisant la cohésion. Chaque action témoigne de la détermination des membres à inscrire l’éducation, la solidarité et la culture au cœur du développement local. Aujourd’hui, AMESCAO est une référence dans le canton d’Aouda, un moteur de mobilisation et un symbole d’espoir pour la jeunesse.'
    },
    


  },
  en: {
    nav: {
      home: 'Home',
      events: 'Events',
      albums: 'Albums',
      contact: 'Contact',
      support: 'Support AMESCAO'
    },
    home: {
      heroTitle: 'AMESCAO',
      heroSubtitle: 'Building together the future of the youth of the Canton of Aouda',
      presentationTitle: 'Our Vision, Your Future',
      presentationText: 'AMESCAO is not just an association, it is a family. We join forces to transform the potential of every young person in Aouda into a brilliant success. Education, culture, and solidarity are the pillars of our commitment.',
      recentEvents: 'Our Latest Actions',
      boardTitle: 'The Board: Committed Leaders',
      reportsTitle: 'Transparency & Impact'
    },
    events: {
      title: 'Our Journey',
      timeline: 'Timeline',
      readMore: 'Discover the impact',
      close: 'Close'
    },
    albums: {
      title: 'Memories in Pictures',
      year: 'Year'
    },
    contact: {
      title: 'Join the Movement',
      formName: 'Your Name',
      formEmail: 'Your Email',
      formMessage: 'Your Message',
      formSubmit: 'Send with enthusiasm',
      historyTitle: 'Heritage & Roots',
      missionTitle: 'Our Compass',
      partnersTitle: 'Hand in Hand',
      achievementsTitle: 'Common Victories'
    },
    support: {
      title: 'Invest in Tomorrow',
      motivation: 'Every contribution is a seed sown for the education and fulfillment of a young person. Together, let’s fund scholarships, libraries, and dreams.',
      donateTitle: 'Support the Impact',
      donateButton: 'I support AMESCAO'
    },
      about: {
      title: 'About Us',
      text: 'AMESCAO is above all a story of passion, commitment, and solidarity. Founded in 2010 by a group of visionary young people from the canton of Aouda, our association has grown to become a key player in local development. Our mission is clear: to provide every young person with the means to realize their potential and actively contribute to building a better future for our community. Through educational, cultural, health, and entrepreneurial projects, we turn challenges into opportunities and dreams into realities. Join us in this collective adventure where every action counts and every success is a shared victory.'
    },
      history: {
      title: 'Our History',
      text: 'The story of AMESCAO begins at the founding congress of December 29, 30 and 31, 1997 in Aouda. Inspired by the desire to unite and act for their canton, the young people decided to create a structured association, equipped with statutes and officially recognized by the Ministry of Territorial Administration. Since then, AMESCAO has multiplied its initiatives: holiday courses gathering hundreds of students, sensitization on health and prevention of STIs/HIV, youth forums, donations of school kits and birth certificates, as well as sports activities promoting cohesion. Each action testifies to the determination of members to place education, solidarity and culture at the heart of local development. Today, AMESCAO is a reference in the canton of Aouda, a mobilization engine and a symbol of hope for the youth.'
    }

  },
  de: {
    nav: {
      home: 'Startseite',
      events: 'Veranstaltungen',
      albums: 'Alben',
      contact: 'Kontakt',
      support: 'AMESCAO unterstützen'
    },
    home: {
      heroTitle: 'AMESCAO',
      heroSubtitle: 'Gemeinsam die Zukunft der Jugend des Kantons Aouda gestalten',
      presentationTitle: 'Unsere Vision, Ihre Zukunft',
      presentationText: 'AMESCAO ist nicht nur ein Verein, es ist eine famille. Wir bündeln unsere Kräfte, um das Potenzial jedes jungen Menschen in Aouda in einen glänzenden Erfolg zu verwandeln. Bildung, Kultur und Solidarität sind die Säulen unseres Engagements.',
      recentEvents: 'Unsere neuesten Aktionen',
      boardTitle: 'Der Vorstand: Engagierte Führungskräfte',
      reportsTitle: 'Tätigkeitsberichte'
    },
    events: {
      title: 'Unsere Reise',
      timeline: 'Zeitstrahl',
      readMore: 'Wirkung entdecken',
      close: 'Schließen'
    },
    albums: {
      title: 'Erinnerungen in Bildern',
      year: 'Jahr'
    },
    contact: {
      title: 'Schließen Sie sich der mouvement an',
      formName: 'Ihr Name',
      formEmail: 'Ihre E-Mail',
      formMessage: 'Ihre Nachricht',
      formSubmit: 'Mit Begeisterung senden',
      historyTitle: 'Erbe & Wurzeln',
      missionTitle: 'Unser Kompass',
      partnersTitle: 'Hand in Hand',
      achievementsTitle: 'Gemeinsame Siege'
    },
    support: {
      title: 'In Morgen investieren',
      motivation: 'Jeder Beitrag ist ein Samen, der für die Bildung und Erfüllung eines jungen Menschen gesät wird. Lassen Sie uns gemeinsam Stipendien, Bibliotheken und Träume finanzieren.',
      donateTitle: 'Wirkung unterstützen',
      donateButton: 'Ich unterstütze AMESCAO'
    },
      about: {
      title: 'Über uns',
      text: 'AMESCAO ist vor allem eine Geschichte von Leidenschaft, Engagement und Solidarität. Gegründet im Jahr 2010 von einer Gruppe visionärer junger Menschen aus dem Kanton Aouda, hat sich unser Verein zu einem wichtigen Akteur in der lokalen Entwicklung entwickelt. Unsere Mission ist klar: jedem jungen Menschen die Mittel zur Verfügung zu stellen, um sein Potenzial zu verwirklichen und aktiv zum Aufbau einer besseren Zukunft für unsere Gemeinschaft beizutragen. Durch Bildungs-, Kultur-, Gesundheits- und Unternehmerprojekte verwandeln wir Herausforderungen in Chancen und Träume in Realitäten. Schließen Sie sich uns in diesem kollektiven Abenteuer an, bei dem jede Aktion zählt und jeder Erfolg ein geteilter Sieg ist.',
      },
      history: {
      title: 'Unsere Geschichte',
      text: 'Die Geschichte von AMESCAO beginnt auf dem Gründungskongress am 29., 30. und 31. Dezember 1997 in Aouda. Inspiriert von dem Wunsch, sich zu vereinen und für ihren Kanton zu handeln, beschlossen die jungen Menschen, einen strukturierten Verein zu gründen, ausgestattet mit Statuten und offiziell anerkannt vom Ministerium für territoriale Verwaltung. Seitdem hat AMESCAO seine Initiativen vervielfacht: Ferienkurse, die Hunderte von Schülern versammeln, Sensibilisierung für Gesundheit und Prävention von STIs/HIV, Jugendforen, Spenden von Schulpaketen und Geburtsurkunden sowie Sportaktivitäten zur Förderung des Zusammenhalts. Jede Aktion zeugt von der Entschlossenheit der Mitglieder, Bildung, Solidarität und Kultur in den Mittelpunkt der lokalen Entwicklung zu stellen. Heute ist AMESCAO eine Referenz im Kanton Aouda, ein Motor der Mobilisierung und ein Symbol der Hoffnung für die Jugend.'
      }

  }
};
