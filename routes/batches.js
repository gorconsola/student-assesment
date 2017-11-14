const router = require('express').Router()
const passport = require('../config/auth')
const { Batch } = require('../models')
const utils = require('../lib/utils')

const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/batches', (req, res, next) => {
      Batch.find()
        // Newest games first
        .sort({ createdAt: -1 })
        // Send the data in JSON format
        .then((batches) => res.json(batches))
        // Throw a 500 error if something goes wrong
        .catch((error) => next(error))
    })
    .get('/batches/:id', (req, res, next) => {
      const id = req.params.id

      Batch.findById(id)
        .then((game) => {
          if (!game) { return next() }
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .post('/batches', authenticate, (req, res, next) => {
      const newBatch = {
        userId: req.account._id,
        players: [{
          userId: req.account._id,
          pairs: [],
        }],
        horizontal: Array(110).fill(0),
        vertical: Array(110).fill(0),
        board: Array(100).fill(0)
      }

      Batch.create(newBatch)
        .then((game) => {
          io.emit('action', {
            type: 'GAME_CREATED',
            payload: game
          })
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .put('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const updatedBatch = req.body

      Batch.findByIdAndUpdate(id, { $set: updatedBatch }, { new: true })
        .then((game) => {
          io.emit('action', {
            type: 'GAME_UPDATED',
            payload: game
          })
          res.json(game)
        })
        .catch((error) => next(error))
    })
    .patch('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const patchForBatch = req.body
      const index = req.body.index
      const type = req.body.type
      const player = req.body.currentPlayer



      Batch.findById(id)
        .then((game) => {
          if (!game) { return next() }
          var horizontal = [...game.horizontal]
          var vertical = [...game.vertical]
          var board = [...game.board]
          var turn = game.turn
          var playerValue
          var playerOneScore
          var playerTwoScore

          if(turn === 0){
            playerValue = 1
            turn = 1
          } else {
            playerValue = 2
            turn = 0
          }

          if(type === "horizontal"){
            horizontal[index] = 1
          }

          if(type === "vertical"){
            vertical[index] = 1
          }

          {board.map((box, index)=> {
            if (board[index] === 0){
              if (horizontal[index] > 0 && horizontal[index+10] > 0){
                const verCounter = Math.floor(index/10) + (index%10)*10;
                if (vertical[verCounter] > 0 && vertical[verCounter+10] > 0){
                  board[index] = playerValue
                  if(turn === 1){
                    turn = 0
                  } else {
                    turn = 1
                  }
                }
              }
            }
          }
        )}


          const updatedBatch = { ...game, horizontal: horizontal, vertical: vertical, board: board, turn: turn }

          Batch.findByIdAndUpdate(id, { $set: updatedBatch }, { new: true })
            .then((game) => {
              io.emit('action', {
                type: 'GAME_UPDATED',
                payload: game
              })
              res.json(game)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .delete('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      Batch.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'GAME_REMOVED',
            payload: id
          })
          res.status = 200
          res.json({
            message: 'Removed',
            _id: id
          })
        })
        .catch((error) => next(error))
    })

  return router
}
