import React from "react";
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
const io = require('socket.io-client');
const socket = io();

class Map extends React.Component {
  constructor(props){
    super(props);
    this.state = { location1: [0.0, 0.0], location2: [0.0, 0.0] }
  }

  componentDidMount() {
    socket.on('user locations', (data) => {
      this.setState({
        location1: data.location1,
        location2: data.location2
      });
    });
  }

  render() {
    const markers = this.props.markers.map(function(obj,index){
      return {
        position: {
          lat: obj.coordinates.latitude,
          lng: obj.coordinates.longitude
        },
        label: obj.name,
        key: index
      }
    });

    return(
      <GoogleMap defaultZoom={16} center={ this.props.center } defaultCenter={ this.props.center }>
        { markers.map((marker, index) => {
            return(
              <Marker
                key={ marker.key }
                position={ marker.position }
                label={ marker.label }
              />
            )
          }
        )}
        <Marker
          key="midpoint"
          position={ this.props.center }
          label="Midpoint"
          icon={{ url: "./images/midPointIcon.png" }}
          />
        <Marker
          key="User 1"
          position={ this.state.location1 }
          label="Your location"
        />
        <Marker
          key="Friend"
          position={ this.state.location2 }
          label="Friend's location"
        />
      </GoogleMap>
    )
  }
}
//higher functionality component
export default withGoogleMap(Map);