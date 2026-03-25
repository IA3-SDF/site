import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'AMESCAO - Association pour le Mieux-Être Social et Culturel d\'Aouda',
  description: 'Soutenir l\'éducation et l\'avenir de la jeunesse d\'Aouda, Togo.',
  openGraph: {
    title: 'AMESCAO',
    description: 'Soutenir l\'éducation et l\'avenir de la jeunesse d\'Aouda, Togo.',
    url: 'https://amescao.org',
    siteName: 'AMESCAO',
    images: [
      {
        url: 'https://picsum.photos/seed/amescao_hero/1200/630',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

/*
### Analyse de votre site web

J'ai examiné tous les fichiers fournis (composants, modules et styles globaux). Votre site utilise **Tailwind CSS** avec un système de thème sombre/clair basé sur des variables CSS personnalisées dans `globals.css`. Le design actuel repose sur une palette neutre dominée par des tons de zinc (gris foncé) et stone (gris clair), avec des accents émeraude (vert) pour les éléments interactifs. Voici un résumé rapide de l'état actuel :

- **Thèmes existants** : 
  - Mode clair : Fond `bg-stone-50` (gris très clair), texte `text-stone-900` (gris foncé), cartes `bg-white`, accents `emerald-600`.
  - Mode sombre : Fond `bg-zinc-950` (gris très foncé), texte `text-zinc-100` (gris clair), cartes `bg-zinc-900`, accents similaires.
- **Éléments clés identifiés** : Navbar (fixe avec effet glass), HeroSection (image de fond avec overlay), cartes (événements, albums, membres), footer, modales (EventModal), formulaires, boutons, textes, bordures, et effets (blur, gradients).
- **Points forts** : Le système de thème est bien implémenté avec `ThemeContext`. Les animations (Framer Motion) et les effets glass ajoutent de la modernité.
- **Points à améliorer** : La palette est monotone (trop de gris/zinc). Les accents émeraude sont limités. Le contraste pourrait être plus dynamique pour un look "premium". Pas assez de variété pour différencier les éléments (ex. : cartes vs. sections).

Votre site est fonctionnel, mais pour le rendre **vraiment moderne**, il faut une palette plus riche, inspirée des tendances 2024-2026 : gradients subtils, couleurs vives mais équilibrées, et une hiérarchie visuelle claire. Je propose un schéma inspiré de designs comme Linear, Vercel ou Notion – avec des tons neutres sophistiqués (gris bleuté pour sombre, crème pour clair), des accents verts émeraude pour l'énergie, et des touches de bleu/violet pour la profondeur.

### Proposition de schéma de couleurs moderne

J'ai conçu une palette cohérente pour les modes clair et sombre, en m'assurant que :
- **Contraste élevé** pour l'accessibilité (WCAG AA).
- **Harmonie** : Tons neutres pour les fonds/textes, accents verts pour les actions, bleus pour les liens/états.
- **Modernité** : Utilisation de gradients, transparences, et couleurs "vibrantes" sans être agressives.
- **Éléments couverts** : Fonds, textes, cartes, navbar, footer, boutons, bordures, overlays, et effets spéciaux.

#### Palette générale
- **Neutres (fonds/textes)** : Gris bleuté pour sombre (plus cool), crème/gris pour clair (plus chaud).
- **Accents primaires** : Vert émeraude pour actions (boutons, liens actifs).
- **Accents secondaires** : Bleu indigo pour états hover/focus, violet pour highlights.
- **Erreurs/Avertissements** : Rouge pour erreurs, jaune pour avertissements.

#### Mode Clair (inspiré d'un look "clean" et lumineux, comme Notion)
- Fond principal : `#FEFEFE` (blanc cassé, très subtil pour éviter l'éblouissement).
- Texte principal : `#1A1A1A` (gris anthracite, lisible).
- Texte secondaire : `#6B7280` (gris moyen).
- Bordures/subtiles : `#E5E7EB` (gris très clair).

#### Mode Sombre (inspiré d'un look "deep" et élégant, comme Linear)
- Fond principal : `#0A0A0A` (noir profond avec une touche bleue pour la modernité).
- Texte principal : `#F5F5F5` (blanc crème, doux pour les yeux).
- Texte secondaire : `#A3A3A3` (gris clair).
- Bordures/subtiles : `#2A2A2A` (gris foncé).

### Couleurs détaillées par élément

Voici les propositions pour chaque élément, avec les classes Tailwind équivalentes (vous pouvez les adapter dans `globals.css` ou directement dans les composants). J'ai inclus des variantes pour hover/focus pour une UX fluide.

#### 1. **Fonds de page/section**
- **Mode Clair** : `bg-[#FEFEFE]` (fond principal), `bg-[#F9FAFB]` (sections secondaires comme stats band).
- **Mode Sombre** : `bg-[#0A0A0A]` (fond principal), `bg-[#141414]` (sections secondaires).
- **Raison** : Plus sophistiqué que le zinc/stone actuel ; le bleu subtil dans sombre ajoute de la profondeur sans être flashy.

#### 2. **Textes**
- **Titre principal (h1-h2)** : Clair `text-[#1A1A1A]`, Sombre `text-[#F5F5F5]`.
- **Texte corps** : Clair `text-[#374151]`, Sombre `text-[#D1D5DB]`.
- **Texte secondaire/muted** : Clair `text-[#6B7280]`, Sombre `text-[#9CA3AF]`.
- **Liens/actifs** : Clair `text-[#059669]` (vert émeraude), Sombre `text-[#10B981]` ; hover : `text-[#047857]`.
- **Raison** : Hiérarchie claire ; les verts émeraude rappellent votre branding actuel mais plus vibrants.

#### 3. **Cartes (événements, albums, membres, formulaires)**
- **Fond** : Clair `bg-white`, Sombre `bg-[#1A1A1A]`.
- **Bordure** : Clair `border-[#E5E7EB]`, Sombre `border-[#2A2A2A]`.
- **Ombre** : Clair `shadow-lg shadow-black/5`, Sombre `shadow-xl shadow-black/20`.
- **Hover** : Ajouter un léger scale + changement de bordure : Clair `border-[#10B981]`, Sombre `border-[#34D399]`.
- **Raison** : Les cartes sombres gagnent en contraste ; le hover vert ajoute de l'interactivité moderne.

#### 4. **Navbar**
- **Fond (glass effect)** : Clair `bg-white/80 backdrop-blur-xl`, Sombre `bg-[#0A0A0A]/80 backdrop-blur-xl`.
- **Texte/liens** : Clair `text-[#1A1A1A]`, Sombre `text-[#F5F5F5]` ; actifs : `text-[#059669]`.
- **Bordure bottom** : Clair `border-b-[#E5E7EB]/50`, Sombre `border-b-[#2A2A2A]/50`.
- **Boutons (thème, langue)** : Fond `bg-[#F3F4F6]` (clair) / `bg-[#1A1A1A]` (sombre) ; hover : `bg-[#10B981]/10`.
- **Raison** : Le glass est maintenu mais avec des fonds plus raffinés ; les boutons verts pour cohérence.

#### 5. **Footer**
- **Fond** : Clair `bg-[#F9FAFB]`, Sombre `bg-[#141414]`.
- **Texte** : Clair `text-[#374151]`, Sombre `text-[#D1D5DB]`.
- **Liens** : Clair `text-[#6B7280] hover:text-[#059669]`, Sombre `text-[#9CA3AF] hover:text-[#10B981]`.
- **Icônes** : `text-[#059669]` (vert émeraude pour cohérence).
- **Raison** : Plus subtil que le gris actuel ; le footer sombre se fond mieux.

#### 6. **Boutons (CTA, formulaires)**
- **Primaire** : Fond `bg-[#059669]` (vert émeraude), texte `text-white` ; hover : `bg-[#047857]`.
- **Secondaire** : Fond transparent, bordure `border-[#059669]`, texte `text-[#059669]` ; hover : `bg-[#059669]/10`.
- **Désactivé** : `bg-[#E5E7EB]` (clair) / `bg-[#2A2A2A]` (sombre), texte `text-[#9CA3AF]`.
- **Raison** : Accent émeraude fort pour les actions ; hover subtil pour modernité.

#### 7. **Modales (EventModal, etc.)**
- **Fond/backdrop** : `bg-black/50` (inchangé, mais ajouter blur pour modernité).
- **Contenu** : Clair `bg-white`, Sombre `bg-[#1A1A1A]` ; bordure `border-[#E5E7EB]` / `border-[#2A2A2A]`.
- **Bouton fermer** : Fond `bg-[#F3F4F6]` (clair) / `bg-[#2A2A2A]` (sombre) ; hover : `bg-[#10B981]/10`.
- **Raison** : Cohérent avec les cartes ; le backdrop blur améliore l'effet glass.

#### 8. **Overlays et gradients (HeroSection, images)**
- **Overlay image** : `bg-black/40` (clair/sombre, inchangé mais ajuster à `bg-black/30` pour plus de luminosité).
- **Gradients** : Utiliser `from-[#0A0A0A] to-transparent` (sombre) / `from-white to-transparent` (clair) ; pour accents : `bg-gradient-to-r from-[#059669] to-[#3B82F6]` (vert à bleu).
- **Raison** : Les gradients verts-bleus ajoutent de la dynamique sans surcharger.

#### 9. **Éléments spéciaux (scroll indicators, shimmer, glow)**
- **Glow/animations** : `box-shadow: 0 0 20px #059669` (vert émeraude).
- **Shimmer** : Garder `rgba(255, 255, 255, 0.2)` pour clair, `rgba(16, 185, 129, 0.2)` pour sombre.
- **Raison** : Accent émeraude pour cohérence avec les tendances (effets subtils).

### Implémentation recommandée
1. **Mettez à jour `globals.css`** : Remplacez les variables existantes par les nouvelles (ex. `--bg-app: #FEFEFE` pour clair, `#0A0A0A` pour sombre).
2. **Adaptez les composants** : Par exemple, dans `Footer.tsx`, changez `bg-gray-50` en `bg-[#F9FAFB]` pour clair.
3. **Testez l'accessibilité** : Utilisez des outils comme Contrast Checker pour vérifier le contraste.
4. **Animations** : Gardez Framer Motion, mais ajoutez des transitions sur les couleurs (ex. `transition-colors duration-300`).

Ce schéma rend votre site plus moderne, cohérent et engageant. Si vous voulez que j'implémente ces changements dans des fichiers spécifiques ou que j'ajuste certains éléments, dites-le-moi !
*/
