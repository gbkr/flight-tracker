import React, { Component } from "react";
import {
  WakeTurbulenceHelper,
  TransponderHelper,
  SpeciesHelper,
  EngineTypeHelper
} from "./helpers";

class FlightDetail extends Component {
  render() {
    const { activeFlightDetail: detail } = this.props;
    return (
      <div>
        {Object.keys(detail).length > 0 && (
          <span>
            <h3>{detail.Mdl}</h3>
            <p>
              <span className="flightDetail-title">From: </span>
              <span className="flightDetail-value">{detail.From}</span>
            </p>
            <p>
              <span className="flightDetail-title">To: </span>
              <span className="flightDetail-value">{detail.To}</span>
            </p>
            <p>
              <span className="flightDetail-title">ICAO: </span>
              <span className="flightDetail-value">{detail.Icao}</span>
            </p>
            <p>
              <span className="flightDetail-title">Reg: </span>
              <span className="flightDetail-value">{detail.Reg}</span>
            </p>
            <p>
              <span className="flightDetail-title">Alt: </span>
              <span className="flightDetail-value">{detail.Alt} feet</span>
            </p>
            <p>
              <span className="flightDetail-title">GAlt: </span>
              <span className="flightDetail-value">{detail.GAlt} feet</span>
            </p>
            <p>
              <span className="flightDetail-title">Track: </span>
              <span className="flightDetail-value">{detail.Trak}°</span>
            </p>
            <p>
              <span className="flightDetail-title">Latitude: </span>
              <span className="flightDetail-value">{detail.Lat}</span>
            </p>
            <p>
              <span className="flightDetail-title">Longitude: </span>
              <span className="flightDetail-value">{detail.Long}</span>
            </p>
            <p>
              <span className="flightDetail-title">Speed: </span>
              <span className="flightDetail-value">{detail.Spd} knots</span>
            </p>
            <p>
              <span className="flightDetail-title">ICAO type code: </span>
              <span className="flightDetail-value">{detail.Type}</span>
            </p>
            <p>
              <span className="flightDetail-title">Manufacturer: </span>
              <span className="flightDetail-value">{detail.Man}</span>
            </p>
            <p>
              <span className="flightDetail-title">
                Construction/Serial number:{" "}
              </span>
              <span className="flightDetail-value">{detail.CNum}</span>
            </p>
            <p>
              <span className="flightDetail-title">Operator: </span>
              <span className="flightDetail-value">{detail.Op}</span>
            </p>
            <p>
              <span className="flightDetail-title">Operator ICAO code: </span>
              <span className="flightDetail-value">{detail.OpIcao}</span>
            </p>
            <p>
              <span className="flightDetail-title">Transponder code: </span>
              <span className="flightDetail-value">{detail.Sqk}</span>
            </p>
            <p>
              <span className="flightDetail-title">Vertical speed: </span>
              <span className="flightDetail-value">
                {detail.Vsi} (feet/min)
              </span>
            </p>
            <p>
              <span className="flightDetail-title">
                Wake turbulence category:{" "}
              </span>
              <span className="flightDetail-value">
                {WakeTurbulenceHelper(detail.WTC)}
              </span>
            </p>
            <p>
              <span className="flightDetail-title">
                General aircraft type:{" "}
              </span>
              <span className="flightDetail-value">
                {SpeciesHelper(detail.Species)}
              </span>
            </p>
            <p>
              <span className="flightDetail-title">Engine type: </span>
              <span className="flightDetail-value">
                {EngineTypeHelper(detail.EngType)}
              </span>
            </p>
            <p>
              <span className="flightDetail-title">Number of engines: </span>
              <span className="flightDetail-value">{detail.Engines}</span>
            </p>
            <p>
              <span className="flightDetail-title">Military: </span>
              <span className="flightDetail-value">{detail.Mil}</span>
            </p>
            <p>
              <span className="flightDetail-title">
                Registered in country:{" "}
              </span>
              <span className="flightDetail-value">{detail.Cou}</span>
            </p>
            <p>
              <span className="flightDetail-title">On ground: </span>
              <span className="flightDetail-value">{String(detail.Gnd)}</span>
            </p>
            <p>
              <span className="flightDetail-title">Callsign: </span>
              <span className="flightDetail-value">{detail.Call}</span>
            </p>
            <p>
              <span className="flightDetail-title">Marked of interest: </span>
              <span className="flightDetail-value">{detail.Interested}</span>
            </p>
            <p>
              <span className="flightDetail-title">
                Transmitting emergency squak code:{" "}
              </span>
              <span className="flightDetail-value">{detail.Help}</span>
            </p>
            <p>
              <span className="flightDetail-title">Transponder type: </span>
              <span className="flightDetail-value">
                {TransponderHelper(detail.Trt)}
              </span>
            </p>
          </span>
        )}
      </div>
    );
  }
}

export default FlightDetail;
