
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true , useUnifiedTopology: true}).then(()=> console.log("MongoDB connected")).catch(() => console.log("error in db connection"))
const {Schema} =mongoose;

const ItemSchema = new Schema({ name: {type: String, required: true}});
const ListSchema = new Schema({
    userId: {type: String, required: true},
    name: {type:String, required:true}, 
    items: {type: [ItemSchema], default:[]}
});

const List= mongoose.model('List', ListSchema);

const PORT = 5000;
app.listen(PORT, ()=>{console.log("Server listening on port",PORT)});
app.use(express.json());

app.get("/:id/lists", async (req,res) => {
    try {
        const {id} = req.params;
        const lists = await List.find({userId: id});
        res.json(lists)
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post("/:id/lists", async (req, res) => {
    try {
        const {id}=req.params;
        const {name} = req.body; 
        if (!name) {
            return res.status(400).json({error: "invalid data"})
        }
        const newList = new List({userId: id, name: name});
        const savedList = await newList.save();
        res.status(200).json({message: "Element created", data: savedList});

    }
    catch(err){
        res.status(500).json({error: err.message})
    }
});

app.get("/:id/lists/:listId/items", async (req, res) => {
    try {
        const {id,listId } = req.params;
        const list = await List.findOne({userId:id, name: listId});
        if (!list){
            res.status(404).json("Not found");
        }
        else {
            res.json(list.items);
        }
        
    }
    catch(err) {
        res.status(500).json({error: err.message});
    }
});

app.post("/:id/lists/:listId/items", async (req,res) => {
    try {
        const {id,listId} = req.params;
        const {item} = req.body;
        if (!item) {
            return res.status(400).json({error: "Invalid data for item"});
        }
        const updatedList = await List.findOneAndUpdate({userId: id,name: listId}, {$push :{items: {name: item}}}, {new: true});
        if (!updatedList){
            return res.status(404).json({error: "list not found"});
        }
        res.status(201).json({message: "Element created", data: updatedList});
    }
    catch (err){
        res.status(500).json({message: err.message});
    }
})

app.delete("/:id/lists/:listId/items/:item", async (req,res) => {
    try {
        const {id,listId, item} = req.params;
        const removed = await List.findOneAndUpdate({userId:id,name: listId}, {$pull: {items: {name: item}}},{ new: true});
        if (!removed) {
            return res.status(404).json({error:"couldn't find the item"})
        }
        res.status(204).end();
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
})

app.delete("/:id/lists/:listId", async (req,res) => {
    try {
        const {id,listId} = req.params;
        const removed = await List.findOneAndDelete({userId:id,name: listId});
        if (!removed) {
            return res.status(404).json({error: "list not found"})
        }
        res.status(204).end();
    }
    catch(err) {
        res.status(500).json({error:err.message});
    }
})


app.get("/places/:lat/:lon", async (req,res) => {
    const GOOGLE_MAPS_API_KEY= "";

    try {
        const {lat,lon} = req.params;
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    }
    catch(err) {
        res.status(500).json({error: err.message});
        console.error(err);
    }
})

app.get("/:id/items/:item", async (req,res)=> {
    try {
        const {id,item} = req.params;
        const list = await List.findOne({userId: id, "items.name": item});
        if (!list){
            return res.status(404).json("not found");
        }
        res.status(200).json(list);
    }
    catch(err) {
        res.status(500).json({error:err.message});
    }
})
