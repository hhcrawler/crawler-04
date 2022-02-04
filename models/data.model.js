const mongoose = require('mongoose');
const dataSchema = mongoose.Schema(
    {
        big: { type: Boolean, required: true },
        sessionId: { type: Number, required: true,unique:true },
        d1: { type: Number, required: true },
        d2: { type: Number, required: true },
        d3: { type: Number, required: true },
        created_at: { type: Number, default: Date.now },
    },
);

const Data = mongoose.model('fa88-02', dataSchema);

module.exports= Data;