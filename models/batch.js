const mongoose = require('../config/database')
const { Schema } = mongoose
const picture = "http://food.fnr.sndimg.com/content/dam/images/food/editorial/talent/guy-fieri/FN-TalentAvatar-Guy-Fieri-800x800.jpg.rend.hgtvcom.616.616.suffix/1457720995801.jpeg"

const evaluationSchema = new Schema({
  day: { type: Date, default: Date.now },
  evaluation: { type: Number, default: 0},
  remark: { type: String},
})

const studentSchema = new Schema({
  name: { type: String, default: "Nerdie McNerdface"},
  evaluations: [evaluationSchema],
  image_url: { type: String, default: picture },
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
});

const batchSchema = new Schema({
  students: [studentSchema],
  batchNumber: { type: Number },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {usePushEach:true})

module.exports = mongoose.model('batches', batchSchema)
