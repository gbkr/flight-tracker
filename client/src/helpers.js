export function WakeTurbulenceHelper(categoryCode) {
  switch (categoryCode) {
    case 0:
      return "None";
    case 1:
      return "Light";
    case 2:
      return "Medium";
    case 3:
      return "Heavy";
    default:
      return "Unknown";
  }
}

export function TransponderHelper(transponderCode) {
  switch (transponderCode) {
    case 0:
      return "Unknown";
    case 1:
      return "Mode-S";
    case 2:
      return "ADS-B (unknown version)";
    case 3:
      return "ADS-B 0 – DO-260";
    case 4:
      return "ADS-B 1 – DO-260 (A)";
    case 5:
      return "ADS-B 2 – DO-260 (B)";
    default:
      return "Unknown";
  }
}

export function SpeciesHelper(speciesCode) {
  switch (speciesCode) {
    case 0:
      return "None";
    case 1:
      return "Land Plane";
    case 2:
      return "Sea Plane";
    case 3:
      return "Amphibian";
    case 4:
      return "Helicopter";
    case 5:
      return "Gyrocopter";
    case 6:
      return "Tiltwing";
    case 7:
      return "Ground Vehicle";
    case 8:
      return "Tower";
    default:
      return "Unknown";
  }
}

export function EngineTypeHelper(engineCode) {
  switch (engineCode) {
    case 0:
      return "None";
    case 1:
      return "Piston";
    case 2:
      return "TurboProp";
    case 3:
      return "Jet";
    case 4:
      return "Electric";
    default:
      return "Unknown";
  }
}

export function sendMessage(socket, msg) {
  waitForSocketConnection(socket, function() {
    socket.send(msg);
  });
}

function waitForSocketConnection(socket, callback) {
  setTimeout(function() {
    if (socket.readyState === 1) {
      if (callback != null) {
        callback();
      }
      return;
    } else {
      waitForSocketConnection(socket, callback);
    }
  }, 5);
}