import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetMeter } from '../components/plan/BudgetMeter';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';

describe('ConfidenceBadge', () => {
  it('labels estimates and sample data distinctly', () => {
    render(<><ConfidenceBadge confidence="estimate" /><ConfidenceBadge confidence="sample" /></>);
    expect(screen.getByText('Estimate')).toBeInTheDocument();
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });
});

describe('BudgetMeter', () => {
  it('shows overspend clearly', () => {
    render(<BudgetMeter budget={{ status: 'over', budget: 100000, difference: -20000, utilisation: 1.2, warnings: [] }} />);
    expect(screen.getByText('Over budget')).toBeInTheDocument();
    expect(screen.getByText('₹20,000 over')).toBeInTheDocument();
  });
  it('shows remaining budget', () => {
    render(<BudgetMeter budget={{ status: 'within', budget: 100000, difference: 25000, utilisation: 0.75, warnings: [] }} />);
    expect(screen.getByText('₹25,000 left')).toBeInTheDocument();
  });
});
