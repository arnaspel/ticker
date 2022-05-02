import React, { useState, createRef } from "react";
import socketIOClient from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import './App.css';

const ENDPOINT = "http://127.0.0.1:3000";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.TICKS_DATA = [];
    this.socket = socketIOClient(ENDPOINT);
    this.state = {
      
      lineHeight: 0,
      threshold: 100000,
      ticksData: [],
    };
  }

  dataToDisplay(threshold) {
    const RET_VAL = this.state.ticksData.map( (tick) => {
      let retVal;
      if (tick.ask >= threshold) {
          retVal = {
            ask: null,
            bid: tick.bid,
            currency: tick.currency,
            time: tick.time,
            overThreshold: tick.ask
          }
      } else {
        retVal = tick
      }
      return retVal;
    });
    return RET_VAL;
  }

  componentDidMount() {
    this.socket.on("tick", data => {
      const date = new Date(data.timestamp);
      const hours = date.getHours();
      const minutes = "0" + date.getMinutes();
      const seconds = "0" + date.getSeconds();
      const time = hours + ':' + minutes + ':' + seconds ;
      const TICK = {
        bid: parseFloat(data.bid),
        ask: parseFloat(data.ask),
        time: time,
      };
      this.tick(TICK);
      this.render();
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  setThresholdPrice(evt) {
    const val = evt.target.value;
    this.setState({
      threshold: val,
    });
    this.render();
  }

  tick(tick) {
    this.TICKS_DATA.push(tick);
    const TMP = [...this.TICKS_DATA];
    this.setState({
      ticksData: TMP,
    });
  }

  handleRefreshChange(event) {
    const value = event.target.value;
    this.setState({
      ticksData: [],
    });
    this.socket.emit('changeRefreshTime', value);
  }

  handleCurrencyChange(event) {
    const value = event.target.value;
    this.setState({
      ticksData: [],
    });
    this.socket.emit('changeCurrency', value);
  }

  render() {
    return (
      <div className="lineChart">
      <LineChart
          width={1000}
          height={300}
          data={this.dataToDisplay(this.state.threshold)}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis type="number" domain={['dataMin - 10', 'dataMax + 10']} />
          <YAxis />
          <ReferenceLine y={this.state.threshold} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="overThreshold" stroke="#f200ff" />
          <Line type="monotone" dataKey="ask" stroke="#000000" />
          <Line type="monotone" dataKey="bid" stroke="#82ca9d" />
        </LineChart>
        <span>Set Threshold Price</span>
        <input placeholder="1.1578213182" value={this.state.threshold} onChange={(evt) => this.setThresholdPrice(evt)}></input>
        <label>Refresh interval</label>
        <div>
        <select onChange={(event) => this.handleRefreshChange(event)}>
          <option value="1">1 sec</option>
          <option value="3">3 sec</option>
          <option value="5">5 sec</option>
          <option value="10">10 sec</option>
        </select>
        </div>
        <label>Select Currency Pair</label>
        <div>
        <select onChange={(event) => this.handleCurrencyChange(event)}>
          <option value="AAPL-USD">AAPL-USD</option>
          <option value="BTC-USD">BTC-USD</option>
          <option value="ALCX-USD">ALCX-USD</option>
          <option value="BABA-USD">BABA-USD</option>
        </select>
        </div>
      </div>
    );
  }
}

export default App;
