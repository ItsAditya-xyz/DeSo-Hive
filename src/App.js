import "./App.css";
import First from "./Components/First/First";
import DeSoIdentity from "./libs/desoIdentity";
import DesoApi from "./libs/desoApi";
import Landing from "./Components/Landing/Landing";
import { useEffect, useState } from "react";
const IdentityUsersKey = "identityUsersV2";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [desoIdentity, setDesoIdentity] = useState(null);
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
    const di = new DeSoIdentity();
    setDesoIdentity(di);
    const da = new DesoApi();
    setDesoApi(da)
    let user = {};
    if (localStorage.getItem(IdentityUsersKey) === "undefined") {
      user = {};
    } else if (localStorage.getItem(IdentityUsersKey)) {
      user = JSON.parse(localStorage.getItem(IdentityUsersKey) || "{}");
    }
    if (user.publicKey) {
      setLoggedIn(true);
      setPublicKey(user.publicKey);
      localStorage.setItem("lastLoggedInUser", `${user.publicKey.toString()}`);
    }
    await initAppState(da);
    setIsLoading(false);
  }, []);

  const loginWithDeso = async () => {
    const user = await desoIdentity.loginAsync(4);
    setLoggedIn(true);
    //console.log(user)
    setPublicKey(user.publicKey);
    //store user.publicKey as string in localstorage
    localStorage.setItem("lastLoggedInUser", `${user.publicKey.toString()}`);
  };

  return (
    <>
      <iframe
        title='desoidentity'
        id='identity'
        frameBorder='0'
        src='https://identity.deso.org/embed?v=2'
        style={{
          height: "100vh",
          width: "100vw",
          display: "none",
          position: "fixed",
          zIndex: 1000,
          left: 0,
          top: 0,
        }}></iframe>

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
        <First
          loginWithDeso={loginWithDeso}
          desoIdentity={desoIdentity}
          desoApi={desoApi}
          publicKey={publicKey}
          desoPrice={desoPrice}
          appState={appState}
        />
      ) : (
        <Landing loginWithDeso={loginWithDeso} />
      )}
    </>
  );
}

export default App;
