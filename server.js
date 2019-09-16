
require('dotenv').config()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const POKEDEX = require('./pokedex.json')

const app = express()

app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next){
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN

  if (!authToken || authToken.split(' ')[1] !== apiToken){
    return res.status(401).json({error: 'Unauthorized request'})
  }
  
  next();
})

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

app.get('/types', function handleGetTypes(req,res){
  res.json(validTypes)
})

app.get('/pokemon', function handleGetPokemon(req, res){
  const { name, type } = req.query
  let result = POKEDEX['pokemon']

  if (name){
    result = POKEDEX['pokemon'].filter((pokemon)=> pokemon.name.toLowerCase().includes(name.toLowerCase()))
  }

  if (type){
    let validType = validTypes.filter((valid)=> valid === type).length > 0  
    !validType ? res.status(400).json({error: 'Invalid type'}) : result = POKEDEX['pokemon'].filter((pokemon)=> pokemon.type.includes(type))
  }
  
  res.json(result)
})

app.use((error, req, res, next)=> {
  let response 
  if (process.env.NODE_ENV === 'production'){
    response = { error: { message: 'server error' } }
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})