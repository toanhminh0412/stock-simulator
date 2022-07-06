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
    console.log(stock)
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
          let startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 30);

          finnhubClient.companyNews(stock, startDate.toLocaleDateString(), endDate.toLocaleDateString(), (error, newsData, response) => {
            console.log(newsData)
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

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});