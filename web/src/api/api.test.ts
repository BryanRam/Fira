import { describe, it, expect } from 'vitest';
import { statusOrder, statusLabels, statusBadgeColors } from './index';

describe('statusOrder', () => {
  it('contains all four statuses in the correct progression order', () => {
    expect(statusOrder).toEqual(['todo', 'in-progress', 'in-review', 'done']);
  });

  it('has todo before in-progress', () => {
    expect(statusOrder.indexOf('todo')).toBeLessThan(statusOrder.indexOf('in-progress'));
  });

  it('has in-progress before in-review', () => {
    expect(statusOrder.indexOf('in-progress')).toBeLessThan(statusOrder.indexOf('in-review'));
  });

  it('has in-review before done', () => {
    expect(statusOrder.indexOf('in-review')).toBeLessThan(statusOrder.indexOf('done'));
  });
});

describe('statusLabels', () => {
  it('has a human-readable label for every status', () => {
    expect(statusLabels['todo']).toBe('To Do');
    expect(statusLabels['in-progress']).toBe('In Progress');
    expect(statusLabels['in-review']).toBe('In Review');
    expect(statusLabels['done']).toBe('Done');
  });

  it('covers all statuses in statusOrder', () => {
    for (const status of statusOrder) {
      expect(statusLabels[status]).toBeTruthy();
    }
  });
});

describe('statusBadgeColors', () => {
  it('provides a color string for every status', () => {
    for (const status of statusOrder) {
      expect(typeof statusBadgeColors[status]).toBe('string');
      expect(statusBadgeColors[status].length).toBeGreaterThan(0);
    }
  });

  it('all colors are valid hex or CSS color strings', () => {
    for (const status of statusOrder) {
      const color = statusBadgeColors[status];
      expect(color).toMatch(/^#[0-9A-Fa-f]{3,8}$|^[a-z]+$/);
    }
  });
});
