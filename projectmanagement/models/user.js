/**
 * Created by FanTaSyLin on 2016/7/21.
 */

var mongoose = require('mongoose');
var bcrypt = require('node-bcrypt');
var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        toObject: {
            virtuals: true
        }, toJSON: {
        virtuals: true
    }
    });

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        var salt;
        try {
            salt = bcrypt.gensalt();
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                return next();
            })
        } catch (err) {
            return next(err);
        }
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passwd, cb) {
    try {
        var isMatch = bcrypt.checkpw(passwd, this.password);
        return cb(null, true);
    } catch (err) {
        return cb(err);
    }

};

module.exports = mongoose.model('User', UserSchema);