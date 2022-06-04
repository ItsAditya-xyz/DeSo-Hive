import React from "react";
import { useParams } from "react-router-dom";
import Deso from "deso-protocol";
import { useState, useEffect, useRef } from "react";
import logo from "../../assets/images/logo.svg";

const deso = new Deso();
export default function DaoOrderbook(props) {
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listOfBuyOrders, setListOfbuyOrders] = useState([]);
  const [listOfSellOrders, setListOfSellOrders] = useState([]);
  const [publicKeyToUsername, setPublicKeyToUsername] = useState([]);
  const params = useParams();
  const daoName = params.DaoName;

  const precision = 100000;
  var daoPublicKey = "";
  var daoOrderResponse = null;
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadOrderbook = async () => {
    let listOfKeys = [];
    let mapOfPublicKeys = {};
    const getSingleProfile = await deso.user.getSingleProfile({
      Username: daoName,
    });

    const publicKeyOfDAO = getSingleProfile.Profile.PublicKeyBase58Check;
    daoPublicKey = publicKeyOfDAO;
    const payload = {
      DAOCoin1CreatorPublicKeyBase58Check: publicKeyOfDAO,
      DAOCoin2CreatorPublicKeyBase58Check: "DESO",
    };
    const response = await deso.dao.GetDAOCoinLimitOrders(payload);
    daoOrderResponse = response.Orders;
    //loop through response.orders and find unique keys and store them in listOfKeys
    response.Orders.forEach((order) => {
      if (listOfKeys.indexOf(order.TransactorPublicKeyBase58Check) === -1) {
        listOfKeys.push(order.TransactorPublicKeyBase58Check);
      }
    });

    const getUserStateLess = await deso.user.getUserStateless({
      PublicKeysBase58Check: listOfKeys,
      SkipForLeaderboard: true,
    });
    //loop through getUserStateLess and store username for each publicKey in mapOfPublicKeys
    getUserStateLess.UserList.forEach((user) => {
      mapOfPublicKeys[user.PublicKeyBase58Check] = user.ProfileEntryResponse
        ? user.ProfileEntryResponse.Username
        : user.PublicKeyBase58Check;
    });
    console.log(mapOfPublicKeys);
    setPublicKeyToUsername(mapOfPublicKeys);

    //store all sell orders in asencding order in sellOrder variable
    const sellOrder = response.Orders.filter(
      (order) => order.OperationType === "ASK"
    );
    //make sellOrder in decennary order with respect to ExchangeRateCoinsToSellPerCoinToBuy
    sellOrder.sort((a, b) => {
      return (
        a.ExchangeRateCoinsToSellPerCoinToBuy -
        b.ExchangeRateCoinsToSellPerCoinToBuy
      );
    });
    //store all buy orders in decending order in buyOrder variable
    const buyOrder = response.Orders.filter(
      (order) => order.OperationType === "BID"
    );
    //make buyOrder in ascending order with respect to ExchangeRateCoinsToSellPerCoinToBuy
    buyOrder.sort((a, b) => {
      return (
        b.ExchangeRateCoinsToSellPerCoinToBuy -
        a.ExchangeRateCoinsToSellPerCoinToBuy
      );
    });
    setListOfbuyOrders(buyOrder);
    setListOfSellOrders(sellOrder);
    setIsLoading(false);
  };

  useEffect(async () => {
    await loadOrderbook();
    scrollToBottom();
  }, []);

  const MINUTE_MS = 25000;

  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("Logs every 15 seconds");
      const payload = {
        DAOCoin1CreatorPublicKeyBase58Check: daoPublicKey,
        DAOCoin2CreatorPublicKeyBase58Check: "DESO",
      };
      const response = await deso.dao.GetDAOCoinLimitOrders(payload);
      let orderList = response.Orders;

      //check if orderList is different from daoOrderResponse
      if (orderList.length !== daoOrderResponse.length) {
        console.log("Order book changed");
        //if different, update daoOrderResponse and reload orderbook
        daoOrderResponse = orderList;
        let listOfKeys = [];
        let mapOfPublicKeys = {};
        response.Orders.forEach((order) => {
          if (listOfKeys.indexOf(order.TransactorPublicKeyBase58Check) === -1) {
            listOfKeys.push(order.TransactorPublicKeyBase58Check);
          }
        });

        const getUserStateLess = await deso.user.getUserStateless({
          PublicKeysBase58Check: listOfKeys,
          SkipForLeaderboard: true,
        });
        //loop through getUserStateLess and store username for each publicKey in mapOfPublicKeys
        getUserStateLess.UserList.forEach((user) => {
          mapOfPublicKeys[user.PublicKeyBase58Check] = user.ProfileEntryResponse
            ? user.ProfileEntryResponse.Username
            : user.PublicKeyBase58Check;
        });
        console.log(mapOfPublicKeys);
        let prvePublicKeyToUserName = publicKeyToUsername;
        //check if there is something in mapOfPublicKeys which is not in prvePublicKeyToUserName
        for (let key in mapOfPublicKeys) {

          if (!(key in prvePublicKeyToUserName)) {
            console.log("New user joined");
            prvePublicKeyToUserName[key] = mapOfPublicKeys[key];
          }
        }
        setPublicKeyToUsername(prvePublicKeyToUserName);
        console.log(prvePublicKeyToUserName);
        console.log(publicKeyToUsername);

        //store all sell orders in asencding order in sellOrder variable
        const sellOrder = response.Orders.filter(
          (order) => order.OperationType === "ASK"
        );
        //make sellOrder in decennary order with respect to ExchangeRateCoinsToSellPerCoinToBuy
        sellOrder.sort((a, b) => {
          return (
            a.ExchangeRateCoinsToSellPerCoinToBuy -
            b.ExchangeRateCoinsToSellPerCoinToBuy
          );
        });
        //store all buy orders in decending order in buyOrder variable
        const buyOrder = response.Orders.filter(
          (order) => order.OperationType === "BID"
        );
        //make buyOrder in ascending order with respect to ExchangeRateCoinsToSellPerCoinToBuy
        buyOrder.sort((a, b) => {
          return (
            b.ExchangeRateCoinsToSellPerCoinToBuy -
            a.ExchangeRateCoinsToSellPerCoinToBuy
          );
        });
        setListOfbuyOrders(buyOrder);
        setListOfSellOrders(sellOrder);

        setIsLoading(false);
      } else {
        console.log("No changes detected...");
      }
    }, MINUTE_MS);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, []);

  return (
    <>
      <nav className=' navbar navbar-dark bg-dark navbar-inverse'>
        <div className='container-fluid'>
          <div className='d-flex'>
            <a className='navbar-brand' href='#'>
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

          <div className='nav navbar-nav navbar-right align-self-center '>
            <button
              className='btn btn-primary btn-sm'
              onClick={props.loginWithDeso}>
              Login with Identity
            </button>
          </div>
        </div>
      </nav>

      {isLoading ? (
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
      ) : (
        <div className=' container-lg my-5 d-flex flex-column justify-content-center'>
          <div className=' d-flex flex-column justify-content-center'>
            {/* Code to show order book exchagne. Buys in green and sells in red*/}
            <div className=''>
              <div className=''>
                <h3>{`Sell Orders for ${daoName} DAO`}</h3>
                <div
                  style={{
                    height: "416px",

                    overflowY: "scroll",
                  }}>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th>Creator</th>
                        <th>Amount</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listOfSellOrders.map((order) => {
                        if (order.OperationType === "ASK") {
                          return (
                            <tr key={order.OrderID}>
                              <td>
                                <div className='d-flex'>
                                  <img
                                    className='rounded-circle'
                                    style={{ width: "30px", height: "30px" }}
                                    src={`https://diamondapp.com/api/v0/get-single-profile-picture/${order.TransactorPublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                                  />
                                  <p className='mx-2'>
                                    {
                                      publicKeyToUsername[
                                        order.TransactorPublicKeyBase58Check
                                      ]
                                    }
                                  </p>
                                </div>
                              </td>
                              <td className='table-danger'>
                                {Math.round(order.QuantityToFill)}
                              </td>
                              <td>
                                {`${
                                  Math.round(
                                    (1 /
                                      order.ExchangeRateCoinsToSellPerCoinToBuy) *
                                      precision
                                  ) / precision
                                } $DESO ($${
                                  Math.round(
                                    (1 /
                                      order.ExchangeRateCoinsToSellPerCoinToBuy) *
                                      (props.desoPrice / 100) *
                                      precision
                                  ) / precision
                                })`}
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                  <div ref={messagesEndRef} />
                </div>
                <h3 className='my-5'>{`Buy Orders for ${daoName} DAO`}</h3>

                <div
                  style={{
                    height: "416px",

                    overflowY: "scroll",
                  }}>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th>Creator</th>
                        <th>Amount</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listOfBuyOrders.map((order) => {
                        if (order.OperationType === "BID") {
                          return (
                            <tr key={order.OrderID}>
                              <td>
                                <div className='d-flex'>
                                  <img
                                    className='rounded-circle'
                                    style={{ width: "30px", height: "30px" }}
                                    src={`https://diamondapp.com/api/v0/get-single-profile-picture/${order.TransactorPublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                                  />
                                  <p className='mx-2'>
                                    {publicKeyToUsername[
                                      order.TransactorPublicKeyBase58Check
                                    ].slice(0, 18)}
                                  </p>
                                </div>
                              </td>
                              <td className='table-success'>
                                {Math.round(order.QuantityToFill)}
                              </td>
                              <td>
                                {" "}
                                {`${
                                  Math.round(
                                    order.ExchangeRateCoinsToSellPerCoinToBuy *
                                    precision
                                  ) / precision
                                } $DESO ($${
                                  Math.round(
                                    order.ExchangeRateCoinsToSellPerCoinToBuy *
                                      (props.desoPrice / 100) *
                                      precision
                                  ) / precision
                                })`}
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ height: "20px" }}></div>
    </>
  );
}
