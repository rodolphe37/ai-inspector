import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';

const plans = [
  {
    name: 'Free',
    description: 'For individual explorers',
    monthly: 0,
    yearly: 0,
    features: [
      '10 analyses per day',
      'Basic metadata inspection',
      'Unicode scanner',
      'C2PA inspection',
      'Demo mode',
    ],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Pro',
    description: 'For professionals and researchers',
    monthly: 24,
    yearly: 19,
    features: [
      'Unlimited analyses',
      'Advanced fingerprint matching',
      'Detailed reports with export',
      'Analysis history',
      'Statistical analysis with p-values',
      'API access',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Business',
    description: 'For teams and organizations',
    monthly: 99,
    yearly: 79,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access with higher limits',
      'Private deployment option',
      'Audit logs',
      'Priority support',
    ],
    cta: 'Contact us',
    highlight: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted max-w-2xl mx-auto"
          >
            Start free in demo mode. Upgrade when you need more.
          </motion.p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3">
            <span className={`text-sm ${!yearly ? 'text-content font-medium' : 'text-muted'}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative h-7 w-12 rounded-full transition-colors ${yearly ? 'bg-primary' : 'bg-border-hover'}`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 h-5 w-5 rounded-full bg-white"
                style={{ left: yearly ? '1.5rem' : '0.25rem' }}
              />
            </button>
            <span className={`text-sm ${yearly ? 'text-content font-medium' : 'text-muted'}`}>
              Yearly
              <span className="ml-1.5 text-xs text-success">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`surface p-6 relative ${plan.highlight ? 'border-primary glow-primary' : ''}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted mt-1">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={yearly ? 'yearly' : 'monthly'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-4xl font-bold tabular-nums"
                  >
                    ${yearly ? plan.yearly : plan.monthly}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-muted">/month</span>
              </div>
              {yearly && plan.monthly > 0 && (
                <p className="text-xs text-success mt-1">
                  Billed annually (${plan.yearly * 12}/year)
                </p>
              )}

              <Link
                to="/app"
                className={`mt-6 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'border border-default text-content hover:bg-surface-2'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Sparkles className="h-6 w-6 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted max-w-lg mx-auto">
            All plans include demo mode. No credit card required to start.
            An absence of signal does not constitute proof of human origin.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
