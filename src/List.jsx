
import React from 'react';
import "./List.css";

export class List extends React.Component {
    constructor(props){
        super(props);
        this.handleKey=this.handleKey.bind(this);
        this.handleBold= this.handleBold.bind(this);
        this.state={bold: {}};

    }

    handleKey(e){
        if (e.key==="Enter"){
            //this.setState({items: [...this.state.items,e.target.value]});
            this.props.addItem(e.target.value);
        }
    }

    handleBold(index){
        if (index in this.state.bold) {
            this.setState(prevState => {
                return {bold: {...prevState.bold, [index] : !prevState.bold[index]}}
            })
        }
        else {
            this.setState(prevState => ({ bold: {...prevState.bold, [index]: true}}))
        }
    }

    

    render() {
        console.log(this.state);
        return (
            <div className="list-container" style={{backgroundColor: this.props.color, margin: "10px"}}>
                <span className='list-title'>{this.props.name}</span>
                <br/>
                <ul>
                {this.props.items.map((item,index) => (
                    <React.Fragment key={index}>
                        <li style={{fontWeight: index in this.state.bold && this.state.bold[index]? "bold":"normal"}} onClick={()=>this.handleBold(index)} key={index}>{item.name}</li>
                        <button onClick={()=>this.props.handleDelete(this.props.name, item)}>delete</button>
                        <br/>
                    </React.Fragment>
                ))}
                </ul>
                <button onClick={()=>this.props.deleteList(this.props.name)}>delete list</button>
                <input onKeyDown={(e)=>this.handleKey(e)}></input>
            </div>
        );
    }

}