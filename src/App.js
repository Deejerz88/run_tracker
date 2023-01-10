import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState, createContext } from "react";
import { Home, ProfilePage } from "./Pages/index.js";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { DateTime } from "luxon";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

export const AppContext = createContext({}, () => {});

function App() {
  const [Context, setContext] = useState({
    user: {},
    loggedIn: "false",
    stayLoggedIn: "false",
    checkedIn: "false",
    participant: {},
    race: {},
    date: DateTime.local().toISODate(),
  });

  useEffect(() => {
    const stayLoggedIn =
      localStorage.getItem("stayLoggedIn")?.toString() ||
      sessionStorage.getItem("stayLoggedIn")?.toString() ||
      "false";

    const user = stayLoggedIn
      ? localStorage.getItem("user")
      : sessionStorage.getItem("user");

    const loggedIn = stayLoggedIn
      ? localStorage.getItem("loggedIn")
      : sessionStorage.getItem("loggedIn");

    const checkedIn = stayLoggedIn
      ? localStorage.getItem("checkedIn")
      : sessionStorage.getItem("checkedIn");

    const newState = {
      user: (user && JSON.parse(user)) || {},
      loggedIn: (loggedIn && JSON.parse(loggedIn)?.toString()) || "false",
      stayLoggedIn:
        (stayLoggedIn && JSON.parse(stayLoggedIn)?.toString()) || "false",
      checkedIn: (checkedIn && JSON.parse(checkedIn)?.toString()) || "false",
      participant: {},
      race: {},
      date: DateTime.local().toISODate(),
      defaultFields: {},
    };

    setContext(newState);
  }, []);

  useEffect(() => {
    console.log("state", Context);
    if (Context.stayLoggedIn === "true") {
      localStorage.setItem("user", JSON.stringify(Context.user));
      localStorage.setItem("loggedIn", Context.loggedIn);
      localStorage.setItem("stayLoggedIn", Context.stayLoggedIn);
      localStorage.setItem("checkedIn", Context.checkedIn);
    } else {
      sessionStorage.setItem("user", JSON.stringify(Context.user));
      sessionStorage.setItem("loggedIn", Context.loggedIn);
      sessionStorage.setItem("stayLoggedIn", Context.stayLoggedIn);
      sessionStorage.setItem("checkedIn", Context.checkedIn);
    }
  }, [Context]);

  const BrowserRouter = createBrowserRouter(
    createRoutesFromElements([
      <Route path="/" element={<Home />} />,
      <Route path="/profile/:user_id" element={<ProfilePage />} />,
    ])
  );

  return (
    <>
      <ToastContainer />
      <AppContext.Provider value={[Context, setContext]}>
        <RouterProvider router={BrowserRouter} />
      </AppContext.Provider>
    </>
  );
}

export default App;
