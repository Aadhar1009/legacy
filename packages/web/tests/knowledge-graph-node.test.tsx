import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KnowledgeGraphNode } from '../src/components/business/knowledge-graph-node';
import { LoreEntity } from '../src/lib/mock-lore-engine';

describe('KnowledgeGraphNode', () => {
  it('renders normal entity correctly', () => {
    const entity: LoreEntity = {
      id: '1',
      name: 'Gupta Traders',
      type: 'COMPANY',
      relation: 'Customer'
    };
    
    render(<KnowledgeGraphNode entity={entity} />);
    expect(screen.getByText('Gupta Traders')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
  });

  it('renders risk entity with error classes', () => {
    const entity: LoreEntity = {
      id: '2',
      name: 'Rakesh',
      type: 'PERSON',
      relation: 'Sole Knowledge Owner',
      isConcentratedRisk: true
    };
    
    const { container } = render(<KnowledgeGraphNode entity={entity} />);
    expect(screen.getByText('Rakesh')).toBeInTheDocument();
    
    // Check if error-related classes are applied
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('border-error');
  });
});
