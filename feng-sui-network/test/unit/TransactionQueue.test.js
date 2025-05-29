const TransactionQueue = require('../../src/core/TransactionQueue');

describe('TransactionQueue', () => {
  let queue;

  beforeEach(() => {
    queue = new TransactionQueue();
  });

  afterEach(() => {
    queue.clear();
  });

  test('should initialize with empty queue', () => {
    const status = queue.getStatus();
    expect(status.queueLength).toBe(0);
    expect(status.nextId).toBe(1);
  });

  test('should add transactions to queue', () => {
    const transaction = {
      type: 'transfer',
      from: 'address1',
      to: 'address2',
      amount: '100',
      nonce: 12345
    };

    const queuedTx = queue.addTransaction(transaction);
    
    expect(queuedTx.id).toBe(1);
    expect(queuedTx.status).toBe('queued');
    expect(queuedTx.type).toBe('transfer');
    expect(queuedTx.timestamp).toBeDefined();
  });

  test('should assign sequential IDs to transactions', () => {
    const tx1 = queue.addTransaction({ type: 'transfer', amount: '100' });
    const tx2 = queue.addTransaction({ type: 'transfer', amount: '200' });
    
    expect(tx1.id).toBe(1);
    expect(tx2.id).toBe(2);
  });

  test('should track queue length correctly', () => {
    expect(queue.getStatus().queueLength).toBe(0);
    
    queue.addTransaction({ type: 'transfer', amount: '100' });
    expect(queue.getStatus().queueLength).toBe(1);
    
    queue.addTransaction({ type: 'transfer', amount: '200' });
    expect(queue.getStatus().queueLength).toBe(2);
  });

  test('should retrieve transactions by ID', () => {
    const originalTx = { type: 'transfer', amount: '100' };
    const queuedTx = queue.addTransaction(originalTx);
    
    const retrievedTx = queue.getTransaction(queuedTx.id);
    expect(retrievedTx).toBeDefined();
    expect(retrievedTx.id).toBe(queuedTx.id);
    expect(retrievedTx.amount).toBe('100');
  });

  test('should return null for non-existent transaction ID', () => {
    const retrievedTx = queue.getTransaction(999);
    expect(retrievedTx).toBeNull();
  });

  test('should clear queue properly', () => {
    queue.addTransaction({ type: 'transfer', amount: '100' });
    queue.addTransaction({ type: 'transfer', amount: '200' });
    
    expect(queue.getStatus().queueLength).toBe(2);
    
    queue.clear();
    expect(queue.getStatus().queueLength).toBe(0);
    expect(queue.getStatus().processedCount).toBe(0);
  });

  test('should handle batch processor connection', () => {
    const mockBatchProcessor = {
      isReady: () => true,
      createBatch: jest.fn()
    };

    queue.setBatchProcessor(mockBatchProcessor);
    const status = queue.getStatus();
    
    expect(status.batchProcessorConnected).toBe(true);
    expect(status.batchProcessorReady).toBe(true);
  });
}); 
