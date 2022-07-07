import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Nav from './Nav'

function HomePage() {
  const [budget, setBudget] = useState(window.localStorage.getItem("ASSbudget") !== null ? parseFloat(window.localStorage.getItem("ASSbudget")) : 100000)
  const [totalValue, setTotalValue] = useState(0);
  const [portfolio, setPortfolio] = useState(null)
  const [viewOption, setViewOption] = useState("share");
  const [sellingStock, setSellingStock] = useState({stockNum: 0, stockId: ""});
  const [error, setError] = useState("");

  useEffect(() => {
    // Every user starts out with 100000 in budget
    if (window.localStorage.getItem("ASSbudget") === null) {
      window.localStorage.setItem("ASSbudget", 100000)
    }

    const getCurPrices = async() => {
      const preProcessedPortfolio = JSON.parse(window.localStorage.getItem("ASSportfolio"))
      if (preProcessedPortfolio === null || preProcessedPortfolio.length === 0) {
        window.localStorage.setItem("ASSportfolio", JSON.stringify([]));
        setPortfolio([]);
      } else {
        let processedPortfolio = []
        let sumCurrentPrice = 0;
        for (let i = 0; i < preProcessedPortfolio.length; i++) {
          let stockObj = preProcessedPortfolio[i]
          await axios.get("/single-stock-info", {params: {stock: stockObj.name}})
          .then(res => {
            stockObj.currentPrice = res.data.price;
            processedPortfolio.push(stockObj)
          })
          .catch(error => {
            console.log(error)
          })
          sumCurrentPrice = sumCurrentPrice + stockObj.currentPrice * stockObj.numBought
        }
        setTotalValue(sumCurrentPrice);
        setPortfolio(processedPortfolio);
      }
    }

    getCurPrices()
    
  }, [])

  const onViewOptionChange = e => {
    setError("")
    setViewOption(e.target.value)
  }

  const onSellingStockChange = (e, id) => {
    setError("")
    setSellingStock({stockNum: e.target.value, stockId: id});
  }

  const sellStock = stock => {
    setError("")
    if (stock.id === sellingStock.stockId) {
      if (sellingStock.stockNum > parseFloat(stock.numBought)) {
        setError(`You only own ${stock.numBought} shares of ${stock.name}`)
      } else {
        let newBudget = budget;
        newBudget = newBudget + parseFloat(sellingStock.stockNum) * parseFloat(stock.currentPrice);
        setBudget(newBudget);
        window.localStorage.setItem("ASSbudget", newBudget);
        let newPortfolioValue = 0;
        let newPortfolio = [];
        for (let i = 0; i < portfolio.length; i++) {
          if (portfolio[i].id !== stock.id) {
            newPortfolio.push(portfolio[i]);
            newPortfolioValue = newPortfolioValue + parseFloat(portfolio[i].numBought) * parseFloat(portfolio[i].currentPrice);
          } else {
            const shareLeft = parseFloat(portfolio[i].numBought) - sellingStock.stockNum;
            if (shareLeft > 0) {
              const remainingStock = {
                id: portfolio[i].id,
                name: portfolio[i].name,
                numBought: shareLeft,
                priceBought: parseFloat(portfolio[i].priceBought),
                currentPrice: stock.currentPrice
              }
              newPortfolio.push(remainingStock);
              newPortfolioValue = newPortfolioValue + remainingStock.numBought * remainingStock.currentPrice;
            }
          }
        }
        setPortfolio(newPortfolio);
        window.localStorage.setItem("ASSportfolio", JSON.stringify(newPortfolio));
        setTotalValue(newPortfolioValue);
        setSellingStock({stockNum: 0, stockId: ""})
      }
    } else {
      setError("Number of shares sold is not specified")
    }
  }

  if (portfolio === null || budget === null) {
    return (
      <div>
          <Nav/>
          <h1 className="font-bold text-6xl my-auto mx-auto">Loading...</h1>
      </div>
    )
  } else {
    return (
      <div className="bg-slate-200 w-screen min-h-screen pb-20">
        <Nav/>
        <h1 className="text-center font-bold text-4xl pt-8">Current budget: ${budget.toFixed(2)}</h1>
        <div className="sm:w-11/12 lg:w-10/12 xl:w-8/12 mx-auto mt-12">
          <h1 className="font-bold text-3xl border-b border-black pb-2">Your portfolio - Total value: {totalValue.toFixed(2)}</h1>
          {error !== "" ? (<div className="text-red-500 text-xl mt-4">{error}</div>) : (<div></div>)}
          <label className="text-xl mt-4 mr-2">View Option:</label>
          <select className="text-xl mt-4 border border-slate-500 shadow-sm shadow-slate-500 px-3 py-1 rounded-sm" defaultValue="share" onChange={onViewOptionChange}>
            <option value="share">Share price</option>
            <option value="total">Total value</option>
          </select>
          {portfolio === null || portfolio.length === 0 ? (
            <div className="text-center mt-8 text-xl font-normal">
              You haven't bought any stock, search for a stock to buy using the search bar above
            </div>
          ):
          (<div className="mt-2 text-md md:text-xl">
            {portfolio.map((s) => (
              <div key={s.id} className="w-full flex flex-row pb-2 border-b border-black pt-2">
                <div className="w-3/12 md:w-4/12 text-center"><span className="font-bold">{s.name} ({s.numBought} shares)</span></div>
                {viewOption === "share" ? (<div className={`w-4/12 md:w-4/12 font-bold text-center ${s.currentPrice > s.priceBought ? "text-green-500" : "text-red-500"}`}>{s.currentPrice.toFixed(2)} ({((s.currentPrice - s.priceBought) / 100).toFixed(2)} %)</div>):
                (<div className={`w-4/12 md:w-4/12 font-bold text-center ${s.currentPrice > s.priceBought ? "text-green-500" : "text-red-500"}`}>{(s.currentPrice * s.numBought).toFixed(2)} ({((s.currentPrice - s.priceBought) * s.numBought / 100).toFixed(2)} %)</div>)}
                <div className="w-5/12 md:w-4/12 text-center">
                  <div className="w-fit h-fit flex flex-row">
                    <input className="px-3 py-1 w-32 md:w-40 h-fit rounded-sm border border-slate-500 shadow-sm shadow-slate-500" type="number" placeholder='Share num' value={sellingStock.stockId === s.id ? sellingStock.stockNum : 0} onChange={e => {onSellingStockChange(e, s.id)}}/>
                    <div className="px-3 py-1 w-fit h-fit bg-indigo-500 hover:bg-indigo-900 active:bg-indigo-900 duration-200 text-white font-medium rounded-sm cursor-default border border-slate-500 shadow-sm shadow-slate-500" onClick={() => {sellStock(s)}}>Sell</div>
                  </div>
                </div>
              </div>
            ))}
          </div>)}
        </div>
      </div>
    )
  }
}

export default HomePage