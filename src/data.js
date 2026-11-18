// All copy on the page lives here — edit this file to update the site.

export const profile = {
  name: 'Aung Pyae Phyo',
  role: 'Web & Mobile Developer',
  location: 'Taunggyi, Myanmar',
  email: 'ap1548999@gmail.com',
  github: 'https://github.com/Ivankali2020',
  githubHandle: 'Ivankali2020',
  intro:
    'Backend developer building Laravel platforms, Filament panels and Flutter apps — from multi-tenant e-commerce and LMS platforms to offline point-of-sale.',
  about: [
    'I am an ambitious developer with a mature, responsible approach to every task I take on. I work well with others, and I care about delivering on time and to a high standard.',
    'I trained as a teacher and studied English literature before changing careers in 2020. That path left me with clear communication, structured thinking and patience — habits I now bring to code reviews, cross-border teamwork and the products I ship.',
  ],
  stats: [
    { value: '5+', label: 'Years building for the web', more: 'Working with Laravel professionally since May 2021.' },
    { value: '3', label: 'Languages — PHP, JavaScript, Dart', more: 'PHP for backends, JavaScript for interfaces, Dart for Flutter apps.' },
    { value: '2', label: 'Self-initiated products shipped', more: 'A multi-vendor commerce platform and an offline point-of-sale app.' },
  ],
}

// `icon` picks the logo shown on the right of each row — see src/skillIcons.jsx for the list.
export const skills = [
  {
    title: 'Backend',
    items: [
      { name: 'Laravel framework', icon: 'laravel' },
      { name: 'Filament', icon: 'filament' },
      { name: 'RESTful API development', icon: 'api' },
      { name: 'MySQL database management', icon: 'mysql' },
      { name: 'Git version control', icon: 'git' },
      { name: 'Testing & debugging', icon: 'testing' },
    ],
  },
  {
    title: 'Frontend & Mobile',
    items: [
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'React', icon: 'react' },
      { name: 'Vue', icon: 'vue' },
      { name: 'Livewire', icon: 'livewire' },
      { name: 'Flutter', icon: 'flutter' },
    ],
  },
  {
    title: 'Ways of working',
    items: [
      { name: 'Problem-solving', icon: 'idea' },
      { name: 'Strong attention to detail', icon: 'detail' },
      { name: 'Teamwork & communication', icon: 'team' },
      { name: 'Code review', icon: 'review' },
    ],
  },
]

export const marquee = [
  'Laravel', 'Filament', 'Livewire', 'PHP', 'MySQL', 'REST APIs', 'React', 'Vue',
  'JavaScript', 'Flutter', 'Dart', 'Tailwind CSS', 'Pest', 'WordPress', 'kintone', 'Git',
]

export const experience = [
  {
    role: 'Backend Developer',
    company: 'Coosy Japan — Myanmar branch',
    logo: 'logos/coosy.png',
    url: 'https://coosy.co.jp/',
    period: 'Jun 2024 — Present',
    points: [
      'Build custom-designed WordPress sites with SEO optimisation.',
      'Collaborate daily with the Japanese team.',
      'Write to Japanese-standard design rules and CSS conventions such as BEM.',
      'Develop custom web pages with Filament and Livewire.',
      'Build in-house applications through kintone customisation.',
      'Learning AWS services for deploying test servers.',
    ],
  },
  {
    role: 'Laravel Developer',
    company: 'APP.COM.MM Company Limited',
    logo: 'logos/appcommm.jpg',
    url: 'https://app.com.mm/',
    period: '2023 — May 2024',
    points: [
      'Developed and maintained web applications on the Laravel framework.',
      'Implemented backend logic, database schemas and RESTful APIs.',
      'Applied advanced Eloquent ORM: eager and lazy loading, relationships, model scopes, custom accessors and mutators.',
      'Used Laravel Queues and Horizon for asynchronous and background processing.',
      'Conducted code reviews and gave feedback to team members.',
      'Began learning Flutter for mobile development.',
    ],
  },
  {
    role: 'Junior Laravel Developer',
    company: 'APP.COM.MM Company Limited',
    logo: 'logos/appcommm.jpg',
    url: 'https://app.com.mm/',
    period: 'May 2021 — 2023',
    points: [
      'Assisted senior developers in building and maintaining Laravel projects.',
      'Worked on frontend tasks in HTML, CSS and JavaScript.',
      'Contributed to the design and development of RESTful APIs.',
      'Wrote unit tests and took part in bug fixing.',
    ],
  },
]

