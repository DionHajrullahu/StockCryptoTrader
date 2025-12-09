/* Dioni Starts */

const symbolInput = document.getElementById("symbolInput")
const searchBtn = document.getElementById("searchBtn")
const currentCard = document.getElementById("currentCard")
const currentName = document.getElementById("currentName")
const currentSymbol = document.getElementById("currentSymbol")
const currentPrice = document.getElementById("currentPrice")
const currentChangeVal = document.getElementById("currentChangeVal")
const currentChangePct = document.getElementById("currentChangePct")
const currentTimestamp = document.getElementById("currentTimestamp")
const historyTypeSel = document.getElementById("historyTypeSel")
const alertBox = document.getElementById("alertBox")

const currentContext = { type: "stock", symbol: "", coinId: "", days: 7 }

const coinMap = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", XRP: "ripple", ADA: "cardano",
  SOL: "solana", DOGE: "dogecoin", DOT: "polkadot", MATIC: "matic-network", AVAX: "avalanche-2",
  SHIB: "shiba-inu", LTC: "litecoin", LINK: "chainlink", UNI: "uniswap", ATOM: "cosmos",
  XLM: "stellar", ETC: "ethereum-classic", BCH: "bitcoin-cash", NEAR: "near", ALGO: "algorand",
  VET: "vechain", ICP: "internet-computer", FIL: "filecoin", HBAR: "hedera-hashgraph",
  APT: "aptos", QNT: "quant-network", ARB: "arbitrum", OP: "optimism",
  USDT: "tether", USDC: "usd-coin", BUSD: "binance-usd", DAI: "dai",
  AAVE: "aave", MKR: "maker", COMP: "compound-governance-token", SNX: "synthetix-network-token",
  CRV: "curve-dao-token", MINA: "mina-protocol", IMX: "immutable-x", LRC: "loopring"
}

const stockAliases = {
  TESLA: "TSLA", APPLE: "AAPL", MICROSOFT: "MSFT", GOOGLE: "GOOGL", ALPHABET: "GOOGL",
  AMAZON: "AMZN", META: "META", FACEBOOK: "META", NVIDIA: "NVDA", NETFLIX: "NFLX",
  ADOBE: "ADBE", ORACLE: "ORCL", IBM: "IBM", CISCO: "CSCO", INTEL: "INTC", AMD: "AMD",
  QUALCOMM: "QCOM", SALESFORCE: "CRM", ZOOM: "ZM", SHOPIFY: "SHOP", UBER: "UBER",
  LYFT: "LYFT", AIRBNB: "ABNB", SPOTIFY: "SPOT", TWITTER: "TWTR", SNAP: "SNAP",
  PINTEREST: "PINS", ROBLOX: "RBLX", DISNEY: "DIS", COMCAST: "CMCSA", SONY: "SONY",
  KO: "KO", PEPSI: "PEP", MCDONALDS: "MCD", STARBUCKS: "SBUX", WALMART: "WMT",
  TARGET: "TGT", COSTCO: "COST", HOMEDEPOT: "HD", LOWES: "LOW", BESTBUY: "BBY",
  NIKE: "NKE", FORD: "F", GM: "GM", TOYOTA: "TM", BOEING: "BA", JPMORGAN: "JPM",
  "BANK OF AMERICA": "BAC", VISA: "V", MASTERCARD: "MA", PFIZER: "PFE", MODERNA: "MRNA",
  EXXON: "XOM", CHEVRON: "CVX", VERIZON: "VZ", TMUS: "TMUS", GE: "GE"
}

function showAlert(msg, type = "danger") {
  alertBox.textContent = msg
  alertBox.className = `alert-box`
  if (type === "success") alertBox.classList.add("success")
  if (type === "warning") alertBox.classList.add("warning")
  alertBox.classList.remove("d-none")
}

function clearAlert() {
  alertBox.classList.add("d-none")
}

function renderCurrent(asset) {
  currentCard.classList.remove("d-none")
  currentName.textContent = asset.name
  currentSymbol.textContent = asset.symbol
  currentPrice.textContent = asset.current?.toFixed(2) ?? "N/A"
  currentChangeVal.textContent = asset.changeVal?.toFixed(2) ?? "N/A"
  currentChangePct.textContent = asset.changePct != null ? asset.changePct.toFixed(2) + "%" : "N/A"
  currentTimestamp.textContent = "Last updated: " + new Date(asset.timestamp).toLocaleString()

  currentChangeVal.classList.remove("positive", "negative")
  currentChangePct.classList.remove("positive", "negative")

  if (asset.changeVal > 0) {
    currentChangeVal.classList.add("positive")
    currentChangePct.classList.add("positive")
  } else if (asset.changeVal < 0) {
    currentChangeVal.classList.add("negative")
    currentChangePct.classList.add("negative")
  }
}

