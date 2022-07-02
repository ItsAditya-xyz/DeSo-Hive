import React from "react";
import { useState, useEffect } from "react";
import Deso from "deso-protocol";
import { getExpiration } from "../utils/desoMath";

const deso = new Deso();

export default function DerivedKey(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [derivedKeyMap, setDerivedKeyMap] = useState(null);
  const revokeDerived = async (publicKey) => {
    var loginKey = localStorage.getItem("deso_user_key");
    const request = {
      deleteKey: true,
      publicKey: loginKey,
      derivedPublicKey: publicKey,
    };
    const response = await deso.identity.derive(request);
    if (response) {
      //remove publicKey from derivedKeyMap
      var newDerivedKeyMap = { ...derivedKeyMap };
      delete newDerivedKeyMap[publicKey];
      setDerivedKeyMap(newDerivedKeyMap);
    }
  };
  const handleInit = async () => {
    setIsLoading(true);
    var lastLoggedInUser = localStorage.getItem("deso_user_key");

    const derivedKeysResponse = await props.desoApi.getDerivedKeys(
      lastLoggedInUser
    );

    const derivedMap = derivedKeysResponse.DerivedKeys;
    const validKeys = {};

    const currentBlockHeight = props.appState.BlockHeight;
    for (var key in derivedMap) {
      const isValid = derivedMap[key].IsValid;
      const expirationBlock = derivedMap[key].ExpirationBlock;
      if (isValid && expirationBlock > currentBlockHeight) {
        console.log(isValid);
        validKeys[key] = derivedMap[key];
      }
    }

    //sort valid keys in ascending order of ExpirationBlock
    const sortedValidKeys = {};
    Object.keys(validKeys)
      .sort(function (a, b) {
        return validKeys[a].ExpirationBlock - validKeys[b].ExpirationBlock;
      })
      .forEach(function (key) {
        sortedValidKeys[key] = validKeys[key];
      });

    console.log(sortedValidKeys);
    setDerivedKeyMap(sortedValidKeys);
    setIsLoading(false);
  };

  const handleViewButton = (spendingLimit) => {
    var granularLimits = "";
    const globalDeso = Math.round(spendingLimit.GlobalDESOLimit / 1e8) / 10;
    const TransactionCountLimitMap = spendingLimit.TransactionCountLimitMap;
    if (TransactionCountLimitMap) {
      const transactionCountLimitMap = {};
      for (var key in TransactionCountLimitMap) {
        const transactionCountLimit = TransactionCountLimitMap[key];
        transactionCountLimitMap[key] = transactionCountLimit;
      }

      for (var key in transactionCountLimitMap) {
        const transactionCountLimit = transactionCountLimitMap[key];
        granularLimits += `${key}: ${transactionCountLimit}\n`;
      }
    }

    const finalMessage = `Global DESO Limit: ${globalDeso} $DESO \n${granularLimits}`;
    alert(finalMessage);
  };
  useEffect(async () => {
    const test = await handleInit();
  }, []);
  return (
    <>
      {isLoading ? (
        <div className='container my-5'>
          <div className='d-flex justify-content-center'>
            <h1> Loading Derived Keys</h1>&#160;&#160;
            <div
              className='spinner-border'
              style={{ width: "3rem", height: "3rem" }}
              role='status'></div>
          </div>
        </div>
      ) : (
        <div>
          <div className='list-group list-group-flush my-5 container'>
            <div className='d-flex justify-content-center'>
              <h4>
                You are having {Object.keys(derivedKeyMap).length} active
                Derived Keys
              </h4>
            </div>
            {/* Make a yellow alert in booostrap*/}
            <div className='alert alert-warning' role='alert'>
              Warning: Don't revoke keys about which you have no idea. Otherwise
              apps like DaoDao, Cordify, Desofy etc. might not work
            </div>
            <div className='d-flex justify-content-center'>
              <p>Current Block Height: {props.appState.BlockHeight}</p>
            </div>
            <table className='table '>
              <thead className='thead-dark'>
                <tr>
                  <th scope='col'>Derived Public key</th>
                  <th scope='col'>Expiration Block</th>
                  <th scope='col'>Time left </th>
                  <th scope='col'></th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(derivedKeyMap).map((publicKey, index) => {
                  return (
                    <tr key={index}>
                      <th scope='row'>
                        <p>{publicKey.slice(0, 15)}...</p>
                      </th>
                      <td>
                        <p>{derivedKeyMap[publicKey].ExpirationBlock}</p>
                      </td>
                      <td>
                        <p>
                          {getExpiration(
                            props.appState.BlockHeight,
                            derivedKeyMap[publicKey].ExpirationBlock
                          )}
                        </p>
                      </td>
                      <td>
                        <button
                          className='btn btn-danger shadow hover-shadow mx-2 my-1'
                          onClick={() => revokeDerived(publicKey)}>
                          Revoke
                        </button>
                        <button
                          className='btn btn-success shadow hover-shadow mx-2'
                          onClick={() => {
                            handleViewButton(
                              derivedKeyMap[publicKey].TransactionSpendingLimit
                            );
                          }}>
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
