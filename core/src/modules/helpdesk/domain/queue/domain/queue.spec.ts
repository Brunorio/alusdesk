import { Queue, QueueId } from './queue';

describe('Queue Domain Unit Tests', () => {
  it('should create a valid Queue instance', () => {
    const queue = new Queue({
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      name: 'Tier 1 Support',
      priority: 2,
    });

    expect(queue).toBeInstanceOf(Queue);
    expect(queue.getId()).toBeInstanceOf(QueueId);
    expect(queue.getOutput().name).toBe('Tier 1 Support');
    expect(queue.getOutput().priority).toBe(2);
    expect(queue.getOutput().isActive).toBe(true);
  });
});

