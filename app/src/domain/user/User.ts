export class User {
  private readonly id: number;
  private balance: number;

  constructor(id: number, balance: number) {
    this.id = id;
    this.balance = balance;
  }

  public getId(): number {
    return this.id;
  }

  public getBalance(): number {
    return this.balance;
  }

  public updateBalance(amount: number): void {
    if (this.balance + amount < 0) {
      throw new Error('Insufficient funds');
    }
    this.balance += amount;
  }
} 