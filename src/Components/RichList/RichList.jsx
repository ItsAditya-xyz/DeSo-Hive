import { useState, useEffect } from "react";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function RichList(desoPrice) {
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [richList, setRichList] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [lastDoneIndex, setLastDoneIndex] = useState(0);
  const [richListLength, setRichListLength] = useState(0);

  const total = 10590628;
  async function getRichList() {
    const url = "https://bitclout.com/api/v0/rich-list";
    const response = await fetch(url);
    const data = await response.json();
    setRichList(data);
    setRichListLength(data.length);
    let first100PublicKeyList = data.slice(0, 100).map((item) => {
      return item.PublicKeyBase58Check;
    });
    const payload = {
      PublicKeysBase58Check: first100PublicKeyList,
      SkipForLeaderboard: true,
    };

    const response2 = await fetch(
      "https://bitclout.com/api/v0/get-users-stateless",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data2 = await response2.json();
    const userList = data2.UserList;
    let keyToNameMap = {};
    //loop through userList, store name if ProfileEntryResponse is not null
    userList.forEach((user) => {
      if (user.ProfileEntryResponse) {
        keyToNameMap[user.PublicKeyBase58Check] =
          user.ProfileEntryResponse.Username;
      } else {
        keyToNameMap[user.PublicKeyBase58Check] = user.PublicKeyBase58Check;
      }
    });
    setUserInfo(keyToNameMap);
    setLastDoneIndex(100);
    setLoading(false);
  }
  async function fetchMoreData() {
    if (lastDoneIndex >= richListLength) {
      setHasMore(false);
      return;
    }
    const next100PublicKeyList = richList
      .slice(lastDoneIndex, lastDoneIndex + 100)
      .map((item) => {
        return item.PublicKeyBase58Check;
      });
    const payload = {
      PublicKeysBase58Check: next100PublicKeyList,
      SkipForLeaderboard: true,
    };
    const response = await fetch(
      "https://bitclout.com/api/v0/get-users-stateless",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    const userList = data.UserList;
    let keyToNameMap = {};
    userList.forEach((user) => {
      if (user.ProfileEntryResponse) {
        keyToNameMap[user.PublicKeyBase58Check] =
          user.ProfileEntryResponse.Username;
      } else {
        keyToNameMap[user.PublicKeyBase58Check] = user.PublicKeyBase58Check;
      }
    });
    setUserInfo({ ...userInfo, ...keyToNameMap });
    setLastDoneIndex(lastDoneIndex + 100);
  }

  useEffect(() => {
    getRichList();
  }, []);

  return (
    <div>
      {loading && (
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
      )}
      {!loading && (
        <div className='container '>
          <InfiniteScroll
            dataLength={lastDoneIndex}
            next={fetchMoreData}
            className='container mx-auto flex pt-4 pb-12 '
            style={{
              width: "100%",
              overflowY: "hidden",
            }}
            hasMore={hasMore}
            loader={
              <div className='d-flex justify-content-center mt-5'>
                <div
                  className='spinner-border text-primary'
                  style={{ width: "4rem", height: "4rem" }}
                  role='status'>
                  <span className='sr-only'>Loading...</span>
                </div>
              </div>
            }
            endMessage={
              <p className='text-center'>
                <b>Yay! You have seen it all</b>
              </p>
            }>
            <div style={{ overflowX: "hidden" }}>
              <table className='table'>
                <thead>
                  <tr>
                    <th scope='col'>Rank</th>
                    <th scope='col'>Username</th>
                    <th scope='col'>Balance</th>
                    <th scope='col'>USD</th>
                    <th scope='col'>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {richList.slice(0, lastDoneIndex).map((item, index) => (
                    <tr key={index}>
                      <th scope='row'>{index + 1}</th>
                      <td>
                        <div className='d-flex align-items-center'>
                          <img
                            src={`https://diamondapp.com/api/v0/get-single-profile-picture/${item.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default-profile-pic.png`}
                            alt='profile'
                            className='rounded-circle'
                            style={{ width: "30px", height: "30px" }}
                          />
                          <a
                            className='ml-4 text-dark'
                            href={`https://wallet.deso.com/?user=${item.PublicKeyBase58Check}`}
                            target='_blank'>
                            {userInfo[item.PublicKeyBase58Check].length > 40
                              ? userInfo[item.PublicKeyBase58Check].slice(
                                  0,
                                  8
                                ) +
                                "..." +
                                userInfo[item.PublicKeyBase58Check].slice(-9)
                              : userInfo[item.PublicKeyBase58Check]}
                          </a>
                        </div>
                      </td>
                      <td>
                        {(
                          Math.round((item.BalanceNanos * 10) / 1e9) / 10
                        ).toLocaleString()}
                      </td>
                      <td>
                        $
                        {(
                          Math.round(
                            (item.BalanceNanos *
                              (desoPrice.desoPrice / 100) *
                              10) /
                              1e9
                          ) / 10
                        ).toLocaleString()}
                      </td>
                      <td>
                        {(
                          ((item.BalanceNanos/1e9) / total) *
                          100
                        ).toLocaleString()}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
}
