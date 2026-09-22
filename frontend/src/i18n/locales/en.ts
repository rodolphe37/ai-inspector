import { common } from './en/common';
import { engine } from './en/engine';
import { footer, nav, pwa } from './en/layout';
import { landing } from './en/landing';
import { features, notFound } from './en/features';
import { howItWorks } from './en/howItWorks';
import { about, security } from './en/pages';
import { analyze, dashboard, fingerprints, history, results, status } from './en/app';
import { clean, settings } from './en/tools';

/** English: the source of truth for every translation key. */
export const en = {
  common,
  nav,
  footer,
  pwa,
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

export type Messages = typeof en;
