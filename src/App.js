import "./App.css";
import Dashboard from "./Components/Dashboard/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DesoApi from "./libs/desoApi";
import Landing from "./Components/Landing/Landing";
import { useEffect, useState } from "react";
import Deso from "deso-protocol";
import DaoOrderbook from "./Components/DaoOrderbook/DaoOrderbook";

const IdentityUsersKey = "login_key";
const deso = new Deso();
function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [desoApi, setDesoApi] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [desoPrice, setDeSoPrice] = useState(50);
  const [appState, setAppState] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const initAppState = async (da) => {
    try {
      const exchangeRate = await da.getDeSoPrice();
      const desoPrice = exchangeRate.USDCentsPerDeSoExchangeRate;
      setDeSoPrice(desoPrice);
      const getAppState = await da.getAppState();
      console.log(getAppState);
      setAppState(getAppState);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(async () => {
    setIsLoading(true);
    //check if selectedTab exists in localStorage
    const selectedTab = localStorage.getItem("selectedTab");
    if (!selectedTab) {
      localStorage.setItem("selectedTab", "ThreadTab");
    }

    const da = new DesoApi();
    setDesoApi(da);
    let user = "";
    if (localStorage.getItem(IdentityUsersKey) === "undefined") {
      user = "";
    } else if (localStorage.getItem(IdentityUsersKey)) {
      user = localStorage.getItem(IdentityUsersKey) || "";
    }
    if (user) {
      setLoggedIn(true);
      setPublicKey(user);
    }
    await initAppState(da);
    setIsLoading(false);
  }, []);

  const loginWithDeso = async () => {
    const user = await deso.identity.login(4);
    setPublicKey(user.key);

    setLoggedIn(true);
  };

  return (
    <>
      <Router>
        <Routes>
          <Route
            path='/'
            element={
              <>
                {isLoading ? (
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
                ) : loggedIn ? (
                  <Dashboard
                    desoApi={desoApi}
                    publicKey={publicKey}
                    desoPrice={desoPrice}
                    appState={appState}
                  />
                ) : (
                  <Landing loginWithDeso={loginWithDeso} />
                )}
              </>
            }
          />

          <Route
            path='/DAO/:DaoName'
            element={
              <>
                {isLoading ? (
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
                ) : (
                  <DaoOrderbook loginWithDeso={loginWithDeso}
                  desoPrice={desoPrice} />
                )}
              </>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
