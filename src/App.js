import React, { useState, useEffect } from "react";
import NavBar from "./navbar/NavBar";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import CoinInformation from "./components/CoinProfile/CoinInformation";
import Watchlist from "./components/Watchlist/Watchlist";
import axios from "axios";
import TopCoins from "./components/TopCoins/TopCoins";

const ticker = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");
let coinWatchSymbol = [];
let coinWatchlistArray = [];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [coinList, setCoinList] = useState({});
  const [profileCoin, setProfileCoin] = useState({});
  const [tickerSymbol, setTickerSymbol] = useState("");
  const [coinWatchlist, setCoinWatchlist] = useState([]);

  let coinFeed = [];

  useEffect(() => {
    axios
      .get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false"
      )
      .then((response) => {
        setCoinList(response.data);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    ticker.onopen = () => {
      console.log("Connected");
    };
    ticker.onmessage = (message) => {
      console.log(coinWatchSymbol);
      coinFeed = JSON.parse(message.data);
      let idxTemplate = coinFeed.map((e) => e.s);
      let singleIdx = idxTemplate.indexOf(tickerSymbol);
      setProfileCoin(coinFeed[singleIdx]);
      coinWatchlistArray = [];
      coinWatchSymbol.forEach(function (e) {
        let watchSingleIdx = idxTemplate.indexOf(e);
        coinWatchlistArray = [...coinWatchlistArray, coinFeed[watchSingleIdx]];
        setCoinWatchlist([]);
        setCoinWatchlist(coinWatchlistArray);

        //   let matchedCoin = coinWatchlistArray.findIndex(
        //     (coinId) => coinId.s === e
        //   );
        //   console.log(matchedCoin);
        //   if (matchedCoin === -1 || matchedCoin === undefined) {
        //     coinWatchlistArray.splice(matchedCoin);
        //   } else {
        //     coinWatchlistArray = [
        //       ...coinWatchlistArray,
        //       coinFeed[watchSingleIdx],
        //     ];
        //   }
        // });
      });
    };
  }, [tickerSymbol, coinWatchSymbol]);

  const findProfileCoin = (symbol) => {
    setProfileCoin({});
    setTickerSymbol(symbol);
  };

  const saveWatchlistCoin = (symbol) => {
    console.log(symbol);
    coinWatchSymbol.push(symbol);
  };

  if (isLoading) {
    return <span>Loading...</span>;
  }
  return (
    <div>
      <NavBar coinList={coinList} findProfileCoin={findProfileCoin} />
      {/* <CoinInformation coinList={coinList} profileCoin={profileCoin} /> */}
      <Watchlist
        coinList={coinList}
        coinWatchlist={coinWatchlist}
        saveWatchlistCoin={saveWatchlistCoin}
      />
      <TopCoins coinList={coinList} saveWatchlistCoin={saveWatchlistCoin} />
    </div>
  );
}

export default App;
