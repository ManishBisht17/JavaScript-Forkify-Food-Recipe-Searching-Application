import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

const gcd = function (a, b) {
  return b ? gcd(b, a % b) : a;
};

export const formatQuantity = function (quantity) {
  if (!quantity) return '';

  const sign = quantity < 0 ? '-' : '';
  const absolute = Math.abs(quantity);
  const whole = Math.floor(absolute + 1e-9);
  const fraction = absolute - whole;

  if (fraction < 1e-6) return `${sign}${whole}`;

  let bestNumerator = 0;
  let bestDenominator = 1;
  let smallestError = Infinity;

  for (let denominator = 1; denominator <= 16; denominator++) {
    const numerator = Math.round(fraction * denominator);
    const error = Math.abs(fraction - numerator / denominator);
    if (error < smallestError) {
      bestNumerator = numerator;
      bestDenominator = denominator;
      smallestError = error;
    }
  }

  const divisor = gcd(bestNumerator, bestDenominator);
  bestNumerator /= divisor;
  bestDenominator /= divisor;

  if (bestDenominator === 1) return `${sign}${whole + bestNumerator}`;
  if (whole === 0) return `${sign}${bestNumerator}/${bestDenominator}`;
  return `${sign}${whole} ${bestNumerator}/${bestDenominator}`;
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    const fetchPro = fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};
*/
