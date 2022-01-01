/// <reference types='next' />
/// <reference types='next/types/global' />

// this file replaces the default next.js next-env.d.ts, which breaks imports for svg files. see https://duncanleung.com/next-js-typescript-svg-any-module-declaration/

declare module '*.svg' {
  const component: React.FC<React.SVGProps<SVGSVGElement>>;

  export default component;
}