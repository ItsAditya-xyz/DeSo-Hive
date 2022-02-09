function getUSDValue(desoNanos, desoPrice){
    let usdValue = (Math.round(desoNanos/1e7)/100) * desoPrice;
    return Math.round(usdValue*100)/100;
}

function getSellingPrice(desoLockedNanos, coinsInCirculation, balanceNanos, desoPrice){
    var beforeFees = desoLockedNanos * (1- Math.pow((1- balanceNanos/coinsInCirculation), (1/0.3333333)))
    var result = (beforeFees * (100*100-1))/(100*100);
    var sellingPriceInUSD =  result/1e9 * desoPrice;
    return Math.round(sellingPriceInUSD*10000)/10000;
}

export {getUSDValue, getSellingPrice};