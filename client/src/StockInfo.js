import React, {useState, useEffect} from 'react'
import {useParams} from "react-router-dom"
import axios from "axios"

import Nav from './Nav';

function StockInfo() {
    const [stockData, setStockData] = useState(null)
    const [stockFound, setStockFound] = useState(false);
    let {stockName} = useParams();

    useEffect(() => {
        setStockFound(false)
        setStockData(null)
        axios.get("/stock-info", {
            params: {
                stockName: stockName
            }
        })
        .then(res => {
            console.log(res.data);
            setStockFound(true)
            setStockData(res.data.stockData);
        })
        .catch(error => {
            console.log(error);
        })
    }, [stockName])

    if (!stockFound) {
        return (
            <div>
                <Nav/>
                <h1 className="font-bold text-6xl my-auto mx-auto">Loading...</h1>
            </div>
        )
    } else if (stockFound && !stockData) {
        return (
            <div>
                <Nav/>
                <h1 className="font-bold text-6xl my-auto mx-auto">Stock Not Found. Search Again</h1>
            </div>
        )
    } else {
        return (
            <div className="bg-slate-200 w-screen min-h-screen pb-20">
                <Nav/>
                <h1 className="text-center text-4xl font-bold pt-6">{stockName.toUpperCase()}</h1>
                <h1 className={`text-center text-6xl font-medium pt-6 ${stockData.currentPrice > stockData.openPrice ? "text-green-500" : "text-red-500"}`}>{stockData.currentPrice}</h1>
                <h2 className={`text-center text-5xl font-medium pt-2 ${stockData.currentPrice > stockData.openPrice ? "text-green-500" : "text-red-500"}`}>{((stockData.currentPrice - stockData.openPrice) / stockData.openPrice * 100).toFixed(2)} %</h2>
                <div className="flex flex-row w-full lg:w-10/12 xl:w-8/12 mx-auto mt-12 text-xl lg:text-2xl">
                    <div className="flex flex-col w-1/2">
                        <div className="w-fit mx-auto">
                            <div className="mt-2 py-2 border-b border-black">Current: <span className="font-bold">{stockData.currentPrice}</span></div>
                            <div className="mt-2 py-2 border-b border-black">Open: <span className="font-bold">{stockData.openPrice}</span></div>
                            <div className="mt-2 py-2 border-b border-black">Previous Close: <span className="font-bold">{stockData.previousPrice}</span></div>
                            <div className="mt-2 py-2 border-b border-black">High: <span className="font-bold">{stockData.highPrice}</span></div>
                            <div className="mt-2 py-2 border-b border-black">Low: <span className="font-bold">{stockData.lowPrice}</span></div>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <div className="w-fit mx-auto">
                            <div className="mt-2 py-2 border-b border-black">52 Week High: <span className="font-bold">{stockData['52WeekHigh']}</span></div>
                            <div className="mt-2 py-2 border-b border-black">52 Week Low: <span className="font-bold">{stockData['52WeekLow']}</span></div>
                            <div className="mt-2 py-2 border-b border-black">EPS: <span className="font-bold">{stockData.eps}</span></div>
                            <div className="mt-2 py-2 border-b border-black">Current Ratio: <span className="font-bold">{stockData.currentRatio}</span></div>
                            <div className="mt-2 py-2 border-b border-black">Dividend: <span className="font-bold">{stockData.dividend}</span></div>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-10/12 xl:w-8/12 mx-auto mt-12">
                    <p className="text-xl font-medium">Buy {stockName} stock (Enter number of {stockName} stocks you want to buy):</p>
                    <div className="flex flex-row mt-2">
                        <input className="px-3 py-1 text-lg border border-slate-500 shadow-sm shadow-slate-500 w-fit h-fit rounded-sm" type="number" placeholder="Enter number of stocks"></input>
                        <div className="px-3 py-1 text-lg border border-slate-500 shadow-sm shadow-slate-500 font-medium w-fit rounded-sm bg-blue-500 hover:bg-blue-900 active:bg-blue-900 text-white duration-200 cursor-default">Buy</div>
                    </div>
                </div>
                <div className="w-full lg:w-10/12 xl:w-8/12 mx-auto mt-12">
                    <h1 className="font-bold text-3xl">Company News</h1>
                    <div className="flex flex-col mt-4">
                        {stockData.news.map(n => 
                            (<a key={n.id} href={n.url} className="text-lg underline hover:font-semibold mt-2" target="_blank" rel="noreferrer">
                                {n.headline}
                            </a>)
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default StockInfo