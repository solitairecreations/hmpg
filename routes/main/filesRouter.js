// files router
const express = require('express')
const router = express.Router()

const file = require('../../private/javascripts/file')
const e = require('../../config/errors.json')
const breaker = require('../../config/breaker.json')

// create a new directory
router.post('/files', async (req, res) => {
  try {
    // check if file uploads are enabled
    if (!breaker.uploadEnabled) {
      throw new Error(e.breaker.registerDisabled)
    }

    // check if user is signed in
    if (!req.info.login) {
      throw new Error(e.request.noSession)
    }

    // make sure body content is valid
    verifyBody(req.body)

    // convert length to an int
    let length = req.body.length
    length = parseInt(length)

    // make sure length isn't too long
    if (length > 16) {
      throw new Error(e.request.badRequest)
    }

    const item = await file.handleDirectory(req.info.login.userid, req.body.directory, length, req.body.display)
    res.send({success: true, item: item})
  } catch (error) {
    console.log(error)
    res.send({success: false, error: error.message})
  }
})

function verifyBody(body) {
  // verify post request length
  if (Object.keys(body).length !== 3) {
    throw new Error(e.request.badRequest)
  }

  // verify existence and type of directory
  if (!body.directory || typeof(body.directory) !== "string") {
    throw new Error(e.request.badRequest)
  }

  // verify existence of length
  if (!body.length) {
    throw new Error(e.request.badRequest)
  }

  // verify existence of length
  if (!body.display) {
    throw new Error(e.request.badRequest)
  }
}

// get & render page
router.all('/files', function(req, res, next) {
  // check if user is signed in
  if (req.info.login) {
    req.info.title = "hmpg:files"
    res.render('./main/files', req.info)
  } else {
    // redirect back to index
    return res.status(200).redirect('/')
  }
})

module.exports = router
