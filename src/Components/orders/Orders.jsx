import React, { useEffect, useState, useRef } from "react";
import logo from "../../assets/images/logo.svg";

function Orders() {
  const messagesEndRef = useRef(null);
  const [coinbaseOrderbook, setCoinbaseOrderbook] = useState([]);
  const [loadingOrderbook, setLoadingOrderbook] = useState(true);
  const [tab, setTab] = useState("coinbase");
  const [loadingHeroswap, setLoadingHeroswap] = useState(true);
  const [heroswapOrderbook, setHeroswapOrderbook] = useState([]);

  const [loadingGate, setLoadingGate] = useState(true);
  const [gateOrderbook, setGateOrderbook] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };
  const loadCoinbaseOrderbook = async () => {
    if (tab !== "coinbase") return;
    const response = await fetch(
      "https://api.pro.coinbase.com/products/DESO-USD/book?level=2&limit=5"
    );
    const data = await response.json();
    console.log(data);

    const reversedAsks = [...data.asks].reverse();
    setCoinbaseOrderbook({ ...data, asks: reversedAsks });

    // setCoinbaseOrderbook(data);
    setLoadingOrderbook(false);
  };

  const loadHeroswapOrderBook = async () => {
    const USD_STAGES = [1000, 100000, 500000, 1000000, 5000000];
    const DESO_STAGES = [100, 10000, 50000, 100000, 500000];

    let asks = [];
    let bids = [];
    let heroSwapOrders = {};

    for (let i = 0; i < USD_STAGES.length; i++) {
      const response = await fetch(
        `https://heroswap.com/api/v1/destination-amount-for-deposit-amount/USDC/DESO/${USD_STAGES[i]}`
      );
      const data = await response.json();
      const price =
        Math.round((USD_STAGES[i] / parseFloat(data.DestinationAmount)) * 100) /
        100;
      bids.push([
        Math.round(parseFloat(data.DestinationAmount) * 100) / 100,
        price,
        1,
      ]);
    }

    for (let i = 0; i < USD_STAGES.length; i++) {
      const response = await fetch(
        `https://heroswap.com/api/v1/destination-amount-for-deposit-amount/DESO/USDC/${DESO_STAGES[i]}`
      );
      const data = await response.json();
      const price =
        Math.round(parseFloat(data.DestinationAmount / DESO_STAGES[i]) * 100) /
        100;
      asks.push([DESO_STAGES[i], price, 1]);
    }

    const reversedAsk = [...bids].reverse();
    heroSwapOrders = {
      asks: reversedAsk,
      bids: asks,
    };
    setHeroswapOrderbook(heroSwapOrders);
    setLoadingHeroswap(false);
  };

  const loadGateOrderBook = async () => {
    if (tab !== "gate") return;
  if (gateOrderbook != null) return
    const url = "https://api.gate.io/api2/1/orderBook/deso_usdt";
    const proxyServer = "https://cordify.xyz/proxy-server";
    const payload = {
      url: url,
      isGet: true,
      payload: {},
      headers: {},
    };
    const response = await fetch(proxyServer, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let tempData = await response.json();
    const data = tempData.data;

    //loop through data. in both asks and bids, if there are several orders at the same price, add them up and make it one order
    let asks = [];
    let bids = [];
    for (let i = 0; i < data.asks.length; i++) {
      if (i === 0) {
        asks.push(data.asks[i]);
      } else {
        if (data.asks[i][0] === data.asks[i - 1][0]) {
          asks[asks.length - 1][1] =
            parseFloat(asks[asks.length - 1][1]) +
            parseFloat(data.asks[i][1]);
        } else {
          asks.push(data.asks[i]);
        }
      }
    }

    for (let i = 0; i < data.bids.length; i++) {
      if (i === 0) {
        bids.push(data.bids[i]);
      } else {
        if (data.bids[i][0] === data.bids[i - 1][0]) {
          bids[bids.length - 1][1] =
            parseFloat(bids[bids.length - 1][1]) +
            parseFloat(data.bids[i][1]);
        } else {
          bids.push(data.bids[i]);
        }
      }
    }

    // const reversedAsks = [...data.asks].reverse();
setGateOrderbook({asks:data.asks, bids:data.bids})

    // setCoinbaseOrderbook(data);
    setLoadingGate(false);
  };
  useEffect(async () => {
    await loadCoinbaseOrderbook();
    scrollToBottom();
  }, []);

  const MINUTE_MS = 25000;

  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("Logs every 15 seconds");
      if (tab === "coinbase") {
        await loadCoinbaseOrderbook();
      }
    }, MINUTE_MS);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, []);

  useEffect(() => {
    if (tab === "heroswap") {
      loadHeroswapOrderBook();
    }

    if (tab === "coinbase") {
      scrollToBottom();
    }
    if (tab === "gate") {
      loadGateOrderBook();
      scrollToBottom();
    }
  }, [tab]);

  return (
    <div>
      <nav className=' navbar navbar-dark bg-dark navbar-inverse'>
        <div className='container-fluid'>
          <div className='d-flex'>
            <a className='navbar-brand' href='/'>
              <img
                src={logo}
                alt=''
                width='40'
                height='40'
                className='d-inline-block align-text-top'
              />
            </a>
            <a className='navbar-brand align-self-center' href='/'>
              DeSo Hive
            </a>
          </div>
        </div>
      </nav>
      {loadingOrderbook && (
        <>
          <div
            className='d-flex justify-content-center'
            style={{ marginTop: "49vh" }}>
            <div
              className='spinner-border text-primary'
              style={{ width: "4rem", height: "4rem" }}
              role='status'>
              <span className='sr-only'>Loading...</span>
            </div>
          </div>
        </>
      )}

      <div className='container-lg my-5 d-flex flex-column justify-content-center'>
        <ul className='nav nav-tabs'>
          <li className='nav-item'>
            <button
              className={`nav-link ${tab === "coinbase" ? "active" : ""}`}
              onClick={() => setTab("coinbase")}>
              Coinbase
            </button>
          </li>
          <li className='nav-item'>
            <button
              className={`nav-link ${tab === "heroswap" ? "active" : ""}`}
              onClick={() => setTab("heroswap")}>
              HeroSwap
            </button>
          </li>
          <li className='nav-item'>
            <button
              className={`nav-link ${tab === "gate" ? "active" : ""}`}
              onClick={() => setTab("gate")}>
              Gate.io
            </button>
          </li>
        </ul>
      </div>

      {!loadingOrderbook && tab === "coinbase" && (
        <div className='container-lg my-5 d-flex flex-column justify-content-center'>
          <div className=' d-flex flex-column justify-content-center '>
            <div className='sells'>
              <h2>Sell Orders</h2>
              <div
                style={{
                  height: "416px",
                  overflowY: "scroll",
                }}>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coinbaseOrderbook.asks.map((order, index) => {
                      const [price, size] = order;
                      return (
                        <tr
                          key={index}
                          className={
                            order[2] === 1 ? "single-order" : "multiple-orders"
                          }>
                          <td>{Math.round(size * 10) / 10}</td>
                          <td className='table table-danger'>
                            ${Math.round(price * 100) / 100}
                          </td>
                          <td className='table table-danger'>
                            ${Math.round(price * size * 100) / 100}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className='buys'>
              <h2>Buy Orders</h2>
              <div
                style={{
                  height: "416px",
                  overflowY: "scroll",
                }}>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coinbaseOrderbook.bids.map((order, index) => {
                      const [price, size] = order;
                      return (
                        <tr
                          key={index}
                          className={
                            order[2] === 1 ? "single-order" : "multiple-orders"
                          }>
                          <td>{Math.round(size * 10) / 10}</td>
                          <td className='table table-success'>
                            ${Math.round(price * 100) / 100}
                          </td>
                          <td className='table table-success'>
                            ${Math.round(price * size * 100) / 100}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Graph for buy and sell pressure */}
          <div className='graph'>
            {/* Your graph implementation goes here */}
            {/* You can use charting libraries like Chart.js or D3.js */}
          </div>
        </div>
      )}

      {!loadingOrderbook && tab === "heroswap" && loadingHeroswap && (
        <>
          <div
            className='d-flex justify-content-center'
            style={{ marginTop: "49vh" }}>
            <div
              className='spinner-border text-primary'
              style={{ width: "4rem", height: "4rem" }}
              role='status'>
              <span className='sr-only'>Loading...</span>
            </div>
          </div>
        </>
      )}
      {!loadingOrderbook && tab === "heroswap" && !loadingHeroswap && (
        <div className='container-lg my-5 d-flex flex-column justify-content-center'>
          <div className=' d-flex flex-column justify-content-center '>
            <div className='sells'>
              <h2>Sell Orders</h2>
              <div
                style={{
                  height: "300px",
                  overflowY: "scroll",
                }}>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroswapOrderbook.asks.map((order, index) => {
                      const [size, price] = order;
                      return (
                        <tr
                          key={index}
                          className={
                            order[2] === 1 ? "single-order" : "multiple-orders"
                          }>
                          <td>
                            {" "}
                            {(Math.round(size * 10) / 10).toLocaleString()}
                          </td>
                          <td className='table table-danger'>
                            ${Math.round(price * 100) / 100}
                          </td>
                          <td className='table table-danger'>
                            $
                            {(
                              Math.round(price * size * 100) / 100
                            ).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className='buys'>
              <h2>Buy Orders</h2>
              <div
                style={{
                  height: "300px",
                  overflowY: "scroll",
                }}>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroswapOrderbook.bids.map((order, index) => {
                      const [size, price] = order;
                      return (
                        <tr
                          key={index}
                          className={
                            order[2] === 1 ? "single-order" : "multiple-orders"
                          }>
                          <td>
                            {" "}
                            {(Math.round(size * 10) / 10).toLocaleString()}
                          </td>
                          <td className='table table-success'>
                            ${Math.round(price * 100) / 100}
                          </td>
                          <td className='table table-success'>
                            $
                            {(
                              Math.round(price * size * 100) / 100
                            ).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Graph for buy and sell pressure */}
          <div className='graph'>
            {/* Your graph implementation goes here */}
            {/* You can use charting libraries like Chart.js or D3.js */}
          </div>
        </div>
      )}

      {!loadingOrderbook && tab === "gate" && loadingGate && (
        <>
          <div
            className='d-flex justify-content-center'
            style={{ marginTop: "49vh" }}>
            <div
              className='spinner-border text-primary'
              style={{ width: "4rem", height: "4rem" }}
              role='status'>
              <span className='sr-only'>Loading...</span>
            </div>
          </div>
        </>
      )}

      {!loadingOrderbook && tab === "gate" && !loadingGate && (
        <div className='container-lg my-5 d-flex flex-column justify-content-center'>
          <div className=' d-flex flex-column justify-content-center '>
            <div className='sells'>
              <h2>Sell Orders</h2>
              <div
                style={{
                  height: "300px",
                  overflowY: "scroll",
                }}>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gateOrderbook.asks.map((order, index) => {
                      const price = parseFloat(order[0]);
                      const size = parseFloat(order[1]);
                      return (
                        <tr
                          key={index}
                          className={
                            order[2] === 1 ? "single-order" : "multiple-orders"
                          }>
                          <td>
                            {" "}
                            {(Math.round(size * 10) / 10).toLocaleString()}
                          </td>
                          <td className='table table-danger'>
                            ${Math.round(price * 100) / 100}
                          </td>
                          <td className='table table-danger'>
                            $
                            {(
                              Math.round(price * size * 100) / 100
                            ).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className='buys'>
              <h2>Buy Orders</h2>
              <div
                style={{
                  height: "300px",
                  overflowY: "scroll",
                }}>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gateOrderbook.bids.map((order, index) => {
                     const price  = parseFloat(order[0]);
                     const size = parseFloat(order[1]);
                      return (
                        <tr
                          key={index}
                          className={
                            order[2] === 1 ? "single-order" : "multiple-orders"
                          }>
                          <td>
                            {" "}
                            {(Math.round(size * 10) / 10).toLocaleString()}
                          </td>
                          <td className='table table-success'>
                            ${Math.round(price * 100) / 100}
                          </td>
                          <td className='table table-success'>
                            $
                            {(
                              Math.round(price * size * 100) / 100
                            ).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Graph for buy and sell pressure */}
          <div className='graph'>
            {/* Your graph implementation goes here */}
            {/* You can use charting libraries like Chart.js or D3.js */}
          </div>
        </div>
      )}
      <div style={{ height: "20px" }}></div>
    </div>
  );
}

export default Orders;
