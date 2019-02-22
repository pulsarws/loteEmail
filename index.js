
const geraLote = require('./geraLote')
const iniciaEnvios = require('./iniciaEnvios')



async function index() {
  try {
    const acao = process.argv[2]
    if (!acao) throw new Error('Adicione argumento com ação desejada')
    if (acao === 'geralote') {
      await geraLote()
      return
    }
    if (acao === 'iniciaenvios') {
      await iniciaEnvios()
      return
    }
    throw new Error('Argumento inválido')
  } catch (error) {
    console.log(error.message)
  }
}

index()
