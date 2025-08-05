
import { BrowserRouter, Route } from "react-router-dom";
import {  Welcome } from "../pages/Welcome";
import { RoutesWithNotFound } from "../components/RoutesWithNotFound/RoutesWithNotFound";

export const AppRouter = () => {
    return (
        <BrowserRouter>
        <RoutesWithNotFound> 
            <Route path="/" element={<Welcome />} />
        </RoutesWithNotFound>
        </BrowserRouter>
    )
}