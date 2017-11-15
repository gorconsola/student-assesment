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
      // console.log("Send student: " + req.body.student)

      const id = req.body.batchId
      const student = {
        name: req.body.student.name,
        image_url: req.body.student.image_url
      }
      console.log("STUDENT?!: " + student.name)
      const patchForBatch = req.body
      console.log("patchForBatch: " + patchForBatch)


      Batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }
          var students = [...batch.students, student]
          console.log("STUDENTS BEFORE SHUFFLE: " + students)

          const updatedBatch = { ...batch, students: students }
          
          console.log("UPDATED BATCH: ", updatedBatch )

          Batch.findByIdAndUpdate(id, { $set: updatedBatch }, { new: true })
            .then((batch) => res.json(updatedBatch))
            .catch((error) => next(error))

    })
  })

module.exports = router
