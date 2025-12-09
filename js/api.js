/* Olti begins */

console.log("[v1] API.js loading...")

const COINGECKO_API_KEY = "CG-wgcadFUpu3PAXfk8SMDK2HSA"
const ALPHA_VANTAGE_KEY = "NNUSPZTOLNO9KM6G"

async function fetchCryptoData(coinId) {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&x_cg_demo_api_key=${COINGECKO_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Crypto Network Error: ${response.status}`);
    const data = await response.json();
    if (!data[coinId]) return null;

    return {
      name: coinId,
      price: Number.parseFloat(data[coinId].usd),
      change: Number.parseFloat(data[coinId].usd_24h_change),
      type: "crypto",
    }
  } catch (error) {
    console.error("Crypto Fetch Error:", error)
    return null
  }
}

async function fetchCryptoHistory(coinId, days = 7) {
  try {
    const interval = days == 1 ? "hourly" : "daily"
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}&x_cg_demo_api_key=${COINGECKO_API_KEY}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Crypto History Network Error: ${response.status}`)
    const data = await response.json()
    return data.prices || []
  } catch (error) {
    console.error("Crypto History Error:", error)
    return []
  }
}

async function fetchStockData(symbol) {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Stock Network Error: ${response.status}`)
    const data = await response.json()

    if (data["Note"]) {
      console.warn("Alpha Vantage Note:", data["Note"])
      return null
    }
    if (data["Error Message"]) {
      console.warn("Alpha Vantage Error Message:", data["Error Message"])
      return null
    }

    const quote = data["Global Quote"]
    if (!quote || Object.keys(quote).length === 0) {
      return null
    }

    const priceRaw = quote["05. price"] || quote["05. Price"] || null
    const changePctRaw = quote["10. change percent"] || quote["10. Change Percent"] || null

    const price = priceRaw ? Number.parseFloat(priceRaw) : null
    const changePct = changePctRaw ? Number.parseFloat(changePctRaw.replace("%", "")) : null

    return {
      name: symbol,
      price,
      change: changePct,
      type: "stock",
    }
  } catch (error) {
    console.error("Stock API Error:", error)
    return null
  }
}

async function fetchStockHistory(symbol, days = 7) {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_KEY}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Stock History Network Error: ${response.status}`)
    const data = await response.json()

    if (data["Note"]) {
      console.warn("Alpha Vantage Note (history):", data["Note"])
      return []
    }
    if (data["Error Message"]) {
      console.warn("Alpha Vantage Error Message (history):", data["Error Message"])
      return []
    }

    const series = data["Time Series (Daily)"]
    if (!series) return []

    const dates = Object.keys(series).sort().slice(-days)
    const chartData = dates.map(date => {
      const closeRaw = series[date]["4. close"]
      const close = closeRaw ? Number.parseFloat(closeRaw) : null
      return [new Date(date).getTime(), close]
    })

    return chartData
  } catch (error) {
    console.error("Stock History Error:", error)
    return []
  }
}

async function searchAsset(query) {
  const cryptoResult = await fetchCryptoData(query.toLowerCase())
  if (cryptoResult) return cryptoResult

  const stockResult = await fetchStockData(query.toUpperCase())
  if (stockResult) return stockResult

  throw new Error(`No results found for "${query}"`)
}

window.API = {
  getCryptoCurrentAndChange: fetchCryptoData,
  getCryptoHistory: fetchCryptoHistory,
  getStockCurrent: fetchStockData,
  getStockHistory: fetchStockHistory,
  searchAsset: searchAsset,
}

console.log("[v1] API object exposed globally:", window.API)

/* Olti ends */
