import React, { Component } from "react";
import Switch from "react-toolbox/lib/switch/Switch";
import { SpeciesHelper, EngineTypeHelper } from "./helpers";

class Search extends Component {
  renderSpecies = () => {
    const nSpecies = 8;
    return [...Array(nSpecies)].map((_, i) => (
      <Switch
        key={i}
        label={SpeciesHelper(i + 1)}
        checked={this.props.settings.species.includes(i + 1)}
        onChange={() => this.props.handleChange(i + 1, "species")}
      />
    ));
  };

  renderEngType = () => {
    const nEngTypes = 5;
    return [...Array(nEngTypes)].map((_, i) => (
      <Switch
        key={i}
        label={EngineTypeHelper(i)}
        checked={this.props.settings.engTypes.includes(i)}
        onChange={() => this.props.handleChange(i, "engTypes")}
      />
    ));
  };

  render() {
    return (
      <div>
        <h3>Aircraft types</h3>

        {this.renderSpecies()}

        <br />

        <h3>Engine type</h3>

        {this.renderEngType()}

        <br />

        <h3>Sector</h3>

        <Switch
          label="Civilian"
          checked={this.props.settings.civilian}
          onChange={this.props.handleBoolChange.bind(this, "civilian")}
        />

        <Switch
          label="Military"
          checked={this.props.settings.military}
          onChange={this.props.handleBoolChange.bind(this, "military")}
        />
      </div>
    );
  }
}

export default Search;
