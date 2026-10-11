/*
 * Brand identities.
 *
 * Everything that makes a site belong to one company lives here: name, logo,
 * fonts, colour tokens for both themes, shape, navigation, calls to action,
 * contact details and footer. Page body copy lives in the HTML files.
 *
 * This is a classic script (not a module) on purpose: it runs in <head>
 * before the first paint so js/head.js can apply fonts and tokens without a
 * flash of the wrong brand or theme.
 *
 * Colour rules (see docs/DESIGN-SYSTEM.md):
 *  - text and textMuted on bg and surface must reach 4.5:1
 *  - accent on bg and surface must reach 4.5:1 (it is used as link colour)
 *  - onAccent on accent must reach 4.5:1
 *  - border on bg should reach at least 1.3:1 so hairlines stay visible
 * Run `node scripts/check-contrast.mjs` after editing.
 */
window.BRANDS = {
  'hollis-reed': {
    id: 'hollis-reed',
    name: 'Hollis & Reed',
    legalName: 'Hollis & Reed Bookkeeping Ltd.',
    tagline: 'Bookkeeping that keeps small businesses calm.',
    description: 'Monthly bookkeeping, payroll and year-end accounts for owner-run businesses.',
    logo: {
      src: 'assets/brands/hollis-reed/logo.svg',
      srcDark: 'assets/brands/hollis-reed/logo-dark.svg',
      alt: 'Hollis & Reed',
      width: 184,
      height: 36
    },
    mark: { src: 'assets/brands/hollis-reed/mark.svg', alt: '' },
    hero: { plate: 'ruled' },
    fonts: {
      display: '"Bricolage Grotesque", "Avenir Next", "Segoe UI", sans-serif',
      body: '"Source Sans 3", "Segoe UI", Roboto, system-ui, sans-serif',
      stylesheet: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap',
      displayWeight: 700,
      displayTracking: '-0.015em'
    },
    shape: { radiusSm: '8px', radius: '12px', radiusLg: '20px', button: '999px' },
    colors: {
      light: {
        bg: '#FCFAF6',
        surface: '#FFFFFF',
        surfaceSunken: '#F3EFE7',
        text: '#1C2420',
        textMuted: '#5B655F',
        border: '#E2DDD3',
        borderStrong: '#B9B2A4',
        accent: '#2E6B4B',
        accentHover: '#255A3E',
        accentSoft: '#E3F0E7',
        onAccent: '#FFFFFF',
        highlight: '#F2C94C'
      },
      dark: {
        bg: '#141A16',
        surface: '#1C231E',
        surfaceSunken: '#10150F',
        text: '#ECEAE3',
        textMuted: '#A3ABA4',
        border: '#2F3933',
        borderStrong: '#4C5750',
        accent: '#7FCF9F',
        accentHover: '#99DBB2',
        accentSoft: '#1F3328',
        onAccent: '#141A16',
        highlight: '#F2C94C'
      }
    },
    nav: [
      { label: 'Services', href: 'services.html' },
      { label: 'Pricing', href: 'pricing.html' },
      { label: 'About', href: 'about.html' },
      { label: 'Contact', href: 'contact.html' }
    ],
    cta: {
      primary: { label: 'Book a free call', href: 'contact.html' },
      secondary: { label: 'See pricing', href: 'pricing.html' }
    },
    contact: {
      email: 'hello@hollisandreed.example',
      phone: '+44 20 7946 0210',
      address: ['14 Garden Walk', 'Bristol BS1 5HX', 'United Kingdom'],
      hours: 'Monday to Friday, 9:00 to 17:30'
    },
    footer: {
      columns: [
        { title: 'Services', links: [
          { label: 'Monthly bookkeeping', href: 'services.html#bookkeeping' },
          { label: 'Payroll', href: 'services.html#payroll' },
          { label: 'Year-end accounts', href: 'services.html#year-end' },
          { label: 'Advisory', href: 'services.html#advisory' }
        ] },
        { title: 'Company', links: [
          { label: 'About', href: 'about.html' },
          { label: 'Pricing', href: 'pricing.html' },
          { label: 'Contact', href: 'contact.html' },
          { label: 'Components', href: 'showcase.html' }
        ] }
      ],
      note: 'Registered in England and Wales. Fictional company for template demonstration.'
    },
    sample: {
      hero: {
        headline: 'Your books, done by people who answer the phone.',
        lede: 'We keep the ledger tidy every month so you can see where the business stands without opening a spreadsheet.',
        primary: { label: 'Book a free call', href: '#' },
        secondary: { label: 'See pricing', href: '#' }
      },
      features: [
        { icon: 'receipt', title: 'Monthly close by the 10th', body: 'Reconciled accounts and a plain-language summary, every month, on time.' },
        { icon: 'users', title: 'One named bookkeeper', body: 'The same person handles your books all year and knows your business.' },
        { icon: 'shield', title: 'Filing without the panic', body: 'VAT, payroll and year-end deadlines tracked for you, with reminders well ahead.' }
      ],
      testimonial: {
        quote: 'For the first time I know our cash position on the first of the month, not the thirtieth.',
        name: 'Priya Nair',
        role: 'Owner, Nair Joinery'
      },
      cta: { headline: 'Start with a free 30-minute review.', body: 'We look at your current setup and tell you honestly what to change.', label: 'Book a free call' }
    }
  },

  'kestrel-freight': {
    id: 'kestrel-freight',
    name: 'Kestrel Freight',
    legalName: 'Kestrel Freight Logistics GmbH',
    tagline: 'Regional road freight with real-time tracking.',
    description: 'Scheduled and on-demand pallet freight across central Europe, tracked to the minute.',
    logo: {
      src: 'assets/brands/kestrel-freight/logo.svg',
      srcDark: 'assets/brands/kestrel-freight/logo-dark.svg',
      alt: 'Kestrel Freight',
      width: 236,
      height: 36
    },
    mark: { src: 'assets/brands/kestrel-freight/mark.svg', alt: '' },
    hero: { plate: 'grid' },
    fonts: {
      display: '"Archivo", "Helvetica Neue", Arial, sans-serif',
      body: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
      stylesheet: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112,500..800&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&display=swap',
      displayWeight: 800,
      displayTracking: '-0.02em'
    },
    shape: { radiusSm: '3px', radius: '4px', radiusLg: '6px', button: '4px' },
    colors: {
      light: {
        bg: '#F3F5F7',
        surface: '#FFFFFF',
        surfaceSunken: '#E9EDF1',
        text: '#121A22',
        textMuted: '#526069',
        border: '#D5DCE2',
        borderStrong: '#AEB9C3',
        accent: '#BF4408',
        accentHover: '#A33A06',
        accentSoft: '#FBE7DC',
        onAccent: '#FFFFFF',
        highlight: '#FFD166'
      },
      dark: {
        bg: '#0F1419',
        surface: '#171E25',
        surfaceSunken: '#0A0E12',
        text: '#E6EBF0',
        textMuted: '#9AA7B2',
        border: '#2A353F',
        borderStrong: '#46535F',
        accent: '#FF8A4C',
        accentHover: '#FFA070',
        accentSoft: '#33231A',
        onAccent: '#0F1419',
        highlight: '#FFD166'
      }
    },
    nav: [
      { label: 'Routes', href: '#' },
      { label: 'Tracking', href: '#' },
      { label: 'Fleet', href: '#' },
      { label: 'Contact', href: '#' }
    ],
    cta: {
      primary: { label: 'Get a quote', href: '#' },
      secondary: { label: 'Track a shipment', href: '#' }
    },
    contact: {
      email: 'dispatch@kestrelfreight.example',
      phone: '+49 30 2000 4410',
      address: ['Hafenstrasse 8', '10115 Berlin', 'Germany'],
      hours: 'Dispatch desk staffed 24 hours'
    },
    footer: {
      columns: [
        { title: 'Services', links: [
          { label: 'Scheduled routes', href: '#' },
          { label: 'On-demand pallets', href: '#' },
          { label: 'Cross-dock', href: '#' }
        ] },
        { title: 'Company', links: [
          { label: 'Fleet', href: '#' },
          { label: 'Careers', href: '#' },
          { label: 'Contact', href: '#' }
        ] }
      ],
      note: 'Fictional company for template demonstration.'
    },
    sample: {
      hero: {
        headline: 'Pallets on the road tonight, tracked to the minute.',
        lede: 'Scheduled lanes between 40 regional hubs, with live ETAs you can share with your customers.',
        primary: { label: 'Get a quote', href: '#' },
        secondary: { label: 'Track a shipment', href: '#' }
      },
      features: [
        { icon: 'truck', title: 'Nightly scheduled lanes', body: 'Departures every weeknight on 40 hub pairs, with capacity confirmed by 15:00.' },
        { icon: 'map', title: 'Live ETA sharing', body: 'A tracking link per consignment that your customer can open without an account.' },
        { icon: 'shield', title: 'Claims settled in 10 days', body: 'Damage or loss claims paid within ten working days, documented at every handover.' }
      ],
      testimonial: {
        quote: 'We stopped phoning the depot. The ETA on the link is the ETA.',
        name: 'Tomasz Wrona',
        role: 'Logistics lead, Brno Components'
      },
      cta: { headline: 'Price a lane in two minutes.', body: 'Postcode to postcode, pallet count, pickup window. No account needed.', label: 'Get a quote' }
    }
  }
};
