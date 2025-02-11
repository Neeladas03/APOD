import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Main from "./components/Main";
import SideBar from "./components/SideBar";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  function handleToggleModal() {
    setShowModal(!showModal);
  }

  useEffect(() => {
    async function fetchWithRetry(url, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Network error");
          return await res.json();
        } catch (err) {
          console.error(`Attempt ${i + 1} failed:`, err.message);
          if (i === retries - 1) throw err;
        }
      }
    }

    async function fetchAPIData() {
      const NASA_KEY = import.meta.env.VITE_NASA_API_KEY;
      const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`;
      
      const today = new Date().toDateString();
      const localKey = `NASA-${today}`;
      
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const oldKey = `NASA-${yesterday.toDateString()}`;
      localStorage.removeItem(oldKey);

      
      if (localStorage.getItem(localKey)) {
        const apiData = JSON.parse(localStorage.getItem(localKey));
        setData(apiData);
        setLoading(false);
        return;
      }

      try {
        const apiData = await fetchWithRetry(url);
        if (!apiData || apiData.code) {
          throw new Error("Invalid API response");
        }
        localStorage.setItem(localKey, JSON.stringify(apiData));
        setData(apiData);
      } catch (err) {
        console.error("Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAPIData();
  }, []);

  return (
    <>
      {loading ? (
        <div className="loadingState">
          <i className="fa-solid fa-gear"></i> Loading...
        </div>
      ) : (
        <Main data={data} />
      )}
      {showModal && data && (
        <SideBar data={data} handleToggleModal={handleToggleModal} />
      )}
      {data && (
        <Footer data={data} handleToggleModal={handleToggleModal} />
      )}
    </>
  );
}

export default App;
