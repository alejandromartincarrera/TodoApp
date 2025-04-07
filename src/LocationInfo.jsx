
import React from 'react';

const OPEN_WEATHER_API_KEY= "";


export class LocationInfo extends React.Component {
    constructor(props){
        super(props);
        this.state={location:null};
        this.handleKey=this.handleKey.bind(this);
    }

    async handleKey(e){
        if (e.key==="Enter") {
            const data = await this.getWeather(e.target.value);
            await this.getPlaces(data.coord.lat, data.coord.lon);
            this.setState({location: e.target.value});
        }
    }

    async getWeather(location){
        try{
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;
            const response = await fetch(url);
            if (!response.ok){
                console.log("Couldn't find weather for ",location);
                return null;
            }
            const data = await response.json();
            console.log(data.weather[0].description);
            console.log(data);
            this.setState({data:data, description: data.weather[0].description});
            return data
        }
        catch (err) {
            console.error("error: ",err);
        }
    }

    async getPlaces(lat,lon) {
        try {
            const url = `http://localhost:5000/places/${lat}/${lon}`;
            const response = await fetch(url);
            if (!response.ok) {
                console.log("Couldn't find places for ",lat,lon);
                return null;
            }
            const data = await response.json();
            console.log(data);
            if (data.results.length<5){
                this.setState({places:data.results});
            }
            else {
                this.setState({places:data.results.slice(0,5)})
            }
            return data;
        }
        catch(err){
            console.error("Error: ",err);
        }
    }

    getCurrentPosition(){
        if ("geolocation" in navigator) {
            this.setState({location: null});
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude,longitude}= position.coords;
                    this.getPlaces(latitude,longitude);
                },
                (error)=>{
                    console.error(error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            )
        }
    }

    render(){
        return(
            <div>
                <span>enter location: </span>
                <input onKeyDown={this.handleKey}></input> <button onClick={this.getCurrentPosition.bind(this)}>current position</button>
                {this.state.location==null? <div> </div>: <div>
                    <p>{this.state.location}</p>
                    <p>{this.state.data.weather[0].description}   {this.state.data.main.temp}º Celsius</p>
                    </div>}
                {this.state.places? <p>Near Places: </p> : ""}
                {this.state.places? this.state.places.map((place,index) => (<p>{place.name}</p>)) : ""}
            </div>
        );
    }
}