import axios, { AxiosError } from 'axios';

const TOTAL_REQUESTS = 10000;
const BATCH_SIZE = 100;
const AMOUNT_TO_WITHDRAW = -2;
const USER_ID = 1;
const API_URL = 'http://localhost/balance/update';
const BALANCE_URL = `http://localhost/balance/${USER_ID}`;
const EXPECTED_SUCCESSFUL_REQUESTS = 5000;

async function getBalance() {
  const response = await axios.get(BALANCE_URL);
  return Number(response.data.balance);
}

async function sendRequest() {
  try {
    await axios.post(API_URL, {
      userId: USER_ID,
      amount: AMOUNT_TO_WITHDRAW
    });
    return true;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 400) {
      return false;
    }
    throw error;
  }
}

async function runBatch(size: number) {
  const requests = Array(size).fill(null).map(() => sendRequest());
  const results = await Promise.all(requests);
  return results.reduce((acc, success) => acc + (success ? 1 : 0), 0);
}

async function runTest() {
  console.log('Starting test...');

  // Проверяем начальный баланс
  const initialBalance = await getBalance();
  console.log(`Initial balance: ${initialBalance.toFixed(2)}`);

  // Проверяем, что баланса хватит на нужное количество запросов
  const requiredBalance = Math.abs(AMOUNT_TO_WITHDRAW) * EXPECTED_SUCCESSFUL_REQUESTS;
  if (initialBalance < requiredBalance) {
    console.log(`Insufficient initial balance. Need at least ${requiredBalance}, but have ${initialBalance.toFixed(2)}`);
    return;
  }

  let successfulRequests = 0;
  let failedRequests = 0;

  for (let i = 0; i < TOTAL_REQUESTS; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL_REQUESTS - i);
    const batchSuccesses = await runBatch(batchSize);
    successfulRequests += batchSuccesses;
    failedRequests += batchSize - batchSuccesses;

    console.log(`Batch ${i/BATCH_SIZE + 1}: ${batchSuccesses} successful, ${batchSize - batchSuccesses} failed`);
  }

  // Проверяем финальный баланс
  const finalBalance = await getBalance();
  const expectedBalance = initialBalance - (successfulRequests * Math.abs(AMOUNT_TO_WITHDRAW));
  console.log('\nTest completed!');
  console.log(`Final balance: ${finalBalance.toFixed(2)}`);
  console.log(`Expected balance: ${expectedBalance.toFixed(2)}`);
  console.log(`Successful requests: ${successfulRequests}`);
  console.log(`Failed requests: ${failedRequests}`);

  // Округляем значения до 2 знаков после запятой для сравнения
  const roundedFinalBalance = Math.round(finalBalance * 100) / 100;
  const roundedExpectedBalance = Math.round(expectedBalance * 100) / 100;

  // Проверяем результаты теста
  let testPassed = true;
  const messages: string[] = [];

  if (roundedFinalBalance !== roundedExpectedBalance) {
    testPassed = false;
    messages.push('Final balance does not match expected balance');
  }

  if (successfulRequests !== EXPECTED_SUCCESSFUL_REQUESTS) {
    testPassed = false;
    messages.push(`Expected ${EXPECTED_SUCCESSFUL_REQUESTS} successful requests, but got ${successfulRequests}`);
  }

  if (failedRequests !== EXPECTED_SUCCESSFUL_REQUESTS) {
    testPassed = false;
    messages.push(`Expected ${EXPECTED_SUCCESSFUL_REQUESTS} failed requests, but got ${failedRequests}`);
  }

  if (testPassed) {
    console.log('Test passed! All conditions met:');
    console.log(`- Final balance matches expected balance`);
    console.log(`- Exactly ${EXPECTED_SUCCESSFUL_REQUESTS} successful requests`);
    console.log(`- Exactly ${EXPECTED_SUCCESSFUL_REQUESTS} failed requests`);
  } else {
    console.log('Test failed! Issues found:');
    messages.forEach(msg => console.log(`- ${msg}`));
  }
}

runTest().catch(console.error);
