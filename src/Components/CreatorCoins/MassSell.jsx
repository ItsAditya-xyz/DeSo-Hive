import React, { useState, useEffect } from "react";
import { getSellingPrice, getUSDValue } from "../utils/desoMath";

export default function MassSell(props) {
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [userYouHold, setUsersYouHold] = useState(null);
  const [listOfKeysToSell, setListOfKeysToSell] = useState([]);
  const [isSelling, setIsSelling] = useState(false);
  const [desoPrice, setDesoPrice] = useState(50);
  const [totalWorth, setTotalWorth] = useState(0);
  const [coinsSold, setCoinSold] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [filteredHolding, setFilteredHolding] = useState(null);
  const sellUsers = async () => {
    setIsSelling(true);
    let sold = 0;
    //looping into list of keys to follow
    try {
      var lastLoggedInUser = localStorage.getItem("login_key").toString();

      for (let i = 0; i < listOfKeysToSell.length; i++) {
        let key = listOfKeysToSell[i];
        let coinsToSell = filteredHolding[key].BalanceNanos;
        if (coinsToSell > 0) {
          const sellTxn = await props.desoApi.sellCoin(
            lastLoggedInUser,
            key,
            coinsToSell
          );
          const transactionHex = sellTxn.TransactionHex;
          const signedTransaction = await props.desoIdentity.signTxAsync(
            transactionHex
          );
          const submitTransaction = await props.desoApi.submitTransaction(
            signedTransaction
          );
        }
        sold += 1;
        setCoinSold(sold);
        //remove key from userYouHold
        delete filteredHolding[key];
      }
    } catch (e) {
      console.log(e);
      alert("Something went wrong. Please retry");
    }
    setIsSelling(false);
    if (sold > 0) {
      alert(`You have sold ${sold} Creator coins!`);
      window.location.reload();
    } else {
      alert("You have not sold any coins!");
    }
  };

  const handleCheckboxChange = (publicKey, index) => {
    if (isSelling) {
      return;
    }
    const checValue = document.getElementById(
      `flexCheckDefault-${index}`
    ).checked;
    if (checValue) {
      setListOfKeysToSell([...listOfKeysToSell, publicKey]);
    } else {
      setListOfKeysToSell(listOfKeysToSell.filter((key) => key !== publicKey));
    }
  };

  const handleSelectAll = () => {
    if (isSelling) return;
    const checkValue = document.getElementById("selectAll").checked;
    if (checkValue) {
      //push all public key to listOfKeysFrom filteredHolding
      setListOfKeysToSell(Object.keys(filteredHolding).map((key) => key));

      setIsAllSelected(true);
    } else {
      // setPreviousSelectedList(listOfKeysToSell);
      setListOfKeysToSell([]);
      setIsAllSelected(false);
    }
  };
  const handleFilter = () => {
    if (isSelling) return;
    const filterValue = document.getElementById("coinFilter").value;
    setListOfKeysToSell([]);
    setIsAllSelected(false);
    if (filterValue === "All") {
      setFilteredHolding(userYouHold);
    } else if (filterValue === "worth < $1000") {
      //filter out all where sellValue is > 1000 in usersYouHold
      const filtered = Object.keys(userYouHold).filter((key) => {
        return !(
          getSellingPrice(
            userYouHold[key].ProfileEntryResponse.CoinEntry.DeSoLockedNanos,
            userYouHold[key].ProfileEntryResponse.CoinEntry
              .CoinsInCirculationNanos,
            userYouHold[key].BalanceNanos,

            props.desoPrice / 100
          ) > 1000
        );
      });
      setFilteredHolding(
        filtered.reduce((acc, key) => {
          acc[key] = userYouHold[key];
          return acc;
        }, {})
      );
    } else if (filterValue === "worth < $100") {
      const filtered = Object.keys(userYouHold).filter((key) => {
        return !(
          getSellingPrice(
            userYouHold[key].ProfileEntryResponse.CoinEntry.DeSoLockedNanos,
            userYouHold[key].ProfileEntryResponse.CoinEntry
              .CoinsInCirculationNanos,
            userYouHold[key].BalanceNanos,

            props.desoPrice / 100
          ) > 100
        );
      });
      setFilteredHolding(
        filtered.reduce((acc, key) => {
          acc[key] = userYouHold[key];
          return acc;
        }, {})
      );
    } else if (filterValue === "worth < $10") {
      const filtered = Object.keys(userYouHold).filter((key) => {
        return !(
          getSellingPrice(
            userYouHold[key].ProfileEntryResponse.CoinEntry.DeSoLockedNanos,
            userYouHold[key].ProfileEntryResponse.CoinEntry
              .CoinsInCirculationNanos,
            userYouHold[key].BalanceNanos,

            props.desoPrice / 100
          ) > 10
        );
      });
      setFilteredHolding(
        filtered.reduce((acc, key) => {
          acc[key] = userYouHold[key];
          return acc;
        }, {})
      );
    } else if (filterValue === "worth < $5") {
      const filtered = Object.keys(userYouHold).filter((key) => {
        return !(
          getSellingPrice(
            userYouHold[key].ProfileEntryResponse.CoinEntry.DeSoLockedNanos,
            userYouHold[key].ProfileEntryResponse.CoinEntry
              .CoinsInCirculationNanos,
            userYouHold[key].BalanceNanos,

            props.desoPrice / 100
          ) > 5
        );
      });
      setFilteredHolding(
        filtered.reduce((acc, key) => {
          acc[key] = userYouHold[key];
          return acc;
        }, {})
      );
    } else if (filterValue === "worth < $1") {
      const filtered = Object.keys(userYouHold).filter((key) => {
        return !(
          getSellingPrice(
            userYouHold[key].ProfileEntryResponse.CoinEntry.DeSoLockedNanos,
            userYouHold[key].ProfileEntryResponse.CoinEntry
              .CoinsInCirculationNanos,
            userYouHold[key].BalanceNanos,

            props.desoPrice / 100
          ) > 1
        );
      });
      setFilteredHolding(
        filtered.reduce((acc, key) => {
          acc[key] = userYouHold[key];
          return acc;
        }, {})
      );
    }
  };
  const handleInit = async () => {
    const publicKeyOfUser = localStorage.getItem("login_key").toString();
    const userResponse = await props.desoApi.getUsersStateless(
      [publicKeyOfUser],
      false
    );

    const deso_price = props.desoPrice;
    setDesoPrice(deso_price);
    var listofKeys = [];
    var userList = userResponse.UserList[0].UsersYouHODL;
    var mapOfUsers = {};
    var totalSellValue = 0;
    for (let i = 0; i < userList.length; i++) {
      var dictVar = userList[i];
      var holdedKey = dictVar.CreatorPublicKeyBase58Check;
      //add to list of keys

      var balanceNanos = dictVar.BalanceNanos;
      if (balanceNanos > 0) {
        listofKeys.push(holdedKey);
        var circulation =
          dictVar.ProfileEntryResponse.CoinEntry.CoinsInCirculationNanos;
        var DeSoLockedNanos =
          dictVar.ProfileEntryResponse.CoinEntry.DeSoLockedNanos;
        var sellPrice = getSellingPrice(
          DeSoLockedNanos,
          circulation,
          balanceNanos,
          deso_price / 100
        );
        totalSellValue += sellPrice;
        dictVar.sellValue = sellPrice;
        mapOfUsers[holdedKey] = dictVar;
      }
    }
    const sortedMapOfUsers = {};
    setTotalWorth(Math.round(totalSellValue * 1000) / 1000);
    Object.keys(mapOfUsers)
      .sort(function (a, b) {
        return mapOfUsers[b].sellValue - mapOfUsers[a].sellValue;
      })
      .forEach(function (key) {
        sortedMapOfUsers[key] = mapOfUsers[key];
      });

    console.log(sortedMapOfUsers);

    setFilteredHolding(sortedMapOfUsers);
    setUsersYouHold(sortedMapOfUsers);
    setIsLoadingWallet(false);
  };
  useEffect(() => {
    const test = handleInit();
  }, []);

  return (
    <>
      {isLoadingWallet ? (
        <div className='container my-5'>
          <div className='d-flex justify-content-center'>
            <h1> Loading your Wallet</h1>&#160;&#160;
            <div
              className='spinner-border'
              style={{ width: "3rem", height: "3rem" }}
              role='status'></div>
          </div>
        </div>
      ) : (
        <div className='container my-5'>
          <div className='d-flex justify-content-center my-3'>
            <h3>
              You are holding {Object.keys(userYouHold).length} creator
              coins worth ${totalWorth}
            </h3>
          </div>
          <div className='d-flex justify-content-center my-4'>
            <button
              className={`btn btn-primary shadow btn-lg ${
                isSelling || listOfKeysToSell.length === 0 ? "disabled" : null
              }`}
              onClick={() => {
                sellUsers();
              }}>
              {isSelling ? (
                <>
                  <span
                    className='spinner-border spinner-border-sm'
                    role='status'
                    aria-hidden='true'></span>
                  &#160;
                  <span className=''>
                    Selling {coinsSold}/{listOfKeysToSell.length} coins
                  </span>
                </>
              ) : (
                `Sell all ${listOfKeysToSell.length} Creator Coins`
              )}
            </button>
          </div>

          <div className='d-flex'>
            <div className='form-check container'>
              <input
                className='form-check-input'
                type='checkbox'
                value=''
                id='selectAll'
                onChange={handleSelectAll}
                checked={isAllSelected}
              />
              Select all
            </div>

            <div className='container ml-auto'>
              <label htmlFor='filters'>Filter: </label>
              <select
                name='coin filter'
                id='coinFilter'
                onChange={handleFilter}>
                <option value='All'>All</option>
                <option value='worth < $1000'>{`worth < $1000`}</option>
                <option value='worth < $100'>{`worth < $100`}</option>
                <option value='worth < $10'>{`worth < $10`}</option>
                <option value='worth < $5'>{`worth < $5`}</option>
                <option value='worth < $1'>{`worth < $1`}</option>
              </select>
            </div>
          </div>

          <table className='table '>
            <thead className='thead-dark'>
              <tr>
                <th scope='col'>#</th>
                <th scope='col'>Name</th>
                <th scope='col'>Coin Price</th>
                <th scope='col'>USD value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(filteredHolding).map((publicKey, index) => {
                return (
                  <tr key={index}>
                    <th scope='row'>
                      <div className='form-check'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id={`flexCheckDefault-${index}`}
                          checked={listOfKeysToSell.includes(publicKey)}
                          onChange={() => {
                            handleCheckboxChange(
                              filteredHolding[publicKey]
                                .CreatorPublicKeyBase58Check,
                              index
                            );
                          }}
                        />
                      </div>
                    </th>
                    <td>
                      <div
                        className='my-1 container '
                        style={{ overflow: "hidden" }}>
                        <div className='d-flex justify-content-between'>
                          <div className='d-flex align-items-center'>
                            <img
                              src={`https://diamondapp.com/api/v0/get-single-profile-picture/${filteredHolding[publicKey].CreatorPublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                              className='rounded-circle'
                              alt='profile'
                              width='35'
                              height='35'
                            />
                            <h6 className='mx-2 card-title'>
                              <strong>
                                {
                                  filteredHolding[publicKey]
                                    .ProfileEntryResponse.Username
                                }
                              </strong>
                              {filteredHolding[publicKey].ProfileEntryResponse
                                .IsVerified.IsVerified ? (
                                <span
                                  style={{ color: "blue" }}
                                  className='fas fa-check-circle'></span>
                              ) : null}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      $
                      {getUSDValue(
                        filteredHolding[publicKey].ProfileEntryResponse
                          .CoinPriceDeSoNanos,
                        desoPrice / 100
                      ).toString()}
                    </td>
                    <td>${filteredHolding[publicKey].sellValue.toString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
