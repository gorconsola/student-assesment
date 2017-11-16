const router = require('express').Router()
const passport = require('../config/auth')
const { Batch } = require('../models')

const authenticate = passport.authorize('jwt', { session: false })

router.get('/batches', (req, res, next) => {
  Batch.find()
    .sort({ createdAt: -1 })
    .then((batches) => res.json(batches))
    .catch((error) => next(error))
  })

  .get('/batches/:id', (req, res, next) => {
    const id = req.params.id
    console.log(req.params, req.body)
    Batch.findById(id)
      .then((batch) => {
        if (!batch) { return next() }
        res.json(batch)
      })
      .catch((error) => next(error))
  })
  .post('/batches', authenticate, (req, res, next) => {
    let newBatch = req.body
    console.log('routes batch', req.body)
    Batch.create(newBatch)
      .then((batch) => res.json(batch))
      .catch((error) => next(error))
  })

  .patch('/batches/:id', authenticate, (req, res, next) => {
      const type = req.body.type
      const id = req.body.batchId
      const studentId = req.body.student._id
      console.log("STUDENT ID: ",studentId)

      const Student = {
        name: req.body.student.name,
        image_url: req.body.student.image_url,
        evaluations: req.body.student.evaluations,
        _id: req.body.student._id
      }

      const patchForBatch = req.body


      Batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }

          if(type === "rateStudent"){
            var students = [...batch.students]
            var indexOfstudent = students.findIndex(student => student._id.toString() === Student._id.toString());
            if (indexOfstudent !== -1) {
              students[indexOfstudent] = Student;
            }
          } else {
            var students = [...batch.students, Student]
          }

          const updatedBatch = { ...batch, students: students }

          Batch.findByIdAndUpdate(id, { $set: updatedBatch }, { new: true })
            .then((batch) => res.json(updatedBatch))
            .catch((error) => next(error))

    })
  })

module.exports = router
