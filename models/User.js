const { model, Schema } = require('mongoose');

// We can use GraphQL to specify which fields are required!!
const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String
});

module.exports = model('User', userSchema);