import type { Messages } from './en';
import { common } from './fr/common';
import { engine } from './fr/engine';
import { footer, nav } from './fr/layout';
import { landing } from './fr/landing';
import { features, notFound } from './fr/features';
import { howItWorks } from './fr/howItWorks';
import { about, security } from './fr/pages';
import { analyze, dashboard, fingerprints, history, results, status } from './fr/app';
import { clean, settings } from './fr/tools';

/** French: must provide every key defined in `en.ts`. */
export const fr: Messages = {
  common,
  nav,
  footer,
  landing,
  features,
  howItWorks,
  security,
  about,
  notFound,
  dashboard,
  analyze,
  results,
  history,
  fingerprints,
  status,
  clean,
  settings,
  engine,
};