export const projects = [
  {
    // Screenshots for the slider. Put files in public/projects/… and list them here.
    images: ['projects/ecommerce/1.svg', 'projects/ecommerce/2.svg', 'projects/ecommerce/3.svg'],
    title: 'Multi-Vendor E-Commerce & POS Platform',
    url: 'https://github.com/Ivankali2020/ecommerce_plus',
    stack: ['Laravel 13', 'PHP 8.4', 'Filament 5', 'Livewire 4', 'Tailwind CSS 4', 'Pest'],
    summary:
      'A multi-tenant SaaS platform where Myanmar sellers each run their own online store on a custom domain, with a built-in point-of-sale system and a bilingual English/Myanmar interface.',
    points: [
      'Domain-based multi-tenancy with stancl/tenancy — a branded storefront per seller, data kept separate in a shared database.',
      'Separate Filament admin and seller panels with role-based permissions, staff sub-accounts and subscription-gated access.',
      'Livewire storefront: variants, retail and wholesale pricing, cart and checkout with delivery-zone fees, cash on delivery and payment-slip uploads.',
      'Loyalty points and referrals, gift redemption, reviews, order returns and Excel import/export.',
      'Telegram order notifications, ESC/POS thermal receipts, PDF invoices, Google sign-in and a Sanctum REST API for mobile clients.',
      'Storefront UI rebuilt as a reusable Blade component library with design tokens, covered by Pest tests.',
    ],
  },
  {
    images: ['projects/pos/1.svg', 'projects/pos/2.svg', 'projects/pos/3.svg'],
    title: 'Offline Point-of-Sale App',
    url: 'https://github.com/Ivankali2020/offiline-pos',
    stack: ['Flutter', 'Dart', 'SQLite', 'GetX'],
    summary:
      'A Flutter POS application for managing sales, inventory, purchases, expenses and returns — built to keep working with no internet connection.',
    points: [
      'Local SQLite database so sales are processed without any internet dependency.',
      'Product and inventory management with categories, brands, suppliers, variants and stock tracking.',
      'Full sales workflow: checkout, discounts, payment handling, returns and invoice generation.',
      'Dashboard analytics with sales summaries, charts and daily/monthly reporting.',
      'Barcode scanning, thermal receipt printing and an English/Myanmar multi-store interface.',
    ],
  },
]

export const education = [
  {
    title: 'Web Development Certificate',
    place: 'MMSIT',
    period: '2020 — 2021',
    text: 'The course I took when I decided to change careers — backend and frontend techniques practised on real-life projects.',
    // Shown as a small slider under the text. Files live in public/certificates/.
    certificates: [
      { src: 'certificates/web-development.jpg', alt: 'Certificate of completion — Web Development Course, Sep to Nov 2020' },
      { src: 'certificates/basic-web-design.jpg', alt: 'Certificate of completion — Basic Web Design Course, Jan 2021' },
      { src: 'certificates/special-web-design.jpg', alt: 'Certificate of completion — Special Web Design Course, Dec 2021 to Feb 2022' },
    ],
  },
  {
    title: 'B.A. (English)',
    place: 'Loikaw University',
    period: '2016 — 2019',
    text: 'Majored in English literature, specialising in professional writing, critical analysis and structural editing.',
  },
  {
    title: 'Diploma in Teacher Education',
    place: 'Taunggyi Education College',
    period: '2016 — 2018',
    text: 'First steps in computer programming, alongside presentation, communication and group-work skills.',
  },
]
