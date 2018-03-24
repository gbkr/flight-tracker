import React, { Component } from "react";
import "./App.css";
import Map from "./Map";
import Sidebar from "./Sidebar";

const token = process.env.REACT_APP_MAPBOX_TOKEN;

class App extends Component {
  checkToken = () => {
    if (!token) {
      throw new Error("Please specify a valid mapbox token");
    }
  };

  success = position => {
    this.setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      loading: false
    });
  };

  error = err => {
    console.error(err);
  };

  locateUser = () => {
    navigator.geolocation.getCurrentPosition(this.success, this.error);
  };

  constructor(props) {
    super(props);
    this.checkToken();
    this.locateUser();
    this.state = {
      loading: true,
      activeFlight: {},
      tabIndex: 0,

      settings: {
        // TODO these should be strings mapped to ints
        species: [1, 2, 3, 4, 5, 6, 7, 8],
        engTypes: [0, 1, 2, 3, 4],
        civilian: true,
        military: true
      }
    };
  }

  handleSettingChange = (item, collection) => {
    let settings = { ...this.state.settings };
    let items = settings[collection];

    if (items.includes(item)) {
      items = items.filter(e => e !== item);
    } else {
      items.push(item);
    }

    settings[collection] = items.sort();
    this.setState({ settings });
  };

  handleSettingBoolChange = (field, value) => {
    const settings = { ...this.state.settings };
    settings[field] = value;
    this.setState({ settings });
  };

  handleTabChange = index => {
    this.setState({ tabIndex: index });
  };

  activeFlightDetail = activeFlight => {
    this.setState({ activeFlight });
  };

  render() {
    if (this.state.loading) {
      return <b>Loading...</b>;
    } else {
      return (
        <div id="container">
          <Sidebar
            tabIndex={this.state.tabIndex}
            onChange={this.handleTabChange}
            activeFlightDetail={this.state.activeFlight}
            settings={this.state.settings}
            handleSettingChange={this.handleSettingChange}
            handleSettingBoolChange={this.handleSettingBoolChange}
          />

          <div className="App">
            <Map
              settings={this.state.settings}
              token={token}
              center={{
                latitude: this.state.latitude,
                longitude: this.state.longitude
              }}
              connection={new WebSocket("ws://localhost:4000")}
              activeFlightDetail={this.activeFlightDetail}
            />
          </div>
        </div>
      );
    }
  }
}

export default App;