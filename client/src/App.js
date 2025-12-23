import {CssBaseline, ThemeProvider} from "@mui/material";
import {createTheme} from "@mui/material/styles";
import {useSelector} from "react-redux";
import {themeSettings} from "./theme";
import {useMemo} from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import PrivateRoute from "guard/PrivateRoute";
import Login from "scenes/login"
import Dashboard from "scenes/dashboard"
import PublicRoute from "./guard/PublicRoute";
import Layout from "./scenes/layout";
import UserInfo from "./scenes/userInfo";

import AllUsers from "./scenes/users";
import Products from "./scenes/products";
import Details from "./scenes/products/details";
import Materials from "./scenes/materials";
import Branches from "./scenes/branches"
import BranchDetails from "./scenes/branches/branchDetails";
import OrdersPage from "./scenes/orders";

function App() {

    const mode = useSelector(state => state.theme.mode);
    const theme = createTheme(themeSettings(mode), [mode]);

    return (
        <div className="App">
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Routes>
                        {/*<Route path="/login" element={<PublicRoute><Login/></PublicRoute>}/>*/}
                        <Route element={<PublicRoute><Layout/></PublicRoute>}>
                            <Route index element={<Navigate to="login" replace />} />
                            <Route path="/login" element={<Login/>}/>
                        </Route>
                        <Route element={<PrivateRoute><Layout/></PrivateRoute>}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="/" component={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard/>}/>
                            <Route path="/profile" element={<UserInfo/>}/>
                            <Route path="/users" element={<AllUsers/>}/>
                            <Route path="/products" element={<Products />}/>
                            <Route path="/products/details/:id" element={<Details />} />
                            <Route path="/materials" element={<Materials />}/>
                            <Route path="/branches" element={<Branches />}/>
                            <Route path="/branches/details/:id" element={<BranchDetails />}/>
                            <Route path="/orders" element={<OrdersPage/>}/>
                        </Route>
                    </Routes>
                </ThemeProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
