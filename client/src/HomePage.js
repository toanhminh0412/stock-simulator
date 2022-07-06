import axios from 'axios'
import React, {useState, useEffect} from 'react'
import Nav from './Nav'

function HomePage() {
  const [budget, setBudget] = useState(window.localStorage.getItem("ASSbudget") !== null ? window.localStorage.getItem("ASSbudget") : 100000)
  const [portfolio, setPortfolio] = useState(null)

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
        }
        setPortfolio(processedPortfolio);
      }
    }

    getCurPrices()
    
  }, [])

  if (portfolio === null) {
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
        <h1 className="text-center font-bold text-4xl pt-8">Current budget: ${budget}</h1>
        <div className="sm:w-11/12 lg:w-10/12 xl:w-8/12 mx-auto mt-12">
          <h1 className="font-bold text-3xl border-b border-black pb-2">Your portfolio</h1>
          {portfolio === null || portfolio.length === 0 ? (
            <div className="text-center mt-8 text-xl font-normal">
              You haven't bought any stock, search for a stock to buy using the search bar above
            </div>
          ):
          (<div className="mt-2 text-md lg:text-xl">
            {portfolio.map((s, index) => (
              <div key={index} className="w-full flex flex-row pb-2 border-b border-black pt-2">
                <div className="w-1/4"><span className="font-bold">{s.name}</span></div>
                <div className="w-1/4">Shares: <span className="font-bold">{s.numBought}</span></div>
                <div className="w-1/4">Bought: <span className="font-bold">{s.priceBought}</span></div>
                <div className="w-1/4">Current: <span className="font-bold">{s.currentPrice}</span></div>
              </div>
            ))}
          </div>)}
        </div>
      </div>
    )
  }
}

export default HomePage