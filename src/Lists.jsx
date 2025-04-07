
import React from 'react';
import {List} from './List.jsx';
import {gapi} from 'gapi-script';


export class Lists extends React.Component {
    constructor(props) {
        console.log(props);
        super(props);
        this.state= {lists: [], currentItem: 0};
        this.handleKey=this.handleKey.bind(this);
        this.handleAddList = this.handleAddList.bind(this);
        this.handleAddItem = this.handleAddItem.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.colors=["Blue","Red"];

    }

    componentDidMount(){
        this.getLists();
    }

    async checkTask(name){
        const response = await fetch(`http://localhost:5000/${this.props.id}/items/${name}`);
        return (response.status===404);
    }
    
    async createTask(name) {
        try {
            const response = await fetch(`http://localhost:5000/${this.props.id}/lists/google/items`);  
            if (response.status===404) {
                await this.addList("google");
            }
            await this.addItem("google",name);
        }
        catch(err){
            console.error(err);
        }
    }



    async fetchTasks() {
        try {
            await this.props.gapi.client.load('tasks','v1');
            const response = await this.props.gapi.client.tasks.tasks.list({
                tasklist: '@default'
            });
            console.log("tasks  ",response.result.items);
            const items = response.result.items
            for (let i=0; i<items.length; i++) {
                const result = await this.checkTask(items[i].title);
                if (result) {
                    await this.createTask(items[i].title);
                }
            }
            this.getLists();
        }
        catch(err) {
            console.error(err);
        }
    }




    async getLists() {
        const response = await fetch("http://localhost:5000/"+this.props.id+"/lists");
        if (!response.ok){
            throw new Error("failed fetching")
        }
        const data = await response.json();
        this.setState({lists: data});
    }

    async addList(name) {
        fetch("http://localhost:5000/"+this.props.id+"/lists", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({name: name})
        }).then(response => {
            if (!response.ok){
                throw new Error("couldn't create list")
            }
            console.log("created list ", name);
            this.getLists();
        })
    }

    async addItem(listName, item) {
        fetch("http://localhost:5000/"+this.props.id+"/lists/"+listName+"/items", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({item: item})
        }).then(response => {
            if (!response.ok) {
                throw new Error("couldn't add item")
            }
            this.getLists();
        })
    }

    async deleteItem(listName, item) {
        fetch("http://localhost:5000/"+this.props.id+"/lists/"+listName+"/items/"+item, {
            method: "DELETE"
        }).then(response => {
            if (!response.ok) {
                throw new Error("couldn't delete item")
            }
            this.getLists();
        }).catch(error => {
            console.error("Error in fetch ",error);
        })
    }

    async deleteList(listName) {
        console.log("delete "+listName, "http://localhost:5000/lists/"+listName);
        fetch("http://localhost:5000/"+this.props.id+"/lists/"+listName, {
            method: "DELETE"
        }).then(response=> {
            if (!response.ok) {
                console.log("not ok");
                throw new Error("couldn't delete list")
            }
            console.log(response," deleted");
            this.getLists();
        }).catch(error => {
            console.log("Error in fetch in deleteList ",error);
        })
    }



    handleKey(e) {
        if (e.key==="Enter"){
            this.handleAddList(e.target.value);
        }
    }

    handleAddList(name) {
        this.addList(name);
    }

    handleAddItem(listName, item) {
        this.addItem(listName, item);
    }

    handleDelete(listName,item) {
        this.deleteItem(listName, item.name);
    }

    handleDeleteList(listName){
        this.deleteList(listName);
    }

    handleListClick(name){
        for (let i=0; i<this.state.lists.length;i++){
            if (this.state.lists[i].name===name){
                this.setState({currentItem: i});
            }
        }
    }

    render() {
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: '100vh',
              backgroundColor: '#f5f5f5',
              margin: 0
            }}
          >
            <div
              style={{
                width: '250px',
                backgroundColor: '#ffffff',
                borderRight: '1px solid #ddd',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <button
                style={{
                  marginBottom: '1rem',
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                onClick={this.fetchTasks.bind(this)}
              >
                Import Google Tasks
              </button>
    
              <ul style={{ listStyle: 'none', paddingLeft: 0, flex: '1', margin: 0 }}>
                {this.state.lists.map((list) => (
                  <li
                    key={list.name}
                    onClick={() => this.handleListClick(list.name)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '0.3rem',
                      color: "black"
                    }}
                  >
                    {list.name}
                  </li>
                ))}
              </ul>
    
              <input
                type="text"
                placeholder="Add a new list..."
                onKeyDown={this.handleKey}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
    
            <div
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: '1rem'
              }}
            >
              {this.state.lists.length>0 ? (
                <List
                  name={this.state.lists[this.state.currentItem%this.state.lists.length].name}
                  items={this.state.lists[this.state.currentItem%this.state.lists.length].items}
                  addItem={(item) => this.handleAddItem(this.state.lists[this.state.currentItem%this.state.lists.length].name, item)}
                  deleteList={(listName) => this.handleDeleteList(listName)}
                  handleDelete={(listName, itemObj) => this.handleDelete(listName, itemObj)}
                />
              ) : (
                <div style={{ color: '#888' }}>Select a list to see its items</div>
              )}
            </div>
          </div>
        );
    }
}