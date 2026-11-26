// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

const prismLightTheme = {
  ...prismThemes.github,
  styles: [
    ...prismThemes.github.styles,
    {types: ['property'], style: {color: '#096b69'}},
    {types: ['string'], style: {color: '#a31252'}},
  ],
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Handbook A11Y',
  tagline: 'Sintoma, causa, solução',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://dxdad.github.io',
  baseUrl: '/handbook_wcag/',

  organizationName: 'DxDad',
  projectName: 'handbook_wcag',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/DxDad/handbook_wcag/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Handbook A11Y',
        logo: {
          alt: '',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Sobre',
          },
          {
            href: 'https://github.com/DxDad/handbook_wcag',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Handbook',
            items: [
              {
                label: 'Sobre o Handbook A11Y',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Mais',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/DxDad/handbook_wcag',
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Handbook A11Y. Conteúdo sob a licença <a rel="license" href="https://creativecommons.org/licenses/by-nc/4.0/deed.pt-br">Creative Commons Atribuição-NãoComercial 4.0 Internacional (CC BY-NC 4.0)</a>.`,
      },
      prism: {
        theme: prismLightTheme,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
