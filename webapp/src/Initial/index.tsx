import * as React from "react";
import "./style.css";
import InitialForm from "./FormContainer";

export interface Props {
  genes: Map<string, string>;
  celllines: Array<string>;
}

export default class Initial extends React.Component<Props, object> {
  render() {
    return (
      <div className="App">
        <div className="AppHeader">
          <h1>PAVOOC</h1>
        </div>
        <div className="AppBody">
          <div className="bodyLeft">
            <p className="teaser">
              Design and control cutting-edge-scored sgRNAs in an eye-blink
            </p>
          </div>
          <InitialForm className="bodyRight" />
        </div>
      </div>
    );
  }
}
