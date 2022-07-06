const path = require('path');
const express = require("express");
const finnhub = require("finnhub");

require('dotenv').config()

// Authentication with Finnhub
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINNHUB_API_KEY
const finnhubClient = new finnhub.DefaultApi()

const PORT = process.env.PORT || 3001;

const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Get stock info from FINNHUB
app.get("/stock-info", (req, res) => {
    const stock = req.query.stockName;
    // console.log(stock)
    let stockData = {}
    finnhubClient.quote(stock, (error, quoteData, response) => {
      // console.log("Quote Data:")
      // console.log(quoteData)
      if (quoteData.c === 0) {
        res.status(200).send({stockData: null})
      } else {
        stockData.currentPrice = quoteData.c
        stockData.highPrice = quoteData.h
        stockData.lowPrice = quoteData.l
        stockData.openPrice = quoteData.o
        stockData.previousPrice = quoteData.pc
        finnhubClient.companyBasicFinancials(stock, "all", (error, financialData, response) => {
          // console.log(financialData)
          stockData["52WeekHigh"] = financialData.metric['52WeekHigh']
          stockData['52WeekLow'] = financialData.metric['52WeekLow']
          stockData.eps = financialData.metric.ebitdPerShareTTM
          stockData.currentRatio = financialData.metric.currentRatioQuarterly
          stockData.dividend = financialData.metric.dividendPerShareAnnual

          let endDate = new Date();
          let startDate = new Date(endDate.getTime() - 30*24*60*60*1000);
          startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1 < 10 ? "0": ""}${startDate.getMonth() + 1}-${startDate.getDate() < 10 ? "0": ""}${startDate.getDate()}`
          endDateStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1 < 10 ? "0": ""}${endDate.getMonth() + 1}-${endDate.getDate() < 10 ? "0": ""}${endDate.getDate() + 1}`
          // console.log("startDateStr: " + startDateStr)
          // console.log("endDateStr: " + endDateStr)
          finnhubClient.companyNews(stock, startDateStr, endDateStr, (error, newsData, response) => {
            // console.log("newsData: " + newsData)
            let newsArray = [];
            let newsLength = 0;
            5 > newsData.length ? newsLength = newsData.length : newsLength = 5;
            for (let i = 0; i < newsLength; i++) {
              newsArray.push(newsData[i]);
            }
            stockData.news = newsArray;
            res.status(200).send({stockData: stockData})
          });
        });
      }
    });
    

})

app.get("/single-stock-info", (req, res) => {
  const stock = req.query.stock;
  // console.log(stock)
  finnhubClient.quote(stock, (error, quoteData, response) => {
    res.status(200).send({price: quoteData.c})
  })
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});