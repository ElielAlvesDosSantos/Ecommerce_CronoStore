const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Cliente = db.define('cliente', {
    usuario: {
        type: DataTypes.STRING(50)
    },
    email: {
        type: DataTypes.STRING(50),
    },
    telefone: {
        type: DataTypes.STRING(20)
    },
    cpf: {
        type: DataTypes.STRING(50),
    },
    senha: {
        type: DataTypes.STRING(100)
    },
    tipo: {
        type: DataTypes.STRING(30)
    },

}, {
    createdAt: false,
    updatedAt: false
})

// Cliente.sync({force:true})

module.exports = Cliente