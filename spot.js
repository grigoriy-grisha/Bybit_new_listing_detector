const {RestClientV5} = require('bybit-api');


const client = new RestClientV5({
    key: process.env.KEY,
    secret: process.env.SECRET
});

function findCommonElementsInArray(arr1, arr2) {
    return arr2.filter(item1 => !arr1.find(item2 => item2.symbol === item1.symbol));
}

let list = [];

const wait = (ms) => new Promise((r => setTimeout(r, ms)));

async function handleTrade({symbol, qty}) {
    const resultBuy = await client.submitOrder({
            symbol,
            qty,
            category: "spot",
            side: 'Buy',
            orderType: "Market"
        }
    )

    console.log("_____BUY_SPOT_____")
    console.log(resultBuy)

    await wait(10000)

    const balance = await getBalanceCoin(symbol);

    console.log(balance)

    const resultSell = await client.submitOrder({
            symbol,
            qty: Number(balance.equity).toFixed(2),
            category: "spot",
            side: 'Sell',
            orderType: "Market"
        }
    )

    console.log("_____SELL_SPOT_____")
    console.log(resultSell)

}

async function getBalanceCoin(symbol) {
    const balance = await client.getWalletBalance(
        {
            accountType: 'UNIFIED'
        }
    )

    const wallet = balance.result.list[0]
    const baseCoin = symbol.replace("USDT", "")

    return wallet.coin.find(({coin}) => coin === baseCoin)
}


async function runSpot() {
    console.log("___START_SPOT___")
    while (true) {
        try {
            const response = await client
                .getInstrumentsInfo({
                    category: 'spot',
                })

            if (list.length === 0) {
                list = response.result.list
                continue
            }

            const values = findCommonElementsInArray(list, response.result.list)
            if (values.length !== 0) {
                console.log("____FOUND_NEW_PAIR_SPOT____")
                console.log(values)
                console.log("____FOUND_NEW_PAIR_SPOT_DATE____")
                console.log(new Date())
                console.log("____START_TRADING_SPOT____")
                await handleTrade({symbol: values[0].symbol, qty: "30"})
            }
            list = response.result.list
            await wait(500)
        } catch (e) {
            console.log("____ERROR_SPOT____")
            console.log(e)
        }
    }
}

module.exports = {runSpot}
