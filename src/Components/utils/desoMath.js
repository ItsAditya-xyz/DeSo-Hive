import bs58check from "bs58check";


function getUSDValue(desoNanos, desoPrice) {
  let usdValue = (Math.round(desoNanos / 1e7) / 100) * desoPrice;
  return Math.round(usdValue * 100) / 100;
}

function timeDelay (time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function getSellingPrice(
  desoLockedNanos,
  coinsInCirculation,
  balanceNanos,
  desoPrice
) {
  var beforeFees =
    desoLockedNanos *
    (1 - Math.pow(1 - balanceNanos / coinsInCirculation, 1 / 0.3333333));
  var result = (beforeFees * (100 * 100 - 1)) / (100 * 100);
  var sellingPriceInUSD = (result / 1e9) * desoPrice;
  return Math.round(sellingPriceInUSD * 1000) / 1000;
}
function getExpiration(currentBlock, expirationBlock) {
  const leftBlock = expirationBlock - currentBlock;
  // assuming a block is minted after every 5 minutes
  const minutesLeft = leftBlock * 5;

  if (minutesLeft < 60) {
    const result = minutesLeft.toString + " m";
    return result; //returning minutes
  } else if (minutesLeft < 1440) {
    const result = `${Math.round(minutesLeft / 60)}h ${minutesLeft % 60}m`;
    return result;
  } else if (minutesLeft < 10080) {
    const day = Math.round(minutesLeft / (60 * 24));
    const hours = Math.round((minutesLeft - day * 24 * 60) / 60);
    const minutes = Math.round(minutesLeft - day * 24 * 60 - hours * 60);
    const result = `${day}d ${hours > 0 ? hours.toString() + "h" : ""} ${
      minutes > 0 ? minutes.toString() + "m" : ""
    }`;
    return result;
  } else if (minutesLeft < 43200) {
    const week = Math.round(minutesLeft / (60 * 24 * 7));
    const day = Math.round((minutesLeft - week * 60 * 24 * 7) / (60 * 24));
    const hours = Math.round(
      (minutesLeft - week * 60 * 24 * 7 - day * 24 * 60) / 60
    );
    const result = `${week}w ${day > 0 ? day.toString() + "d" : ""} ${
      hours > 0 ? hours.toString() + "h" : ""
    }`;

    return result;
  } else {
    const month = Math.round(minutesLeft / (60 * 24 * 30));
    const day = Math.round((minutesLeft - 30 * 24 * 60) / (60 * 24));
    const result = `${month}M ${day > 0 ? day.toString() + "d" : ""}`;

    return result;
  }
}
function uint64ToBufBigEndian(expirationBlock) {
  const result = [];
  while (expirationBlock >= 0xff) {
    result.push(expirationBlock & 0xff);
    expirationBlock >>>= 8;
  }
  result.push(expirationBlock | 0);
  while (result.length < 8) {
    result.push(0);
  }

  return result.reverse();
}

function getPublicKeyfromDeSoPublicKey(publicKey){
 
    const desopublicKeyDecoded = bs58check.decode(publicKey);
    const desoPublicKeyDecodedArray = [...desopublicKeyDecoded]
    const rawPublicKeyArra = desoPublicKeyDecodedArray.slice(3);
    return rawPublicKeyArra;
}
export {getUSDValue,timeDelay, getSellingPrice, getExpiration, uint64ToBufBigEndian, getPublicKeyfromDeSoPublicKey };
