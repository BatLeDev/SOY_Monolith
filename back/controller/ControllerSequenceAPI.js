const debug = require('debug')('ControllerSequenceAPI')
const ModelSequence = require('../model/ModelSequence')
const ModelPlageSession = require('../model/ModelPlageSession')
const ModelExercise = require('../model/ModelExercise')

/**
 * Retrieve all the sequences
 * (Order them by id)
 */
module.exports.readAll = async function (req, res) {
  const sequences = await ModelSequence.getAllSequences()
  if (sequences) {
    const result = []
    for (const [key, val] of sequences.entries()) {
      // There we receive a Map from the model, we need to make it an array
      const seq = {
        sequenceId: key.seq_id,
        exercises: [],
        description: key.description,
        profile_id: key.p_id,
      }

      val.forEach((ex) => {
        const seqExercise = {
          exercise_id: ex.ex_id,
          rank: ex.rank,
          min_rating: ex.min_rating,
        }
        seq.exercises.push(seqExercise)
      })
      result.push(seq)
    }
    result.sort((a, b) => {
      // Then sort the array by sequence id
      return a.sequenceId - b.sequenceId
    })
    res.status(200).json(result) // if all went well, send back the json
  } else {
    res.status(500).end()
  }
}

/**
 *
 * Creates a sequence of exercises
 */
module.exports.create = async function (req, res) {
  debug('Create a sequence ')
  let exercises
  // Pour les tests Postman (Json et non string)
  if (typeof req.body.exercises === 'string') {
    exercises = JSON.parse(req.body.exercises)
  } else {
    exercises = req.body.exercises
  }
  debug('Exos of sequence: ' + JSON.stringify(exercises))
  // Creates the first exercise to obtain a sequence id
  const exercise = exercises[0]
  const data = {
    seq_id: undefined,
    ex_id: exercise.exercise_id,
    rank: exercise.rank,
    min_rating: exercise.min_rating,
    p_id: req.body.profile_id,
    description: req.body.description,
  }
  const sequence = new ModelSequence(data)
  let idSeq = await sequence.save()
  debug('Put first exo in table and get new seq id=' + idSeq)

  if (!idSeq) {
    // The creation didn't succeed
    res.status(500).end()
  }
  exercises = exercises.slice(1) // remove first exo as already inserted in table

  let success = true // Will be used to check if all the exercises have been saved

  // prepare info for other exos of the sequence, re-using the same sequence id
  exercises.forEach(async (exo) => {
    const data = {
      seq_id: idSeq, // same seq id as first exo
      ex_id: exo.exercise_id,
      rank: exo.rank,
      min_rating: exo.min_rating,
      p_id: req.body.profile_id,
      description: req.body.description,
    }
    const sequence = new ModelSequence(data)
    idSeq = await sequence.save() // put in table other exos
    if (!idSeq) {
      success = false
    }
  })
  if (success) {
    res.status(201).json({ seq_id: idSeq })
  } else {
    res.status(500).end()
  }
}

/**
 *
 * Retrieve one sequence, given its id
 */
module.exports.read = async function (req, res) {
  debug('API Get a sequence list')
  const seqList = await ModelSequence.read(req.params.sequenceId)
  // debug("\n seqList is: "+seqList+"\n")
  if (seqList[0]) { // if got some exercises (sequence exists)
    // Formating the result :
    const sequence = {
      sequenceId: seqList[0].seq_id,
      exercises: [
        {
          exercise_id: seqList[0].ex_id,
          rank: seqList[0].rank,
          min_rating: seqList[0].min_rating,
        },
      ],
      profile_id: seqList[0].p_id,
      description: seqList[0].description,
    }
    seqList.shift() // remove first element
    for (let i = 0; i < seqList.length; i++) {
      // Loop to fill all the remaining exercises
      sequence.exercises.push({
        exercise_id: seqList[i].ex_id,
        rank: seqList[i].rank,
        min_rating: seqList[i].min_rating,
      })
    }
    res.status(200).json(sequence)
  } else {
    res.status(404).end()
  }
}

/**
 *
 * Update a sequence of exercises
 */
module.exports.update = async function (req, res) {
  debug('updated()')

  const sequenceId = req.params.sequenceId

  debug('req.params.sequenceId=' + sequenceId)

  // get exercises indicated by user
  debug('Updating')
  let exercises
  if (typeof req.body.exercises === 'string') {
    exercises = JSON.parse(req.body.exercises)
  } else {
    exercises = req.body.exercises
  }
  debug(exercises)

  // We start by deleting tuples corresponding to previous list (and ranks) of exercises.
  debug('Trying to delete rows concerning seq_id ' + sequenceId)
  // TODO : Call the controller function instead ???
  let done = await ModelSequence.delete(sequenceId)

  if (!done) {
    // Delete went wrong
    res.status(500).end()
  } else {
    // The delete went well, now we want to add the updated sequence to the DB

    // This is the data we want to send back as response to the request
    // This is not part of the business logic
    const updatedSequence = {
      sequenceId,
      exercises: [],
      profile_id: req.body.profile_id,
      description: req.body.description,
    }

    let success = true

    // Then prepare info for inserting exos of the sequence, re-using the same sequence id
    exercises.forEach(async (exo) => {
      if (parseInt(exo.rank) > 0) {
        // if exo with strictly positive rank (=> Data received from the req is OK)
        debug('exo ' + exo.exercise_id + ' is OK (rank ' + exo.rank + ')')
        const data = {
          seq_id: sequenceId, // same seq id as coming with in function
          ex_id: exo.exercise_id,
          rank: exo.rank,
          min_rating: exo.min_rating,
          p_id: req.body.profile_id,
          description: req.body.description,
        }

        // This is the data we want to send back as response to the request
        // This is not part of the business logic
        updatedSequence.exercises.push({
          exercise_id: data.ex_id,
          rank: data.rank,
          min_rating: data.min_rating,
        })

        const sequence = new ModelSequence(data)
        done = await sequence.save() // put in table other exos
        if (!done) {
          success = false
        }
      } else {
        // Wrong parameters (=> Data received from req is NOT OK)
        debug('exo ' + exo.exercise_id + ' NOT OK(rank ' + exo.rank + ')')
        res.status(400).end()
      }
    })
    if (success) {
      res.status(200).json(updatedSequence)
    }
  }
}

/**
 *
 * Delete a sequence of exercises
 */
module.exports.delete = async function (req, res) {
  debug('Asked to delete a sequence')

  // We need to check if sessions exist that follow this sequence
  // TODO : do that properly
  // Maybe its read(where: seq_id = req.params.sequenceId) ?
  // And if so, we have to first delete that session ?
  const tabPlageSession = await ModelPlageSession.readAll() // Is it usefull ?

  if (tabPlageSession) {
    const success = await ModelSequence.delete(req.params.sequenceId)
    if (success) {
      res.status(200).end()
    } else {
      res.status(404).end(JSON.stringify(answer))
    }
  } else {
    res.status(500).end()
  }
}

/**
 *
 * Retrieve all the exercises that compose a sequence of exercises, given its id
 */
module.exports.readAllSequenceExercises = async function (req, res) {
  const sequenceData = await ModelSequence.read(req.params.sequenceId)
  if (sequenceData) {
    const exercises = []
    for (let i = 0; i < sequenceData.length; i++) {
      const ex = await ModelExercise.readById(sequenceData[i].ex_id)
      const exercise = new ModelExercise(ex)
      exercises.push(exercise)
    }
    res.status(200).json(exercises)
  } else {
    // Sequence not found
    res.status(404).end()
  }
}
