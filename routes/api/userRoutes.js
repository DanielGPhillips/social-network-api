const router = require('express').Router();
const { User, Thought } = require('../../models');

// Find all users
router.get('/', (req, res) => {
    User.find({}, (err, result) => {
        if (err) {
            res.status(500).json({ message: err })
        }
        if (result) {
            res.status(200).json(result)
        }
    })
});

// Find user by id
router.get('/:userid', (req, res) => {
    User.findOne({ _id: req.params.userId },(err, result) => {
        if (err) {
            res.status(500). json(err)
        }
        if (!result) {
            res.status(404).json({ message: `There is no user with id ${req.params.id}` })
        }
        if (result) {
            res.status(200).json(res)
        }
    }).populate('friends').populate('thoughts').select('-__v');
});

// Create new user
router.post('/new', async (req, res) => {
    try {
        if ((!req.body.username && req.body.email) || (req.body.username === '') || (req.body.email === '')){
            res.status(400).json({ message: 'Please enter a valid username and email' })
        } else {
            const response = await User.create(req.body)
            if (response) {
                res.status(200).json(response)
            }
        }
    } catch (err) {
        res.status(500).json(err)
    }
});

// Edit user by id
router.put('/edit/:id', (req, res) => {
    const updateUser = () => {
        User.findOneAndUpdate(
            { _id: req.params.id },
            { 
                username: req.body.username, 
                email: req.body.email,
            },
            { runValidators: true, new: true },
            (err, response) => {
                if (err) {
                    console.log(`An error has occured: ${err}`)
                    res.status(500).json(err)
                }
                if (!response) {
                    res.status(400).json({ message: `No user found to update at id# ${req.params.id}`})
                }
                if (response) {
                    console.log('User has been updated successfully')
                    res.status(200).json(response)
                }
            }
        ).populate('friends').populate('thoughts').select('-__v');
    }
    const checkEmail = () => {
        if (req.body.email === '') {
            res.status(400).json({ message: `The email you entered is formatted incorrectly`})
        } else {
            if (req.body.email) {
                if (!/^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(req.body.email)) {
                    res.status(400).json({ message: 'The email you entered is formatted incorrectly'})
                } else {
                    updateUser();
                }
            } else {
                updateUser();
            }
        }
    }

    if (req.body.username) {
        if (req.body.username === '') {
            res.status(400).json({ message: 'Your username cannot be blank'})
        } else {
            User.findOne({ username: req.body.username }, (err, result) => {
                if (err) {
                    throw err
                }
                if (result) {
                    res.status(400).json({ message: 'That username is already taken' })
                } else {
                    checkEmail();
                }
            })
        }
    } else {
        checkEmail();
    }
});

// Add a friend to user
router.post('/:id/friends/:friendId', (req,res) => {
    User.findOneAndUpdate(
        { id: req.params.id },
        { $addToSet: { friends: req.params.friendId } },
        { new: true },
        (err, response) => {
            if (err) {
                console.log('There was an error adding friend')
                res.status(500).json(err);
            } else if (!response) {
                res.status(404).json({ message: `There was a problem with an ID. Please check ID's and try agian.`})
            } else {
                console.log('Friend was added');
                res.status(200).json(response)
            }
        }
    ).populate('friends').populate('thoughts').select('-__v');
});

// Delete a user
router.delete('/delete/:id', (req,res) => {
    User.findOneAndDelete({ id: req.params.id })
    .then((user) =>
    !user
        ? res.status(404).json({ message: 'No user with that ID'})
        : Thought.deleteMany({ _id: { $in: user.thoughts } })
    )
    .then(() => res.status(200).json({ message: 'User and associated thoughts have been deleted'}))
    .catch((err) => res.status(500).json({ message: `There has been an unexpected error: ${err}`}))
});

// Remove a friend
router.delete('/:id/friends/:friendId', (req,res) => {
    User.findOneAndUpdate(
        { _id: req.params.id },
        { $pull: {friends: req.params.friendId }},
        { new: true },
        (err, response) => {
            if (err) {
                console.log(`An error has occurred: ${err}`);
                res.status(500).json({ message: `An error has occurred: ${err}` })
            } else if (!response) {
                res.status(404).json({ message: 'One of the ID is incorrect. Please check and try again.'})
            } else if (response) {
                console.log('Friend was successfully removed');
                res.status(200).json(response);
            }
        }
    ).populate('friends').populate('thoughts').select('-__v');
});

module.exports = router;