async function doSearch(e) {
  if (e) e.preventDefault()
  clearAlert()

  let symbol = (symbolInput.value || "").trim()
  if (!symbol) return showAlert("Please enter a symbol", "warning")

  const type = document.querySelector('input[name="assetType"]:checked').value
  currentContext.type = type
  currentContext.days = historyTypeSel.value === "1" ? 1 : 7

  const inputUpper = symbol.toUpperCase()

  if (type === "stock") {
    if (stockAliases[inputUpper]) {
      const original = inputUpper
      symbol = stockAliases[inputUpper]
      showAlert(`Searching for ${original} (${symbol})...`, "success")
    } else {
      symbol = inputUpper
    }
  } else {
    symbol = inputUpper
  }

  currentContext.symbol = symbol

  if (!window.API) {
    showAlert("API not loaded.", "danger")
    return
  }

  try {
    let result, historyPoints = []

    if (type === "crypto") {
      const coinId = coinMap[symbol]
      if (!coinId) throw new Error(`Unknown crypto: ${symbol}`)

      currentContext.coinId = coinId

      result = await API.getCryptoCurrentAndChange(coinId)
      if (!result) throw new Error(`No live data for ${symbol}`)

      historyPoints = await API.getCryptoHistory(coinId, currentContext.days)
      const changeVal = result.price * (result.change / 100)

      renderCurrent({
        name: coinId.toUpperCase(),
        symbol,
        current: result.price,
        changeVal,
        changePct: result.change,
        timestamp: Date.now(),
      })
    }

    else {
      result = await API.getStockCurrent(symbol)
      if (!result || result.price == null) {
        throw new Error(`Stock "${symbol}" not found or rate-limited.`)
      }

      historyPoints = await API.getStockHistory(symbol, currentContext.days)

      const prevPrice = historyPoints.length > 1 ? historyPoints.at(-2)[1] : null
      const changeVal = result.change != null
        ? result.price * (result.change / 100)
        : prevPrice != null ? result.price - prevPrice : 0

      const changePct = result.change != null
        ? result.change
        : prevPrice != null ? (changeVal / prevPrice) * 100 : 0

      renderCurrent({
        name: symbol,
        symbol,
        current: result.price,
        changeVal,
        changePct,
        timestamp: Date.now(),
      })
    }

    if (historyPoints.length > 0) {
      if (window.renderHistoryChart) {
        window.renderHistoryChart(historyPoints, currentContext)
        showAlert("Data loaded successfully!", "success")
        setTimeout(clearAlert, 2500)
      }
    } else {
      if (window.clearChart) window.clearChart()
      showAlert("No historical data available.", "warning")
    }

  } catch (err) {
    showAlert(err.message)
    if (window.clearChart) clearChart()
    currentCard.classList.add("d-none")
  }
}

searchBtn.addEventListener("click", doSearch)
symbolInput.addEventListener("keypress", e => { if (e.key === "Enter") doSearch(e) })
historyTypeSel.addEventListener("change", () => { if (currentContext.symbol) doSearch() })

window.addEventListener("DOMContentLoaded", () => {
  console.log("[v2] App initialized")
})

const themeBtn = document.querySelector(".theme-btn");
const lightIcon = themeBtn.querySelector("span:first-child");
const darkIcon = themeBtn.querySelector("span:last-child");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  lightIcon.classList.toggle("active");
  darkIcon.classList.toggle("active");

  if (document.body.classList.contains("dark-theme")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
  lightIcon.classList.remove("active");
  darkIcon.classList.add("active");
}

const watchlist = [];
const watchlistToggle = document.getElementById("watchlist-toggle");
const watchlistContainer = document.getElementById("watchlist");
const watchlistItems = document.getElementById("watchlist-items");

watchlistToggle.addEventListener("click", () => {
    watchlistContainer.classList.toggle("d-none");
});

function renderWatchlist() {
    watchlistItems.innerHTML = "";
    watchlist.forEach(symbol => {
        const li = document.createElement("li");
        li.textContent = symbol;
        li.addEventListener("click", () => {
            symbolInput.value = symbol;
            doSearch();
        });
        watchlistItems.appendChild(li);
    });
}

function addToWatchlist(symbol) {
    if (!watchlist.includes(symbol)) {
        watchlist.push(symbol);
        renderWatchlist();
        showAlert(`${symbol} added to watchlist`, "success");
    } else {
        showAlert(`${symbol} is already in watchlist`, "warning");
    }
}

function removeFromWatchlist(symbol) {
    const index = watchlist.indexOf(symbol);
    if (index !== -1) {
        watchlist.splice(index, 1);
        renderWatchlist();
        showAlert(`${symbol} removed from watchlist`, "success");
    }
}

const watchlistBtn = document.createElement("button");
watchlistBtn.textContent = "⭐ Add to Watchlist";
watchlistBtn.className = "btn-primary";
watchlistBtn.addEventListener("click", () => {
    if (currentContext.symbol) addToWatchlist(currentContext.symbol);
});
currentCard.querySelector(".card-body").appendChild(watchlistBtn);

const removeWatchlistBtn = document.createElement("button");
removeWatchlistBtn.textContent = "❌ Remove from Watchlist";
removeWatchlistBtn.className = "btn-primary";
removeWatchlistBtn.addEventListener("click", () => {
    if (currentContext.symbol) removeFromWatchlist(currentContext.symbol);
});
currentCard.querySelector(".card-body").appendChild(removeWatchlistBtn);

renderWatchlist();

/* Dioni Ends*/