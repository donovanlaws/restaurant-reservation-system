import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import NewReservation from "../reservations/NewReservations";
import { today } from "../utils/date-time";
import NewTable from "../tables/TableNew";
import ReservationSeat from "../reservations/ReservationSeat";
import SearchDash from "../search/SearchDash";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations/new">
        <NewReservation/>
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/seat">
        <ReservationSeat/>
      </Route>
      <Route exact={true} path="/tables/new">
        <NewTable/>
      </Route>
      <Route path="/search">
        <SearchDash />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={today()} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
