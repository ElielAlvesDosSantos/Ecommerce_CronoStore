const { Sequelize } = require('sequelize')
const sequelize = new Sequelize('cronostore', 'root', 'senai', {
    host: 'localhost',
    dialect: 'mysql',
})

// sequelize.authenticate().then(()=>{
//     console.log('Banco de dados conectado com sucesso!')
// }).catch((error)=>{
//     console.error('Erro de conexão com banco de dados'+error)
// })

module.exports = sequelize