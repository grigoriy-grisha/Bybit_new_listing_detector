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
            category: "linear",
            side: 'Buy',
            orderType: "Market",
            positionIdx: 1
        }
    )

    console.log("_____BUY_DERIVATIVES_____")
    console.log(resultBuy)

    await wait(10000)

    const resultSell = await client.submitOrder({
            symbol,
            qty,
            category: "linear",
            side: 'Sell',
            orderType: "Market",
            positionIdx: 1
        }
    )

    console.log("_____SELL_DERIVATIVES_____")
    console.log(resultSell)

}

async function runDerivatives() {
    console.log("___START_DERIVATIVES___")
    while (true) {
        try {
            const response = await client
                .getInstrumentsInfo({
                    category: 'linear',
                })

            if (list.length === 0) {
                list = response.result.list
                continue
            }

            const values = findCommonElementsInArray(list, response.result.list)
            if (values.length !== 0) {

                for (let i = 0; i < values.length; i++) {
                    console.log("____FOUND_NEW_PAIR_DERIVATIVES____")
                    console.log(values)
                    console.log("____FOUND_NEW_PAIR_DERIVATIVES_DATE____")
                    console.log(new Date())
                    console.log("____START_TRADING_DERIVATIVES____")
                    await handleTrade({symbol: values[i].symbol, qty: "30"})
                }
            }
            list = response.result.list
            await wait(500)
        } catch (e) {
            console.log("____ERROR_DERIVATIVES____")
            console.log(e)
        }
    }
}

module.exports = {runDerivatives}
