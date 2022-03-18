const router = require('express').Router();
const { User, Thought } = require('../../models');

// Get all Thoughts
router.get('/', (req, res)=>{
    Thought.find({}, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else if(result){
            res.status(200).json(result);
        }
    }).select('-__v');
    
});

// Get a Thought by ID
router.get('/:id', (req, res)=>{
    Thought.findOne({_id: req.params.id}, (err, result) =>{
        if (err) {
            res.status(500).json(err);
        }
        if(!result){
            res.status(404).json({message: `There was no thought associated with id ${req.params.id}`});
        }
        if(result){
            res.status(200).json(result);
        } 
    }).select('-__v');
    
});

// Create a new Thought and Associate with User
router.post('/new/:userId', async (req, res) => {     
    if ((!req.body.username)||(!req.body.thoughtText)) {
        res.status(400).json({message: `Please enter both a username and text to create a thought.`});
    } else {
        try{
            const response = await Thought.create(req.body)
                if(response){
                    const resp = await User.findOneAndUpdate(
                        { _id: req.params.userId },
                        { $addToSet: { thoughts: response._id }},
                        {new: true}
                    )
                    if(resp){
                        res.status(200).json(response);
                    }
                    if(!resp){
                        res.status(404).json({ message: `No user with ID# ${req.params.userId} found` });
                    } 
                }
        } catch (err) {
            res.status(500).json(err);
        }
    }
});

// Add a Reaction 
router.post('/:id/reactions', (req, res) => {
    Thought.findOneAndUpdate(
        { _id: req.params.id },
        { $addToSet: { reactions: req.body } },
        { new: true },
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            }
            if (!response) {
                res.status(404).json({message:`No thought associated with that ID ${req.params.id}`});
            }
            if (response) {
                console.log(`Reaction was added`);
                res.status(200).json(response);
            }
        }
    )
});

// Edit a Thought by ID
router.put('/edit/:id', (req, res) => {
    Thought.findOneAndUpdate(
        { _id: req.params.id },
        { thoughtText: req.body.thoughtText },
        { new: true },
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            }
            if (!response) {
                console.log(`Thought was updated`);
                res.status(404).json({ message: 'No thought found with that ID' });
            }
            if (response) {
                console.log('Thought was updated');
                res.status(200).json(response);
            }
        }
    ).populate('reactions').select('-__v');
})


// Delete a Thought
router.delete('/delete/:id', (req, res) => {
    Thought.findOneAndDelete({ _id: req.params.id }, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json(err);
        }
        if (result) {
            User.findOneAndUpdate(
                { thoughts: req.params.id },
                { $pull: { thoughts: req.params.id } },
                { new: true }
            )
            console.log(`Thought ${req.params.id} was deleted`);
            res.status(200).json(result);
        } else {
            res.status(404).json({ message:`No thought with id${req.params.id} found` });
        }
    })
})

// Delete a Reaction
router.delete('/:id/reactions/:reactionId', (req, res) => {
    Thought.findOneAndUpdate(
        { _id: req.params.id },
        { $pull: { reactions: { _id: req.params.reactionId } } },
        { new: true },
        (err, response) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            }
            if (!response) {
                res.status(404).json({message:`A reaction with ID ${req.params.id} could not be found.`});
            }
            if(response){
                console.log(`Reaction was deleted`);
                res.status(200).json(response);
            }
        }
    )
})

module.exports = router;