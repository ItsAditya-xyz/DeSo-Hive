import React, { useEffect, useState, useRef } from "react";
import logo from "../../assets/images/logo.svg";

function Orders() {
  const messagesEndRef = useRef(null);
  const [coinbaseOrderbook, setCoinbaseOrderbook] = useState([]);
  const [loadingOrderbook, setLoadingOrderbook] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };
  const loadCoinbaseOrderbook = async () => {
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

  useEffect(async () => {
    await loadCoinbaseOrderbook();
    scrollToBottom();
  }, []);


  const MINUTE_MS = 25000;

  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("Logs every 15 seconds");
        await loadCoinbaseOrderbook();
    }, MINUTE_MS);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, []);



  return (
    <div>
      <nav className=" navbar navbar-dark bg-dark navbar-inverse">
        <div className="container-fluid">
          <div className="d-flex">
            <a className="navbar-brand" href="/">
              <img
                src={logo}
                alt=""
                width="40"
                height="40"
                className="d-inline-block align-text-top"
              />
            </a>
            <a className="navbar-brand align-self-center" href="/">
              DeSo Hive
            </a>
          </div>
        </div>
      </nav>
      {loadingOrderbook && (
        <>
          <div
            className="d-flex justify-content-center"
            style={{ marginTop: "49vh" }}
          >
            <div
              className="spinner-border text-primary"
              style={{ width: "4rem", height: "4rem" }}
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </>
      )}

      {!loadingOrderbook && (
        <div className="container-lg my-5 d-flex flex-column justify-content-center">
          <div className=" d-flex flex-column justify-content-center ">
            <div className="sells">
              <h2>Sell Orders</h2>
              <div
                style={{
                  height: "416px",
                  overflowY: "scroll",
                }}
              >
                <table className="table">
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
                          className={order[2] === 1 ? "single-order" : "multiple-orders"}
                        >
                          
                          <td>{Math.round(size * 10) / 10}</td>
                          <td className="table table-danger">
                            ${Math.round(price * 100) / 100}
                          </td>
                          <td className="table table-danger">
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
            <div className="buys">
              <h2>Buy Orders</h2>
              <div
                style={{
                  height: "416px",
                  overflowY: "scroll",
                }}
              >
                <table className="table">
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
                          className={order[2] === 1 ? "single-order" : "multiple-orders"}
                        >
                          
                          <td>{Math.round(size * 10) / 10}</td>
                          <td className="table table-success">
                            ${Math.round(price * 100) / 100}
                          </td>
                          <td className="table table-danger">
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
          <div className="graph">
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
