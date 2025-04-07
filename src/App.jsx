import logo from './logo.svg';
import './App.css';
import {Lists} from './Lists.jsx';
import { LocationInfo } from './LocationInfo.jsx';

import React from 'react';

import GoogleLogin from 'react-google-login';
import {gapi} from 'gapi-script';

console.log("GoogleLogin:", GoogleLogin);
console.log("Lists", Lists);



const CLIENTID= "";


export class App extends React.Component {

  constructor(props) {
    super(props);
    this.state={login: false};
  }

  componentDidMount() {

    gapi.load("client:auth2", ()=>{
      gapi.client.init({
        clientId: CLIENTID,
          scope:"https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks"
      }).then(() => {
        this.setState({gapi:gapi});
      }
      ).catch(err=>{console.error(err)});
    });
  }

  async fetchCalendar() {
    try {
      const response = await gapi.client.calendar.calendarList.list();
      console.log(response);
      const calendar = response.result.items;
      console.log("fetched calendar ",calendar);
      this.setState({calendar: calendar});
    }
    catch (err) {
      console.error("CALENDAR ERROR: ",err);
    }
  }

  async fetchEvents() {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime"
      });
      console.log(response.result.items);
      this.setState({events: response.result.items});

    }
    catch (err) {
      console.error(err);
    }
  }



  


  

  render() {
    console.log(this.state);
    return (
      <div className="App">
        <header className="App-header">
          <div>
          {this.state.login? <div> <button onClick={()=>{this.setState({login:false})}}>Logout</button><br/>
          <div
  style={{
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-between",
    border: "1px solid #ccc",
    height: "500px",
    width: "100%",
    margin: "1rem 0"
  }}
>
  {/* LEFT SIDE */}
  <div
    style={{
      flex: 2,               // Takes up 1 part
      borderRight: "1px solid #ccc",
      padding: "1rem"
    }}
  >
    <Lists id={this.state.id} gapi={this.state.gapi} />
  </div>

  {/* RIGHT SIDE */}
  <div
    style={{
      flex: 1,               // Takes up 2 parts (wider than left)
      display: "flex",
      flexDirection: "column",
      padding: "1rem"
    }}
  >
    <div>
      <p>Your Google Calendar Events:</p>
      {this.state.events ? (
        this.state.events.map((event) => (
          <p key={event.id}>
            {event.summary} {event.start.dateTime}
          </p>
        ))
      ) : (
        <p>No events</p>
      )}
    </div>
    <div style={{ marginTop: "auto" }}>
      <LocationInfo />
    </div>
  </div>
</div>

          
           </div>
          : <GoogleLogin 
            clientId={CLIENTID}
            buttonText='Login'
            onSuccess={(response)=>{
              this.setState({login:true, id: response.profileObj.googleId});
              gapi.client.load('calendar', 'v3').then(()=>{this.fetchCalendar();}).then(()=>{this.fetchEvents();}).catch((err)=>{console.error(err)});
              }}
            onFailure={()=>{this.setState({login:false})}}
            cookiePolicy={"single_host_origin"}
            isSignedIn={false}
            />}
          </div>
        </header>
      </div>
    );
  }
}

