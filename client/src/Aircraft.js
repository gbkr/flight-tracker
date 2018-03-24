import React, { Component } from "react";
import { Marker } from "react-map-gl";

class Aircraft extends Component {
  render() {
    return (
      <Marker latitude={this.props.lat} longitude={this.props.lng}>
        <img
          style={{
            transform: `rotate(${this.props.bearing}deg)`,
            width: "20px",
            height: "20px"
          }}
          onClick={() =>
            this.props.updateTrackedFlight(
              this.props.flightId,
              this.props.lat,
              this.props.lng
            )
          }
          alt=""
          className={this.props.isActive}
          src="plane.svg"
        />
      </Marker>
    );
  }
}

export default Aircraft;
