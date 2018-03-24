import React, { Component } from "react";
import ReactMapGL from "react-map-gl";
import Aircraft from "./Aircraft";
import { sendMessage } from "./helpers";

const updateInterval = 1000 * 10;

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: this.props.center.latitude,
        longitude: this.props.center.longitude,
        zoom: 8,
        bearing: 0,
        pitch: 0,
        width: window.innerWidth,
        height: window.innerHeight
      },
      flightData: [],
      trackedFlight: "",
      boundsArr: []
    };
  }

  filterSector = militaryPlane => {
    const military = this.props.settings.military;
    const civilian = this.props.settings.civilian;

    if (military && civilian) {
      return true;
    }
    if (!military && !civilian) {
      return false;
    }
    if (military && militaryPlane) {
      return true;
    }
    if (civilian && !militaryPlane) {
      return true;
    }

    return false;
  };

  applySearchCriteria = fullData => {
    const species = this.props.settings.species;
    const engTypes = this.props.settings.engTypes;

    return fullData.filter(
      e =>
        species.includes(e.Species) &&
        engTypes.includes(e.EngType) &&
        this.filterSector(e.Mil)
    );
  };

  componentDidMount() {
    window.addEventListener("resize", this._resize);
    this._resize();

    let ws = this.props.connection;

    ws.onmessage = e => {
      let data = JSON.parse(e.data);
      let d2 = JSON.parse(data.data);

      let filteredData = this.applySearchCriteria(d2);

      let msg = data.name;

      switch (msg) {
        case "aircraft feed":
          this.setState({
            flightData: filteredData
          });
          let foundIndex = d2.findIndex(x => x.Id === this.state.trackedFlight);
          if (foundIndex !== -1) {
            let activeElement = d2[foundIndex];

            this._recenter(activeElement["Lat"], activeElement["Long"]);
          }
          break;

        case "aircraft detail":
          this.props.activeFlightDetail(d2[0]);
          break;

        default:
          console.error("Unhandled message: ", msg);
      }
    };

    const bounds = this._getBounds();
    this.setState({ bounds }, this.fetchFlightData(ws, bounds));

    setInterval(() => {
      this.fetchFlightData(ws, this.state.bounds);
    }, updateInterval);
  }

  fetchFlightData = (ws, bounds) => {
    let msg = {
      name: "bounds",
      data: {
        bounds: bounds,
        activeFlightId: String(this.state.trackedFlight)
      }
    };

    sendMessage(ws, JSON.stringify(msg));
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this._resize);
  }

  _resize = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  };

  boundsChanged = map => {
    const bounds = map.getBounds();
    const limitedBounds = map.unproject([60, 60]);

    const hDiff = Math.abs(bounds.getNorth() - limitedBounds.lat);
    const vDiff = Math.abs(bounds.getWest() - limitedBounds.lng);

    const boundsArr = [
      bounds.getSouth() + hDiff,
      limitedBounds.lng,
      limitedBounds.lat,
      bounds.getEast() - vDiff
    ];

    this.setState({ boundsArr });
  };

  _recenter = (latitude, longitude) => {
    const newViewport = { latitude, longitude };
    const viewport = Object.assign({}, this.state.viewport, newViewport);
    this.setState({ viewport });
  };

  updateTrackedFlight = (flightId, lat, lng) => {
    this._recenter(lat, lng);

    // Request info on this flight
    let msg = {
      name: "activeFlightId",
      data: String(flightId)
    };
    this.props.connection.send(JSON.stringify(msg));

    this.setState({
      trackedFlight: this.state.trackedFlight === flightId ? null : flightId
    });
  };

  _getBounds = () => {
    if (this.map !== void [0]) {
      const rawBounds = this.map.getMap().getBounds();
      const bounds = {
        lat: {
          high: rawBounds._ne.lat,
          low: rawBounds._sw.lat
        },
        lng: {
          high: rawBounds._ne.lng,
          low: rawBounds._sw.lng
        }
      };
      return bounds;
    } else {
      return {};
    }
  };

  renderAircraft = () => {
    let data = this.state.flightData;

    return data.map(e => (
      <Aircraft
        isActive={this.state.trackedFlight === e["Id"] ? "active" : ""}
        updateTrackedFlight={this.updateTrackedFlight}
        id={e["Id"]}
        key={e["Id"]}
        flightId={e["Id"]}
        aircraftId={e["Reg"]}
        lat={e["Lat"]}
        lng={e["Long"]}
        bearing={e["Trak"]}
        text={`Name: ${e["Mdl"]} From: ${e["From"]} To: ${e["To"]}`}
      />
    ));
  };

  _onViewportChange = viewport => {
    const bounds = this._getBounds();
    this.setState({ bounds, viewport });
  };

  render() {
    const { viewport } = this.state;

    return (
      <div id="flight-map">
        <ReactMapGL
          {...viewport}
          ref={map => (this.map = map)}
          boundsChanged={this.boundsChanged}
          mapboxApiAccessToken={this.props.token}
          mapStyle="mapbox://styles/mapbox/light-v9"
          onViewportChange={this._onViewportChange}
        >
          {this.renderAircraft()}
        </ReactMapGL>
      </div>
    );
  }
}

export default Map;
