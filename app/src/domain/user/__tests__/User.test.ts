import { User } from '../User';

describe('User', () => {
  let user: User;

  beforeEach(() => {
    user = new User(1, 1000);
  });

  test('should create user with initial balance', () => {
    expect(user.getId()).toBe(1);
    expect(user.getBalance()).toBe(1000);
  });

  test('should update balance successfully', () => {
    user.updateBalance(500);
    expect(user.getBalance()).toBe(1500);
  });

  test('should throw error when balance becomes negative', () => {
    expect(() => user.updateBalance(-2000)).toThrow('Insufficient funds');
    expect(user.getBalance()).toBe(1000); // Balance should not change
  });
}); 