
import React from 'react';



export class Board extends React.Component {

    constructor(props){
        super(props);
        if (this.props.lists.length>0){
            this.state={currentItem: this.props.lists[0]}
        }
        else {
            this.state={currentItem: ""}
        }
    }

    render() {
        <div>
            <ul>
            {this.props.lists.map((value)=>(<li>{value.name}</li>))}
            </ul>
            <div>
                <div onClick={this.handleClick.bind(this)}>{this.state.currentItem}</div>
            </div>
            <div>
                <form>
                    <input onKeyDown={this.handleKey.bind(this)}></input>
                    <input type="submit" onClick={this.handleSubmit.bind(this)}>Create task</input>
                </form>
            </div>
        </div>

    }
}