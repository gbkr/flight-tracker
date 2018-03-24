import React, { Component } from "react";
import Tab from "react-toolbox/lib/tabs/Tab";
import Tabs from "react-toolbox/lib/tabs/Tabs";

import FlightDetail from "./FlightDetail";
import Search from "./Search";

class Sidebar extends Component {
  render() {
    return (
      <div id="info-panel">
        <Tabs index={this.props.tabIndex} onChange={this.props.onChange}>
          <Tab label="Flight information">
            <FlightDetail activeFlightDetail={this.props.activeFlightDetail} />
          </Tab>
          <Tab label="Search">
            <Search
              settings={this.props.settings}
              handleChange={this.props.handleSettingChange}
              handleBoolChange={this.props.handleSettingBoolChange}
            />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default Sidebar;
