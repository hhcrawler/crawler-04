const mongoose = require('mongoose');
const dataSchema = mongoose.Schema(
    {
        is_even: { type: Boolean, required: true },
        result: { type: String, required: true },
        rsmd5: { type: String, required: true },
        created_at: { type: Number, default: Date.now },
    },
);

const Data = mongoose.model('data', dataSchema);

module.exports= Data;