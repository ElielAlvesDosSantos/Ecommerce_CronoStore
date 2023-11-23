const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Relogio = db.define('relogio', {
    num_relogio: {
        type: DataTypes.STRING(10)
    },
    nome: {
        type: DataTypes.STRING(100)
    },
    tamanho: {
        type: DataTypes.STRING(30)
    },
    tipo: {
        type: DataTypes.STRING(30)
    },
    quantidadeEstoque: {
        type: DataTypes.INTEGER
    },
    precoUnitario: {
        type: DataTypes.FLOAT
    },
    descricao: {
        type: DataTypes.STRING(30)
    }
}, {
    createdAt: false,
    updatedAt: false
})

// Relogio.sync({force:true})

module.exports = Relogio